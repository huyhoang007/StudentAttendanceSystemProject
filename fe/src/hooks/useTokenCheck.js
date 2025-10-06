import { useEffect } from "react";
import { checkTokenAndRedirect } from "../utils/tokenUtils";

export const useTokenCheck = () => {
  useEffect(() => {
    // Check token immediately
    checkTokenAndRedirect();

    // Check token every 5 minutes
    const interval = setInterval(() => {
      checkTokenAndRedirect();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);
};
