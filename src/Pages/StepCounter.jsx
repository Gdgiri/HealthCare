import React, { useState, useEffect, useRef } from "react";

function StepCounterImproved() {
  const [steps, setSteps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const accBuffer = useRef([]);
  const gyroBuffer = useRef([]);
  const lastStepTime = useRef(0);

  const bufferSize = 10;
  const stepGap = 400;
  const accThreshold = 1.0;
  const gyroThreshold = 0.5;

  const handleMotion = (event) => {
    const acc = event.accelerationIncludingGravity;
    const gyro = event.rotationRate;
    if (!acc || !gyro) return;

    // Total acceleration magnitude
    const accMag = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    accBuffer.current.push(accMag);
    if (accBuffer.current.length > bufferSize) accBuffer.current.shift();

    // Gyroscope magnitude (rotational velocity)
    const gyroMag = Math.sqrt(
      gyro.alpha ** 2 + gyro.beta ** 2 + gyro.gamma ** 2
    );
    gyroBuffer.current.push(gyroMag);
    if (gyroBuffer.current.length > bufferSize) gyroBuffer.current.shift();

    // Calculate average values
    const avgAcc =
      accBuffer.current.reduce((a, b) => a + b, 0) / accBuffer.current.length;
    const avgGyro =
      gyroBuffer.current.reduce((a, b) => a + b, 0) / gyroBuffer.current.length;

    const now = Date.now();

    // Detect step if acceleration spikes above threshold AND rotation above threshold (typical walking pattern)
    if (
      avgAcc > accThreshold &&
      avgGyro > gyroThreshold &&
      now - lastStepTime.current > stepGap
    ) {
      setSteps((prev) => prev + 1);
      lastStepTime.current = now;
    }
  };

  const startTracking = async () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission !== "granted") {
        alert("Permission denied");
        return;
      }
    }

    window.addEventListener("devicemotion", handleMotion);
    setIsRunning(true);
  };

  const stopTracking = () => {
    window.removeEventListener("devicemotion", handleMotion);
    setIsRunning(false);
    accBuffer.current = [];
    gyroBuffer.current = [];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          🚶 Step Counter
        </h2>
        <p className="text-4xl font-semibold mb-6 text-gray-700">
          {steps} Steps
        </p>
        {!isRunning ? (
          <button
            onClick={startTracking}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg text-lg transition duration-200"
          >
            Start
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg text-lg transition duration-200"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

export default StepCounterImproved;
