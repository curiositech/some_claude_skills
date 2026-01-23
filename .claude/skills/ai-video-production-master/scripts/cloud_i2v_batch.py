#!/usr/bin/env python3
"""
Cloud I2V Batch Processor

Uploads keyframe images to a cloud GPU (Vast.ai),
runs Wan 2.1 I2V generation, and downloads results.

This is 10-50x faster than local M4 Max for video generation.

Requires: pip install vastai httpx
"""

import argparse
import asyncio
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import httpx


@dataclass
class CloudInstance:
    id: str
    ip: str
    port: int
    ssh_port: int
    hourly_cost: float
    gpu: str


def run_vastai(args: list[str], capture_json: bool = False) -> dict | str:
    """Run a vastai CLI command."""
    cmd = ["vastai"] + args
    if capture_json:
        cmd.append("--raw")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"vastai command failed: {result.stderr}")

    if capture_json:
        return json.loads(result.stdout)
    return result.stdout


def search_offers(max_price: float = 0.50, min_gpu_ram: int = 24) -> list[dict]:
    """Search for available GPU instances using vastai CLI."""
    query = f"gpu_ram >= {min_gpu_ram} num_gpus = 1 rentable = true dph < {max_price} reliability > 0.95"

    offers = run_vastai(["search", "offers", query, "-o", "dph+"], capture_json=True)

    # Filter for good GPUs (both underscore and space formats)
    good_gpus = ["RTX 4090", "RTX 5090", "RTX A6000", "A100", "H100", "A40",
                 "RTX_4090", "RTX_5090", "RTX_A6000"]
    filtered = [o for o in offers if any(g in o.get("gpu_name", "") for g in good_gpus)]

    if not filtered:
        # If no exact matches, return all offers with 24GB+ VRAM
        return offers[:10]

    return filtered[:10]  # Top 10 cheapest suitable options


def create_instance(offer_id: int, image: str = "runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04") -> int:
    """Create a new instance from an offer."""
    # Use onstart script to install ComfyUI
    onstart = """#!/bin/bash
set -e
cd /root

# Ensure pip is available
apt-get update && apt-get install -y python3-pip || true
pip3 install comfy-cli httpx || pip install comfy-cli httpx
comfy --skip-prompt install
comfy node install ComfyUI-GGUF ComfyUI-VideoHelperSuite

# Download models
mkdir -p /root/comfy/ComfyUI/models/diffusion_models
mkdir -p /root/comfy/ComfyUI/models/text_encoders
mkdir -p /root/comfy/ComfyUI/models/vae

# Wan I2V model (only if not exists)
if [ ! -f /root/comfy/ComfyUI/models/diffusion_models/wan2.1-i2v-14b-480p-Q5_K_M.gguf ]; then
    wget -q -O /root/comfy/ComfyUI/models/diffusion_models/wan2.1-i2v-14b-480p-Q5_K_M.gguf \
        "https://huggingface.co/city96/Wan2.1-I2V-14B-480P-GGUF/resolve/main/wan2.1-i2v-14b-480p-Q5_K_M.gguf"
fi

# Text encoder
if [ ! -f /root/comfy/ComfyUI/models/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors ]; then
    wget -q -O /root/comfy/ComfyUI/models/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors \
        "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors"
fi

# VAE
if [ ! -f /root/comfy/ComfyUI/models/vae/wan_2.1_vae.safetensors ]; then
    wget -q -O /root/comfy/ComfyUI/models/vae/wan_2.1_vae.safetensors \
        "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors"
fi

# Start ComfyUI
cd /root/comfy/ComfyUI
python main.py --listen 0.0.0.0 --port 8188 &
"""

    # Write onstart script to temp file
    onstart_file = Path("/tmp/vastai_onstart.sh")
    onstart_file.write_text(onstart)

    result = run_vastai([
        "create", "instance", str(offer_id),
        "--image", image,
        "--disk", "80",
        "--onstart-cmd", onstart,
        "--direct",
    ], capture_json=False)  # CLI doesn't return JSON for create

    # Parse instance ID from success message like "Started. {'new_contract': 12345, ...}"
    # or "success: created instance 12345"
    match = re.search(r"new_contract['\"]?\s*:\s*(\d+)", result)
    if match:
        return int(match.group(1))

    match = re.search(r"instance\s+(\d+)", result, re.IGNORECASE)
    if match:
        return int(match.group(1))

    # Try to find any number that looks like an instance ID
    match = re.search(r"(\d{7,})", result)
    if match:
        return int(match.group(1))

    raise RuntimeError(f"Failed to parse instance ID from: {result}")


