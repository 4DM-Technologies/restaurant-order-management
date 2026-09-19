import type { UserBO } from '@/types/user/UserBO.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import { UserStatusENUM } from '@/types/user/UserStatusENUM.ts';
import { employeesData } from '@/services/screens/employeeScreenService/employeesData.ts';

let _employees: UserBO[] = [...employeesData];

export const employeeScreenService = {
  getEmployees: async (): Promise<UserBO[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [..._employees];
  },

  addEmployee: async (data: { name: string; email: string; role: UserRoleENUM }): Promise<UserBO> => {
    await new Promise((r) => setTimeout(r, 500));
    const newEmp: UserBO = {
      id: `emp-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: UserStatusENUM.ACTIVE,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name.slice(0, 2)}&backgroundColor=c8956c&textColor=ffffff`,
    };
    _employees = [..._employees, newEmp];
    return newEmp;
  },

  editEmployee: async (
    id: string,
    data: Partial<Pick<UserBO, 'name' | 'email' | 'role' | 'status'>>,
  ): Promise<UserBO> => {
    await new Promise((r) => setTimeout(r, 400));
    _employees = _employees.map((e) => (e.id === id ? { ...e, ...data } : e));
    const updated = _employees.find((e) => e.id === id);
    if (!updated) throw new Error('Employee not found');
    return updated;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 400));
    _employees = _employees.filter((e) => e.id !== id);
  },
};
