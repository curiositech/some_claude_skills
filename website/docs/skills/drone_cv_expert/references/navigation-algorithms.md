---
title: Navigation Algorithms Reference
sidebar_label: Navigation Algorithms Refer...
sidebar_position: 1
---
# Navigation Algorithms Reference

## GPS-Based Waypoint Navigation

```python
class PIDController:
    """Standard PID controller for position control"""
    def __init__(self, kp: float, ki: float, kd: float):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.integral = 0.0
        self.prev_error = 0.0

    def update(self, error: float, dt: float = 0.02) -> float:
        self.integral += error * dt
        derivative = (error - self.prev_error) / dt
        self.prev_error = error
        return self.kp * error + self.ki * self.integral + self.kd * derivative


class WaypointNavigator:
    """GPS waypoint navigation with PID control"""
    def __init__(self, kp=1.0, ki=0.1, kd=0.05):
        self.pid_lat = PIDController(kp, ki, kd)
        self.pid_lon = PIDController(kp, ki, kd)
        self.pid_alt = PIDController(kp, ki, kd)
        self.waypoint_threshold = 2.0  # meters

    def navigate_to_waypoint(self, current_pos, target_pos):
        """Generate velocity commands to reach waypoint"""
        lat_error = target_pos.lat - current_pos.lat
        lon_error = target_pos.lon - current_pos.lon
        alt_error = target_pos.alt - current_pos.alt

        return {
            'north': self.pid_lat.update(lat_error),
            'east': self.pid_lon.update(lon_error),
            'up': self.pid_alt.update(alt_error)
        }

    def is_waypoint_reached(self, current_pos, target_pos) -> bool:
        """Check if within threshold of waypoint"""
        import math
        distance = math.sqrt(
            (current_pos.lat - target_pos.lat)**2 +
            (current_pos.lon - target_pos.lon)**2
        ) * 111000  # Rough meters conversion
        return distance < self.waypoint_threshold
```

## Visual SLAM Pipeline

```python
import cv2
import numpy as np
from typing import List, Tuple, Optional

class VisualSLAM:
    """ORB-SLAM style visual SLAM for GPS-denied navigation"""
    def __init__(self, camera_matrix: np.ndarray = None):
        self.orb = cv2.ORB_create(nfeatures=2000)
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        self.map_points: List[np.ndarray] = []
        self.camera_poses: List[np.ndarray] = []
        self.prev_frame = None
        self.prev_keypoints = None
        self.prev_descriptors = None

        # Camera intrinsics (default for 640x480)
        self.K = camera_matrix if camera_matrix is not None else np.array([
            [500, 0, 320],
            [0, 500, 240],
            [0, 0, 1]
        ], dtype=np.float32)

    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, List]:
        """Process frame and return estimated pose"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame

        # Feature detection
        keypoints, descriptors = self.orb.detectAndCompute(gray, None)

        if self.prev_frame is None:
            # Initialize with first frame
            self.prev_frame = gray
            self.prev_keypoints = keypoints
            self.prev_descriptors = descriptors
            pose = np.eye(4)
            self.camera_poses.append(pose)
            return pose, []

        # Match features
        matches = self.matcher.match(self.prev_descriptors, descriptors)
        matches = sorted(matches, key=lambda x: x.distance)[:100]

        if len(matches) < 10:
            return self.camera_poses[-1], self.map_points

        # Extract matched points
        pts1 = np.float32([self.prev_keypoints[m.queryIdx].pt for m in matches])
        pts2 = np.float32([keypoints[m.trainIdx].pt for m in matches])

        # Estimate pose
        E, mask = cv2.findEssentialMat(pts1, pts2, self.K, method=cv2.RANSAC)
        _, R, t, mask = cv2.recoverPose(E, pts1, pts2, self.K)

        # Build pose matrix
        pose = np.eye(4)
        pose[:3, :3] = R
        pose[:3, 3] = t.flatten()

        # Chain with previous pose
        if self.camera_poses:
            pose = self.camera_poses[-1] @ pose

        self.camera_poses.append(pose)

        # Update state
        self.prev_frame = gray
        self.prev_keypoints = keypoints
        self.prev_descriptors = descriptors

        return pose, self.map_points


class VisualInertialOdometry:
    """VIO combining camera and IMU for robust tracking"""
    def __init__(self):
        self.visual_slam = VisualSLAM()
        self.imu_buffer = []
        self.gravity = np.array([0, 0, -9.81])

    def process_imu(self, accel: np.ndarray, gyro: np.ndarray, dt: float):
        """Buffer IMU measurements for fusion"""
        self.imu_buffer.append({
            'accel': accel,
            'gyro': gyro,
            'dt': dt
        })

    def process_frame(self, frame: np.ndarray):
        """Fuse visual with IMU for robust pose"""
        visual_pose, _ = self.visual_slam.process_frame(frame)

        # Integrate IMU between frames
        imu_delta = self._integrate_imu()

        # Simple fusion (production would use EKF/UKF)
        fused_pose = visual_pose.copy()
        if imu_delta is not None:
            # Weight visual more when feature tracking is good
            fused_pose[:3, 3] = 0.8 * visual_pose[:3, 3] + 0.2 * imu_delta

        self.imu_buffer = []
        return fused_pose

    def _integrate_imu(self) -> Optional[np.ndarray]:
        if not self.imu_buffer:
            return None

        position = np.zeros(3)
        velocity = np.zeros(3)

        for meas in self.imu_buffer:
            accel = meas['accel'] - self.gravity
            dt = meas['dt']
            velocity += accel * dt
            position += velocity * dt

        return position
```

