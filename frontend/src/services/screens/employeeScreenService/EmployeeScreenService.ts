import type { UserBO } from '@/types/user/UserBO.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import { UserStatusENUM } from '@/types/user/UserStatusENUM.ts';
import { apiClient } from '@/services/apiClient.ts';

interface ApiEmployee {
  account_uuid: string;
  account_id: number;
  account_name: string;
  account_email: string;
  account_role: string;
  created_at: string;
  has_password: boolean;
  can_delete: boolean;
}

function toUser(e: ApiEmployee): UserBO {
  const role = e.account_role.toUpperCase();
  return {
    id: e.account_uuid,
    name: e.account_name,
    email: e.account_email,
    role: (role === UserRoleENUM.ADMIN || role === UserRoleENUM.EMPLOYEE ? role : UserRoleENUM.EMPLOYEE) as UserRoleENUM,
    status: e.has_password ? UserStatusENUM.ACTIVE : UserStatusENUM.INACTIVE,
    createdAt: e.created_at,
  };
}

export const employeeScreenService = {
  getEmployees: async (): Promise<UserBO[]> => {
    const data = await apiClient.get<ApiEmployee[]>('/admin/employees');
    return data.map(toUser);
  },

  addEmployee: async (data: { name: string; email: string; role: UserRoleENUM }): Promise<UserBO> => {
    const created = await apiClient.post<ApiEmployee>('/admin/employees', {
      name: data.name,
      email: data.email,
    });
    return toUser(created);
  },

  editEmployee: async (
    id: string,
    data: Partial<Pick<UserBO, 'name' | 'email' | 'role' | 'status'>>,
  ): Promise<UserBO> => {
    const payload: Record<string, string> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    const updated = await apiClient.patch<ApiEmployee>(`/admin/employees/${id}`, payload);
    return toUser(updated);
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/employees/${id}`);
  },
};