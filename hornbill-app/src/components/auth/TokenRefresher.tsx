"use client";

import { useEffect, useRef } from "react";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
} from "@/utils/cookie.utils";

const BASE_URL = "/api/proxy";

// Refresh token every 10 minutes (token expires after 15 minutes)
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function TokenRefresher() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refreshToken = async () => {
      // Only refresh if user has a token (is logged in)
      const currentToken = getAccessToken();
      const currentRefreshToken = getRefreshToken();

      if (!currentToken || !currentRefreshToken) return;

      try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: currentRefreshToken,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);
          console.log("Token refreshed successfully");
        } else {
          console.error("Failed to refresh token");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    };

    // Refresh immediately on mount if user is logged in
    const currentToken = getAccessToken();
    if (currentToken) {
      refreshToken();
    }

    // Set up interval to refresh token periodically
    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
