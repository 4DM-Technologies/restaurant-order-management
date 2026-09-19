import type { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import type { UserStatusENUM } from '@/types/user/UserStatusENUM.ts';

export interface UserBO {
  id: string;
  name: string;
  email: string;
  role: UserRoleENUM;
  status: UserStatusENUM;
  createdAt: string;
  avatar?: string;
}
