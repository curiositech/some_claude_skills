#!/usr/bin/env python3
"""
Video Analyzer

Extract frames from video, run object detection, generate timeline of detections.
Supports YOLOv8, batch processing, and tracking.

Usage:
    python video_analyzer.py detect <video.mp4> <output_dir/> [--model yolov8n.pt] [--conf 0.4]
    python video_analyzer.py track <video.mp4> <output_dir/> [--model yolov8n.pt]
    python video_analyzer.py extract <video.mp4> <output_dir/> [--sample-rate 30]

Examples:
    python video_analyzer.py detect drone_footage.mp4 ./detections/ --model yolov8n.pt --conf 0.4
    python video_analyzer.py track dolphins.mp4 ./tracks/ --model yolov8n.pt
    python video_analyzer.py extract survey.mp4 ./frames/ --sample-rate 60
"""

import os
import sys
import argparse
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
import time

import cv2
import numpy as np
from ultralytics import YOLO


class VideoAnalyzer:
    """Analyze video with object detection and tracking"""

    def __init__(self, model_path: str = 'yolov8n.pt'):
        """Initialize with YOLO model"""
        print(f"\n🔍 Loading model: {model_path}")
        self.model = YOLO(model_path)
        print(f"✅ Model loaded\n")

    def extract_frames(
        self,
        video_path: str,
        output_dir: str,
        sample_rate: int = 30,
        scene_detection: bool = False
    ) -> List[str]:
        """
        Extract frames from video

        Args:
            video_path: Path to input video
            output_dir: Directory to save frames
            sample_rate: Extract every Nth frame (default: 30 = 1 FPS for 30 FPS video)
            scene_detection: Use adaptive sampling based on scene changes

        Returns:
            List of extracted frame paths
        """
        print(f"📹 Extracting frames from: {video_path}")
        print(f"   Sample rate: every {sample_rate} frames")
        print(f"   Scene detection: {scene_detection}\n")

        os.makedirs(output_dir, exist_ok=True)

        video = cv2.VideoCapture(video_path)
        fps = video.get(cv2.CAP_PROP_FPS)
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

        print(f"Video info:")
        print(f"  FPS: {fps}")
        print(f"  Total frames: {total_frames}")
        print(f"  Duration: {total_frames / fps:.2f}s\n")

        frame_count = 0
        extracted = []
        prev_frame = None

        while True:
            ret, frame = video.read()
            if not ret:
                break

            frame_count += 1

            # Determine if we should save this frame
            should_save = False

            if scene_detection:
                should_save = self._scene_changed(prev_frame, frame)
                prev_frame = frame.copy()
            else:
                should_save = (frame_count % sample_rate == 0)

            if should_save:
                frame_path = os.path.join(output_dir, f'frame_{frame_count:06d}.jpg')
                cv2.imwrite(frame_path, frame)
                extracted.append(frame_path)

                if len(extracted) % 100 == 0:
                    print(f"  ✓ Extracted {len(extracted)} frames...")

        video.release()

        print(f"\n✅ Extracted {len(extracted)} frames")
        print(f"   Reduction: {(1 - len(extracted)/total_frames)*100:.1f}%\n")

        return extracted

    def detect_batch(
        self,
        image_paths: List[str],
        output_path: str,
        conf_threshold: float = 0.4,
        iou_threshold: float = 0.5,
        batch_size: int = 16
    ) -> Dict[str, Any]:
        """
        Run object detection on batch of images

        Args:
            image_paths: List of image file paths
            output_path: Path to save results JSON
            conf_threshold: Confidence threshold
            iou_threshold: IoU threshold for NMS
            batch_size: Number of images to process at once

        Returns:
            Dictionary with detection results
        """
        print(f"🔍 Running detection on {len(image_paths)} images")
        print(f"   Confidence threshold: {conf_threshold}")
        print(f"   IoU threshold: {iou_threshold}")
        print(f"   Batch size: {batch_size}\n")

        all_results = []
        start_time = time.time()

        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i+batch_size]

            # Load batch
            frames = [cv2.imread(path) for path in batch_paths]

            # Batch inference
            results = self.model(
                frames,
                conf=conf_threshold,
                iou=iou_threshold,
                verbose=False
            )

            # Extract results
            for path, result in zip(batch_paths, results):
                detections = []

                for box in result.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    label = result.names[cls]

                    detections.append({
                        'bbox': [float(x1), float(y1), float(x2), float(y2)],
                        'confidence': conf,
                        'class': label,
                        'class_id': cls
                    })

                all_results.append({
                    'image': path,
                    'detections': detections,
                    'count': len(detections)
                })

            if (i + batch_size) % 100 < batch_size:
                print(f"  ✓ Processed {min(i + batch_size, len(image_paths))} images...")

        elapsed = time.time() - start_time
        fps = len(image_paths) / elapsed

        # Save results
        results_data = {
            'metadata': {
                'total_images': len(image_paths),
                'total_detections': sum(r['count'] for r in all_results),
                'conf_threshold': conf_threshold,
                'iou_threshold': iou_threshold,
                'processing_time': elapsed,
                'fps': fps
            },
            'results': all_results
        }

        with open(output_path, 'w') as f:
            json.dump(results_data, f, indent=2)

        print(f"\n✅ Detection complete")
        print(f"   Total detections: {results_data['metadata']['total_detections']}")
        print(f"   Processing time: {elapsed:.2f}s")
        print(f"   Throughput: {fps:.1f} images/s")
        print(f"   Results saved: {output_path}\n")

        return results_data

    def track_video(
        self,
        video_path: str,
        output_path: str,
        conf_threshold: float = 0.4,
        tracker: str = 'bytetrack.yaml'
    ) -> Dict[str, Any]:
        """
        Run object tracking on video

        Args:
            video_path: Path to input video
            output_path: Path to save tracking results JSON
            conf_threshold: Confidence threshold
            tracker: Tracking algorithm ('bytetrack.yaml', 'botsort.yaml')

        Returns:
            Dictionary with tracking results
        """
        print(f"🎯 Tracking objects in: {video_path}")
        print(f"   Tracker: {tracker}")
        print(f"   Confidence: {conf_threshold}\n")

        video = cv2.VideoCapture(video_path)
        fps = video.get(cv2.CAP_PROP_FPS)
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

        tracks = {}  # track_id -> list of detections
        frame_count = 0
        start_time = time.time()

        while True:
            ret, frame = video.read()
            if not ret:
                break

            frame_count += 1

            # Run tracking
            results = self.model.track(
                frame,
                conf=conf_threshold,
                persist=True,
                tracker=tracker,
                verbose=False
            )

            # Extract tracked objects
            if results[0].boxes is not None and results[0].boxes.id is not None:
                for box in results[0].boxes:
                    track_id = int(box.id[0])
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    label = results[0].names[cls]

                    if track_id not in tracks:
                        tracks[track_id] = {
                            'track_id': track_id,
                            'class': label,
                            'first_frame': frame_count,
                            'last_frame': frame_count,
                            'detections': []
                        }

                    tracks[track_id]['detections'].append({
                        'frame': frame_count,
                        'timestamp': frame_count / fps,
                        'bbox': [float(x1), float(y1), float(x2), float(y2)],
                        'confidence': conf
                    })

                    tracks[track_id]['last_frame'] = frame_count

            if frame_count % 100 == 0:
                print(f"  ✓ Processed {frame_count}/{total_frames} frames...")

        video.release()
        elapsed = time.time() - start_time

        # Calculate statistics
        track_list = list(tracks.values())
        for track in track_list:
            track['duration_frames'] = track['last_frame'] - track['first_frame'] + 1
            track['duration_seconds'] = track['duration_frames'] / fps
            track['avg_confidence'] = np.mean([d['confidence'] for d in track['detections']])

        # Save results
        results_data = {
            'metadata': {
                'video': video_path,
                'total_frames': total_frames,
                'fps': fps,
                'duration': total_frames / fps,
                'total_tracks': len(tracks),
                'processing_time': elapsed,
                'processing_fps': total_frames / elapsed
            },
            'tracks': track_list
        }

        with open(output_path, 'w') as f:
            json.dump(results_data, f, indent=2)

        print(f"\n✅ Tracking complete")
        print(f"   Unique objects: {len(tracks)}")
        print(f"   Total detections: {sum(len(t['detections']) for t in track_list)}")
        print(f"   Processing time: {elapsed:.2f}s")
        print(f"   Results saved: {output_path}\n")

        # Print track summary
        print("Track summary:")
        for track in sorted(track_list, key=lambda t: t['duration_frames'], reverse=True)[:10]:
            print(f"  Track {track['track_id']:3d} ({track['class']:15s}): "
                  f"{track['duration_frames']:4d} frames, "
                  f"{track['duration_seconds']:6.2f}s, "
                  f"conf={track['avg_confidence']:.2f}")

        return results_data

    def _scene_changed(
        self,
        prev_frame: np.ndarray,
        curr_frame: np.ndarray,
        threshold: float = 0.3
    ) -> bool:
        """Detect scene change using histogram comparison"""
        if prev_frame is None:
            return True

        # Convert to grayscale
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)

        # Calculate histograms
        prev_hist = cv2.calcHist([prev_gray], [0], None, [256], [0, 256])
        curr_hist = cv2.calcHist([curr_gray], [0], None, [256], [0, 256])

        # Normalize
        cv2.normalize(prev_hist, prev_hist)
        cv2.normalize(curr_hist, curr_hist)

        # Compare
        correlation = cv2.compareHist(prev_hist, curr_hist, cv2.HISTCMP_CORREL)

        return correlation < (1 - threshold)


