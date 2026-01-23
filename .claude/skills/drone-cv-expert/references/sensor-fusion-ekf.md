# Sensor Fusion & State Estimation Reference

## Extended Kalman Filter for Drone State

```python
import numpy as np
from typing import Tuple, Optional

class DroneEKF:
    """
    Extended Kalman Filter for drone state estimation.
    State vector: [x, y, z, vx, vy, vz, roll, pitch, yaw]
    """
    def __init__(self):
        # State: position (3), velocity (3), attitude (3)
        self.state = np.zeros(9)
        self.P = np.eye(9) * 1.0  # State covariance

        # Process noise
        self.Q = np.diag([
            0.01, 0.01, 0.01,    # Position noise
            0.05, 0.05, 0.05,    # Velocity noise
            0.001, 0.001, 0.001  # Attitude noise
        ])

        # Measurement noise matrices
        self.R_gps = np.eye(3) * 2.5       # GPS position (meters)
        self.R_baro = np.array([[0.5]])     # Barometer altitude (meters)
        self.R_imu_accel = np.eye(3) * 0.1  # Accelerometer
        self.R_imu_gyro = np.eye(3) * 0.01  # Gyroscope

        self.gravity = np.array([0, 0, 9.81])

    def predict(self, dt: float):
        """Predict step using motion model"""
        # State transition matrix (linearized)
        F = self._get_state_transition_matrix(dt)

        # Predict state
        self.state = self._motion_model(self.state, dt)

        # Predict covariance
        self.P = F @ self.P @ F.T + self.Q

    def _motion_model(self, state: np.ndarray, dt: float) -> np.ndarray:
        """Non-linear motion model"""
        new_state = state.copy()

        # Position update: x += v * dt
        new_state[0:3] += state[3:6] * dt

        return new_state

    def _get_state_transition_matrix(self, dt: float) -> np.ndarray:
        """Jacobian of motion model"""
        F = np.eye(9)
        F[0, 3] = dt  # dx/dvx
        F[1, 4] = dt  # dy/dvy
        F[2, 5] = dt  # dz/dvz
        return F

    def update_gps(self, gps_measurement: np.ndarray):
        """Update with GPS position measurement [lat, lon, alt] in local frame"""
        # Observation matrix: GPS measures position
        H = np.zeros((3, 9))
        H[0:3, 0:3] = np.eye(3)

        # Innovation
        y = gps_measurement - (H @ self.state)

        # Kalman gain
        S = H @ self.P @ H.T + self.R_gps
        K = self.P @ H.T @ np.linalg.inv(S)

        # Update
        self.state = self.state + K @ y
        self.P = (np.eye(9) - K @ H) @ self.P

    def update_barometer(self, altitude: float):
        """Update with barometer altitude measurement"""
        H = np.zeros((1, 9))
        H[0, 2] = 1  # Measures z position

        y = altitude - self.state[2]
        S = H @ self.P @ H.T + self.R_baro
        K = self.P @ H.T / S

        self.state = self.state + (K * y).flatten()
        self.P = (np.eye(9) - K @ H) @ self.P

    def update_imu(self, accel: np.ndarray, gyro: np.ndarray, dt: float):
        """Update with IMU measurements"""
        # Accelerometer updates velocity (after gravity compensation)
        roll, pitch, yaw = self.state[6:9]
        R_body_to_world = self._rotation_matrix(roll, pitch, yaw)

        # Compensate for gravity and transform to world frame
        accel_world = R_body_to_world @ accel - self.gravity

        # Simple integration for velocity update
        H_accel = np.zeros((3, 9))
        H_accel[0:3, 3:6] = np.eye(3) / dt

        innovation = accel_world - (self.state[3:6] - self._prev_velocity) / dt if hasattr(self, '_prev_velocity') else accel_world
        self._prev_velocity = self.state[3:6].copy()

        # Gyroscope updates attitude rates
        self.state[6:9] += gyro * dt

        # Normalize angles
        self.state[6:9] = np.mod(self.state[6:9] + np.pi, 2 * np.pi) - np.pi

    def _rotation_matrix(self, roll: float, pitch: float, yaw: float) -> np.ndarray:
        """Create rotation matrix from Euler angles"""
        cr, sr = np.cos(roll), np.sin(roll)
        cp, sp = np.cos(pitch), np.sin(pitch)
        cy, sy = np.cos(yaw), np.sin(yaw)

        return np.array([
            [cy*cp, cy*sp*sr - sy*cr, cy*sp*cr + sy*sr],
            [sy*cp, sy*sp*sr + cy*cr, sy*sp*cr - cy*sr],
            [-sp, cp*sr, cp*cr]
        ])

    def get_position(self) -> np.ndarray:
        return self.state[0:3]

    def get_velocity(self) -> np.ndarray:
        return self.state[3:6]

    def get_attitude(self) -> np.ndarray:
        return self.state[6:9]

    def get_covariance(self) -> np.ndarray:
        return self.P


class UnscentedKalmanFilter:
    """
    Unscented Kalman Filter - better for highly nonlinear systems.
    Use when EKF linearization introduces significant errors.
    """
    def __init__(self, n: int = 9):
        self.n = n
        self.state = np.zeros(n)
        self.P = np.eye(n) * 1.0

        # UKF parameters
        self.alpha = 0.001
        self.beta = 2.0
        self.kappa = 0.0
        self.lambda_ = self.alpha**2 * (n + self.kappa) - n

        # Weights for mean and covariance
        self.Wm = np.zeros(2 * n + 1)
        self.Wc = np.zeros(2 * n + 1)
        self.Wm[0] = self.lambda_ / (n + self.lambda_)
        self.Wc[0] = self.Wm[0] + (1 - self.alpha**2 + self.beta)
        for i in range(1, 2 * n + 1):
            self.Wm[i] = 1 / (2 * (n + self.lambda_))
            self.Wc[i] = self.Wm[i]

    def _sigma_points(self) -> np.ndarray:
        """Generate sigma points"""
        sigma_pts = np.zeros((2 * self.n + 1, self.n))
        sigma_pts[0] = self.state

        sqrt_P = np.linalg.cholesky((self.n + self.lambda_) * self.P)

        for i in range(self.n):
            sigma_pts[i + 1] = self.state + sqrt_P[i]
            sigma_pts[self.n + i + 1] = self.state - sqrt_P[i]

        return sigma_pts

    def predict(self, motion_model: callable, Q: np.ndarray, dt: float):
        """Predict using unscented transform"""
        # Generate sigma points
        sigma_pts = self._sigma_points()

        # Transform through motion model
        transformed = np.array([motion_model(sp, dt) for sp in sigma_pts])

        # Compute predicted mean
        self.state = np.sum(self.Wm[:, np.newaxis] * transformed, axis=0)

        # Compute predicted covariance
        self.P = Q.copy()
        for i in range(2 * self.n + 1):
            diff = transformed[i] - self.state
            self.P += self.Wc[i] * np.outer(diff, diff)

    def update(self, measurement: np.ndarray, measurement_model: callable, R: np.ndarray):
        """Update with measurement"""
        # Generate sigma points
        sigma_pts = self._sigma_points()

        # Transform through measurement model
        transformed = np.array([measurement_model(sp) for sp in sigma_pts])

        # Predicted measurement
        z_pred = np.sum(self.Wm[:, np.newaxis] * transformed, axis=0)

        # Innovation covariance
        Pzz = R.copy()
        for i in range(2 * self.n + 1):
            diff = transformed[i] - z_pred
            Pzz += self.Wc[i] * np.outer(diff, diff)

        # Cross covariance
        Pxz = np.zeros((self.n, len(measurement)))
        for i in range(2 * self.n + 1):
            diff_x = sigma_pts[i] - self.state
            diff_z = transformed[i] - z_pred
            Pxz += self.Wc[i] * np.outer(diff_x, diff_z)

        # Kalman gain
        K = Pxz @ np.linalg.inv(Pzz)

        # Update
        self.state = self.state + K @ (measurement - z_pred)
        self.P = self.P - K @ Pzz @ K.T


class ComplementaryFilter:
    """
    Simple complementary filter for attitude estimation.
    Faster than Kalman for basic stabilization.
    """
    def __init__(self, alpha: float = 0.98):
        self.alpha = alpha  # Trust gyroscope vs accelerometer
        self.roll = 0.0
        self.pitch = 0.0
        self.yaw = 0.0

    def update(self, accel: np.ndarray, gyro: np.ndarray, dt: float,
               mag: Optional[np.ndarray] = None) -> Tuple[float, float, float]:
        """Update attitude estimate"""
        # Accelerometer-based attitude (gravity direction)
        accel_roll = np.arctan2(accel[1], accel[2])
        accel_pitch = np.arctan2(-accel[0], np.sqrt(accel[1]**2 + accel[2]**2))

        # Gyroscope integration
        self.roll += gyro[0] * dt
        self.pitch += gyro[1] * dt
        self.yaw += gyro[2] * dt

        # Complementary fusion
        self.roll = self.alpha * self.roll + (1 - self.alpha) * accel_roll
        self.pitch = self.alpha * self.pitch + (1 - self.alpha) * accel_pitch

        # Magnetometer for yaw (if available)
        if mag is not None:
            # Compensate for tilt
            mx = mag[0] * np.cos(self.pitch) + mag[2] * np.sin(self.pitch)
            my = (mag[0] * np.sin(self.roll) * np.sin(self.pitch) +
                  mag[1] * np.cos(self.roll) -
                  mag[2] * np.sin(self.roll) * np.cos(self.pitch))
            mag_yaw = np.arctan2(-my, mx)
            self.yaw = self.alpha * self.yaw + (1 - self.alpha) * mag_yaw

        return self.roll, self.pitch, self.yaw
```

