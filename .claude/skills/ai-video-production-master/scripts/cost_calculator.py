#!/usr/bin/env python3
"""
AI Video Production Cost Calculator

Compares costs across different approaches:
- Full local (M4 Max)
- Hybrid (local images + cloud I2V)
- Cloud-only (Vast.ai, RunPod)
- SaaS platforms (InVideo, Runway)
"""

import argparse
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Provider(Enum):
    LOCAL_M4_MAX = "local_m4_max"
    VASTAI_H100 = "vastai_h100"
    RUNPOD_H100 = "runpod_h100"
    RUNPOD_A100 = "runpod_a100"
    LAMBDA_H100 = "lambda_h100"
    INVIDEO_PLUS = "invideo_plus"
    INVIDEO_MAX = "invideo_max"
    RUNWAY_GEN4 = "runway_gen4"


@dataclass
class ProviderConfig:
    name: str
    hourly_cost: float  # $/hr for cloud, monthly for SaaS
    i2v_time_per_clip: float  # minutes
    image_time: float  # seconds per image
    monthly_minutes: Optional[int] = None  # For SaaS platforms
    is_saas: bool = False
    is_local: bool = False


PROVIDERS = {
    Provider.LOCAL_M4_MAX: ProviderConfig(
        name="Local M4 Max (128GB)",
        hourly_cost=0.0,  # Just electricity
        i2v_time_per_clip=90,  # 15 min/step × 6 steps
        image_time=45,  # seconds
        is_local=True,
    ),
    Provider.VASTAI_H100: ProviderConfig(
        name="Vast.ai H100 80GB",
        hourly_cost=1.87,
        i2v_time_per_clip=2,  # minutes
        image_time=5,  # seconds
    ),
    Provider.RUNPOD_H100: ProviderConfig(
        name="RunPod H100 80GB",
        hourly_cost=1.99,
        i2v_time_per_clip=2,
        image_time=5,
    ),
    Provider.RUNPOD_A100: ProviderConfig(
        name="RunPod A100 80GB",
        hourly_cost=1.74,
        i2v_time_per_clip=3,
        image_time=7,
    ),
    Provider.LAMBDA_H100: ProviderConfig(
        name="Lambda Labs H100",
        hourly_cost=2.99,
        i2v_time_per_clip=2,
        image_time=5,
    ),
    Provider.INVIDEO_PLUS: ProviderConfig(
        name="InVideo Plus",
        hourly_cost=20.0,  # monthly
        i2v_time_per_clip=0.5,  # Their pipeline
        image_time=0,  # Included
        monthly_minutes=50,
        is_saas=True,
    ),
    Provider.INVIDEO_MAX: ProviderConfig(
        name="InVideo Max",
        hourly_cost=48.0,  # monthly
        i2v_time_per_clip=0.5,
        image_time=0,
        monthly_minutes=200,
        is_saas=True,
    ),
    Provider.RUNWAY_GEN4: ProviderConfig(
        name="Runway Gen-4",
        hourly_cost=0.05,  # per second of video
        i2v_time_per_clip=0.5,
        image_time=0,
        is_saas=True,
    ),
}


