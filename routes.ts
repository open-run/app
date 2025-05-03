export const RouteNames = {
  HOME: 'home' as const,
  DETAIL: 'detail' as const,
};

export type RootStackParamList = {
  [RouteNames.HOME]: undefined;
  [RouteNames.DETAIL]: undefined;
};
