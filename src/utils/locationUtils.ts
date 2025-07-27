// Location utilities for teacher attendance verification

export interface LocationResult {
  isInRange: boolean;
  distance: number;
}

export interface SchoolLocation {
  name: string;
  latitude: number;
  longitude: number;
  allowedRadius: number; // in meters
}

// School location configuration
export const SCHOOL_LOCATION: SchoolLocation = {
  name: 'Farabi Language School',
  latitude: 30.009222611629205, // Updated coordinates
  longitude: 31.42008321224489,
  allowedRadius: 15000 // 15 km radius to accommodate wider area
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Get current position with promise wrapper
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

// Verify if current location is within school range
export async function verifyLocationInRange(): Promise<LocationResult> {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    
    const distance = calculateDistance(
      latitude,
      longitude,
      SCHOOL_LOCATION.latitude,
      SCHOOL_LOCATION.longitude
    );

    return {
      isInRange: distance <= SCHOOL_LOCATION.allowedRadius,
      distance
    };
  } catch (error) {
    throw error;
  }
}

// Format distance for display
export function formatDistance(distance: number, language: string): string {
  if (distance < 1000) {
    return language === 'ar' 
      ? `${Math.round(distance)} متر`
      : `${Math.round(distance)}m`;
  } else {
    const km = (distance / 1000).toFixed(1);
    return language === 'ar'
      ? `${km} كيلومتر`
      : `${km}km`;
  }
}

// Get localized error message for geolocation errors
export function getLocationErrorMessage(error: GeolocationPositionError, language: string): string {
  const messages = {
    en: {
      [GeolocationPositionError.PERMISSION_DENIED]: 'Location access denied. Please enable location services.',
      [GeolocationPositionError.POSITION_UNAVAILABLE]: 'Location information is unavailable.',
      [GeolocationPositionError.TIMEOUT]: 'Location request timed out. Please try again.',
    },
    ar: {
      [GeolocationPositionError.PERMISSION_DENIED]: 'تم رفض الوصول للموقع. يرجى تفعيل خدمات الموقع.',
      [GeolocationPositionError.POSITION_UNAVAILABLE]: 'معلومات الموقع غير متوفرة.',
      [GeolocationPositionError.TIMEOUT]: 'انتهت مهلة طلب الموقع. يرجى المحاولة مرة أخرى.',
    }
  };

  const langMessages = messages[language as keyof typeof messages] || messages.en;
  return langMessages[error.code] || (language === 'ar' 
    ? 'حدث خطأ في تحديد الموقع.'
    : 'An error occurred while determining location.');
} 