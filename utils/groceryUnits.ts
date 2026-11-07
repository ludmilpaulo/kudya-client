const UNIT_SUFFIX: Record<string, string> = {
  item: "UnitItem",
  kg: "UnitKg",
  g: "UnitG",
  l: "UnitL",
  ml: "UnitMl",
  pack: "UnitPack",
  box: "UnitBox",
  bottle: "UnitBottle",
  dozen: "UnitDozen",
  tray: "UnitTray",
};

export function sellingUnitTranslationKey(
  unit?: string | null,
  scope: "gp" | "grocery" = "grocery",
): string {
  const suffix = UNIT_SUFFIX[(unit || "item").toLowerCase()] ?? "UnitItem";
  return `${scope}${suffix}`;
}
