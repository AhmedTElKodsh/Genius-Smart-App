import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StatusBanner = styled.div<{ $isConnected: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${props => props.$isConnected ? '#4CAF50' : '#f44336'};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
`;

const StatusDot = styled.div<{ $isConnected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$isConnected ? '#81C784' : '#ff6b6b'};
  animation: ${props => props.$isConnected ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ServerStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setIsConnected(true);
          // Hide banner after 3 seconds if connected
          if (!isConnected) {
            setTimeout(() => setShowBanner(false), 3000);
          }
        } else {
          setIsConnected(false);
          setShowBanner(true);
        }
      } catch (error) {
        setIsConnected(false);
        setShowBanner(true);
      }
    };

    // Check immediately
    checkServerStatus();

    // Check every 10 seconds
    const interval = setInterval(checkServerStatus, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  if (!showBanner) return null;

  return (
    <StatusBanner $isConnected={isConnected}>
      <StatusDot $isConnected={isConnected} />
      {isConnected ? 'Server Connected' : 'Server Disconnected - Using Mock Data'}
    </StatusBanner>
  );
};

export default ServerStatus;