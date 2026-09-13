import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import tw from 'twrnc';
import { RouteProp, useRoute } from '@react-navigation/native';

import { useAppNavigation } from '../navigation/hooks';
import { RootStackParamList } from '../navigation/navigation';
import { useAppSelector } from '../redux/store';
import { selectCartItems } from '../redux/slices/basketSlice';
import { selectUser } from '../redux/slices/authSlice';
import {
  useGetGroceryFavouritesQuery,
  useGetGroceryHomeQuery,
  useGetGroceryProductsQuery,
} from '../redux/api/groceriesApi';
import { useTranslation } from '../hooks/useTranslation';
import GroceryProductCard from '../features/groceries/components/GroceryProductCard';
import type { GroceryBanner, GroceryCategory, GroceryProduct } from '../features/groceries/types';
import { parseGroceryCategoryHref } from '../features/groceries/types';

type GroceryRoute = RouteProp<RootStackParamList, 'Grocery'>;
type GrocerySection = 'home' | 'categories' | 'favourites' | 'deals' | 'popular';

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, '0');
}

function SectionHeader({
  title,
  onViewAll,
  viewAllLabel,
}: {
  title: string;
  onViewAll?: () => void;
  viewAllLabel: string;
}) {
  return (
    <View style={tw`mb-3 flex-row items-center justify-between`}>
      <Text style={tw`text-xl font-bold text-[#111827]`}>{title}</Text>
      {onViewAll ? (
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={tw`text-sm font-semibold text-[#0B8F45]`}>{viewAllLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HeroCard({ banner, onShop }: { banner: GroceryBanner; onShop: (href: string) => void }) {
  const badgeLines = banner.badge.split('\n').filter(Boolean);
  return (
    <View style={tw`overflow-hidden rounded-3xl bg-[#EAF7EE]`}>
      <View style={tw`flex-row items-center p-4`}>
        <View style={tw`flex-1 pr-3`}>
          {banner.subtitle ? (
            <Text style={tw`text-xs font-semibold text-[#0B8F45]`}>{banner.subtitle}</Text>
          ) : null}
          <Text style={tw`mt-1 text-2xl font-extrabold text-[#111827]`}>{banner.title}</Text>
          {banner.body ? (
            <Text style={tw`mt-2 text-xs leading-5 text-[#6B7280]`} numberOfLines={3}>
              {banner.body}
            </Text>
          ) : null}
          <Pressable
            onPress={() => onShop(banner.cta_href)}
            style={tw`mt-3 h-11 flex-row items-center self-start rounded-full bg-[#0B8F45] px-4`}
          >
            <Text style={tw`font-semibold text-white`}>{banner.cta_label || 'Shop Now'}</Text>
            <Feather name="arrow-right" size={16} color="#fff" style={tw`ml-2`} />
          </Pressable>
        </View>
        <View style={tw`h-32 w-32 overflow-hidden rounded-3xl bg-white`}>
          {banner.image ? (
            <Image source={{ uri: banner.image }} style={tw`h-full w-full`} contentFit="cover" />
          ) : null}
          {badgeLines.length ? (
            <View style={tw`absolute -bottom-1 -right-1 h-16 w-16 items-center justify-center rounded-full bg-[#0B8F45]`}>
              {badgeLines.map((line) => (
                <Text key={line} style={tw`text-[9px] font-bold text-white`}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </View>
      <View style={tw`mb-3 items-center`}>
        <View style={tw`h-2 w-6 rounded-full bg-[#0B8F45]`} />
      </View>
    </View>
  );
}

function CategoryChip({
  category,
  onPress,
}: {
  category: GroceryCategory;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={tw`mr-4 w-24 items-center`}>
      <View style={tw`h-24 w-24 overflow-hidden rounded-full bg-white border border-[#E5E7EB]`}>
        {category.image ? (
          <Image source={{ uri: category.image }} style={tw`h-full w-full`} contentFit="cover" />
        ) : (
          <View style={tw`h-full w-full items-center justify-center bg-[#EAF7EE]`}>
            <Feather name="grid" size={20} color="#0B8F45" />
          </View>
        )}
      </View>
      <Text style={tw`mt-2 text-center text-xs font-medium text-[#111827]`} numberOfLines={2}>
        {category.name}
      </Text>
    </Pressable>
  );
}

function ProductGrid({ products }: { products: GroceryProduct[] }) {
  return (
    <View style={tw`flex-row flex-wrap justify-between`}>
      {products.map((product) => (
        <View key={product.id} style={tw`mb-3 w-[48%]`}>
          <GroceryProductCard product={product} />
        </View>
      ))}
    </View>
  );
}

export default function GroceryScreen() {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useRoute<GroceryRoute>();
  const user = useAppSelector(selectUser);
  const cartItems = useAppSelector(selectCartItems);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [section, setSection] = useState<GrocerySection>(route.params?.section ?? 'home');
  const [categorySlug, setCategorySlug] = useState(route.params?.categorySlug);
  const [filter, setFilter] = useState('all');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (route.params?.section) setSection(route.params.section);
    if (route.params?.categorySlug) setCategorySlug(route.params.categorySlug);
  }, [route.params]);

  const homeQuery = useGetGroceryHomeQuery();
  const listingQuery = useGetGroceryProductsQuery(
    {
      search: debouncedSearch || undefined,
      category_slug: categorySlug,
      featured: section === 'popular' && !debouncedSearch && !categorySlug ? true : undefined,
      on_sale: section === 'deals' && !debouncedSearch && !categorySlug ? true : undefined,
      page_size: 24,
    },
    { skip: !debouncedSearch && !categorySlug && section !== 'popular' && section !== 'deals' },
  );
  const favouritesQuery = useGetGroceryFavouritesQuery(undefined, {
    skip: section !== 'favourites' || !user,
  });

  const home = homeQuery.data;
  const listingProducts = listingQuery.data?.results ?? [];
  const selectedCategory = home?.categories.find((category) => category.slug === categorySlug);
  const popularFilters = useMemo(() => {
    const available = new Set((home?.categories ?? []).map((category) => category.slug));
    const preferred = [
      { slug: 'all', label: t('all', 'All') },
      { slug: 'fresh-produce', label: t('fruitsVegetables', 'Fruits & Vegetables') },
      { slug: 'dairy-eggs', label: t('dairy', 'Dairy') },
      { slug: 'beverages', label: t('beverages', 'Beverages') },
    ].filter((item) => item.slug === 'all' || available.has(item.slug));
    if (preferred.length > 1) return preferred;
    return [
      { slug: 'all', label: t('all', 'All') },
      ...(home?.categories.slice(0, 3).map((category) => ({ slug: category.slug, label: category.name })) ?? []),
    ];
  }, [home?.categories, t]);
  const popularVisible = useMemo(() => {
    const products = home?.popular_products ?? [];
    if (filter === 'all') return products;
    return products.filter((product) => product.category?.slug === filter);
  }, [filter, home?.popular_products]);

  useEffect(() => {
    if (!home?.deals_end_at) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [home?.deals_end_at]);

  const countdown = useMemo(() => {
    if (!home?.deals_end_at) return null;
    const diff = Math.max(0, new Date(home.deals_end_at).getTime() - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d : ${pad(hours)}h : ${pad(minutes)}m`;
  }, [home?.deals_end_at, now]);

  function openHref(href: string) {
    const slug = parseGroceryCategoryHref(href);
    if (slug) {
      setCategorySlug(slug);
      setSection('home');
      return;
    }
    setCategorySlug(undefined);
    setSection('popular');
  }

  const showListing = Boolean(categorySlug || debouncedSearch || section === 'popular' || section === 'deals');
  const showHome = section === 'home' && !categorySlug && !debouncedSearch;

  const tabs: { id: GrocerySection | 'orders' | 'account'; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: 'home', label: t('home', 'Home'), icon: 'home' },
    { id: 'categories', label: t('categories', 'Categories'), icon: 'grid' },
    { id: 'orders', label: t('orders', 'Orders'), icon: 'clipboard' },
    { id: 'favourites', label: t('favourites', 'Favourites'), icon: 'heart' },
    { id: 'account', label: t('account', 'Account'), icon: 'user' },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F8FAF9]`} edges={['top']}>
      <View style={tw`flex-row items-center justify-between px-4 py-2`}>
        <View>
          <Text style={tw`text-xl font-extrabold text-[#0B8F45]`}>Kudya</Text>
          <Text style={tw`text-xs text-[#6B7280]`}>{t('deliverToYou', 'Delivering to you')}</Text>
        </View>
        <View style={tw`flex-row items-center`}>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={tw`h-11 w-11 items-center justify-center`}
            accessibilityLabel={t('notifications', 'Notifications')}
          >
            <Feather name="bell" size={22} color="#111827" />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('CartPage')}
            style={tw`ml-2 h-11 w-11 items-center justify-center`}
            accessibilityLabel={`${t('Cart', 'Cart')} ${cartCount}`}
          >
            <Feather name="shopping-cart" size={22} color="#111827" />
            {cartCount > 0 ? (
              <View style={tw`absolute right-0 top-0 min-w-5 items-center rounded-full bg-[#0B8F45] px-1`}>
                <Text style={tw`text-[10px] font-bold text-white`}>{cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View style={tw`px-4 pb-3`}>
        <View style={tw`h-12 flex-row items-center rounded-full border border-[#E5E7EB] bg-white px-4`}>
          <Feather name="search" size={18} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('searchGroceryPlaceholder', 'Search for products, brands...')}
            placeholderTextColor="#6B7280"
            style={tw`ml-3 flex-1 text-sm text-[#111827]`}
            accessibilityLabel={t('search', 'Search')}
          />
          <Feather name="sliders" size={18} color="#0B8F45" />
        </View>
      </View>

      {homeQuery.isError ? (
        <View style={tw`px-4 py-10`}>
          <Text style={tw`text-center text-lg font-semibold text-[#111827]`}>
            {t('somethingWentWrong', 'Something went wrong.')}
          </Text>
          <Text style={tw`mt-2 text-center text-sm text-[#6B7280]`}>
            {t('couldNotLoadGroceries', "We couldn't load the groceries right now. Please try again.")}
          </Text>
          <Pressable onPress={() => void homeQuery.refetch()} style={tw`mt-5 self-center rounded-full bg-[#0B8F45] px-5 py-3`}>
            <Text style={tw`font-semibold text-white`}>{t('tryAgain', 'Try Again')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={tw`px-4 pb-28`}
          refreshControl={
            <RefreshControl refreshing={homeQuery.isFetching && !home} onRefresh={() => void homeQuery.refetch()} />
          }
        >
          {showHome ? (
            <>
              {(home?.hero ?? []).slice(0, 1).map((banner) => (
                <HeroCard key={banner.id} banner={banner} onShop={openHref} />
              ))}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mt-4`}>
                {(home?.benefits ?? []).map((benefit) => (
                  <View key={benefit.id} style={tw`mr-3 w-48 flex-row items-center rounded-2xl border border-[#E5E7EB] bg-white p-3`}>
                    <View style={tw`mr-3 h-11 w-11 items-center justify-center rounded-full bg-[#EAF7EE]`}>
                      <Feather name="truck" size={16} color="#0B8F45" />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-sm font-semibold text-[#111827]`}>{benefit.title}</Text>
                      <Text style={tw`text-xs text-[#6B7280]`}>{benefit.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={tw`mt-6`}>
                <SectionHeader
                  title={t('shopByCategory', 'Shop by Category')}
                  viewAllLabel={t('viewAll', 'View All')}
                  onViewAll={() => {
                    setCategorySlug(undefined);
                    setSection('categories');
                  }}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(home?.categories ?? []).map((category) => (
                    <CategoryChip
                      key={category.id}
                      category={category}
                      onPress={() => {
                        setDebouncedSearch('');
                        setSearch('');
                        setCategorySlug(category.slug);
                        setSection('home');
                      }}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={tw`mt-6`}>
                <SectionHeader
                  title={t('popularProducts', 'Popular Products')}
                  viewAllLabel={t('viewAll', 'View All')}
                  onViewAll={() => {
                    setCategorySlug(undefined);
                    setSection('popular');
                  }}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-3`}>
                  {popularFilters.map((item) => {
                    const selected = filter === item.slug;
                    return (
                      <Pressable
                        key={item.slug}
                        onPress={() => setFilter(item.slug)}
                        style={tw`mr-2 h-11 rounded-full px-4 justify-center ${selected ? 'bg-[#0B8F45]' : 'bg-white border border-[#E5E7EB]'}`}
                      >
                        <Text style={tw`${selected ? 'text-white' : 'text-[#111827]'} font-semibold text-sm`}>
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                {homeQuery.isLoading ? (
                  <Text style={tw`py-8 text-center text-[#6B7280]`}>{t('loading', 'Loading...')}</Text>
                ) : popularVisible.length ? (
                  <ProductGrid products={popularVisible} />
                ) : (
                  <Text style={tw`py-8 text-center text-[#6B7280]`}>{t('noProducts', 'No products found')}</Text>
                )}
              </View>

              <View style={tw`mt-2`}>
                {(home?.promotions ?? []).slice(0, 2).map((banner, index) => (
                  <Pressable
                    key={banner.id}
                    onPress={() => openHref(banner.cta_href)}
                    style={tw`mb-4 overflow-hidden rounded-3xl ${index === 1 ? 'bg-[#056B34]' : 'bg-[#0B8F45]'}`}
                  >
                    <View style={tw`flex-row items-center p-5`}>
                      <View style={tw`flex-1 pr-3`}>
                        <Text style={tw`text-xl font-extrabold text-white`}>{banner.title.replace(/\n/g, ' ')}</Text>
                        {banner.subtitle ? <Text style={tw`mt-1 text-sm text-white/80`}>{banner.subtitle}</Text> : null}
                        <Text style={tw`mt-3 font-semibold text-white`}>{banner.cta_label} →</Text>
                      </View>
                      {banner.image ? (
                        <Image source={{ uri: banner.image }} style={tw`h-24 w-24 rounded-2xl`} contentFit="cover" />
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </View>

              <View>
                <SectionHeader
                  title={home?.deals_title || t('dealsOfTheWeek', 'Deals of the Week')}
                  viewAllLabel={t('viewAll', 'View All')}
                  onViewAll={() => {
                    setCategorySlug(undefined);
                    setSection('deals');
                  }}
                />
                {countdown ? (
                  <Text style={tw`mb-3 text-sm font-medium text-[#0B8F45]`}>
                    {t('endsIn', 'Ends in')} {countdown}
                  </Text>
                ) : null}
                {(home?.deals ?? []).length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {(home?.deals ?? []).map((product) => (
                      <View key={product.id} style={tw`mr-3 w-44`}>
                        <GroceryProductCard product={product} />
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={tw`py-8 text-center text-[#6B7280]`}>
                    {t('noDeals', 'No deals available right now.')}
                  </Text>
                )}
              </View>
            </>
          ) : null}

          {section === 'categories' && !debouncedSearch ? (
            <View>
              <Text style={tw`mb-4 text-2xl font-bold text-[#111827]`}>{t('shopByCategory', 'Shop by Category')}</Text>
              <View style={tw`flex-row flex-wrap`}>
                {(home?.categories ?? []).map((category) => (
                  <View key={category.id} style={tw`mb-4 w-1/4 items-center`}>
                    <CategoryChip
                      category={category}
                      onPress={() => {
                        setCategorySlug(category.slug);
                        setSection('home');
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {section === 'favourites' && !debouncedSearch ? (
            <View>
              <Text style={tw`mb-4 text-2xl font-bold text-[#111827]`}>{t('favourites', 'Favourites')}</Text>
              {!user ? (
                <Text style={tw`py-10 text-center text-[#6B7280]`}>
                  {t('loginToSeeFavourites', 'Sign in to see your favourites')}
                </Text>
              ) : (favouritesQuery.data ?? []).length === 0 ? (
                <Text style={tw`py-10 text-center text-[#6B7280]`}>
                  {t('noFavourites', "You haven't added any favourites yet.")}
                </Text>
              ) : (
                <ProductGrid products={favouritesQuery.data ?? []} />
              )}
            </View>
          ) : null}

          {showListing ? (
            <View>
              <Text style={tw`mb-4 text-2xl font-bold text-[#111827]`}>
                {selectedCategory?.name ||
                  (debouncedSearch
                    ? t('searchResults', 'Search results')
                    : section === 'deals'
                      ? t('dealsOfTheWeek', 'Deals of the Week')
                      : t('popularProducts', 'Popular Products'))}
              </Text>
              {listingQuery.isFetching ? (
                <Text style={tw`py-8 text-center text-[#6B7280]`}>{t('loading', 'Loading...')}</Text>
              ) : listingProducts.length === 0 ? (
                <Text style={tw`py-8 text-center text-[#6B7280]`}>
                  {section === 'deals'
                    ? t('noDeals', 'No deals available right now.')
                    : t('noProducts', 'No products found')}
                </Text>
              ) : (
                <ProductGrid products={listingProducts} />
              )}
            </View>
          ) : null}
        </ScrollView>
      )}

      <View style={tw`absolute inset-x-0 bottom-0 border-t border-[#E5E7EB] bg-white pb-4 pt-2`}>
        <View style={tw`flex-row`}>
          {tabs.map((tab) => {
            const active = tab.id === section || (tab.id === 'home' && showHome);
            return (
              <Pressable
                key={tab.id}
                onPress={() => {
                  if (tab.id === 'orders') {
                    navigation.navigate('OrderHistory');
                    return;
                  }
                  if (tab.id === 'account') {
                    navigation.navigate(user ? 'UserProfile' : 'UserLogin');
                    return;
                  }
                  setDebouncedSearch('');
                  setSearch('');
                  setCategorySlug(undefined);
                  setSection(tab.id);
                }}
                style={tw`flex-1 items-center py-2`}
              >
                <Feather name={tab.icon} size={20} color={active ? '#0B8F45' : '#6B7280'} />
                <Text style={tw`mt-1 text-[11px] font-semibold ${active ? 'text-[#0B8F45]' : 'text-[#6B7280]'}`}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
