/**
 * Utility for handling browser geolocation
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 30000, // Longer timeout for better GPS lock
      maximumAge: 0 // Force fresh location data, no cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Log accuracy information for debugging
        console.log(`Location obtained with ${position.coords.accuracy}m accuracy`);
        if (position.coords.accuracy > 1000) {
          console.warn(`Location accuracy is very poor (${position.coords.accuracy}m) - likely using IP geolocation`);
        } else if (position.coords.accuracy > 100) {
          console.warn(`Location accuracy is moderate (${position.coords.accuracy}m) - may be using Wi-Fi positioning`);
        }
        
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let message = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject({
          code: error.code,
          message
        });
      },
      options
    );
  });
};

export const getHighAccuracyLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 60000, // Extended timeout for GPS
      maximumAge: 0 // Always get fresh location
    };

    // Try multiple times for better accuracy
    let attempts = 0;
    const maxAttempts = 3;
    let bestLocation: LocationData | null = null;

    const tryGetLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          console.log(`Attempt ${attempts + 1}: Location obtained with ${position.coords.accuracy}m accuracy`);

          // If this is our first location or it's more accurate, use it
          if (!bestLocation || position.coords.accuracy < bestLocation.accuracy) {
            bestLocation = locationData;
          }

          attempts++;

          // If we have good accuracy (< 50m) or reached max attempts, resolve
          if (position.coords.accuracy < 50 || attempts >= maxAttempts) {
            resolve(bestLocation);
          } else {
            // Wait a bit and try again for better accuracy
            setTimeout(tryGetLocation, 2000);
          }
        },
        (error) => {
          attempts++;
          if (attempts >= maxAttempts || !bestLocation) {
            let message = 'Unknown error occurred';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location access denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable';
                break;
              case error.TIMEOUT:
                message = 'Location request timed out';
                break;
            }
            reject({
              code: error.code,
              message
            });
          } else if (bestLocation) {
            // Return best location we have if we got at least one
            resolve(bestLocation);
          } else {
            // Try again
            setTimeout(tryGetLocation, 2000);
          }
        },
        options
      );
    };

    tryGetLocation();
  });
};

export const watchLocation = (
  onLocationUpdate: (location: LocationData) => void,
  onError: (error: LocationError) => void
): number | null => {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: 'Geolocation is not supported by this browser.'
    });
    return null;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0 // Force fresh location data for real-time updates
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      onLocationUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    },
    (error) => {
      let message = 'Unknown error occurred';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out';
          break;
      }
      onError({
        code: error.code,
        message
      });
    },
    options
  );
};
