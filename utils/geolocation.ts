import * as Location from "expo-location";

type Location = {
  lat: number;
  lng: number;
};

export async function requestGeolocation(): Promise<Location | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}