def calculate_project_cost(
    num_shots: int,
    clip_duration: float,  # seconds
    provider: Provider,
    include_images: bool = True,
) -> dict:
    """Calculate total cost for a video project."""
    config = PROVIDERS[provider]

    result = {
        "provider": config.name,
        "num_shots": num_shots,
        "clip_duration": clip_duration,
        "total_video_seconds": num_shots * clip_duration,
    }

    if config.is_local:
        # Local processing - just time cost
        image_time = (num_shots * config.image_time) / 60  # minutes
        i2v_time = num_shots * config.i2v_time_per_clip  # minutes
        total_time = image_time + i2v_time

        result["image_generation_min"] = round(image_time, 1)
        result["i2v_generation_min"] = round(i2v_time, 1)
        result["total_time_hours"] = round(total_time / 60, 2)
        result["cost"] = 0.0
        result["cost_note"] = "Free (electricity ~$0.50)"

    elif config.is_saas:
        if provider == Provider.RUNWAY_GEN4:
            # Runway charges per second
            total_seconds = num_shots * clip_duration
            result["cost"] = round(total_seconds * config.hourly_cost, 2)
            result["cost_note"] = f"${config.hourly_cost}/sec of video"
        else:
            # InVideo-style - monthly subscription
            total_minutes = (num_shots * clip_duration) / 60
            if config.monthly_minutes and total_minutes <= config.monthly_minutes:
                result["cost"] = config.hourly_cost
                result["cost_note"] = f"Monthly subscription (includes {config.monthly_minutes} min)"
                result["minutes_used"] = round(total_minutes, 1)
                result["minutes_remaining"] = round(config.monthly_minutes - total_minutes, 1)
            else:
                result["cost"] = config.hourly_cost * 2  # Need higher tier
                result["cost_note"] = "Exceeds plan limits"

    else:
        # Cloud GPU
        image_time = (num_shots * config.image_time) / 60 if include_images else 0
        i2v_time = num_shots * config.i2v_time_per_clip
        total_minutes = image_time + i2v_time
        total_hours = total_minutes / 60

        # Add 15 min startup overhead
        total_hours += 0.25

        result["image_generation_min"] = round(image_time, 1)
        result["i2v_generation_min"] = round(i2v_time, 1)
        result["total_gpu_hours"] = round(total_hours, 2)
        result["cost"] = round(total_hours * config.hourly_cost, 2)
        result["cost_note"] = f"${config.hourly_cost}/hr"

    return result


def calculate_hybrid_cost(
    num_shots: int,
    clip_duration: float,
    cloud_provider: Provider = Provider.VASTAI_H100,
) -> dict:
    """Calculate cost for hybrid approach (local images + cloud I2V)."""
    local_config = PROVIDERS[Provider.LOCAL_M4_MAX]
    cloud_config = PROVIDERS[cloud_provider]

    # Images locally
    image_time = (num_shots * local_config.image_time) / 60  # minutes

    # I2V on cloud
    i2v_time = num_shots * cloud_config.i2v_time_per_clip  # minutes
    i2v_hours = (i2v_time + 15) / 60  # Add startup overhead

    cloud_cost = i2v_hours * cloud_config.hourly_cost

    return {
        "approach": "Hybrid (Local images + Cloud I2V)",
        "num_shots": num_shots,
        "clip_duration": clip_duration,
        "local_image_time_min": round(image_time, 1),
        "cloud_provider": cloud_config.name,
        "cloud_i2v_time_min": round(i2v_time, 1),
        "cloud_hours": round(i2v_hours, 2),
        "cloud_cost": round(cloud_cost, 2),
        "total_cost": round(cloud_cost, 2),
        "total_time_hours": round((image_time + i2v_time) / 60, 2),
    }


