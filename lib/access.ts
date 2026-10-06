
import { db } from './db';

type AccessUser = {
  id: string;
  role: string;
  groupId: string | null;
  departmentId: string | null;
  officeId: string | null;
};

type UserAccessRecord = {
  userId: string;
  permission: string;
};

type AccessRuleRecord = {
  groupId: string | null;
  departmentId: string | null;
  permission: string;
};

type ShareRecord = {
  expiresAt: Date | null;
  permission: string;
  targetType: string;
  recipientUserId: string | null;
  recipientGroupId: string | null;
  recipientDepartmentId: string | null;
  recipientOfficeId: string | null;
};

export async function canAccessDocument(
  user: AccessUser,
  documentId: string,
  needDownload = false,
) {
  if (user.role === 'STUDENT') return false;
  if (user.role === 'SUPER_ADMIN') return true;

  const d = await db.document.findUnique({
    where: { id: documentId },
    include: {
      accessRules: true,
      userAccess: true,
      shares: true,
    },
  });

  if (!d) return false;

  if (d.uploaderId === user.id) return true;

  const direct = (d.userAccess as UserAccessRecord[]).find(
    (x: UserAccessRecord) => x.userId === user.id,
  );

  if (
    direct &&
    (!needDownload || direct.permission !== 'VIEW')
  ) {
    return true;
  }

  const group = (d.accessRules as AccessRuleRecord[]).some(
    (r: AccessRuleRecord) =>
      r.groupId === user.groupId &&
      (!needDownload || r.permission !== 'VIEW'),
  );

  const dept = (d.accessRules as AccessRuleRecord[]).some(
    (r: AccessRuleRecord) =>
      r.departmentId === user.departmentId &&
      (!needDownload || r.permission !== 'VIEW'),
  );

  const share = (d.shares as ShareRecord[]).some(
    (s: ShareRecord) =>
      (!s.expiresAt || s.expiresAt > new Date()) &&
      (!needDownload || s.permission !== 'VIEW') &&
      (
        (s.targetType === 'USER' &&
          s.recipientUserId === user.id) ||
        (s.targetType === 'GROUP' &&
          s.recipientGroupId === user.groupId) ||
        (s.targetType === 'DEPARTMENT' &&
          s.recipientDepartmentId === user.departmentId) ||
        (s.targetType === 'OFFICE' &&
          s.recipientOfficeId === user.officeId)
      ),
  );

  return group || dept || share;
}

export async function visibleDocuments(user: AccessUser) {
  if (user.role === 'STUDENT') return [];
  if (user.role === 'SUPER_ADMIN') {
    return db.document.findMany({
      include: {
        uploader: true,
        department: true,
        course: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  return db.document.findMany({
    where: {
      OR: [
        {
          uploaderId: user.id,
        },
        {
          accessRules: {
            some: {
              OR: [
                {
                  groupId: user.groupId ?? undefined,
                },
                {
                  departmentId: user.departmentId ?? undefined,
                },
              ],
            },
          },
        },
        {
          userAccess: {
            some: {
              userId: user.id,
            },
          },
        },
        {
          shares: {
            some: {
              OR: [
                {
                  targetType: 'USER',
                  recipientUserId: user.id,
                },
                {
                  targetType: 'GROUP',
                  recipientGroupId: user.groupId ?? undefined,
                },
                {
                  targetType: 'DEPARTMENT',
                  recipientDepartmentId:
                    user.departmentId ?? undefined,
                },
                {
                  targetType: 'OFFICE',
                  recipientOfficeId:
                    user.officeId ?? undefined,
                },
              ],
            },
          },
        },
      ],
    },
    include: {
      uploader: true,
      department: true,
      course: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
