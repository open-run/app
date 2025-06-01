import { Platform } from "react-native";

export function log(key: string, message?: any) {
  const deviceOS = Platform.OS === "ios" ? "iOS" : "Android";
  const osColor = Platform.OS === "ios" ? "#A9ADAE" : "#A8CC40";
  const osColorCode = `\x1b[38;2;${parseInt(osColor.slice(1, 3), 16)};${parseInt(
    osColor.slice(3, 5),
    16
  )};${parseInt(osColor.slice(5, 7), 16)}m`;
  console.log(`${osColorCode}[${deviceOS}]\x1b[0m`, `\x1b[34m${key}\x1b[0m`, message);
}
