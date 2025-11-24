import { useState } from 'react';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

// Hook personnalisé pour les Server-Sent Events
const useSSE = () => {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const connectToWorkflow = async (endpoint, payload) => {
    try {
      setIsConnected(true);
      setEvents([]);

      // Récupérer le token comme dans votre apiClient
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Garder la dernière ligne incomplète dans le buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  const jsonStr = line.replace('data:', '').trim();
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr);
                    setEvents(prev => [...prev, {
                      id: Date.now() + Math.random(),
                      timestamp: new Date(),
                      ...data
                    }]);
                  }
                } catch (e) {
                  console.warn('Ligne JSON invalide:', line);
                }
              }
            }
          }
        } catch (error) {
          console.error('Erreur lecture stream:', error);
          setEvents(prev => [...prev, {
            id: Date.now(),
            timestamp: new Date(),
            error: error.message
          }]);
        } finally {
          setIsConnected(false);
        }
      };

      readStream();
    } catch (error) {
      console.error('Erreur connexion SSE:', error);
      setIsConnected(false);
      setEvents(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date(),
        error: error.message
      }]);
    }
  };

  return { 
    events, 
    isConnected, 
    connectToWorkflow, 
    clearEvents: () => setEvents([]) 
  };
};

export default useSSE;