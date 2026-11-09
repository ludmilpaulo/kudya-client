export type TransferRequirements =
  | { credit_party_identifier?: string[][]; beneficiary?: string[][] }
  | Array<string | string[]>;

export type TransferSection = 'credit_party_identifier' | 'beneficiary';

export type FieldOptions = Record<TransferSection, string[][]>;

function combinations(raw: unknown): string[][] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (raw.every((item) => typeof item === 'string')) return [raw as string[]];
  return raw.filter((group): group is string[] => Array.isArray(group) && group.length > 0);
}

/** Accepted field combinations per section. Legacy flat lists become one combination per entry. */
export function fieldOptions(required: TransferRequirements | null | undefined): FieldOptions {
  if (Array.isArray(required)) {
    return {
      credit_party_identifier: required
        .map((entry) => (Array.isArray(entry) ? entry : [entry]))
        .filter((group) => group.length > 0),
      beneficiary: [],
    };
  }
  return {
    credit_party_identifier: combinations(required?.credit_party_identifier),
    beneficiary: combinations(required?.beneficiary),
  };
}

export function fieldLabel(name: string): string {
  const spaced = name.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function buildBeneficiary(
  options: FieldOptions,
  choice: Record<TransferSection, number>,
  values: Record<string, string>,
): Record<TransferSection, Record<string, string>> {
  const result: Record<TransferSection, Record<string, string>> = { credit_party_identifier: {}, beneficiary: {} };
  (Object.keys(result) as TransferSection[]).forEach((section) => {
    const group = options[section][choice[section]] ?? [];
    group.forEach((name) => {
      const value = (values[`${section}.${name}`] ?? '').trim();
      if (value) result[section][name] = value;
    });
  });
  return result;
}
