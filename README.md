#Drone Monitoring System

##Overview:
Real-time drone monitoring platform built with Node.js, Socket.IO, and React.  
Visualizes telemetry data such as GPS coordinates, altitude, speed, battery level, and environmental conditions (temperature, weather, wind speed, humidity) in a live dashboard.

##Features:
- Real-Time data visualization using WebSockets.
- Display of drone telemetry: GPS, Altitude, Speed, Baterry, Enviromental data (temperature, weather, wind speed, humidity).
- Export flight data as PDF or JSON.
- Route clearing functionality.
- Responsive and user-friendly interface using React and Tailwind CSS.  
- Interactive map with Leaflet.

##Note:
Due to the lack of a physical drone, this project uses **simulated telemetry data** including GPS coordinates, altitude, speed, battery, and environmental conditions to demonstrate the real-time monitoring capabilities.

##Technologies:
- Backend: Node.js, Express, Socket.IO.
- Frontend: Reac, Tailwind CSS, Leaflet.
- Communication: WebSockets.
- Data formats: JSON, PDF export.

##Installation
1. Clone the repository:  
   ```bash
    git clone https://github.com/JoshuaPiscil/Drone-Monitoring-System.git

2. Navigate to backend directory and install dependencies:
    cd backend
    npm install

3. Navigate to frontend directory and install dependencies:
    cd ../frontend
    npm install

##Usage:
1. Start the backend server:
    cd backend
    node index.js

2. Start frontend server
    cd ../frontend
    npm start

3. Open the browser of you choise and go to http://localhost:3000 to view the dashboard

##Future Updates

- Integration with real drone hardware for live telemetry data.  
- Enhanced data analytics and visualization tools.  
- User authentication and multi-drone support.  
- Mobile-friendly interface improvements.  
- Alert system for low battery and other critical conditions.  
- Deployment scripts for cloud hosting and scalability.