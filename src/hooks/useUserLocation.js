import { useEffect, useRef, useState } from "react";

const fallbackLocation = {
  lat: 28.6139,
  lng: 77.209,
};
const LAST_LOCATION_KEY = "civic:last-known-location";

function readStoredLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LAST_LOCATION_KEY) || "null");
    if (
      parsed &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng)
    ) {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
      };
    }
  } catch {
    // ignore malformed cache
  }

  return null;
}

export default function useUserLocation(enabled = true) {
  const hasGeolocation = typeof navigator !== "undefined" && Boolean(navigator.geolocation);
  const [location, setLocation] = useState(() => {
    const storedLocation = readStoredLocation();
    if (storedLocation) {
      return storedLocation;
    }
    return hasGeolocation ? null : fallbackLocation;
  });
  const [error, setError] = useState(() => (hasGeolocation ? "" : "Geolocation is not available in this browser."));
  const [permissionState, setPermissionState] = useState(() => (hasGeolocation ? "prompt" : "denied"));
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const requestInFlightRef = useRef(false);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!enabled || !hasGeolocation) {
      return undefined;
    }

    let isMounted = true;

    navigator.permissions
      ?.query?.({ name: "geolocation" })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setPermissionState(result.state);
        result.onchange = () => {
          setPermissionState(result.state);
        };
      })
      .catch(() => {
        setPermissionState("prompt");
      });

    return () => {
      isMounted = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, hasGeolocation]);

  const handleSuccess = (position) => {
    const nextLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    setLocation(nextLocation);
    setError("");
    setPermissionState("granted");
    try {
      window.localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(nextLocation));
    } catch {
      // ignore storage errors
    }
  };

  const handleError = (positionError) => {
    const message = positionError.message || "Unable to read location.";
    setError(message);
    if (positionError.code === 1) {
      setPermissionState("denied");
      setLocation(null);
      return true;
    }
    setPermissionState("prompt");
    return false;
  };

  const requestLocation = () => {
    if (!hasGeolocation || requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setIsRequesting(true);
    setHasRequested(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        requestInFlightRef.current = false;
        setIsRequesting(false);
        handleSuccess(position);
      },
      (positionError) => {
        requestInFlightRef.current = false;
        setIsRequesting(false);
        if (handleError(positionError)) return;
        if (positionError.code === 3) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              handleSuccess(position);
            },
            () => {
              setPermissionState("prompt");
            },
            {
              enableHighAccuracy: false,
              timeout: 30000,
              maximumAge: 60000,
            }
          );
          return;
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 2500,
        maximumAge: 900000,
      }
    );
  };

  const startTracking = () => {
    if (!hasGeolocation) return;
    setHasRequested(true);
    setIsTracking(true);
    setIsRequesting(true);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    const options = {
      enableHighAccuracy: false,
      timeout: 4000,
      maximumAge: 600000,
    };
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setIsRequesting(false);
        handleSuccess(position);
      },
      (positionError) => {
        setIsRequesting(false);
        if (handleError(positionError)) return;
        if (positionError.code === 3) {
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              setIsRequesting(false);
              handleSuccess(position);
            },
            (fallbackError) => {
              setIsRequesting(false);
              handleError(fallbackError);
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 300000,
            }
          );
        }
      },
      options
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  return {
    location,
    error,
    permissionState,
    requestLocation,
    startTracking,
    stopTracking,
    isRequesting,
    hasRequested,
    isTracking,
  };
}