def get_instance_info(instance_id: int) -> Optional[dict]:
    """Get instance connection info."""
    instances = run_vastai(["show", "instances"], capture_json=True)

    for inst in instances:
        if inst.get("id") == instance_id:
            return inst
    return None


def wait_for_instance(instance_id: int, timeout: int = 900) -> dict:
    """Wait for instance to be ready."""
    print(f"Waiting for instance {instance_id} to be ready...")
    start = time.time()
    last_status = None

    while time.time() - start < timeout:
        info = get_instance_info(instance_id)
        if info:
            status = info.get("actual_status", "")
            if status != last_status:
                print(f"  Status: {status}")
                last_status = status

            if status == "running":
                return info  # Don't wait here - we'll check ComfyUI separately

        time.sleep(10)

    raise TimeoutError(f"Instance {instance_id} did not become ready in {timeout}s")


def destroy_instance(instance_id: int):
    """Destroy an instance."""
    try:
        run_vastai(["destroy", "instance", str(instance_id)])
        print(f"Destroyed instance {instance_id}")
    except Exception as e:
        print(f"Warning: Failed to destroy instance: {e}")


def build_i2v_workflow(image_name: str, motion_prompt: str, num_frames: int = 33, steps: int = 6) -> dict:
    """Build ComfyUI workflow for Wan I2V."""
    import random
    seed = random.randint(0, 2**32 - 1)

    return {
        "1": {"class_type": "LoadImage", "inputs": {"image": image_name}},
        "2": {"class_type": "ImageScale", "inputs": {
            "image": ["1", 0], "width": 832, "height": 480,
            "upscale_method": "lanczos", "crop": "center"
        }},
        "3": {"class_type": "UnetLoaderGGUF", "inputs": {
            "unet_name": "wan2.1-i2v-14b-480p-Q5_K_M.gguf"
        }},
        "4": {"class_type": "CLIPLoader", "inputs": {
            "clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors", "type": "wan"
        }},
        "5": {"class_type": "VAELoader", "inputs": {
            "vae_name": "wan_2.1_vae.safetensors"
        }},
        "6": {"class_type": "CLIPTextEncode", "inputs": {
            "text": motion_prompt, "clip": ["4", 0]
        }},
        "7": {"class_type": "CLIPTextEncode", "inputs": {
            "text": "blurry, distorted, watermark, static", "clip": ["4", 0]
        }},
        "8": {"class_type": "WanImageToVideo", "inputs": {
            "positive": ["6", 0], "negative": ["7", 0], "vae": ["5", 0],
            "width": 832, "height": 480, "length": num_frames,
            "batch_size": 1, "start_image": ["2", 0],
        }},
        "9": {"class_type": "ModelSamplingSD3", "inputs": {
            "model": ["3", 0], "shift": 8.0
        }},
        "10": {"class_type": "KSampler", "inputs": {
            "model": ["9", 0], "positive": ["8", 0], "negative": ["8", 1],
            "latent_image": ["8", 2], "seed": seed, "steps": steps,
            "cfg": 5.0, "sampler_name": "uni_pc", "scheduler": "normal",
            "denoise": 1.0,
        }},
        "11": {"class_type": "VAEDecode", "inputs": {
            "samples": ["10", 0], "vae": ["5", 0]
        }},
        "12": {"class_type": "VHS_VideoCombine", "inputs": {
            "frame_rate": 16, "loop_count": 0,
            "filename_prefix": f"i2v_{Path(image_name).stem}",
            "format": "video/h264-mp4", "pingpong": False,
            "save_output": True, "images": ["11", 0],
        }},
    }


async def submit_workflow(base_url: str, workflow: dict) -> str:
    """Submit workflow to ComfyUI and return prompt_id."""
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(f"{base_url}/prompt", json={"prompt": workflow})
        resp.raise_for_status()
        return resp.json()["prompt_id"]


async def wait_for_completion(base_url: str, prompt_id: str, timeout: int = 600) -> Optional[str]:
    """Wait for workflow to complete."""
    async with httpx.AsyncClient(timeout=30) as client:
        start = time.time()
        while time.time() - start < timeout:
            await asyncio.sleep(10)

            resp = await client.get(f"{base_url}/history/{prompt_id}")
            if resp.status_code == 200:
                history = resp.json()
                if prompt_id in history:
                    entry = history[prompt_id]
                    status = entry.get("status", {}).get("status_str", "")

                    if status == "success":
                        outputs = entry.get("outputs", {})
                        for node_id, output in outputs.items():
                            if "gifs" in output:
                                return output["gifs"][0]["filename"]
                            if "videos" in output:
                                return output["videos"][0]["filename"]
                    elif "error" in status.lower():
                        print(f"  Workflow error: {entry}")
                        return None

        print(f"  Timeout waiting for {prompt_id}")
        return None