## Path Planning Algorithms

### A* 3D Path Planning

```python
import heapq
import numpy as np
from typing import List, Tuple, Set, Optional

class Drone3DPathPlanner:
    """A* path planning with 3D obstacle avoidance"""
    def __init__(self, grid_resolution: float = 0.5, safety_margin: float = 1.0):
        self.resolution = grid_resolution
        self.safety_margin = safety_margin
        self.obstacle_map: Set[Tuple[int, int, int]] = set()

    def add_obstacles(self, point_cloud: np.ndarray):
        """Add obstacles from 3D point cloud"""
        for point in point_cloud:
            grid_cell = self._to_grid(point)
            self.obstacle_map.add(grid_cell)
            # Add safety margin
            for dx in range(-2, 3):
                for dy in range(-2, 3):
                    for dz in range(-2, 3):
                        self.obstacle_map.add((
                            grid_cell[0] + dx,
                            grid_cell[1] + dy,
                            grid_cell[2] + dz
                        ))

    def _to_grid(self, pos: Tuple[float, float, float]) -> Tuple[int, int, int]:
        return (
            int(pos[0] / self.resolution),
            int(pos[1] / self.resolution),
            int(pos[2] / self.resolution)
        )

    def _from_grid(self, cell: Tuple[int, int, int]) -> Tuple[float, float, float]:
        return (
            cell[0] * self.resolution,
            cell[1] * self.resolution,
            cell[2] * self.resolution
        )

    def a_star(self, start: Tuple[float, float, float],
               goal: Tuple[float, float, float]) -> Optional[List[Tuple[float, float, float]]]:
        """Find optimal path avoiding obstacles"""
        start_cell = self._to_grid(start)
        goal_cell = self._to_grid(goal)

        open_set = [(0, start_cell)]
        came_from = {}
        g_score = {start_cell: 0}
        f_score = {start_cell: self._heuristic(start_cell, goal_cell)}

        while open_set:
            current = heapq.heappop(open_set)[1]

            if self._is_goal_reached(current, goal_cell):
                return self._reconstruct_path(came_from, current)

            for neighbor in self._get_neighbors(current):
                if neighbor in self.obstacle_map:
                    continue

                tentative_g = g_score[current] + self._distance(current, neighbor)

                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + self._heuristic(neighbor, goal_cell)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))

        return None  # No path found

    def _heuristic(self, pos1: Tuple, pos2: Tuple) -> float:
        """Euclidean distance heuristic"""
        return np.sqrt(sum((a - b) ** 2 for a, b in zip(pos1, pos2)))

    def _distance(self, pos1: Tuple, pos2: Tuple) -> float:
        return self._heuristic(pos1, pos2)

    def _is_goal_reached(self, current: Tuple, goal: Tuple, threshold: int = 2) -> bool:
        return all(abs(a - b) <= threshold for a, b in zip(current, goal))

    def _get_neighbors(self, cell: Tuple[int, int, int]) -> List[Tuple[int, int, int]]:
        """26-connected neighbors in 3D grid"""
        neighbors = []
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                for dz in [-1, 0, 1]:
                    if dx == 0 and dy == 0 and dz == 0:
                        continue
                    neighbors.append((cell[0] + dx, cell[1] + dy, cell[2] + dz))
        return neighbors

    def _reconstruct_path(self, came_from: dict, current: Tuple) -> List[Tuple[float, float, float]]:
        path = [self._from_grid(current)]
        while current in came_from:
            current = came_from[current]
            path.append(self._from_grid(current))
        return list(reversed(path))
```

### RRT (Rapidly-exploring Random Tree)

