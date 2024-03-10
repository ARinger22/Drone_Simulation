import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import mapapi from '../constants/Mapapi';
import 'leaflet/dist/leaflet.css';
import images from '../constants/Images';
import L from 'leaflet';

const customMarkerIcon = L.icon({
    iconUrl: images.marker,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [3, -9],
});

function Coordinate() {
    const [coordinates, setCoordinates] = useState([[0, 0]]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [center, setCenter] = useState({ lat: 0, lng: 0 });


    const handleFileUpload = (event) => {
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
            case 'application/json':
                coords = parseJSONCoordinates(input);
                break;
            case 'text/csv':
                coords = parseCSVCoordinates(input);
                break;
            default:
                coords = parseTextCoordinates(input);
        }

        setCoordinates(coords);
    };

    const parseJSONCoordinates = (input) => {
        const data = JSON.parse(input);
        return data.map(({ lat, lng }) => [lat, lng]);
    };

    const parseCSVCoordinates = (input) => {
        const lines = input.split("\n");
        const coords = [];

        lines.forEach(line => {
            const [lat, lng] = line.split(",").map(parseFloat);
            if (!isNaN(lat) && !isNaN(lng)) {
                coords.push([lat, lng]);
            }
        });
        return coords;
    };

    const parseTextCoordinates = (input) => {
        const lines = input.split("\n");
        return lines.map(line => {
            const [lat, lng] = line.split(",").map(parseFloat);
            return [lat, lng];
        });
    };

    useEffect(() => {
        if (currentIndex < coordinates.length) {
            const timeoutId = setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [currentIndex, coordinates]);

    const simulateDrone = () => {
        if (coordinates.length === 0 || (coordinates[0][0] === 0 && coordinates[0][1] === 0)) {
            console.log("please enter coordinates first");
            return;
        }
        console.log(currentIndex);
    };

    const handlePause = () => {
        clearTimeout(intervalId);
    };

    return (
        <div className='h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-gray-700 text-black-400'>
            <div className='ml-2 w-full' >
                <MapContainer style={{ height: "600px", width: "100%" }} center={center} zoom={2} scrollWheelZoom={false}>
                    <TileLayer
                        url={mapapi.maptiler.url}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Polyline positions={coordinates.slice(0, currentIndex+1)} color="red" />
                    <Marker position={coordinates[currentIndex] ? coordinates[currentIndex] : [0, 0]} icon={customMarkerIcon} />
                </MapContainer>
            </div>

            <div className="flex flex-col items-center p-4">
                <textarea
                    className="w-full h-32 border border-gray-300 rounded p-2 mb-2"
                    placeholder="Enter latitude, longitude pairs"
                    onChange={(e) => parseCoordinates(e.target.value, 'text/plain')}
                />
                <input
                    type="file"
                    accept=".json, .csv, .txt"
                    className="mb-2"
                    onChange={handleFileUpload}
                />
                <div className='flex'>
                    <button
                        className="flex-col bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 mr-5"
                        onClick={simulateDrone}
                    >
                        Simulate
                    </button>
                    <button
                        className="flex-col bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
                        onClick={handlePause}
                    >
                        Pause
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Coordinate;
