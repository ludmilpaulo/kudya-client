import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState, ScreenHeader, SearchBar } from '../../components/kudya';
import { useVerticalTheme, withVerticalTheme } from '../../contexts/VerticalThemeContext';
import { useAppNavigation } from '../../navigation/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { useGetGroceryHomeQuery } from '../../redux/api/groceriesApi';
import type { GroceryCategory } from '../../features/groceries/types';
import CartButton from '../../features/groceryFlow/components/CartButton';
import { CategoryGlyph } from '../../features/groceryFlow/components/CategoryTile';

function CategoryRow({ category, onPress }: { category: GroceryCategory; onPress: () => void }) {
  const theme = useVerticalTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={category.name}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.glyph, { backgroundColor: theme.colors.primarySoft }]}>
        <CategoryGlyph category={category} size={48} />
      </View>
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
        {category.name}
      </Text>
      <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
    </Pressable>
  );
}

function GroceryCategoriesContent() {
  const theme = useVerticalTheme();
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const home = useGetGroceryHomeQuery();
  const [filter, setFilter] = useState('');
  const categories = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const all = home.data?.categories ?? [];
    return needle ? all.filter((category) => category.name.toLowerCase().includes(needle)) : all;
  }, [filter, home.data?.categories]);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={t('grAllCategories', 'All Categories')}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        right={<CartButton />}
      />
      {home.isLoading ? (
        <LoadingState />
      ) : home.isError ? (
        <ErrorState
          title={t('grCategoriesError', "We couldn't load categories")}
          retryLabel={t('grRetry', 'Try again')}
          onRetry={() => void home.refetch()}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshing={home.isFetching}
          onRefresh={() => void home.refetch()}
          ListHeaderComponent={
            <SearchBar value={filter} onChangeText={setFilter} placeholder={t('grFindCategory', 'Find a category')} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="grid"
              title={filter ? t('grNoCategoryMatch', 'No matching categories') : t('grNoCategories', 'No categories yet')}
            />
          }
          renderItem={({ item }) => (
            <CategoryRow
              category={item}
              onPress={() => navigation.navigate('GroceryProductSearch', { categorySlug: item.slug, title: item.name })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, borderRadius: 16, borderWidth: 1 },
  pressed: { opacity: 0.9 },
  glyph: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: 15, fontWeight: '700' },
});

export default withVerticalTheme(GroceryCategoriesContent, () => 'groceries');
