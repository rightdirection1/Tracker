import React, { useState, useEffect } from "react";
import { useStopwatch } from "react-timer-hook";
import haversine from "haversine-distance";
import "./Timer.css";
import { isDisabled } from "@testing-library/user-event/dist/utils";

function MyStopWatch() {
  const { seconds, minutes, hours, start, pause, reset } = useStopwatch({
    autoStart: false,
  });

  const [distance, setSdistance] = useState(0); // init distance state
  const [speed, setSpeed] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [isRunning, setIsRuning] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [counter, setCounter] = useState(0);

  let initialPosition = [];
  let currentPosition = [];

  useEffect(() => {
    console.log(isRunning);
    if (isRunning) {
      start();
      setIsDisabled(false);

      setIntervalId(
        setInterval(() => {
          console.log("Start");
          watchPosition();
        }, 5000)
      );
    } else {
      clearInterval(intervalId);
      pause();
      console.log("Stopped");
    }
  }, [isRunning]);

  let checkpointHistory = [];

  const watchPosition = () => {
    setCounter(prevState => prevState + 1);
    if (navigator.geolocation) {
      setWatchId(
        navigator.geolocation.watchPosition(function (position) {
          console.log(position);
          console.log("Latitude is :", position.coords.latitude);
          console.log("Longitude is :", position.coords.longitude);
          console.log("Speed :", position.coords.speed);

          let checkpoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed,
            distance: calcDistance(
              position.coords.latitude,
              position.coords.longitude
            ),
          };

          checkpointHistory.push(checkpoint);

          const totalDistance = checkpointHistory.reduce(
            (partialSum, object) =>
              Number(partialSum) + Number(object.distance),
            0
          );

          let totalResult = totalDistance.toFixed(4);
          console.log(totalResult);
          setSdistance(totalDistance);

          if (position.coords.speed !== null) {
            setSpeed(position.coords.speed);
          } else {
            setSpeed(0);
          }

          if (position.coords.latitude == null) {
            alert("GPS not activated! Please Turn On Your GPS!");
          }
        })
      );
    }
  };

  const calcDistance = (latitude, longitude) => {
    if (checkpointHistory.length == 0) {
      return 0;
    }

    initialPosition = [
      checkpointHistory[checkpointHistory.length - 1].latitude,
      checkpointHistory[checkpointHistory.length - 1].longitude,
    ];
    currentPosition = [latitude, longitude];

    if (JSON.stringify(initialPosition) === JSON.stringify(currentPosition)) {
      return 0;
    }

    let distanceResult = haversine(initialPosition, currentPosition) / 1000;

    return Number(distanceResult).toPrecision(4);
  };

  const resetTimer = () => {
    reset();
    console.log("reset");
    setIsRuning(false);
    console.log("setIsRuning");
    setSdistance(0);
    console.log("setSdistance");
    setSpeed(0);
    console.log("setSpeed");
  
    navigator.geolocation.clearWatch(watchId);
    console.log(watchId);
    checkpointHistory = [];
  };

  const pauseTimer = () => {
    pause();
    console.log("pause");
    setIsRuning(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="header">Tracker</h1>
      <p>Duration</p>
      <p>{counter}</p>
      <div>
        <div className="box">
          {" "}
          <span>{hours < 10 ? "0" + hours : hours}</span>:
          <span>{minutes < 10 ? "0" + minutes : minutes}</span>:
          <span>{seconds < 10 ? "0" + seconds : seconds}</span>
        </div>
      </div>
      <p>{isRunning ? "Running" : "Not running"}</p>
      <button
        type="button"
        className="button-36"
        onClick={() => setIsRuning(true)}
      >
        Start
      </button>
      <button
        type="button"
        className="button-36"
        onClick={() => pauseTimer()}
        disabled={isDisabled}
      >
        Pause
      </button>
      <button
        type="button"
        className="button-36"
        onClick={() => resetTimer()}
        disabled={isDisabled}
      >
        Reset
      </button>
      <div>
        <p id="distance">{distance.toFixed(4)} m</p>
        <p id="speed">{speed.toFixed(4)} km/h</p>
      </div>
    </div>
  );
}

export default MyStopWatch;
