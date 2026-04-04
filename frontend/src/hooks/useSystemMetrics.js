import { useState, useEffect } from 'react';

export function useSystemMetrics() {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu_percent: 0,
    memory_percent: 0,
    memory_used_mb: 0,
    memory_total_mb: 0,
    error: null
  });

  useEffect(() => {
    let intervalId;

    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/system');
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data = await res.json();
        setSystemMetrics(prev => ({ ...prev, ...data, error: null }));
      } catch (error) {
        setSystemMetrics(prev => ({ ...prev, error: error.message }));
      }
    };

    fetchMetrics();
    intervalId = setInterval(fetchMetrics, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return { systemMetrics };
}
