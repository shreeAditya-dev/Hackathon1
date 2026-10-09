import { useState } from "react";
import { analyzeSowing } from "../services/api";

function useSowingAnalysis() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const result = await analyzeSowing(payload);

      setData(result);

      return result;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete analysis."
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    data,
    error,
    runAnalysis,
  };
}

export default useSowingAnalysis;