## Multi-Sensor Fusion Architecture

```python
from dataclasses import dataclass
from typing import Dict, List, Callable
import time

@dataclass
class SensorReading:
    sensor_type: str
    timestamp: float
    data: np.ndarray
    covariance: np.ndarray

class MultiSensorFusion:
    """
    Asynchronous multi-sensor fusion framework.
    Handles GPS, IMU, Barometer, Optical Flow, LiDAR, etc.
    """
    def __init__(self):
        self.ekf = DroneEKF()
        self.sensor_queue: List[SensorReading] = []
        self.last_update_time = time.time()

        # Sensor update callbacks
        self.update_functions: Dict[str, Callable] = {
            'gps': self._update_gps,
            'imu': self._update_imu,
            'barometer': self._update_baro,
            'optical_flow': self._update_optical_flow,
            'lidar': self._update_lidar
        }

    def add_reading(self, reading: SensorReading):
        """Add sensor reading to fusion queue"""
        self.sensor_queue.append(reading)
        self.sensor_queue.sort(key=lambda x: x.timestamp)

    def process(self) -> np.ndarray:
        """Process all pending sensor readings"""
        while self.sensor_queue:
            reading = self.sensor_queue.pop(0)

            # Predict to reading time
            dt = reading.timestamp - self.last_update_time
            if dt > 0:
                self.ekf.predict(dt)
                self.last_update_time = reading.timestamp

            # Update with sensor reading
            if reading.sensor_type in self.update_functions:
                self.update_functions[reading.sensor_type](reading)

        return self.ekf.state

    def _update_gps(self, reading: SensorReading):
        self.ekf.R_gps = reading.covariance
        self.ekf.update_gps(reading.data)

    def _update_imu(self, reading: SensorReading):
        accel = reading.data[:3]
        gyro = reading.data[3:6]
        self.ekf.update_imu(accel, gyro, 0.01)

    def _update_baro(self, reading: SensorReading):
        self.ekf.update_barometer(reading.data[0])

    def _update_optical_flow(self, reading: SensorReading):
        """Update with optical flow velocity measurement"""
        # Optical flow gives ground-relative velocity
        H = np.zeros((2, 9))
        H[0, 3] = 1  # vx
        H[1, 4] = 1  # vy

        R = reading.covariance[:2, :2]
        y = reading.data[:2] - self.ekf.state[3:5]
        S = H @ self.ekf.P @ H.T + R
        K = self.ekf.P @ H.T @ np.linalg.inv(S)
        self.ekf.state = self.ekf.state + K @ y
        self.ekf.P = (np.eye(9) - K @ H) @ self.ekf.P

    def _update_lidar(self, reading: SensorReading):
        """Update with LiDAR altitude"""
        self.ekf.update_barometer(reading.data[0])
```