```python
import random
import numpy as np
from typing import List, Tuple, Optional

class RRTPlanner:
    """RRT for dynamic obstacle avoidance"""
    def __init__(self, bounds: Tuple[Tuple, Tuple], step_size: float = 1.0):
        self.bounds = bounds  # ((xmin, ymin, zmin), (xmax, ymax, zmax))
        self.step_size = step_size
        self.tree = []
        self.obstacle_check_fn = None

    def plan(self, start: Tuple, goal: Tuple,
             obstacle_check: callable, max_iterations: int = 1000) -> Optional[List[Tuple]]:
        """Plan path using RRT"""
        self.obstacle_check_fn = obstacle_check
        self.tree = [{'pos': start, 'parent': None}]

        for _ in range(max_iterations):
            # Sample random point (bias toward goal)
            if random.random() < 0.1:
                sample = goal
            else:
                sample = self._random_sample()

            # Find nearest node
            nearest_idx = self._nearest_node(sample)
            nearest = self.tree[nearest_idx]

            # Extend toward sample
            new_pos = self._steer(nearest['pos'], sample)

            # Check collision
            if self._collision_free(nearest['pos'], new_pos):
                self.tree.append({'pos': new_pos, 'parent': nearest_idx})

                # Check if we reached goal
                if self._distance(new_pos, goal) < self.step_size:
                    self.tree.append({'pos': goal, 'parent': len(self.tree) - 1})
                    return self._extract_path()

        return None

    def _random_sample(self) -> Tuple:
        return tuple(
            random.uniform(self.bounds[0][i], self.bounds[1][i])
            for i in range(3)
        )

    def _nearest_node(self, sample: Tuple) -> int:
        distances = [self._distance(node['pos'], sample) for node in self.tree]
        return int(np.argmin(distances))

    def _steer(self, from_pos: Tuple, to_pos: Tuple) -> Tuple:
        direction = np.array(to_pos) - np.array(from_pos)
        distance = np.linalg.norm(direction)
        if distance <= self.step_size:
            return to_pos
        return tuple(np.array(from_pos) + direction / distance * self.step_size)

    def _collision_free(self, from_pos: Tuple, to_pos: Tuple, steps: int = 10) -> bool:
        for i in range(steps + 1):
            t = i / steps
            point = tuple(
                from_pos[j] + t * (to_pos[j] - from_pos[j])
                for j in range(3)
            )
            if self.obstacle_check_fn(point):
                return False
        return True

    def _distance(self, p1: Tuple, p2: Tuple) -> float:
        return np.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))

    def _extract_path(self) -> List[Tuple]:
        path = []
        idx = len(self.tree) - 1
        while idx is not None:
            path.append(self.tree[idx]['pos'])
            idx = self.tree[idx]['parent']
        return list(reversed(path))
```

## AprilTag Localization

```python
import cv2
import numpy as np
from typing import Dict, List, Optional

# Requires: pip install pupil-apriltags
from pupil_apriltags import Detector

class AprilTagLocalizer:
    """Localization using AprilTag markers for GPS-denied environments"""
    def __init__(self, tag_size: float = 0.16, camera_matrix: np.ndarray = None):
        self.detector = Detector(
            families='tag36h11',
            nthreads=4,
            quad_decimate=1.0,
            quad_sigma=0.0,
            refine_edges=True,
            decode_sharpening=0.25
        )
        self.tag_size = tag_size
        self.K = camera_matrix

        # Known tag positions in world frame
        self.tag_world_positions: Dict[int, np.ndarray] = {}

    def register_tag(self, tag_id: int, world_position: np.ndarray):
        """Register known tag position for localization"""
        self.tag_world_positions[tag_id] = world_position

    def localize(self, frame: np.ndarray) -> Optional[np.ndarray]:
        """Estimate drone position from visible tags"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame

        # Detect tags
        detections = self.detector.detect(
            gray,
            estimate_tag_pose=True,
            camera_params=(self.K[0, 0], self.K[1, 1], self.K[0, 2], self.K[1, 2]),
            tag_size=self.tag_size
        )

        poses = []
        for det in detections:
            if det.tag_id in self.tag_world_positions:
                # Get tag-to-camera transform
                R = det.pose_R
                t = det.pose_t

                # Invert to get camera-in-tag frame
                R_inv = R.T
                t_inv = -R_inv @ t

                # Transform to world frame
                tag_world = self.tag_world_positions[det.tag_id]
                camera_world = tag_world + t_inv.flatten()

                poses.append(camera_world)

        if not poses:
            return None

        # Average multiple tag observations
        return np.mean(poses, axis=0)
```
