import React, { useState, useEffect, useRef } from "react";

function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const lastAcceleration = useRef(0);
  const stepThreshold = 12;
  const lastStepTime = useRef(Date.now());

  const handleMotion = (event) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const totalAcc = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const now = Date.now();

    if (
      Math.abs(totalAcc - lastAcceleration.current) > stepThreshold &&
      now - lastStepTime.current > 300
    ) {
      setSteps((prev) => prev + 1);
      lastStepTime.current = now;
    }

    lastAcceleration.current = totalAcc;
  };

  const startTracking = async () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission !== "granted") {
        alert("Motion permission denied");
        return;
      }
    }

    window.addEventListener("devicemotion", handleMotion);
    setIsRunning(true);
  };

  const stopTracking = () => {
    window.removeEventListener("devicemotion", handleMotion);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      console.log("Sending steps to backend:", steps);
      // TODO: send steps to backend here
    }, 5000);

    return () => clearInterval(interval);
  }, [isRunning, steps]);

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

export default StepCounter;
