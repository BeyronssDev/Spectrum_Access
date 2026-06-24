import { useCallback, useEffect, useRef, useState } from "react";
import type { LocationState, UserLocation } from "../types";

export function useUserLocation() {
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const autoLocationRequestedRef = useRef(false);

  const requestUserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationState("unsupported");
      return;
    }

    setLocationState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationState("located");
      },
      (error) => {
        setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 12000
      }
    );
  }, []);

  useEffect(() => {
    if (autoLocationRequestedRef.current) {
      return;
    }

    autoLocationRequestedRef.current = true;
    requestUserLocation();
  }, [requestUserLocation]);

  return { locationState, requestUserLocation, userLocation };
}
