import type { ProductAddonGroup } from '../commerce/api';

/** Selected add-on ids keyed by add-on group id. */
export type AddonSelection = Record<number, number[]>;

export type CartAddon = { id: number; name: string; price: number };

export type GroupLimits = { min: number; max: number | null };

export type GroupIssue = { kind: 'min'; min: number } | { kind: 'max'; max: number };

/** Mirrors the checkout validation in the backend (`stores/addons.py`): max_select 0 means unlimited. */
export function groupLimits(group: ProductAddonGroup): GroupLimits {
  const min = group.required ? Math.max(group.min_select, 1) : Math.max(group.min_select, 0);
  return { min, max: group.max_select > 0 ? group.max_select : null };
}

export function isSingleChoice(group: ProductAddonGroup): boolean {
  return groupLimits(group).max === 1;
}

export function toggleAddon(group: ProductAddonGroup, selection: AddonSelection, addonId: number): AddonSelection {
  const current = selection[group.id] ?? [];
  const selected = current.includes(addonId);
  if (isSingleChoice(group)) {
    if (selected) return group.required ? selection : { ...selection, [group.id]: [] };
    return { ...selection, [group.id]: [addonId] };
  }
  if (selected) return { ...selection, [group.id]: current.filter((id) => id !== addonId) };
  const { max } = groupLimits(group);
  if (max !== null && current.length >= max) return selection;
  return { ...selection, [group.id]: [...current, addonId] };
}

export function groupIssue(group: ProductAddonGroup, selection: AddonSelection): GroupIssue | null {
  const count = (selection[group.id] ?? []).length;
  const { min, max } = groupLimits(group);
  if ((group.required || count > 0) && count < min) return { kind: 'min', min };
  if (max !== null && count > max) return { kind: 'max', max };
  return null;
}

export function selectionIssues(groups: ProductAddonGroup[], selection: AddonSelection): Record<number, GroupIssue> {
  const issues: Record<number, GroupIssue> = {};
  for (const group of groups) {
    const issue = groupIssue(group, selection);
    if (issue) issues[group.id] = issue;
  }
  return issues;
}

export function selectedAddons(groups: ProductAddonGroup[], selection: AddonSelection): CartAddon[] {
  return groups.flatMap((group) => {
    const ids = selection[group.id] ?? [];
    return group.addons
      .filter((addon) => ids.includes(addon.id))
      .map((addon) => ({ id: addon.id, name: addon.name, price: Number(addon.price) || 0 }));
  });
}

export function addonsTotal(addons: CartAddon[]): number {
  return addons.reduce((sum, addon) => sum + addon.price, 0);
}

/** Basket lines merge by product id + size, so the label must be unique per configuration. */
export function configurationLabel(sizeLabel: string | null, addons: CartAddon[]): string {
  const extras = addons.map((addon) => addon.name).join(', ');
  return [sizeLabel, extras].filter(Boolean).join(' · ');
}
