import type { UserRole } from '@/domain/modules/users/models/User';

export const MEDICAL_ROLES: UserRole[] = ['doctor', 'nurse', 'admin'];

export const canViewMedicalRecord = (_role?: UserRole): boolean => {
  return true;
};

export const canEditMedicalRecord = (role?: UserRole): boolean => {
  if (!role) return false;
  return MEDICAL_ROLES.includes(role);
};

export const canChangeMedicalRecordStatus = (role?: UserRole): boolean => {
  return role === 'admin';
};
