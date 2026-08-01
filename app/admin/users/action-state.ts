export type ChangePasswordState = {
  success: boolean;
  message: string;
};

export const initialChangePasswordState: ChangePasswordState = {
  success: false,
  message: "",
};