async def run_batch(
    instance_info: dict,
    images_dir: Path,
    output_dir: Path,
    motion_prompt: str,
    steps: int = 6,
    frames: int = 33,
) -> list[Path]:
    """Run batch I2V on cloud instance."""

    # Get connection info
    ssh_host = instance_info.get("ssh_host", "").split(":")[0]
    ssh_port = int(instance_info.get("ssh_port", 22))
    public_ip = instance_info.get("public_ipaddr", ssh_host)

    # ComfyUI port (usually 8188, mapped to a high port)
    ports = instance_info.get("ports", {})
    comfy_port = None
    for port_map in ports.values() if isinstance(ports, dict) else []:
        if "8188" in str(port_map):
            comfy_port = port_map.get("HostPort", 8188)
            break

    if not comfy_port:
        comfy_port = 8188  # Default

    base_url = f"http://{public_ip}:{comfy_port}"
    print(f"ComfyUI URL: {base_url}")

    # Find images
    images = list(images_dir.glob("*.png")) + list(images_dir.glob("*.jpg"))
    print(f"Found {len(images)} images to process")

    # Upload images via SSH
    print("Uploading images...")

    # Find SSH key for Vast.ai (check for dedicated key first, then default)
    ssh_key = Path.home() / ".ssh" / "id_ed25519_vastai"
    if not ssh_key.exists():
        ssh_key = Path.home() / ".ssh" / "id_ed25519"
    if not ssh_key.exists():
        ssh_key = Path.home() / ".ssh" / "id_rsa"

    ssh_opts = f"-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i {ssh_key}"
    scp_port = f"-P {ssh_port}"  # SCP uses capital P for port

    for img in images:
        result = subprocess.run(
            f"scp {ssh_opts} {scp_port} {img} root@{ssh_host}:/root/comfy/ComfyUI/input/",
            shell=True, capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f"  Warning: Failed to upload {img.name}: {result.stderr}")
            raise RuntimeError(f"SCP failed: {result.stderr}")

    # Process each image
    output_videos = []
    for i, img in enumerate(images):
        print(f"Processing {i+1}/{len(images)}: {img.name}")

        workflow = build_i2v_workflow(img.name, motion_prompt, frames, steps)

        try:
            prompt_id = await submit_workflow(base_url, workflow)
            print(f"  Submitted: {prompt_id}")

            video_file = await wait_for_completion(base_url, prompt_id, timeout=600)
            if video_file:
                output_videos.append(video_file)
                print(f"  Complete: {video_file}")
            else:
                print(f"  Failed or timed out")
        except Exception as e:
            print(f"  Error: {e}")

    # Download results
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"\nDownloading {len(output_videos)} videos...")

    for video in output_videos:
        result = subprocess.run(
            f"scp {ssh_opts} {scp_port} root@{ssh_host}:/root/comfy/ComfyUI/output/{video} {output_dir}/",
            shell=True, capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f"  Warning: Failed to download {video}: {result.stderr}")

    return list(output_dir.glob("*.mp4"))


