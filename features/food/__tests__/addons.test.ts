import type { ProductAddonGroup } from '../../commerce/api';
import {
  addonsTotal,
  configurationLabel,
  groupIssue,
  selectedAddons,
  selectionIssues,
  toggleAddon,
} from '../addons';

const sauce: ProductAddonGroup = {
  id: 1,
  name: 'Sauce',
  required: true,
  min_select: 0,
  max_select: 1,
  addons: [
    { id: 11, name: 'Peri-peri', price: '0.00' },
    { id: 12, name: 'Garlic', price: '5.00' },
  ],
};

const extras: ProductAddonGroup = {
  id: 2,
  name: 'Extras',
  required: false,
  min_select: 0,
  max_select: 2,
  addons: [
    { id: 21, name: 'Extra Cheese', price: '15.00' },
    { id: 22, name: 'Bacon', price: '20.00' },
    { id: 23, name: 'Fried Egg', price: '10.00' },
  ],
};

describe('food add-on selection', () => {
  it('treats required groups as needing at least one choice', () => {
    expect(groupIssue(sauce, {})).toEqual({ kind: 'min', min: 1 });
    expect(groupIssue(sauce, { 1: [11] })).toBeNull();
  });

  it('replaces the choice in single-select groups and keeps required ones selected', () => {
    let selection = toggleAddon(sauce, {}, 11);
    selection = toggleAddon(sauce, selection, 12);
    expect(selection[1]).toEqual([12]);
    expect(toggleAddon(sauce, selection, 12)[1]).toEqual([12]);
  });

  it('caps multi-select groups at max_select', () => {
    let selection = toggleAddon(extras, {}, 21);
    selection = toggleAddon(extras, selection, 22);
    selection = toggleAddon(extras, selection, 23);
    expect(selection[2]).toEqual([21, 22]);
    expect(toggleAddon(extras, selection, 21)[2]).toEqual([22]);
  });

  it('only enforces optional minimums once something is chosen', () => {
    const optionalPair: ProductAddonGroup = { ...extras, min_select: 2, max_select: 0 };
    expect(groupIssue(optionalPair, {})).toBeNull();
    expect(groupIssue(optionalPair, { 2: [21] })).toEqual({ kind: 'min', min: 2 });
  });

  it('mirrors the backend minimum: required → max(min_select, 1), optional → min_select', () => {
    const requiredPair: ProductAddonGroup = { ...extras, required: true, min_select: 2, max_select: 3 };
    expect(groupIssue(requiredPair, {})).toEqual({ kind: 'min', min: 2 });
    expect(groupIssue(requiredPair, { 2: [21] })).toEqual({ kind: 'min', min: 2 });
    expect(groupIssue(requiredPair, { 2: [21, 22] })).toBeNull();
    const optionalNoMin: ProductAddonGroup = { ...extras, min_select: 0 };
    expect(groupIssue(optionalNoMin, {})).toBeNull();
    expect(groupIssue(optionalNoMin, { 2: [21] })).toBeNull();
  });

  it('reports selections above max_select and treats max_select 0 as unlimited', () => {
    expect(groupIssue(extras, { 2: [21, 22, 23] })).toEqual({ kind: 'max', max: 2 });
    const unlimited: ProductAddonGroup = { ...extras, max_select: 0 };
    let selection = toggleAddon(unlimited, {}, 21);
    selection = toggleAddon(unlimited, selection, 22);
    selection = toggleAddon(unlimited, selection, 23);
    expect(selection[2]).toEqual([21, 22, 23]);
    expect(groupIssue(unlimited, selection)).toBeNull();
  });

  it('lets optional single-choice groups be cleared', () => {
    const optionalSingle: ProductAddonGroup = { ...sauce, required: false };
    const selection = toggleAddon(optionalSingle, { 1: [11] }, 11);
    expect(selection[1]).toEqual([]);
    expect(groupIssue(optionalSingle, selection)).toBeNull();
  });

  it('prices and labels a configuration in menu order', () => {
    const selection = { 1: [12], 2: [22, 21] };
    const addons = selectedAddons([sauce, extras], selection);
    expect(selectionIssues([sauce, extras], selection)).toEqual({});
    expect(addonsTotal(addons)).toBe(40);
    expect(configurationLabel('Large', addons)).toBe('Large · Garlic, Extra Cheese, Bacon');
    expect(configurationLabel(null, [])).toBe('');
  });
});
