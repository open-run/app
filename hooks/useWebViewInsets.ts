import { useRef, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Message } from "@constants/message";
import { log } from "@utils/log";

interface UseWebViewInsetsProps {
  postMessage: (message: any) => void;
}

/**
 * WebView에 inset 값을 전달하는 훅
 */
export function useWebViewInsets({ postMessage }: UseWebViewInsetsProps) {
  const insets = useSafeAreaInsets();
  const hasSentInsetsRef = useRef<boolean>(false);

  const handleLoadEnd = useCallback(() => {
    if (!hasSentInsetsRef.current) {
      const insetData = {
        top: insets.top,
        bottom: insets.bottom,
      };
      log("📱 [Native] Sending inset values to WebView:", insetData);
      postMessage({
        type: Message.INSET,
        data: insetData,
      });
      hasSentInsetsRef.current = true;
    }
  }, [insets.top, insets.bottom, postMessage]);

  return { handleLoadEnd };
}