async def main():
    parser = argparse.ArgumentParser(description="Cloud I2V Batch Processor")
    parser.add_argument("--images", type=Path, required=True, help="Input images directory")
    parser.add_argument("--output", type=Path, default=Path("i2v_output"), help="Output directory")
    parser.add_argument("--motion", default="subtle organic motion, gentle breathing, cinematic")
    parser.add_argument("--steps", type=int, default=6, help="Sampling steps (4-12)")
    parser.add_argument("--frames", type=int, default=33, help="Output frames (33=~2s at 16fps)")
    parser.add_argument("--max-price", type=float, default=0.50, help="Max $/hr")
    parser.add_argument("--dry-run", action="store_true", help="Show offers only")
    parser.add_argument("--yes", "-y", action="store_true", help="Skip confirmations")
    parser.add_argument("--instance", type=int, help="Use existing instance ID")

    args = parser.parse_args()

    # Count images
    images = list(args.images.glob("*.png")) + list(args.images.glob("*.jpg"))
    if not images:
        print(f"No images found in {args.images}")
        sys.exit(1)

    print(f"Found {len(images)} images to process")

    # Search for offers
    print(f"\nSearching for GPU instances under ${args.max_price}/hr...")
    offers = search_offers(args.max_price)

    if not offers:
        print("No suitable GPU instances found. Try increasing --max-price")
        sys.exit(1)

    print(f"\nTop offers:")
    print(f"{'ID':<12} {'GPU':<20} {'RAM':<8} {'$/hr':<10} {'Location':<20}")
    print("-" * 75)
    for o in offers[:5]:
        print(f"{o['id']:<12} {o.get('gpu_name', 'N/A'):<20} {o.get('gpu_ram', 0):<8.0f} ${o.get('dph_total', 0):<9.4f} {o.get('geolocation', 'N/A'):<20}")

    # Cost estimate
    best = offers[0]
    est_time_min = len(images) * 3  # ~3 min per clip on fast GPU
    est_cost = (est_time_min / 60 + 0.5) * best['dph_total']  # +30 min for setup

    print(f"\nEstimated: {est_time_min} min processing + 30 min setup = ${est_cost:.2f}")

    if args.dry_run:
        print("\n(Dry run - no instance created)")
        return

    # Confirm
    if not args.yes:
        response = input("\nProceed with cheapest option? [y/N] ")
        if response.lower() != "y":
            print("Cancelled")
            return
    else:
        print("\n--yes flag: proceeding automatically")

    instance_id = args.instance
    instance_info = None

    try:
        if not instance_id:
            # Create instance
            print(f"\nCreating instance from offer {best['id']}...")
            instance_id = create_instance(best['id'])
            print(f"Created instance: {instance_id}")

            # Wait for ready
            instance_info = wait_for_instance(instance_id)
        else:
            instance_info = get_instance_info(instance_id)
            if not instance_info:
                print(f"Instance {instance_id} not found")
                sys.exit(1)

        ssh_host = instance_info.get("ssh_host", "").split(":")[0]
        ssh_port = int(instance_info.get("ssh_port", 22))
        public_ip = instance_info.get("public_ipaddr", ssh_host)

        print(f"\nInstance ready!")
        print(f"  SSH: ssh -p {ssh_port} root@{ssh_host}")

        # Find SSH key
        ssh_key = Path.home() / ".ssh" / "id_ed25519_vastai"
        if not ssh_key.exists():
            ssh_key = Path.home() / ".ssh" / "id_ed25519"
        if not ssh_key.exists():
            ssh_key = Path.home() / ".ssh" / "id_rsa"
        ssh_opts = f"-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -i {ssh_key}"

        # Get ComfyUI port from port mappings
        ports = instance_info.get("ports", {})
        comfy_port = 8188
        for port_key, port_info in (ports.items() if isinstance(ports, dict) else []):
            if "8188" in str(port_key):
                if isinstance(port_info, list) and port_info:
                    comfy_port = port_info[0].get("HostPort", 8188)
                break

        comfy_url = f"http://{public_ip}:{comfy_port}"

        # Wait for ComfyUI setup to complete (downloads ~18GB of models)
        # Check both SSH connectivity AND ComfyUI input directory exists
        print(f"  Waiting for setup to complete (this can take 5-10 minutes for model downloads)...")

        comfy_ready = False
        for attempt in range(90):  # Wait up to 15 minutes
            elapsed = attempt * 10

            # First check if SSH works and input directory exists
            try:
                ssh_check = subprocess.run(
                    f"ssh {ssh_opts} -p {ssh_port} root@{ssh_host} 'test -d /root/comfy/ComfyUI/input && echo OK'",
                    shell=True, capture_output=True, text=True, timeout=20
                )
            except subprocess.TimeoutExpired:
                if attempt % 6 == 0:
                    print(f"    SSH connection timed out, retrying... ({elapsed}s)")
                await asyncio.sleep(10)
                continue

            if ssh_check.returncode == 0 and "OK" in ssh_check.stdout:
                # SSH works and directory exists, now check ComfyUI API
                try:
                    async with httpx.AsyncClient(timeout=10) as client:
                        resp = await client.get(f"{comfy_url}/system_stats")
                        if resp.status_code == 200:
                            print(f"  ComfyUI ready! (took {elapsed}s)")
                            comfy_ready = True
                            break
                except Exception:
                    pass

                if attempt % 3 == 0:
                    print(f"    ComfyUI directory exists, waiting for API... ({elapsed}s)")
            else:
                if attempt % 6 == 0:
                    print(f"    Setup in progress... ({elapsed}s)")

            await asyncio.sleep(10)

        if not comfy_ready:
            print("  Warning: ComfyUI setup may not be complete, but proceeding...")

        # Run batch
        downloaded = await run_batch(
            instance_info,
            args.images,
            args.output,
            args.motion,
            args.steps,
            args.frames,
        )

        print(f"\nComplete! Downloaded {len(downloaded)} videos to {args.output}")

    finally:
        if instance_id and not args.instance:
            if not args.yes:
                response = input("\nDestroy instance? [Y/n] ")
                if response.lower() != "n":
                    destroy_instance(instance_id)
            else:
                # Auto-destroy with --yes flag
                destroy_instance(instance_id)


if __name__ == "__main__":
    asyncio.run(main())
