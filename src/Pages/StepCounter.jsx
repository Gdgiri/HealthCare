// import React, { useState, useEffect, useRef } from "react";

// function StepCounter() {
//   const [steps, setSteps] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);

//   const accBuffer = useRef([]);
//   const lastStepTime = useRef(0);

//   const bufferSize = 10;
//   const stepGap = 400; // minimum ms between steps

//   const minStepAccelDiff = 1.0;
//   const maxStepAccelDiff = 3.0;

//   const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

//   // Use useRef to keep a stable function reference
//   const handleMotionRef = useRef();

//   if (!handleMotionRef.current) {
//     handleMotionRef.current = (event) => {
//       const acc = event.accelerationIncludingGravity;
//       if (!acc) return;

//       const totalAcc = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

//       accBuffer.current.push(totalAcc);
//       if (accBuffer.current.length > bufferSize) {
//         accBuffer.current.shift();
//       }

//       const avgAcc = average(accBuffer.current);
//       const diff = totalAcc - avgAcc;
//       const now = Date.now();

//       if (
//         diff > minStepAccelDiff &&
//         diff < maxStepAccelDiff &&
//         now - lastStepTime.current > stepGap
//       ) {
//         setSteps((prev) => prev + 1);
//         lastStepTime.current = now;
//       }
//     };
//   }

//   const startTracking = async () => {
//     if (typeof DeviceMotionEvent.requestPermission === "function") {
//       const permission = await DeviceMotionEvent.requestPermission();
//       if (permission !== "granted") {
//         alert("Permission denied");
//         return;
//       }
//     }

//     window.addEventListener("devicemotion", handleMotionRef.current);
//     setIsRunning(true);
//   };

//   const stopTracking = () => {
//     window.removeEventListener("devicemotion", handleMotionRef.current);
//     setIsRunning(false);
//     accBuffer.current = [];
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white">
//       <div className="bg-white shadow-lg rounded-xl p-8 max-w-sm w-full text-center">
//         <h2 className="text-2xl font-bold text-blue-600 mb-4">
//           🚶 Step Counter
//         </h2>
//         <p className="text-4xl font-semibold mb-6 text-gray-700">
//           {steps} Steps
//         </p>
//         {!isRunning ? (
//           <button
//             onClick={startTracking}
//             className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg text-lg transition duration-200"
//           >
//             Start
//           </button>
//         ) : (
//           <button
//             onClick={stopTracking}
//             className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg text-lg transition duration-200"
//           >
//             Stop
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default StepCounter;

import React, { useState, useEffect, useRef } from "react";

function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const accBuffer = useRef([]);
  const lastStepTime = useRef(0);

  // Parameters to tweak for sensitivity
  const bufferSize = 5;
  const stepGap = 400; // Increased minimum ms between steps
  const stepPeakMinDiff = 0.5; // minimum difference from avg to count as step
  const stepPeakMaxDiff = 5; // lowered max difference to ignore big shakes

  // Stable function reference for event listener
  const handleMotionRef = useRef(null);

  if (!handleMotionRef.current) {
    handleMotionRef.current = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const totalAcc = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

      // Update buffer for smoothing
      accBuffer.current.push(totalAcc);
      if (accBuffer.current.length > bufferSize) {
        accBuffer.current.shift();
      }

      // Calculate average acceleration from buffer
      const avgAcc =
        accBuffer.current.reduce((sum, val) => sum + val, 0) /
        accBuffer.current.length;

      const diff = totalAcc - avgAcc;
      const now = Date.now();

      // Reject too fast steps & big shakes
      if (
        diff > stepPeakMinDiff &&
        diff < stepPeakMaxDiff &&
        now - lastStepTime.current > stepGap
      ) {
        setSteps((prev) => prev + 1);
        lastStepTime.current = now;
      }
    };
  }

  const startTracking = async () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission !== "granted") {
        alert("Motion permission denied");
        return;
      }
    }

    window.addEventListener("devicemotion", handleMotionRef.current);
    setIsRunning(true);
  };

  const stopTracking = () => {
    window.removeEventListener("devicemotion", handleMotionRef.current);
    setIsRunning(false);
    accBuffer.current = [];
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
