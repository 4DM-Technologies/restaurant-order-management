import type { UserBO } from '@/types/user/UserBO.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import { UserStatusENUM } from '@/types/user/UserStatusENUM.ts';

// Mock credentials — frontend only
const MOCK_USERS: Array<UserBO & { password: string }> = [
  {
    id: 'emp-001',
    name: 'Arjun Mehta',
    email: 'admin@soroco.coffee',
    password: 'and ',
    role: UserRoleENUM.ADMIN,
    status: UserStatusENUM.ACTIVE,
    createdAt: '2024-01-15T09:00:00.000Z',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AM&backgroundColor=c8956c&textColor=ffffff',
  },
  {
    id: 'emp-002',
    name: 'Priya Nair',
    email: 'employee@soroco.coffee',
    password: 'employee123',
    role: UserRoleENUM.EMPLOYEE,
    status: UserStatusENUM.ACTIVE,
    createdAt: '2024-02-20T09:00:00.000Z',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PN&backgroundColor=3d1f10&textColor=ffffff',
  },
];

export const authService = {
  login: async (email: string, password: string): Promise<UserBO> => {
    await new Promise((r) => setTimeout(r, 800));
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _pw, ...userBO } = user;
    return userBO;
  },

  signup: async (name: string, email: string, _password: string): Promise<UserBO> => {
    await new Promise((r) => setTimeout(r, 800));
    if (MOCK_USERS.find((u) => u.email === email)) {
      throw new Error('An account with this email already exists');
    }
    const newUser: UserBO = {
      id: `emp-${Date.now()}`,
      name,
      email,
      role: UserRoleENUM.EMPLOYEE,
      status: UserStatusENUM.ACTIVE,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name.slice(0, 2)}&backgroundColor=c8956c&textColor=ffffff`,
    };
    return newUser;
  },

  logout: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200));
  },
};
