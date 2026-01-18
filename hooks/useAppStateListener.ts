import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { log } from "@utils/log";

/**
 * 앱 상태 변경을 감지하는 훅
 * 모달이 열려있을 때 앱이 백그라운드로 가면 지갑 앱으로 이동한 것으로 간주
 */
export function useAppStateListener(isModalOpen: boolean) {
  const appWentToBackgroundRef = useRef<boolean>(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      // 모달이 열려있을 때 앱이 백그라운드로 가면 지갑 앱으로 이동한 것으로 간주
      if (isModalOpen && nextAppState === "background") {
        appWentToBackgroundRef.current = true;
        log("📱 [Native] 앱이 백그라운드로 이동 (지갑 앱으로 이동한 것으로 간주)");
      }

      // 앱이 다시 포그라운드로 돌아오면 리셋
      if (nextAppState === "active" && !isModalOpen) {
        appWentToBackgroundRef.current = false;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isModalOpen]);

  return {
    appWentToBackgroundRef,
    reset: () => {
      appWentToBackgroundRef.current = false;
    },
  };
}
