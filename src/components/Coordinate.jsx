import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import mapapi from "../constants/Mapapi";
import "leaflet/dist/leaflet.css";
import images from "../constants/Images";
import L from "leaflet";
import styled, { keyframes } from "styled-components";
import { slideInFromTop } from "../constants/slides";

const Main = styled.div`
  animation: ${slideInFromTop} 0.2s ease-in-out;
`;

const customMarkerIcon = L.icon({
  iconUrl: images.marker,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [3, -9],
});

function Coordinate() {
  const [coordinates, setCoordinates] = useState([[0, 0]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [seekValue, setSeekValue] = useState(0);
  const [resume, setResume] = useState(false);

  const handleFileUpload = (event) => {
    setIsSimulating(false);
    if (!event) return;
    setCoordinates([[0, 0]]);
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const contents = e.target.result;
      parseCoordinates(contents, file.type);
    };

    reader.readAsText(file);
  };

  const parseCoordinates = (input, fileType) => {
    let coords = [];

    switch (fileType) {
      case "application/json":
        coords = parseJSONCoordinates(input);
        break;
      case "text/csv":
        coords = parseCSVCoordinates(input);
        break;
      default:
        coords = parseTextCoordinates(input);
    }

    setCoordinates(coords);
    setCurrentIndex(0);
    setAlertMessage("");
  };

  const parseJSONCoordinates = (input) => {
    const data = JSON.parse(input);
    return data.map(({ lat, lng }) => [lat, lng]);
  };

  const parseCSVCoordinates = (input) => {
    const lines = input.split("\n");
    const coords = [];

    lines.forEach((line) => {
      const [lat, lng] = line.split(",").map(parseFloat);
      if (!isNaN(lat) && !isNaN(lng)) {
        coords.push([lat, lng]);
      }
    });
    return coords;
  };

  const [wrongInput, setWrongInput] = useState(false);
  const [wrongInputText, setWrongInputText] = useState("");

  useEffect(() => {
    if (wrongInput) {
      const timeoutId = setTimeout(() => {
        setWrongInput(false);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [wrongInput]);

  const parseTextCoordinates = (input) => {
    const lines = input.split("\n");
    const coords = [];

    lines.forEach((line) => {
      const [lat, lng] = line.split(",").map(parseFloat);
      if (!isNaN(lat) && !isNaN(lng)) {
        coords.push([lat, lng]);
      } else {
        setWrongInput(true);
        setWrongInputText(`Invalid input: ${line}`);
      }
    });
    return coords;
  };

  useEffect(() => {
    if (isSimulating && currentIndex < coordinates.length - 1) {
      const timeoutId = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, coordinates, isSimulating]);

  const simulateDrone = () => {
    if (coordinates.length === 0) {
      setAlertMessage("Please enter coordinates first");
      return;
    }
    setIsSimulating(true);
    setAlertMessage("");
  };

  const handlePause = () => {
    setIsSimulating(false);
  };

  const handleResume = () => {
    setResume(true);
    setIsSimulating(true);
  };

  const handleSeekChange = (event) => {
    setSeekValue(parseFloat(event.target.value));
  };

  useEffect(() => {
    if (isSimulating && !resume) {
      setCurrentIndex(Math.floor(seekValue * (coordinates.length - 1)));
    }
  }, [seekValue, coordinates, isSimulating]);

  const [showMaxCoordinatesWarning, setShowMaxCoordinatesWarning] =
    useState(false);
  useEffect(() => {
    setResume(false);
    if (isSimulating && currentIndex === coordinates.length - 1) {
      setShowMaxCoordinatesWarning(true);
      const timeoutId = setTimeout(() => {
        setShowMaxCoordinatesWarning(false);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, coordinates, isSimulating]);

  return (
    <div className="h-5500 pb-5 bg-gradient-to-b from-blue-900 to-gray-700 text-black-400">
      {showMaxCoordinatesWarning && (
        <div className="bg-green-200 text-green-800 py-2 px-4 rounded">
          Max coordinates reached or you are on the final destination
        </div>
      )}
      {wrongInput && (
        <div className="bg-red-200 text-red-800 py-2 px-4 rounded">
          {wrongInputText}
        </div>
      )}
      <Main className="pt-5 flex flex-col md:flex-row items-center justify-center">
        <div className="ml-2 w-full">
          <MapContainer
            style={{ height: "700px", width: "100%" }}
            center={center}
            zoom={2}
            scrollWheelZoom={false}
          >
            <TileLayer
              url={mapapi.maptiler.url}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Polyline
              positions={coordinates.slice(0, currentIndex + 1)}
              color="red"
            />
            <Marker
              position={
                coordinates[currentIndex] ? coordinates[currentIndex] : [0, 0]
              }
              icon={customMarkerIcon}
            />
          </MapContainer>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={seekValue}
            onChange={handleSeekChange}
          />
        </div>

        <div className="flex flex-col items-center p-4">
          <textarea
            className="w-full h-32 border border-gray-300 rounded p-2 mb-2"
            placeholder="Enter latitude, longitude pairs like 37.7749, -122.4194 on different lines"
            onChange={(e) => parseCoordinates(e.target.value, "text/plain")}
          />
          <input
            type="file"
            accept=".json, .csv, .txt"
            className="mb-2"
            onChange={handleFileUpload}
          />
          {alertMessage && (
            <div className="bg-red-200 text-red-800 py-2 px-4 rounded mb-4">
              {alertMessage}
            </div>
          )}
          <div className="flex">
            <button
              className="flex-col bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 mr-5"
              onClick={simulateDrone}
              disabled={isSimulating}
            >
              Simulate
            </button>
            <button
              className="flex-col bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 mr-5"
              onClick={handlePause}
              disabled={!isSimulating}
            >
              Pause
            </button>
            <button
              className="flex-col bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
              onClick={handleResume}
              disabled={isSimulating || currentIndex === coordinates.length - 1}
            >
              Resume
            </button>
          </div>
        </div>
      </Main>
    </div>
  );
}

export default Coordinate;
