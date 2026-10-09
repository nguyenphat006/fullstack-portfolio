"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Loader2, Search, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Combobox } from "@/components/controls/Combobox";
import { EmptyState } from "@/components/common";
import { getIconByName } from "@/constants/iconMap";
import { getActionLabel, sortPermissionsByAction } from "@/constants/permissionTags";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { normalizeText } from "@/lib/text/normalize";
import { cn } from "@/lib/utils";
import { rbacService } from "../services/rbac.service";
import { ROLES_QUERY_KEY, useRolesList } from "../hooks/useRolesQuery";
import type { GroupedPermission, PermissionItem, RoleItem } from "../types";

type Matrix = Record<number, number[]>;

// Mảng rỗng cố định: `initial` so sánh tham chiếu để nạp lại bản nháp (tránh vòng lặp render)
const NO_ROLES: RoleItem[] = [];
const NO_GROUPS: GroupedPermission[] = [];

const isAdminRole = (r: RoleItem) => r.role_code === "ADMIN";

/** Trạng thái checkbox nhóm: true / false / "indeterminate" */
function groupState(selected: Set<number>, ids: number[]): boolean | "indeterminate" {
  const n = ids.filter((id) => selected.has(id)).length;
  return n === 0 ? false : n === ids.length ? true : "indeterminate";
}

