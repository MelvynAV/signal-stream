import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [dataByNode, setDataByNode] = useState({}); // { "US-East": [...], "EU-West": [...] }
  const [currentStatus, setCurrentStatus] = useState("Initializing...");
  const [averageLatency, setAverageLatency] = useState(0);
  const [nodeStatus, setNodeStatus] = useState({});

  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const COLORS = {
    "US-East": "#00ff9d",
    "EU-West": "#00d8ff",
    "Asia-Pacific": "#ff6b00",
    "South-America": "#ff006e"
  };

  const connectWebSocket = () => {
    let websocketUrl;
    if (import.meta.env.DEV || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      websocketUrl = "ws://localhost:5000/ws";
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      websocketUrl = `${protocol}//${window.location.host}/ws`;
    }

    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      setCurrentStatus("Connected");
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      setDataByNode(prev => {
        const nodeData = prev[message.node] || [];
        const newNodeData = [...nodeData, message].slice(-50);
        return { ...prev, [message.node]: newNodeData };
      });

      setNodeStatus(prev => ({
        ...prev,
        [message.node]: message.status
      }));

      // Calculate average latency
      setAverageLatency(prevAvg => {
        const allLatest = Object.keys(dataByNode).map(node => 
          dataByNode[node]?.slice(-1)[0]?.latency || 0
        );
        const newLatest = (dataByNode[message.node]?.slice(-1)[0]?.latency || message.latency);
        const total = allLatest.reduce((a, b) => a + b, 0) + newLatest;
        return Math.round(total / (Object.keys(dataByNode).length + 1));
      });
    };

    ws.current.onclose = () => {
      setCurrentStatus("Disconnected");
      reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
    };

    ws.current.onerror = () => setCurrentStatus("Connection Error");
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) ws.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  // Combine all node data for chart (same timestamps approx)
  const chartData = [];
  const nodes = Object.keys(dataByNode);
  if (nodes.length > 0) {
    const maxLength = Math.max(...nodes.map(n => dataByNode[n].length));
    for (let i = 0; i < maxLength; i++) {
      const entry = { timestamp: dataByNode[nodes[0]]?.[i]?.timestamp || "" };
      nodes.forEach(node => {
        entry[node] = dataByNode[node][i]?.latency || null;
      });
      chartData.push(entry);
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      minHeight: '100vh',
      color: '#e0e0ff',
      fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(0, 255, 157, 0.05) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0, 255, 157, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite',
      }} />

      <style jsx>{`
        @keyframes gridMove { 0% { transform: translate(0,0); } 100% { transform: translate(50px,50px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
      `}</style>

      <div style={{ position: 'relative', zIndex: 10, padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '3.8rem',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #00ff9d, #00d8ff, #ff00aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 255, 157, 0.5)',
            letterSpacing: '5px',
          }}>SIGNALSTREAM</h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.8 }}>Multi-Region Real-Time Network Telemetry</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(20,20,40,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,255,157,0.3)', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <h3 style={{ opacity: 0.8, letterSpacing: '2px' }}>AVERAGE LATENCY</h3>
            <div style={{ fontSize: '4rem', fontWeight: 800, background: 'linear-gradient(45deg, #00d8ff, #00ff9d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {averageLatency || '--'}<span style={{ fontSize: '1.5rem' }}>ms</span>
            </div>
          </div>

          <div style={{ background: 'rgba(20,20,40,0.6)', backdropFilter: 'blur(10px)', border: `2px solid ${currentStatus === "Connected" ? "#00ff9d" : "#ff006e"}`, borderRadius: '16px', padding: '30px' }}>
            <h3 style={{ opacity: 0.8, letterSpacing: '2px' }}>CONNECTION STATUS</h3>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: currentStatus === "Connected" ? "#00ff9d" : "#ff006e" }}>
              {currentStatus}
            </div>
          </div>
        </div>

        {/* Node Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
          {Object.keys(nodeStatus).map(node => (
            <div key={node} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '16px', height: '16px', backgroundColor: COLORS[node], borderRadius: '4px' }} />
              <span>{node}</span>
              <span style={{ color: nodeStatus[node] === "Normal" ? "#00ff9d" : "#ff6b00", fontWeight: 'bold' }}>
                ({nodeStatus[node]})
              </span>
            </div>
          ))}
        </div>

        {/* Multi-Line Chart */}
        <div style={{
          background: 'rgba(15,15,35,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,216,255,0.4)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{
            textAlign: 'center',
            marginBottom: '30px',
            background: 'linear-gradient(90deg, #00d8ff, #ff00aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            LIVE MULTI-REGION LATENCY
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,157,0.2)" />
              <XAxis dataKey="timestamp" stroke="#888" tick={{ fontSize: 12 }} />
              <YAxis stroke="#888" domain={[0, 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,40,0.9)', border: '1px solid #00d8ff' }} />
              <Legend />
              {Object.keys(COLORS).map(node => (
                <Line
                  key={node}
                  type="monotone"
                  dataKey={node}
                  stroke={COLORS[node]}
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <footer style={{ textAlign: 'center', marginTop: '50px', opacity: 0.6 }}>
          SignalStream v1.1 • Distributed Real-time Monitoring Demo
        </footer>
      </div>
    </div>
  );
}

export default App;