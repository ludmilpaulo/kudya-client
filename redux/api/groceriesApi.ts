import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseAPI } from '../../services/types';
import {
  mapGroceryHome,
  mapGroceryProduct,
  mapGroceryProductPage,
  type GroceryHome,
  type GroceryProduct,
  type GroceryProductPage,
  type GroceryProductQuery,
} from '../../features/groceries/types';

type RootStateWithAuth = {
  auth: { token: string | null };
};

export const groceriesApi = createApi({
  reducerPath: 'groceriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/v1/groceries/`,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Accept', 'application/json');
      const token = (getState() as RootStateWithAuth).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['GroceryHome', 'GroceryProducts', 'GroceryFavourites'],
  endpoints: (builder) => ({
    getGroceryHome: builder.query<GroceryHome, void>({
      query: () => 'home/',
      transformResponse: (response: unknown) => mapGroceryHome(response),
      providesTags: ['GroceryHome'],
    }),
    getGroceryProducts: builder.query<GroceryProductPage, GroceryProductQuery | void>({
      query: (params) => {
        const searchParams: Record<string, string | number> = {};
        if (params?.search) searchParams.search = params.search;
        if (params?.category) searchParams.category = params.category;
        if (params?.category_slug) searchParams.category_slug = params.category_slug;
        if (params?.featured) searchParams.featured = 'true';
        if (params?.on_sale) searchParams.on_sale = 'true';
        if (params?.page) searchParams.page = params.page;
        if (params?.page_size) searchParams.page_size = params.page_size;
        if (params?.store) searchParams.store = params.store;
        return { url: 'products/', params: searchParams };
      },
      transformResponse: (response: unknown) => mapGroceryProductPage(response),
      providesTags: ['GroceryProducts'],
    }),
    getGroceryFavourites: builder.query<GroceryProduct[], void>({
      query: () => 'favourites/',
      transformResponse: (response: unknown) =>
        mapGroceryProductPage(response).results.map((product) => ({ ...product, is_favourite: true })),
      providesTags: ['GroceryFavourites'],
    }),
    addGroceryFavourite: builder.mutation<GroceryProduct, number>({
      query: (productId) => ({
        url: 'favourites/',
        method: 'POST',
        body: { product_id: productId },
      }),
      transformResponse: (response: unknown) => {
        const product = mapGroceryProduct(response);
        if (!product) {
          throw new Error('Invalid favourite response');
        }
        return { ...product, is_favourite: true };
      },
      invalidatesTags: ['GroceryFavourites', 'GroceryHome', 'GroceryProducts'],
    }),
    removeGroceryFavourite: builder.mutation<void, number>({
      query: (productId) => ({
        url: `favourites/${productId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GroceryFavourites', 'GroceryHome', 'GroceryProducts'],
    }),
  }),
});

export const {
  useGetGroceryHomeQuery,
  useGetGroceryProductsQuery,
  useGetGroceryFavouritesQuery,
  useAddGroceryFavouriteMutation,
  useRemoveGroceryFavouriteMutation,
} = groceriesApi;
