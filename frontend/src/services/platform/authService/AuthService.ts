import type { UserBO } from '@/types/user/UserBO.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import { UserStatusENUM } from '@/types/user/UserStatusENUM.ts';
import {
  apiClient,
  clearSession,
  getSavedUser,
  saveUser,
  setAccessToken,
} from '@/services/apiClient.ts';

interface LoginResponse {
  access_token: string;
  token_type: string;
  account_uuid: string;
  name: string;
  email: string;
  role: string;
}

interface MeResponse {
  account_uuid: string;
  name: string;
  email: string;
  role: string;
}

interface AccountCheckResponse {
  exists: boolean;
  has_password: boolean;
}

function toUser(account: { account_uuid: string; name: string; email: string; role: string }): UserBO {
  const role = account.role.toUpperCase();
  return {
    id: account.account_uuid,
    name: account.name,
    email: account.email,
    role: (role === UserRoleENUM.ADMIN || role === UserRoleENUM.EMPLOYEE ? role : UserRoleENUM.EMPLOYEE) as UserRoleENUM,
    status: UserStatusENUM.ACTIVE,
    createdAt: '',
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<UserBO> => {
    const data = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    const user = toUser(data);
    setAccessToken(data.access_token);
    saveUser(user);
    return user;
  },

  me: async (): Promise<UserBO> => {
    const data = await apiClient.get<MeResponse>('/auth/me');
    const user = toUser(data);
    saveUser(user);
    return user;
  },

  signup: async (email: string, password: string): Promise<UserBO> => {
    const data = await apiClient.post<LoginResponse>('/auth/signup', {
      name: email,
      email,
      password,
      confirm: password,
    });
    const user = toUser(data);
    setAccessToken(data.access_token);
    saveUser(user);
    return user;
  },

  checkEmail: async (email: string): Promise<AccountCheckResponse> => {
    return apiClient.get<AccountCheckResponse>(`/auth/check?email=${encodeURIComponent(email)}`);
  },

  logout: async (): Promise<void> => {
    clearSession();
  },

  restoreSession: (): UserBO | null => getSavedUser<UserBO>(),
};