/** Ma trận vai trò × quyền: sửa tại chỗ, lưu một lần (batch) */
export function RolePermissionMatrixTab() {
  const t = useTranslations("settings.matrix");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const queryClient = useQueryClient();
  const canEdit = usePermission().can(PERMISSIONS.SETTINGS.UPDATE);

  const { data: roles = NO_ROLES, isLoading: rolesLoading } = useRolesList();
  const { data: groups = NO_GROUPS, isLoading: groupsLoading } = useQuery({
    queryKey: ["grouped-permissions"],
    queryFn: rbacService.getGroupedPermissions,
    staleTime: 60_000,
  });

  const allIds = useMemo(() => groups.flatMap((g) => g.permissions.map((p) => p.id)), [groups]);
  const initial = useMemo<Matrix>(() => Object.fromEntries(roles.map((r) => [r.id, isAdminRole(r) ? allIds : (r.permission_ids ?? [])])), [roles, allIds]);
  // Bản nháp đang sửa; dữ liệu server đổi (sau khi lưu / tải lại) -> nạp lại
  const [source, setSource] = useState(initial);
  const [matrix, setMatrix] = useState<Matrix>(initial);
  if (source !== initial) {
    setSource(initial);
    setMatrix(initial);
  }

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sets = useMemo(() => Object.fromEntries(Object.entries(matrix).map(([k, v]) => [k, new Set(v)])) as Record<number, Set<number>>, [matrix]);
  const initialSets = useMemo(() => Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, new Set(v)])) as Record<number, Set<number>>, [initial]);

  const changes = useMemo(() => {
    let n = 0;
    for (const r of roles) {
      if (isAdminRole(r)) continue;
      const cur = sets[r.id] ?? new Set<number>();
      const orig = initialSets[r.id] ?? new Set<number>();
      cur.forEach((id) => !orig.has(id) && n++);
      orig.forEach((id) => !cur.has(id) && n++);
    }
    return n;
  }, [roles, sets, initialSets]);

  const visibleGroups = useMemo(() => {
    const q = normalizeText(search.trim());
    return groups
      .filter((g) => !moduleFilter || g.module === moduleFilter)
      .map((g) => ({
        ...g,
        permissions: sortPermissionsByAction(
          q ? g.permissions.filter((p) => normalizeText(`${p.permission_code} ${p.permission_name} ${p.description ?? ""} ${g.module_name ?? ""}`).includes(q)) : g.permissions,
        ),
      }))
      .filter((g) => g.permissions.length > 0);
  }, [groups, moduleFilter, search]);

  const setRole = (role: RoleItem, update: (cur: Set<number>) => void) => {
    if (isAdminRole(role) || !canEdit) return;
    setMatrix((prev) => {
      const cur = new Set(prev[role.id] ?? []);
      update(cur);
      return { ...prev, [role.id]: Array.from(cur) };
    });
  };
  const toggleMany = (role: RoleItem, ids: number[]) =>
    setRole(role, (cur) => {
      const all = ids.every((id) => cur.has(id));
      ids.forEach((id) => (all ? cur.delete(id) : cur.add(id)));
    });

  const save = async () => {
    setSaving(true);
    try {
      await rbacService.batchSetRolePermissions(matrix);
      toast.success(t("saved"));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] }),
        queryClient.invalidateQueries({ queryKey: ["navigation"] }),
        queryClient.invalidateQueries({ queryKey: ["users"] }),
      ]);
    } catch (error) {
      toast.error(extractErrorMessage(error, t("saveError")));
    } finally {
      setSaving(false);
    }
  };

  if (rolesLoading || groupsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  const moduleOptions = groups.map((g) => ({ value: g.module, label: `${g.module_name || g.module} (${g.permissions.length})`, icon: getIconByName(g.icon) }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-8" aria-label={t("searchLabel")} />
        </div>
        <div className="w-full sm:w-64">
          <Combobox options={moduleOptions} value={moduleFilter} onChange={setModuleFilter} allowClear placeholder={t("allModules", { count: allIds.length })} />
        </div>
        {canEdit && (
          <div className="ml-auto flex items-center gap-2">
            {changes > 0 && (
              <Button variant="outline" onClick={() => setMatrix(initial)} disabled={saving}>
                <Undo2 />
                {tc("actions.undo")}
              </Button>
            )}
            <Button onClick={save} disabled={changes === 0 || saving}>
              {saving && <Loader2 className="animate-spin" />}
              {changes > 0 ? t("saveChanges", { count: changes }) : tc("actions.save")}
            </Button>
          </div>
        )}
      </div>

      <div className="matrix-scroll">
        <table className="matrix">
          <thead>
            <tr>
              <th className="matrix__corner">{t("permission")}</th>
              {roles.map((role) => {
                const admin = isAdminRole(role);
                const count = admin ? allIds.length : (sets[role.id]?.size ?? 0);
                return (
                  <th key={role.id} className={cn("matrix__role", admin && "matrix__role--admin")}>
                    <span className="flex items-center justify-center gap-1 font-medium">
                      {admin && <Crown className="size-3.5 text-[var(--c-warning)]" />}
                      <span className="truncate">{role.role_name}</span>
                    </span>
                    <span className="mt-1 flex items-center justify-center gap-1.5 text-xs font-normal text-muted-foreground tabular-nums">
                      {!admin && canEdit && (
                        <Checkbox checked={groupState(sets[role.id] ?? new Set(), allIds)} onCheckedChange={() => toggleMany(role, allIds)} aria-label={t("selectAllForRole", { role: role.role_name })} />
                      )}
                      {admin ? t("fullAccess") : `${count}/${allIds.length}`}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleGroups.length === 0 ? (
              <tr>
                <td colSpan={roles.length + 1}>
                  <EmptyState title={t("noMatch")} />
                </td>
              </tr>
            ) : (
              visibleGroups.map((group) => {
                const groupIds = group.permissions.map((p) => p.id);
                return (
                  <React.Fragment key={group.module}>
                    <tr className="matrix__group">
                      <td className="matrix__sticky">
                        <span className="flex items-center gap-2 font-medium [&_svg]:size-4 [&_svg]:text-muted-foreground">
                          {getIconByName(group.icon)}
                          {group.module_name || group.module}
                          <span className="text-xs font-normal text-muted-foreground">{group.permissions.length}</span>
                        </span>
                      </td>
                      {roles.map((role) => (
                        <td key={role.id} className="matrix__cell">
                          {isAdminRole(role) ? null : (
                            <Checkbox
                              checked={groupState(sets[role.id] ?? new Set(), groupIds)}
                              onCheckedChange={() => toggleMany(role, groupIds)}
                              disabled={!canEdit}
                              aria-label={t("selectModuleForRole", { module: group.module_name || group.module, role: role.role_name })}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                    {group.permissions.map((perm: PermissionItem) => (
                      <tr key={perm.id} className="matrix__row">
                        <td className="matrix__sticky pl-9">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block">
                                <span className="block truncate text-sm">{perm.permission_name}</span>
                                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                  {perm.permission_code} · {getActionLabel(perm.permission_code, tr)}
                                </span>
                              </span>
                            </TooltipTrigger>
                            {perm.description && <TooltipContent className="max-w-xs">{perm.description}</TooltipContent>}
                          </Tooltip>
                        </td>
                        {roles.map((role) => {
                          const admin = isAdminRole(role);
                          const checked = admin || !!sets[role.id]?.has(perm.id);
                          const dirty = !admin && checked !== !!initialSets[role.id]?.has(perm.id);
                          return (
                            <td key={role.id} className={cn("matrix__cell", dirty && "matrix__cell--dirty")}>
                              <Checkbox
                                checked={checked}
                                disabled={admin || !canEdit}
                                onCheckedChange={() => toggleMany(role, [perm.id])}
                                aria-label={`${perm.permission_code} cho ${role.role_name}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
