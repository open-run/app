import * as Haptics from "expo-haptics";
import { VibrationType } from "@constants/message";
import { log } from "@utils/log";

/**
 * 진동 타입에 따라 적절한 햅틱 피드백을 실행합니다
 */
export async function executeVibration(vibrationType: VibrationType): Promise<void> {
  log("✅ [Native] REQUEST_VIBRATION received - executing haptic");
  try {
    log("📳 [Native] Vibration type:", vibrationType);

    switch (vibrationType) {
      // Impact 피드백
      case VibrationType.IMPACT_LIGHT:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case VibrationType.IMPACT_MEDIUM:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case VibrationType.IMPACT_HEAVY:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case VibrationType.IMPACT_RIGID:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        break;
      case VibrationType.IMPACT_SOFT:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        break;

      // Notification 피드백
      case VibrationType.NOTIFICATION_SUCCESS:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case VibrationType.NOTIFICATION_WARNING:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case VibrationType.NOTIFICATION_ERROR:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      // Selection 피드백
      case VibrationType.SELECTION:
        await Haptics.selectionAsync();
        break;

      default:
        // 기본값: Medium impact
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        log("⚠️ [Native] Unknown vibration type, using default (Medium)");
    }

    log("✅ [Native] Haptic executed successfully");
  } catch (hapticError) {
    log("❌ [Native] Haptic execution failed:", hapticError);
    throw hapticError;
  }
}
