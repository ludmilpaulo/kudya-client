import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseAPI } from '../../services/types';
import type {
  NearbyDriverResponse,
  Ride,
  RideCategory,
  RideChatMessage,
  RidePriceEstimate,
  RideRequestPayload,
  RideSearchStatus,
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
        stops?: Array<{ latitude: number; longitude: number }>;
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
    getRideSearchStatus: builder.query<
      { ride: Ride; search: RideSearchStatus },
      number
    >({
      query: (rideId) => `/api/rides/${rideId}/search-status/`,
    }),
    acceptDriverCounterOffer: builder.mutation<Ride, number>({
      query: (rideId) => ({
        url: `/api/rides/${rideId}/accept-counter/`,
        method: 'POST',
        body: {},
      }),
      invalidatesTags: ['Rides'],
    }),
    rejectDriverCounterOffer: builder.mutation<Ride, number>({
      query: (rideId) => ({
        url: `/api/rides/${rideId}/reject-counter/`,
        method: 'POST',
        body: {},
      }),
      invalidatesTags: ['Rides'],
    }),
    getRideChat: builder.query<RideChatMessage[], number>({
      query: (rideId) => `/api/client/rides/${rideId}/chat/`,
      providesTags: (_result, _err, rideId) => [{ type: 'Rides', id: `chat-${rideId}` }],
    }),
    sendRideChatMessage: builder.mutation<RideChatMessage, { rideId: number; message: string }>({
      query: ({ rideId, message }) => ({
        url: `/api/client/rides/${rideId}/chat/`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (_result, _err, { rideId }) => [{ type: 'Rides', id: `chat-${rideId}` }],
    }),
    cancelRide: builder.mutation<Ride, { rideId: number; reason?: string }>({
      query: ({ rideId, reason }) => ({
        url: `/api/rides/${rideId}/cancel/`,
        method: 'POST',
        body: { reason: reason ?? '' },
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
  useGetRideSearchStatusQuery,
  useAcceptDriverCounterOfferMutation,
  useRejectDriverCounterOfferMutation,
  useGetRideChatQuery,
  useSendRideChatMessageMutation,
  useCancelRideMutation,
} = ridesApi;
