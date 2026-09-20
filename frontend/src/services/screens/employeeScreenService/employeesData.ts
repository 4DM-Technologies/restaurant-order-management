import type { UserBO } from '@/types/user/UserBO.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import { UserStatusENUM } from '@/types/user/UserStatusENUM.ts';

export const employeesData: UserBO[] = [
  {
    id: 'emp-001',
    name: 'Arjun Mehta',
    email: 'arjun@soroco.coffee',
    role: UserRoleENUM.ADMIN,
    status: UserStatusENUM.ACTIVE,
    createdAt: '2024-01-15T09:00:00.000Z',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AM&backgroundColor=c8956c&textColor=ffffff',
  },
  {
    id: 'emp-002',
    name: 'Priya Nair',
    email: 'priya@soroco.coffee',
    role: UserRoleENUM.EMPLOYEE,
    status: UserStatusENUM.ACTIVE,
    createdAt: '2024-02-20T09:00:00.000Z',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PN&backgroundColor=3d1f10&textColor=ffffff',
  },
  {
    id: 'emp-003',
    name: 'Rahul Sharma',
    email: 'rahul@soroco.coffee',
    role: UserRoleENUM.EMPLOYEE,
    status: UserStatusENUM.ACTIVE,
    createdAt: '2024-03-10T09:00:00.000Z',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RS&backgroundColor=6b3f2a&textColor=ffffff',
  },
  {
    id: 'emp-004',
    name: 'Kavitha Reddy',
    email: 'kavitha@soroco.coffee',
    role: UserRoleENUM.EMPLOYEE,
    status: UserStatusENUM.ACTIVE,
    createdAt: '2024-04-05T09:00:00.000Z',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KR&backgroundColor=a0653a&textColor=ffffff',
  },
  {
    id: 'emp-005',
    name: 'Vishal Kumar',
    email: 'vishal@soroco.coffee',
    role: UserRoleENUM.EMPLOYEE,
    status: UserStatusENUM.INACTIVE,
    createdAt: '2024-05-12T09:00:00.000Z',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=VK&backgroundColor=c8a882&textColor=ffffff',
  },
];
