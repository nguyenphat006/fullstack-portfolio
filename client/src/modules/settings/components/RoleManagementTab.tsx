"use client";

import React, { useMemo, useState } from "react";
import { Lock, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirm } from "@/components/feedback/confirm";
import { EmptyState } from "@/components/common";
import { StatusBadge, ACTIVE_STATUS } from "@/components/common/StatusBadge";
import { RelativeTime } from "@/components/list";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { normalizeText } from "@/lib/text/normalize";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { useRolesList, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from "../hooks/useRolesQuery";
import { RoleFormModal } from "./RoleFormModal";
import type { RoleItem, RoleCreateInput, RoleUpdateInput } from "../types";

interface RoleManagementTabProps {
  onNavigateToMatrix?: (roleId: number) => void;
}

/** Danh mục vai trò (nhỏ, tải 1 lần) — tìm / lọc tại chỗ */
export function RoleManagementTab({ onNavigateToMatrix }: RoleManagementTabProps) {
  const t = useTranslations("settings.roles");
  const tc = useTranslations("common");
  const { can } = usePermission();
  const confirm = useConfirm();
  const canUpdate = can(PERMISSIONS.SETTINGS.UPDATE);
  const canDelete = can(PERMISSIONS.SETTINGS.DELETE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  const { data: roles = [], isLoading } = useRolesList();
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const deleteMutation = useDeleteRoleMutation();

  const rows = useMemo(() => {
    const q = normalizeText(search.trim());
    return roles.filter(
      (r) =>
        (!q || normalizeText(`${r.role_code} ${r.role_name} ${r.description ?? ""}`).includes(q)) &&
        (status === "all" || (status === "active") === r.is_active),
    );
  }, [roles, search, status]);

  const handleFormSubmit = async (values: RoleCreateInput | RoleUpdateInput) => {
    if (editingRole) {
      await updateMutation.mutateAsync({ id: editingRole.id, data: values as RoleUpdateInput });
      toast.success(tc("messages.updated", { entity: `${t("entity")} "${editingRole.role_name}"` }));
    } else {
      await createMutation.mutateAsync(values as RoleCreateInput);
      toast.success(tc("messages.created", { entity: t("entity") }));
    }
    setIsFormOpen(false);
  };

  const remove = (role: RoleItem) =>
    confirm({
      title: tc("messages.deleteTitle", { entity: t("entity"), name: role.role_name }),
      description: tc("messages.deleteIrreversible"),
      confirmText: tc("actions.delete"),
      danger: true,
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(role.id);
          toast.success(tc("messages.deleted", { entity: `${t("entity")} "${role.role_name}"` }));
        } catch (error) {
          toast.error(extractErrorMessage(error, t("deleteError")));
        }
      },
    });

  const deleteBlockedReason = (r: RoleItem) =>
    r.role_code === "ADMIN" ? t("adminProtected") : r.users_count > 0 ? t("inUse", { count: r.users_count }) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-8" aria-label={t("searchLabel")} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40" aria-label={t("statusFilter")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="active">{tc("status.active")}</SelectItem>
            <SelectItem value="inactive">{tc("status.inactive")}</SelectItem>
          </SelectContent>
        </Select>
        {can(PERMISSIONS.SETTINGS.CREATE) && (
          <Button
            className="ml-auto"
            onClick={() => {
              setEditingRole(null);
              setIsFormOpen(true);
            }}
          >
            <Plus />
            {t("add")}
          </Button>
        )}
      </div>

      <div className="dt-scroll">
        <table className="dt w-full min-w-[820px]">
          <thead>
            <tr>
              <th className="dt-th w-48">{tc("fields.code")}</th>
              <th className="dt-th">{t("columns.role")}</th>
              <th className="dt-th w-36">{t("columns.permissions")}</th>
              <th className="dt-th w-32">{t("columns.users")}</th>
              <th className="dt-th w-32">{tc("fields.status")}</th>
              <th className="dt-th w-36">{tc("fields.updatedAt")}</th>
              {(canUpdate || canDelete) && <th className="dt-th w-24" aria-label={tc("fields.actions")} />}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  <td className="dt-td" colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td className="dt-td" colSpan={7}>
                  <EmptyState title={roles.length ? t("noMatch") : t("empty")} />
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const isAdmin = r.role_code === "ADMIN";
                const blocked = deleteBlockedReason(r);
                return (
                  <tr key={r.id} className="dt-row">
                    <td className="dt-td">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold">
                        {r.role_code}
                        {isAdmin && <Lock className="size-3.5 text-[var(--c-purple)]" aria-label={t("fullAccess")} />}
                      </span>
                    </td>
                    <td className="dt-td">
                      <span className="block truncate font-medium">{r.role_name}</span>
                      {r.description && <span className="block truncate text-xs text-muted-foreground">{r.description}</span>}
                    </td>
                    <td className="dt-td">
                      {isAdmin ? (
                        <span className="text-sm text-muted-foreground">{t("allPermissions")}</span>
                      ) : onNavigateToMatrix ? (
                        <Button variant="link" size="sm" className="h-auto p-0 tabular-nums" onClick={() => onNavigateToMatrix(r.id)}>
                          {t("permissionCount", { count: r.permissions_count || 0 })}
                        </Button>
                      ) : (
                        <span className="tabular-nums">{t("permissionCount", { count: r.permissions_count || 0 })}</span>
                      )}
                    </td>
                    <td className="dt-td tabular-nums">{r.users_count || 0}</td>
                    <td className="dt-td">
                      <StatusBadge map={ACTIVE_STATUS} value={r.is_active} />
                    </td>
                    <td className="dt-td">
                      <RelativeTime value={r.updated_at} />
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="dt-td dt-actions text-right">
                        <div className="inline-flex gap-0.5">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={tc("actions.edit")}
                              onClick={() => {
                                setEditingRole(r);
                                setIsFormOpen(true);
                              }}
                            >
                              <Pencil />
                            </Button>
                          )}
                          {canDelete && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label={tc("actions.delete")} disabled={Boolean(blocked)} onClick={() => remove(r)}>
                                    <Trash2 />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {blocked && <TooltipContent>{blocked}</TooltipContent>}
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <RoleFormModal open={isFormOpen} editingRole={editingRole} onCancel={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} loading={createMutation.isPending || updateMutation.isPending} />
    </div>
  );
}
