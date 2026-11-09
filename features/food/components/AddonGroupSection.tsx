import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InlineError, OptionRow } from '../../../components/kudya';
import { useVerticalTheme } from '../../../contexts/VerticalThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatMoney } from '../../../utils/money';
import type { ProductAddonGroup } from '../../commerce/api';
import { groupLimits, isSingleChoice, type GroupIssue } from '../addons';
import { toNumber } from '../format';

type Props = {
  group: ProductAddonGroup;
  selected: number[];
  issue: GroupIssue | null;
  showIssue: boolean;
  currency: string;
  onToggle: (addonId: number) => void;
};

function Indicator({ checked, single }: { checked: boolean; single: boolean }) {
  const theme = useVerticalTheme();
  const color = checked ? theme.colors.primary : theme.colors.border;
  if (single) {
    return (
      <View style={[styles.radio, { borderColor: color }]}>
        {checked ? <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} /> : null}
      </View>
    );
  }
  return (
    <View style={[styles.checkbox, { borderColor: color, backgroundColor: checked ? theme.colors.primary : 'transparent' }]}>
      {checked ? <Feather name="check" size={14} color={theme.colors.onPrimary} /> : null}
    </View>
  );
}

export default function AddonGroupSection({ group, selected, issue, showIssue, currency, onToggle }: Props) {
  const theme = useVerticalTheme();
  const { t } = useTranslation();
  const single = isSingleChoice(group);
  const { min, max } = groupLimits(group);

  const rule = single
    ? t('fdChooseOne', 'Choose 1')
    : max !== null
      ? min > 0
        ? t('fdChooseRange', 'Choose {min}–{max}', { min, max })
        : t('fdChooseUpTo', 'Choose up to {max}', { max })
      : min > 0
        ? t('fdChooseAtLeast', 'Choose at least {min}', { min })
        : t('fdChooseAny', 'Choose any');

  const issueText =
    issue?.kind === 'min'
      ? t('fdIssueMin', 'Choose at least {min} for {group}.', { min: issue.min, group: group.name })
      : issue?.kind === 'max'
        ? t('fdIssueMax', 'Choose up to {max} for {group}.', { max: issue.max, group: group.name })
        : null;

  return (
    <View style={styles.wrap} testID={`food-addon-group-${group.id}`}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{group.name}</Text>
          <Text style={[styles.rule, { color: theme.colors.textMuted }]}>{rule}</Text>
        </View>
        <View
          style={[
            styles.pill,
            { backgroundColor: group.required ? theme.colors.primarySoft : theme.colors.background },
          ]}
        >
          <Text style={[styles.pillText, { color: group.required ? theme.colors.primaryDark : theme.colors.textMuted }]}>
            {group.required ? t('fdRequired', 'Required') : t('fdOptional', 'Optional')}
          </Text>
        </View>
      </View>
      {group.addons.map((addon) => {
        const checked = selected.includes(addon.id);
        const price = toNumber(addon.price);
        return (
          <OptionRow
            key={addon.id}
            title={addon.name}
            selected={checked}
            onPress={() => onToggle(addon.id)}
            right={
              <View style={styles.right}>
                {price > 0 ? (
                  <Text style={[styles.price, { color: theme.colors.textMuted }]}>+{formatMoney(price, currency)}</Text>
                ) : null}
                <Indicator checked={checked} single={single} />
              </View>
            }
          />
        );
      })}
      {showIssue && issueText ? <InlineError message={issueText} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800' },
  rule: { fontSize: 12, marginTop: 2 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '800' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 13, fontWeight: '700' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
