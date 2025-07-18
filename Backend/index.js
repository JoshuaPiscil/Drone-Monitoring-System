import express from "express";
import http from "http";
import { Server as socketIo } from "socket.io";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const routePath = path.join(__dirname, "route.json");
const routeData = await fs.readFile(routePath, "utf-8");
const route = JSON.parse(routeData);


const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let positionIndex = 0;

setInterval(async () => {
  const position = route[positionIndex];

  let weatherData = {
    temp: null,
    humidity: null,
    description: "N/A",
    windSpeed: null
  };

  try {
    const weatherResponse = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat: position.lat,
        lon: position.lng,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric"
      }
    });

    const w = weatherResponse.data;
    weatherData = {
      temp: w.main.temp,
      humidity: w.main.humidity,
      description: w.weather[0].description,
      windSpeed: w.wind.speed
    };
  } catch (error) {
    console.error("Error getting weather:", error.message);
  }

  const data = {
    gps: position,
    battery: Math.max(20, 27 - positionIndex),
    altitude: 50 + Math.random() * 10,
    speed: 5 + Math.random() * 3,
    weather: weatherData
  };

  io.emit("telemetry", data);

  positionIndex = (positionIndex + 1) % route.length;
}, 1000);

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(4000, () => console.log("Backend running on port 4000"));