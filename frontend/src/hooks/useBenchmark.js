import { useState, useRef, useEffect } from 'react';

export function useBenchmark({ selectedModels = ["mistral", "phi3", "llama3"], compareMode = true }) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [streamingTokens, setStreamingTokens] = useState({});
  const [elapsedMs, setElapsedMs] = useState(0);
  const controllersRef = useRef([]);
  const timerRef = useRef(null);

  const abort = () => {
    controllersRef.current.forEach(ctrl => ctrl.abort());
    controllersRef.current = [];
    
    setStreamingTokens(prev => {
      const reset = {};
      Object.keys(prev).forEach(model => {
        reset[model] = { ...prev[model], text: '', done: false, error: 'Aborted' };
      });
      return reset;
    });

    setIsRunning(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const runBenchmark = async (promptText) => {
    abort();
    setIsRunning(true);
    setResults([]);
    setElapsedMs(0);
    
    // Determine which models to run
    const modelsToRun = compareMode ? selectedModels : [selectedModels[0]];
    
    const initialStreamState = {};
    modelsToRun.forEach(m => initialStreamState[m] = { text: '', done: false, error: null, metrics: {} });
    setStreamingTokens(initialStreamState);

    const promises = modelsToRun.map(async (model) => {
      const controller = new AbortController();
      controllersRef.current.push(controller);

      try {
        const queryParams = new URLSearchParams({ prompt: promptText, max_tokens: 512 });
        const res = await fetch(`/api/stream/${model}?${queryParams.toString()}`, {
          signal: controller.signal
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';
        let lastMetrics = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              if (!dataStr) continue;
              
              try {
                const data = JSON.parse(dataStr);
                
                if (data.error) throw new Error(data.error);

                if (data.token) fullText += data.token;
                
                lastMetrics = {
                  latency_ms: data.latency_ms,
                  tokens_per_second: data.tokens_per_second,
                  token_count: data.token_count
                };

                setStreamingTokens(prev => ({
                  ...prev,
                  [model]: { ...prev[model], text: fullText, metrics: lastMetrics, done: data.done }
                }));

                if (data.done) break;
              } catch (e) {
                if (e.message !== "Unexpected end of JSON input" && !e.message.includes("JSON")) {
                   throw e;
                }
              }
            }
          }
        }

        const finalResult = { model, prompt: promptText, response: fullText, ...lastMetrics, error: null };
        setResults(prev => [...prev, finalResult]);
        return finalResult;

      } catch (err) {
        if (err.name !== 'AbortError') {
           setStreamingTokens(prev => ({
             ...prev,
             [model]: { ...prev[model], error: err.message, done: true }
           }));
           const errorResult = { model, prompt: promptText, response: "", latency_ms: 0, error: err.message };
           setResults(prev => [...prev, errorResult]);
           return errorResult;
        }
      }
    });

    const finalResults = await Promise.all(promises);
    setIsRunning(false);
    return finalResults;
  };

  return { isRunning, results, streamingTokens, elapsedMs, runBenchmark, abort };
}
