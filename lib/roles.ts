export const isAdmin = (role: string) => ['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(role);
export const canAccessSuggestions = isAdmin;
export const canAccessCourseMaterials = (role: string) => role !== 'STUDENT';
export const canShareDocuments = (role: string) => ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'OFFICE_STAFF'].includes(role);
