import { useEffect, useRef, useState } from "react";

const fallbackLocation = {
  lat: 28.6139,
  lng: 77.209,
};

export default function useUserLocation(enabled = true) {
  const hasGeolocation = typeof navigator !== "undefined" && Boolean(navigator.geolocation);
  const [location, setLocation] = useState(() => (hasGeolocation ? null : fallbackLocation));
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
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
    setError("");
    setPermissionState("granted");
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
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
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
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
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
              timeout: 60000,
              maximumAge: 60000,
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
