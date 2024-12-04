import { useState, useEffect } from "react";

function useFetchData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async (signal) => {
      setLoading(true);
      try {
        const response = await fetch(`https://www.delhisldc.org/app-api/${endpoint}`, { signal });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result.data); // Adjust according to the API response structure
        setError(null); // Clear error on successful fetch
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    const controller = new AbortController();
    fetchData(controller.signal);

    // Set interval to refetch every 60 seconds
    const intervalId = setInterval(() => fetchData(controller.signal), 30000);

    // Cleanup interval and abort controller on unmount
    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [endpoint]);

  return { data, loading, error };
}

export default useFetchData;