def main():
    parser = argparse.ArgumentParser(description='Video analysis with object detection and tracking')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Extract command
    extract_parser = subparsers.add_parser('extract', help='Extract frames from video')
    extract_parser.add_argument('video', help='Input video path')
    extract_parser.add_argument('output_dir', help='Output directory for frames')
    extract_parser.add_argument('--sample-rate', type=int, default=30, help='Extract every Nth frame')
    extract_parser.add_argument('--scene-detection', action='store_true', help='Use scene change detection')

    # Detect command
    detect_parser = subparsers.add_parser('detect', help='Run object detection on video')
    detect_parser.add_argument('video', help='Input video path')
    detect_parser.add_argument('output_dir', help='Output directory')
    detect_parser.add_argument('--model', default='yolov8n.pt', help='YOLO model path')
    detect_parser.add_argument('--conf', type=float, default=0.4, help='Confidence threshold')
    detect_parser.add_argument('--iou', type=float, default=0.5, help='IoU threshold')
    detect_parser.add_argument('--batch-size', type=int, default=16, help='Batch size for inference')
    detect_parser.add_argument('--sample-rate', type=int, default=30, help='Extract every Nth frame')

    # Track command
    track_parser = subparsers.add_parser('track', help='Track objects in video')
    track_parser.add_argument('video', help='Input video path')
    track_parser.add_argument('output_dir', help='Output directory')
    track_parser.add_argument('--model', default='yolov8n.pt', help='YOLO model path')
    track_parser.add_argument('--conf', type=float, default=0.4, help='Confidence threshold')
    track_parser.add_argument('--tracker', default='bytetrack.yaml', help='Tracker config')

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(1)

    if args.command == 'extract':
        analyzer = VideoAnalyzer()
        analyzer.extract_frames(
            args.video,
            args.output_dir,
            sample_rate=args.sample_rate,
            scene_detection=args.scene_detection
        )

    elif args.command == 'detect':
        analyzer = VideoAnalyzer(args.model)

        # Extract frames
        frames_dir = os.path.join(args.output_dir, 'frames')
        frame_paths = analyzer.extract_frames(
            args.video,
            frames_dir,
            sample_rate=args.sample_rate
        )

        # Run detection
        results_path = os.path.join(args.output_dir, 'detections.json')
        analyzer.detect_batch(
            frame_paths,
            results_path,
            conf_threshold=args.conf,
            iou_threshold=args.iou,
            batch_size=args.batch_size
        )

    elif args.command == 'track':
        analyzer = VideoAnalyzer(args.model)

        # Run tracking
        os.makedirs(args.output_dir, exist_ok=True)
        results_path = os.path.join(args.output_dir, 'tracks.json')
        analyzer.track_video(
            args.video,
            results_path,
            conf_threshold=args.conf,
            tracker=args.tracker
        )


if __name__ == '__main__':
    main()
