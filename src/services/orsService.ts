// src/services/orsService.ts
/* eslint-disable no-bitwise -- operadores binarios necesarios para decodificar polilíneas de OpenRouteService */

const ORS_API_KEY = '5b3ce3597851110001cf624865484f32d18a4af3a950b35bb23ba2bd';

/**
 * Decodes the polyline string returned by OpenRouteService into an array of LatLng coordinates.
 */
function decodePolyline(encoded: string) {
  let points: { latitude: number; longitude: number }[] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ latitude: lat / 1E5, longitude: lng / 1E5 });
  }
  return points;
}

/**
 * Fetches the driving route between origin and destination.
 */
export const getRouteCoordinates = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
) => {
  try {
    // OpenRouteService expects coordinates in [longitude, latitude] format
    const start = `${originLng},${originLat}`;
    const end = `${destLng},${destLat}`;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start}&end=${end}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const encodedPolyline = data.features[0].geometry;
      return decodePolyline(encodedPolyline);
    }
    return null;
  } catch (error) {
    console.error('Error fetching ORS route:', error);
    return null;
  }
};
