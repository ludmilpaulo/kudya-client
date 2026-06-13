import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseAPI } from '../../services/types';
import type {
  NearbyDriverResponse,
  Ride,
  RideCategory,
  RidePriceEstimate,
  RideRequestPayload,
} from '../../services/rides/types';

type RootStateWithAuth = {
  auth: { token: string | null };
};

const ridesBaseQuery = fetchBaseQuery({
  baseUrl: baseAPI,
  prepareHeaders: (headers, { getState }) => {
    headers.set('Accept', 'application/json');
    const token = (getState() as RootStateWithAuth).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const ridesApi = createApi({
  reducerPath: 'ridesApi',
  baseQuery: ridesBaseQuery,
  tagTypes: ['Rides'],
  endpoints: (builder) => ({
    getRideCategories: builder.query<RideCategory[], string>({
      query: (countryCode) => `/api/rides/categories/?country_code=${encodeURIComponent(countryCode)}`,
    }),
    estimateRidePrice: builder.mutation<
      RidePriceEstimate,
      {
        pickup_latitude: number;
        pickup_longitude: number;
        destination_latitude: number;
        destination_longitude: number;
        ride_category_id: number;
        country_code?: string;
      }
    >({
      query: (body) => ({
        url: '/api/rides/estimate-price/',
        method: 'POST',
        body,
      }),
    }),
    getNearbyDrivers: builder.mutation<
      NearbyDriverResponse,
      {
        pickup_latitude: number;
        pickup_longitude: number;
        ride_category_id?: number;
        country_code?: string;
      }
    >({
      query: (body) => ({
        url: '/api/rides/nearby-drivers/',
        method: 'POST',
        body,
      }),
    }),
    requestRide: builder.mutation<Ride, RideRequestPayload>({
      query: (body) => ({
        url: '/api/rides/request/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rides'],
    }),
  }),
});

export const {
  useGetRideCategoriesQuery,
  useEstimateRidePriceMutation,
  useGetNearbyDriversMutation,
  useRequestRideMutation,
} = ridesApi;
