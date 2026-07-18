import * as Location from "expo-location";

type Location = {
  lat: number;
  lng: number;
};

// 캐시 위치 허용 신선도. 웹 useGeolocation의 staleTime(5분)과 별개로 누적되므로
// 소비처는 최대 ~10분 전 위치를 받을 수 있다 (동네 주소/날씨 용도 기준으로 허용).
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;
// 참여 인증의 500m 판정이 같은 브릿지를 쓰므로, 셀타워 수준(수백 m~km 오차) 캐시는 걸러낸다
const LAST_KNOWN_REQUIRED_ACCURACY_M = 500;

export async function requestGeolocation(): Promise<Location | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return null;
    }

    // OS가 캐시한 최근 위치가 있으면 즉시 반환 — 새 GPS fix(실내 수 초)를 기다리지 않는다.
    // 동네 주소/날씨 표시 용도라 5분 이내 위치면 충분하다.
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: LAST_KNOWN_MAX_AGE_MS,
      requiredAccuracy: LAST_KNOWN_REQUIRED_ACCURACY_M,
    });
    if (lastKnown) {
      return {
        lat: lastKnown.coords.latitude,
        lng: lastKnown.coords.longitude,
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
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
