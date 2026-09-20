import { useState, useEffect, useMemo } from 'react';
import { employeeScreenService } from '@/services/screens/employeeScreenService/EmployeeScreenService.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import type { UserBO } from '@/types/user/UserBO.ts';

export interface EmployeeFormData {
  name: string;
  email: string;
  role: UserRoleENUM;
}

const DEFAULT_FORM: EmployeeFormData = {
  name: '',
  email: '',
  role: UserRoleENUM.EMPLOYEE,
};

export function useEmployeeVM() {
  const [employees, setEmployees] = useState<UserBO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserBO | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await employeeScreenService.getEmployees();
        setEmployees(data);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  function openAddModal() {
    setFormData(DEFAULT_FORM);
    setFormError(null);
    setIsAddModalOpen(true);
  }

  function openEditModal(employee: UserBO) {
    setSelectedEmployee(employee);
    setFormData({ name: employee.name, email: employee.email, role: employee.role });
    setFormError(null);
    setIsEditModalOpen(true);
  }

  function openDeleteDialog(employee: UserBO) {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  }

  async function handleAdd() {
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const newEmp = await employeeScreenService.addEmployee(formData);
      setEmployees((prev) => [...prev, newEmp]);
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add employee.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEdit() {
    if (!selectedEmployee) return;
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const updated = await employeeScreenService.editEmployee(selectedEmployee.id, formData);
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update employee.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedEmployee) return;
    try {
      await employeeScreenService.deleteEmployee(selectedEmployee.id);
      setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee.id));
    } catch {
      // Silently fail
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  }

  return {
    employees: filteredEmployees,
    isLoading,
    searchQuery,
    setSearchQuery,

    isAddModalOpen,
    setIsAddModalOpen,
    openAddModal,

    isEditModalOpen,
    setIsEditModalOpen,
    openEditModal,

    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    openDeleteDialog,

    selectedEmployee,
    formData,
    setFormData,
    isSaving,
    formError,

    handleAdd,
    handleEdit,
    handleDelete,
  };
}
