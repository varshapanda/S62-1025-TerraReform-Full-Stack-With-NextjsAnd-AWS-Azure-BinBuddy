// lib/rbac.ts
export type Role = "user" | "volunteer" | "authority" | "admin";

export const permissions = {
  user: [
    "report:create",
    "report:read:own",
    "report:update:own",
    "reward:read:own",
  ],
  volunteer: [
    "report:read:pending",
    "report:verify",
    "report:assign:authority",
    "reward:earn",
  ],
  authority: [
    "task:schedule",
    "task:complete",
    "report:read:assigned",
    "reward:distribute",
  ],
  admin: ["user:manage", "report:*", "task:*", "reward:*", "logs:read"],
} as const;

export function roleHasPermission(role: Role, permission: string) {
  if (role === "admin") return true; // admins bypass checks
  const rolePerms = (permissions[role] as readonly string[]) ?? [];
  // simple pattern match for wildcard perms
  if (rolePerms.includes(permission)) return true;
  // support wildcard like 'report:*' or permission segments
  const [permScope] = permission.split(":");
  return rolePerms.some(
    (p) => p.endsWith(":*") && p.startsWith(`${permScope}:`)
  );
}
