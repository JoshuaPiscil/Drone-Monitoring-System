import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Map from "./components/Map";
import jsPDF from "jspdf";


const socket = io("http://localhost:4000");


function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    socket.on("telemetry", (data) => {
      setTelemetry(data);
      setRoute(prev => [...prev, data.gps]);
    });
  }, []);

   const exportPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("drone route report", 20, 20);
      doc.setFontSize(10);
      doc.text(`Export Date: ${new Date().toLocaleString()}`, 20, 30);
      const totalDistance = calculateTotalDistance(route);
      doc.text(`Total Distance: ${totalDistance.toFixed(2)} meters`, 20, 35);

    if (route.length === 0) {
      doc.text("No Data Available.", 20, 40);
    } else {
      doc.setFontSize(12);
      doc.text("GPS coordinates:", 20, 40);
      route.forEach((point, index) => {
        doc.text(`${index + 1}. Lat: ${point.lat.toFixed(5)}, Lng: ${point.lng.toFixed(5)}`, 20, 50 + index * 6);
      });
    }

    doc.save("report-route-drone.pdf");
  };

  function haversineDistance(coord1, coord2) {
  const toRad = (x) => (x * Math.PI) / 180;

  const R = 6371000;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);

  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
  }

  function calculateTotalDistance(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineDistance(route[i - 1], route[i]);
  }
  return total;
  };

  const [activeTab, setActiveTab] = useState("live");

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem ("flightHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const saveFlightToHistory = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      distance: calculateTotalDistance(route),
      points: route
    };

    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    localStorage.setItem("flightHistory", JSON.stringify(updatedHistory));
    setRoute([]);
  };

  const deleteFlight = (id) => {
    const updated = history.filter((flight) => flight.id !== id);
    setHistory(updated);
    localStorage.setItem("flightHistory", JSON.stringify(updated));
  };

  return (
  <div className="flex min-h-screen">
    {/* Sidebar */}
    <aside className="w-64 bg-gray-900 text-white p-6 flex-shrink-0">
      <h2 className="text-2xl font-bold mb-6"> Panel</h2>
      <nav className="flex flex-col gap-4 text-lg">
        <button 
          onClick={() => setActiveTab("live")}
          className={`hover:bg-gray-700 p-2 rounded text-left ${
        activeTab === "live" ? "bg-gray-700 font-semibold" : ""}`}> 
        📍  Live View
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`p-2 rounded text-left hover:bg-gray-700 ${
          activeTab === "history" ? "bg-gray-700 font-semibold" : ""
        }`}
        >
        📄 History
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`p-2 rounded text-left hover:bg-gray-700 ${
          activeTab === "settings" ? "bg-gray-700 font-semibold" : ""
        }`}
        >
          ⚙️ Settings
        </button>
      </nav>
    </aside>

    {/* Main Content */}
    <main className="flex-1 p-6 bg-gray-50 transition-all duration-300">
      {activeTab === "live" && (
        <>
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Drone Monitoring Dashboard
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => setRoute([])}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
        >
          Clean Route
        </button>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(route, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "ruta-dron.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
        >
          Export JSON File
        </button>

        <button
          onClick={exportPDF}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transform hover:scale-105 transition-transform duration-300"
        >
          Export PDF
        </button>

        <button
          onClick={saveFlightToHistory}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transform hover:scale-105 transition-transform duration-300"
          >
            Save Flight to History
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Map gps={telemetry?.gps} route={route} />
        <div className="p-4 bg-gray-100 rounded-lg shadow-inner">
          {telemetry ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
              <li>
                🔋 Battery:{" "}
                <span className={`font-bold ${telemetry.battery < 30 ? "text-red-600 animate-pulse" : "text-green-600"}`}>
                  {telemetry.battery}%
                </span>
              </li>
              <li><strong>Height:</strong> {telemetry.altitude.toFixed(1)} m</li>
              <li><strong>Velocity:</strong> {telemetry.speed.toFixed(1)} m/s</li>
              <li><strong>GPS:</strong> {telemetry.gps.lat.toFixed(5)}, {telemetry.gps.lng.toFixed(5)}</li>
              <li><strong>Temperature:</strong> {telemetry.weather.temp} °C</li>
              <li><strong>Humidity:</strong> {telemetry.weather.humidity} %</li>
              <li><strong>Condition:</strong> {telemetry.weather.description}</li>
              <li><strong>Wind:</strong> {telemetry.weather.windSpeed} m/s</li>
            </ul>
          ) : (
            <p>Loading drone data...</p>
          )}
        </div>
      </div>
       </>
      )}
    {activeTab === "history" && (
    <div>
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
        Flight History
      </h2>
      {history.length === 0 ? (
        <p className="text-center text-gray-500">No saved flights yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((flight) => (
            <li key={flight.id} className="bg-white rounded-lg shadow p-4">
              <p><strong>Date:</strong> {flight.date}</p>
              <p><strong>Distance:</strong> {flight.distance.toFixed(2)} meters</p>
              <div className="flex gap-4 mt-2 flex-wrap">
                <button
                  onClick={() => console.log(flight.points)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  View GPS Points
                </button>

                <button
                onClick={() =>{
                  const doc = new jsPDF();
                  doc.setFontSize(16);
                  doc.text("Flight Report", 20, 20);
                  doc.setFontSize(10);
                  doc.text(`Date: ${flight.date}`, 20, 30);
                  doc.text(`Distance: ${flight.distance.toFixed(2)} m`, 20, 35);
                  doc.text("GPS Points:", 20, 45);
                  flight.points.forEach((p, i) => {
                    doc.text(`${i + 1}. Lat: ${p.lat.toFixed(5)}, Lng: ${p.lng.toFixed(5)}`, 20, 55 + i * 6);

                  });
                  doc.save(`flight-${flight.id}.pdf`);
                }}
                className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
                >
                  Export PDF
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(flight, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `flight-${flight.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                  >
                    Export JSON
                </button>

                <button
                onClick={() => deleteFlight(flight.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li> 
          ))}
        </ul>
      )}
    </div>
    )}

  {activeTab === "settings" && (
    <div className="text-center text-xl text-gray-600">
      <p>⚙️ Settings (coming soon)</p>
    </div>
    )}



    </main>
  </div>
);
  
};


export default App;
