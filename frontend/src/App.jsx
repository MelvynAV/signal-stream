import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [data, setData] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Initializing...");
  const [currentLatency, setCurrentLatency] = useState(0);
  
  // Use a Ref to keep track of the connection so we don't open duplicates
  const ws = useRef(null);

  useEffect(() => {
    // Connect to the Backend WebSocket
    ws.current = new WebSocket("ws://127.0.0.1:5000/ws");

    ws.current.onopen = () => console.log("Connected to SignalStream Backend");
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      setCurrentLatency(message.latency);
      setCurrentStatus(message.status);

      // Keep only the last 50 data points for the graph to look smooth
      setData(prevData => {
        const newData = [...prevData, message];
        if (newData.length > 50) return newData.slice(newData.length - 50);
        return newData;
      });
    };

    return () => ws.current.close();
  }, []);

  // Determine color based on status
  const getStatusColor = () => {
    if (currentStatus === "Normal") return "green";
    if (currentStatus === "High Latency Warning") return "orange";
    return "red";
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        📡 SignalStream <span style={{fontSize: '14px', color: '#888'}}>Real-Time Network Telemetry</span>
      </h1>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#2d2d2d', padding: '20px', borderRadius: '8px', minWidth: '200px' }}>
          <h3>Current Latency</h3>
          <p style={{ fontSize: '32px', margin: 0 }}>{currentLatency} ms</p>
        </div>
        <div style={{ background: '#2d2d2d', padding: '20px', borderRadius: '8px', minWidth: '200px', borderLeft: `5px solid ${getStatusColor()}` }}>
          <h3>Network Status</h3>
          <p style={{ fontSize: '24px', margin: 0, color: getStatusColor() }}>{currentStatus}</p>
        </div>
      </div>

      {/* The Real-Time Graph */}
      <div style={{ height: '400px', background: '#252525', borderRadius: '8px', padding: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="timestamp" stroke="#888" tick={{fontSize: 12}} interval={4} />
            <YAxis stroke="#888" domain={[0, 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', border: 'none' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="latency" 
              stroke="#00d8ff" 
              strokeWidth={3} 
              dot={false} 
              isAnimationActive={false} // Disable animation for smoother streaming
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;