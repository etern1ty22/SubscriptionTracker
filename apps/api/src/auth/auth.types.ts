import type { Request } from "express";

export type PublicUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: PublicUser;
};

export type LogoutResponse = {
  success: true;
};

export type AuthSession = {
  accessToken: string;
  user: PublicUser;
};

export type AuthContext = {
  userId: string;
};

export type AuthenticatedRequest = Request & {
  auth: AuthContext;
};
