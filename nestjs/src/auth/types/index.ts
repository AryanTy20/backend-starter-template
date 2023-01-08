export type loginType = {
  email: string;
  password: string;
};

export type registerType = {
  email: string;
  password: string;
  repeat_password: string;
};

export type tokenType = 'access' | 'both';
export type bothTokenType = {
  accessToken: string;
  refreshToken: string;
};
export type singleTokenType = Omit<bothTokenType, 'refreshToken'>;

export type tokenVerifyType = {
  userId: number;
};
