export const RouteNames = {
  HOME: 'home' as const,
  DETAIL: 'detail' as const,
  AVATAR: 'avatar' as const,
};

export type RootStackParamList = {
  [RouteNames.HOME]: undefined;
  [RouteNames.DETAIL]: {initialUrl: string};
  [RouteNames.AVATAR]: {initialUrl: string};
};
