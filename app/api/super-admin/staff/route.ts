import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME, isSuperAdmin } from '@/lib/admin-auth';
import { recordAuditLog, getAuditLogs } from '@/lib/audit';
import {
  getStaffMembers,
  saveStaffMember,
  updateStaffRole,
  revokeStaffAccess,
} from '@/lib/settings-db';
import {
  StaffMutationSchema,
  StaffRoleUpdateSchema,
} from '@/lib/super-admin-schemas';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isSuperAdmin(session)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Super Admin privileges strictly required.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const entityType = searchParams.get('entityType') || undefined;
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  try {
    const [staff, rawLogs] = await Promise.all([
      getStaffMembers(search),
      getAuditLogs(Math.min(limit, 300)),
    ]);

    let filteredLogs = rawLogs;
    if (entityType && entityType !== 'ALL') {
      filteredLogs = filteredLogs.filter(
        (l) => l.entityType.toUpperCase() === entityType.toUpperCase()
      );
    }
    if (search) {
      const q = search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (l) =>
          (l.adminEmail && l.adminEmail.toLowerCase().includes(q)) ||
          l.action.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q) ||
          l.entityType.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      staff,
      logs: filteredLogs,
      currentUserRole: session.role,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch staff data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isSuperAdmin(session)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Super Admin privileges strictly required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const action = body.action;

    // 1. Invite or Create Staff / Moderator Account
    if (action === 'INVITE_STAFF' || !action) {
      const parsed = StaffMutationSchema.safeParse(body.staff || body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || 'Invalid staff data' },
          { status: 400 }
        );
      }

      const saved = await saveStaffMember(parsed.data);

      await recordAuditLog({
        adminId: session.userId || session.email,
        adminEmail: session.email,
        action: 'INVITE_STAFF_MEMBER',
        entityType: 'STAFF',
        entityId: saved.id,
        details: {
          email: saved.email,
          name: saved.name,
          role: saved.role,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Staff account created for ${saved.email} with ${saved.role} role.`,
        staff: saved,
      });
    }

    // 2. Change Role of Staff Member
    if (action === 'UPDATE_ROLE') {
      const parsed = StaffRoleUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || 'Invalid role update data' },
          { status: 400 }
        );
      }

      const updated = await updateStaffRole(parsed.data.id, parsed.data.role);

      await recordAuditLog({
        adminId: session.userId || session.email,
        adminEmail: session.email,
        action: 'UPDATE_STAFF_ROLE',
        entityType: 'STAFF',
        entityId: parsed.data.id,
        details: {
          newRole: parsed.data.role,
          targetEmail: updated?.email,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Staff role updated successfully.',
        staff: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action specified' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process staff action' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = await verifyAdminToken(token);

  if (!valid || !isSuperAdmin(session)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Super Admin privileges strictly required.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Staff ID is required for access revocation' },
      { status: 400 }
    );
  }

  try {
    await revokeStaffAccess(id);

    await recordAuditLog({
      adminId: session.userId || session.email,
      adminEmail: session.email,
      action: 'REVOKE_STAFF_ACCESS',
      entityType: 'STAFF',
      entityId: id,
      details: { revokedAt: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff access revoked successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to revoke staff access' },
      { status: 500 }
    );
  }
}
