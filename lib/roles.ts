export const isAdmin = (role: string) => ['SUPER_ADMIN', 'DEPARTMENT_ADMIN'].includes(role);
export function canAccessSuggestions(user: { role: string; staffPosition: string | null }) {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'STUDENT') return false;
  const position = (user.staffPosition ?? '').toLowerCase().replace(/[^a-z]/g, '');
  return position === 'president' ||
    (position.includes('president') && (position.includes('assistant') || position.includes('assistance')));
}
export const canAccessCourseMaterials = (role: string) => role !== 'STUDENT';
export const canShareDocuments = (role: string) => ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'OFFICE_STAFF'].includes(role);