def compare_all(num_shots: int, clip_duration: float) -> None:
    """Compare all providers for a given project."""
    print(f"\n{'='*70}")
    print(f"Cost Comparison: {num_shots} shots × {clip_duration}s = {num_shots * clip_duration}s total video")
    print(f"{'='*70}\n")

    results = []

    # Cloud/Local providers
    for provider in [
        Provider.LOCAL_M4_MAX,
        Provider.VASTAI_H100,
        Provider.RUNPOD_H100,
        Provider.RUNPOD_A100,
    ]:
        r = calculate_project_cost(num_shots, clip_duration, provider)
        results.append(r)

    # Hybrid
    hybrid = calculate_hybrid_cost(num_shots, clip_duration)
    results.append({
        "provider": hybrid["approach"],
        "cost": hybrid["total_cost"],
        "total_time_hours": hybrid["total_time_hours"],
        "cost_note": f"via {hybrid['cloud_provider']}",
    })

    # SaaS
    for provider in [Provider.INVIDEO_MAX, Provider.RUNWAY_GEN4]:
        r = calculate_project_cost(num_shots, clip_duration, provider)
        results.append(r)

    # Sort by cost
    results.sort(key=lambda x: x.get("cost", 0))

    # Display
    print(f"{'Provider':<35} {'Cost':>10} {'Time':>12} {'Notes':<25}")
    print("-" * 85)

    for r in results:
        cost_str = f"${r['cost']:.2f}" if r['cost'] > 0 else "FREE"
        time_str = f"{r.get('total_time_hours', 'N/A')} hrs" if 'total_time_hours' in r else "Quick"
        notes = r.get('cost_note', '')[:25]
        print(f"{r['provider']:<35} {cost_str:>10} {time_str:>12} {notes:<25}")

    print("\n" + "="*70)
    print("RECOMMENDATION:")

    # Find best value
    cheapest = min([r for r in results if r['cost'] > 0], key=lambda x: x['cost'])
    print(f"  Best Value: {cheapest['provider']} at ${cheapest['cost']:.2f}")

    local = next(r for r in results if 'Local' in r['provider'])
    if local['total_time_hours'] < 4:
        print(f"  Best for Quick Projects: Local M4 Max ({local['total_time_hours']} hrs, free)")
    else:
        print(f"  Local Too Slow: {local['total_time_hours']} hrs - use cloud")

    print("="*70)


def monthly_comparison(videos_per_month: int, shots_per_video: int, clip_duration: float) -> None:
    """Compare monthly costs for regular production."""
    print(f"\n{'='*70}")
    print(f"Monthly Cost: {videos_per_month} videos × {shots_per_video} shots × {clip_duration}s")
    print(f"{'='*70}\n")

    total_shots = videos_per_month * shots_per_video
    total_seconds = total_shots * clip_duration
    total_minutes = total_seconds / 60

    print(f"Total monthly: {total_shots} shots, {total_minutes:.1f} minutes of video\n")

    comparisons = [
        ("InVideo Plus ($20/mo)", 20 if total_minutes <= 50 else "Exceeds limit"),
        ("InVideo Max ($48/mo)", 48 if total_minutes <= 200 else "Exceeds limit"),
        ("Runway Gen-4", round(total_seconds * 0.05, 2)),
        ("Hybrid (Vast.ai)", round(calculate_hybrid_cost(total_shots, clip_duration)["total_cost"], 2)),
        ("Full Cloud (Vast.ai)", round(calculate_project_cost(total_shots, clip_duration, Provider.VASTAI_H100)["cost"], 2)),
        ("Full Local (M4 Max)", "FREE (but slow)"),
    ]

    print(f"{'Approach':<30} {'Monthly Cost':>15}")
    print("-" * 50)
    for name, cost in comparisons:
        cost_str = f"${cost}" if isinstance(cost, (int, float)) else cost
        print(f"{name:<30} {cost_str:>15}")


def main():
    parser = argparse.ArgumentParser(description="AI Video Production Cost Calculator")
    parser.add_argument("--shots", type=int, default=10, help="Number of shots/clips")
    parser.add_argument("--duration", type=float, default=5.0, help="Duration per clip (seconds)")
    parser.add_argument("--monthly", type=int, help="Videos per month (for monthly comparison)")
    parser.add_argument("--provider", type=str, help="Specific provider to calculate")

    args = parser.parse_args()

    if args.monthly:
        monthly_comparison(args.monthly, args.shots, args.duration)
    elif args.provider:
        try:
            provider = Provider[args.provider.upper()]
            result = calculate_project_cost(args.shots, args.duration, provider)
            print(f"\n{result['provider']}:")
            for k, v in result.items():
                if k != 'provider':
                    print(f"  {k}: {v}")
        except KeyError:
            print(f"Unknown provider: {args.provider}")
            print(f"Available: {[p.name for p in Provider]}")
    else:
        compare_all(args.shots, args.duration)


if __name__ == "__main__":
    main()
