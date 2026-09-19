import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Users, Loader2 } from 'lucide-react';
import AdminLayout from '@/ui/reusables/AdminLayout/AdminLayout.tsx';
import Modal from '@/ui/reusables/Modal/Modal.tsx';
import ConfirmDialog from '@/ui/reusables/ConfirmDialog/ConfirmDialog.tsx';
import LoadingSkeleton from '@/ui/reusables/LoadingSkeleton/LoadingSkeleton.tsx';
import EmptyState from '@/ui/reusables/EmptyState/EmptyState.tsx';
import { useEmployeeVM } from '@/ui/screens/EmployeeScreen/EmployeeScreen.vm.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';
import { UserStatusENUM } from '@/types/user/UserStatusENUM.ts';
import type { UserBO } from '@/types/user/UserBO.ts';

function RoleBadge({ role }: { role: UserRoleENUM }) {
  return (
    <span className={`badge ${
      role === UserRoleENUM.ADMIN
        ? 'bg-soroco-amber/15 text-soroco-sienna border border-soroco-amber/30'
        : 'bg-blue-50 text-blue-700 border border-blue-200'
    }`}>
      {role === UserRoleENUM.ADMIN ? 'Admin' : 'Employee'}
    </span>
  );
}

function StatusBadgeInline({ status }: { status: UserStatusENUM }) {
  return (
    <span className={`badge ${
      status === UserStatusENUM.ACTIVE
        ? 'bg-green-100 text-green-700 border border-green-200'
        : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}>
      {status === UserStatusENUM.ACTIVE ? 'Active' : 'Inactive'}
    </span>
  );
}

function EmployeeFormFields({
  formData,
  setFormData,
  formError,
  isSaving,
}: {
  formData: { name: string; email: string; role: UserRoleENUM };
  setFormData: (d: { name: string; email: string; role: UserRoleENUM }) => void;
  formError: string | null;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-4">
      {formError && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-body text-sm">
          {formError}
        </div>
      )}
      <div>
        <label htmlFor="emp-name" className="input-label">Full Name</label>
        <input
          id="emp-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Employee name"
          className="input-field"
          disabled={isSaving}
        />
      </div>
      <div>
        <label htmlFor="emp-email" className="input-label">Email Address</label>
        <input
          id="emp-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="employee@soroco.coffee"
          className="input-field"
          disabled={isSaving}
        />
      </div>
      <div>
        <label htmlFor="emp-role" className="input-label">Role</label>
        <select
          id="emp-role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRoleENUM })}
          className="input-field"
          disabled={isSaving}
        >
          <option value={UserRoleENUM.EMPLOYEE}>Employee</option>
          <option value={UserRoleENUM.ADMIN}>Admin</option>
        </select>
      </div>
    </div>
  );
}

export default function EmployeeScreen() {
  const vm = useEmployeeVM();

  return (
    <AdminLayout title="Employees">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="heading-md text-soroco-charcoal">Employee Management</h1>
          <p className="font-body text-soroco-mocha text-sm mt-1">
            Manage your team members and their access.
          </p>
        </div>
        <button onClick={vm.openAddModal} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Employee</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-soroco-tan pointer-events-none" />
        <input
          type="text"
          value={vm.searchQuery}
          onChange={(e) => vm.setSearchQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      {vm.isLoading ? (
        <LoadingSkeleton variant="row" count={5} />
      ) : vm.employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={vm.searchQuery ? 'Try a different search query.' : 'Add your first employee to get started.'}
          actionLabel="Add Employee"
          onAction={vm.openAddModal}
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-soroco-linen bg-soroco-parchment/50">
                  {['Employee', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-body font-semibold text-xs text-soroco-mocha uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vm.employees.map((emp) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-soroco-linen/60 last:border-0 hover:bg-soroco-linen/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full shrink-0" />
                        ) : (
                          <div className="w-8 h-8 bg-soroco-amber/20 rounded-full flex items-center justify-center shrink-0">
                            <span className="font-body font-bold text-soroco-sienna text-xs">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-body font-medium text-sm text-soroco-charcoal">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-body text-sm text-soroco-mocha">{emp.email}</td>
                    <td className="px-5 py-3.5"><RoleBadge role={emp.role} /></td>
                    <td className="px-5 py-3.5"><StatusBadgeInline status={emp.status} /></td>
                    <td className="px-5 py-3.5 font-body text-xs text-soroco-mocha whitespace-nowrap">
                      {new Date(emp.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => vm.openEditModal(emp)}
                          className="btn-icon w-8 h-8 text-soroco-mocha hover:text-soroco-espresso"
                          title="Edit employee"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => vm.openDeleteDialog(emp)}
                          className="btn-icon w-8 h-8 text-soroco-mocha hover:text-red-600"
                          title="Delete employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="md:hidden divide-y divide-soroco-linen">
            {vm.employees.map((emp) => (
              <div key={emp.id} className="p-4 flex items-start gap-3">
                {emp.avatar ? (
                  <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full shrink-0 mt-0.5" />
                ) : (
                  <div className="w-10 h-10 bg-soroco-amber/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-body font-bold text-soroco-sienna text-sm">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-soroco-charcoal">{emp.name}</p>
                  <p className="font-body text-xs text-soroco-mocha truncate">{emp.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <RoleBadge role={emp.role} />
                    <StatusBadgeInline status={emp.status} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => vm.openEditModal(emp)}
                    className="btn-icon w-8 h-8 text-soroco-mocha hover:text-soroco-espresso"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => vm.openDeleteDialog(emp)}
                    className="btn-icon w-8 h-8 text-soroco-mocha hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={vm.isAddModalOpen}
        onClose={() => vm.setIsAddModalOpen(false)}
        title="Add Employee"
        size="sm"
      >
        <div className="space-y-5">
          <EmployeeFormFields
            formData={vm.formData}
            setFormData={vm.setFormData}
            formError={vm.formError}
            isSaving={vm.isSaving}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => vm.setIsAddModalOpen(false)}
              className="btn-ghost text-sm"
              disabled={vm.isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={vm.handleAdd}
              disabled={vm.isSaving}
              className="btn-primary text-sm py-2.5"
            >
              {vm.isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Add Employee'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={vm.isEditModalOpen}
        onClose={() => vm.setIsEditModalOpen(false)}
        title="Edit Employee"
        size="sm"
      >
        <div className="space-y-5">
          <EmployeeFormFields
            formData={vm.formData}
            setFormData={vm.setFormData}
            formError={vm.formError}
            isSaving={vm.isSaving}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => vm.setIsEditModalOpen(false)}
              className="btn-ghost text-sm"
              disabled={vm.isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={vm.handleEdit}
              disabled={vm.isSaving}
              className="btn-primary text-sm py-2.5"
            >
              {vm.isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={vm.isDeleteDialogOpen}
        onClose={() => vm.setIsDeleteDialogOpen(false)}
        onConfirm={vm.handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to remove ${vm.selectedEmployee?.name ?? 'this employee'}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger
      />
    </AdminLayout>
  );
}
