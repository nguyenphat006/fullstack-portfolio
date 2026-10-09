"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Copy, KeyRound, Lock, LockOpen, Trash2 } from "lucide-react";
import { DetailPage } from "@/components/detail";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserDetail, useUpdateUserMutation, useDeleteUserMutation, useCreateUserMutation } from "./hooks/useUsersQuery";
import { UserFormModal } from "./components/UserFormModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { useUserHero } from "./hero";
import type { CreateUserInput, UserItem } from "./types";

const LIST_HREF = "/users";

/** Khớp quy tắc backend: tài khoản Quản trị viên */
export function isAdminAccount(user: UserItem) {
  return Boolean(user.is_superuser || user.username === "admin" || user.roles?.some((r) => r.role_code === "ADMIN"));
}

export interface UserDetailViewProps {
  userId: number;
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const t = useTranslations("users");
  const tc = useTranslations("common");
  const userHero = useUserHero();
  const router = useRouter();
  const { can, isSuperUser } = usePermission();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [duplicate, setDuplicate] = useState<UserItem | null>(null);

  const query = useUserDetail(userId);
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const createMutation = useCreateUserMutation();

  const user = query.data;
  const targetIsAdmin = user ? isAdminAccount(user) : false;
  const isSelf = user?.id === currentUserId;
  const canEditTarget = can(PERMISSIONS.USER.UPDATE) && (!targetIsAdmin || isSuperUser);

  const handleEditSubmit = async (values: CreateUserInput) => {
    await updateMutation.mutateAsync({ id: userId, data: values });
    toast.success(tc("messages.updated", { entity: t("entity") }));
    setEditOpen(false);
  };

  const handleDuplicateSubmit = async (values: CreateUserInput) => {
    await createMutation.mutateAsync(values);
    toast.success(t("duplicated"));
    setDuplicate(null);
  };

  return (
    <DetailPage<UserItem>
      query={query}
      backHref={LIST_HREF}
      entityLabel={t("entity")}
      hero={userHero}
      onEdit={canEditTarget ? () => setEditOpen(true) : undefined}
      moreActions={(u) => [
        {
          key: "reset-password",
          label: t("resetPassword.title"),
          icon: <KeyRound />,
          onClick: canEditTarget ? () => setPasswordOpen(true) : undefined,
        },
        {
          key: "duplicate",
          label: tc("actions.duplicate"),
          icon: <Copy />,
          onClick: can(PERMISSIONS.USER.CREATE)
            ? () =>
                setDuplicate({
                  ...u,
                  id: 0,
                  username: `${u.username}_copy`,
                  full_name: t("copyName", { name: u.full_name || u.username }),
                  email: "",
                  is_superuser: false,
                })
            : undefined,
        },
        {
          key: "toggle",
          label: u.is_active ? t("lockAccount") : t("unlockAccount"),
          icon: u.is_active ? <Lock /> : <LockOpen />,
          disabledReason: isSelf ? t("cannotLockSelf") : null,
          onClick: canEditTarget
            ? async () => {
                await updateMutation.mutateAsync({ id: u.id, data: { is_active: !u.is_active } });
                toast.success(u.is_active ? t("locked") : t("unlocked"));
              }
            : undefined,
        },
        {
          key: "delete",
          label: t("deleteAccount"),
          icon: <Trash2 />,
          danger: true,
          disabledReason: targetIsAdmin ? t("cannotDeleteAdmin") : isSelf ? t("cannotDeleteSelf") : null,
          confirm: { title: tc("messages.deleteTitle", { entity: t("entity"), name: u.full_name || u.username }), content: tc("messages.deleteIrreversible"), okText: tc("actions.delete") },
          onClick: can(PERMISSIONS.USER.DELETE)
            ? async () => {
                await deleteMutation.mutateAsync(u.id);
                toast.success(tc("messages.deleted", { entity: t("entity") }));
                router.push(LIST_HREF);
              }
            : undefined,
        },
      ]}
      attachments={{ entityType: "User", entityId: userId, readonly: !canEditTarget }}
      audit={{ model: "authentication.customuser", objectId: userId }}
    >
      {user && (
        <>
          <UserFormModal
            open={editOpen}
            editingUser={user}
            loading={updateMutation.isPending}
            onCancel={() => setEditOpen(false)}
            onSubmit={handleEditSubmit}
          />
          <UserFormModal
            open={!!duplicate}
            editingUser={duplicate}
            loading={createMutation.isPending}
            onCancel={() => setDuplicate(null)}
            onSubmit={handleDuplicateSubmit}
          />
          <ResetPasswordModal
            open={passwordOpen}
            accountName={user.full_name || user.username}
            loading={updateMutation.isPending}
            onCancel={() => setPasswordOpen(false)}
            onSubmit={async (password) => {
              await updateMutation.mutateAsync({ id: user.id, data: { password } as Partial<CreateUserInput> });
              toast.success(t("resetPassword.done"));
              setPasswordOpen(false);
            }}
          />
        </>
      )}
    </DetailPage>
  );
}

export default UserDetailView;
