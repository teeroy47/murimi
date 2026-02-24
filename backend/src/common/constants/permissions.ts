export const PERMISSIONS = {
  NUTRITION_VIEW: "nutrition.view",
  NUTRITION_EDIT: "nutrition.edit",
  BREEDING_VIEW: "breeding.view",
  BREEDING_EDIT: "breeding.edit",
  HEALTH_VIEW: "health.view",
  HEALTH_EDIT: "health.edit",
  SLAUGHTER_VIEW: "slaughter.view",
  SLAUGHTER_EDIT: "slaughter.edit",
  MAP_VIEW: "map.view",
  MAP_EDIT: "map.edit",
  REPORTS_VIEW: "reports.view",
  AUDIT_VIEW: "audit.view",
  SETTINGS_MANAGE_USERS: "settings.manage_users",
  KB_MANAGE: "kb.manage",
  ANIMALS_VIEW: "animals.view",
  ANIMALS_EDIT: "animals.edit",
  ROLES_MANAGE: "roles.manage",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
