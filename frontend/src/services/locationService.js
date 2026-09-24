// Service for Browser GPS Geolocation and Reverse Geocoding

export const locationService = {
  /**
   * Get device GPS coordinates via Browser Geolocation API
   */
  getCurrentCoordinates: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation API is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Unable to retrieve location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  },

  /**
   * Reverse geocode lat/long to city, district, state using OpenStreetMap Nominatim
   */
  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'KrishiSetu-SIH2026/1.0'
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch address details.');
      }
      const data = await response.json();
      const address = data.address || {};

      const district = address.county || address.state_district || address.city || address.town || 'Nashik';
      const state = address.state || 'Maharashtra';
      const village = address.village || address.suburb || address.town || '';

      const formattedName = village
        ? `${village}, ${district}, ${state}`
        : `${district}, ${state}`;

      return {
        latitude,
        longitude,
        district,
        state,
        village,
        name: formattedName
      };
    } catch (err) {
      console.warn('Reverse geocoding error, returning coordinates default:', err);
      return {
        latitude,
        longitude,
        district: 'Detected Location',
        state: 'India',
        village: '',
        name: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      };
    }
  },

  /**
   * Helper to detect GPS position & reverse geocode in one step
   */
  detectLocation: async () => {
    const coords = await locationService.getCurrentCoordinates();
    const addressDetails = await locationService.reverseGeocode(coords.latitude, coords.longitude);
    return addressDetails;
  }
};

export default locationService;
