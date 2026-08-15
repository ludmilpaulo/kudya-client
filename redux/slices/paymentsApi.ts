import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseAPI } from '../../services/types';
import type {
  PaymentConfiguration,
  PaymentInitializeResponse,
  PaymentTransaction,
} from '../../types/payments';

type RootStateWithAuth = {
  auth: { token: string | null };
};

export type CreatePaymentRequest = {
  amount: number | string;
  currency?: string;
  country?: string;
  email?: string;
  service_type?: string;
  object_id?: number;
  method?: string;
  phone?: string;
  bank_account_id?: number;
};

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootStateWithAuth).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['PaymentMethods', 'Payment'],
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentConfiguration, void>({
      query: () => '/api/payments/methods/',
      providesTags: ['PaymentMethods'],
    }),
    createPayment: builder.mutation<PaymentInitializeResponse, CreatePaymentRequest>({
      query: (body) => ({
        url: '/api/payments/initialize/',
        method: 'POST',
        body,
      }),
    }),
    verifyPayment: builder.mutation<PaymentTransaction, { reference?: string; kudya_reference?: string }>({
      query: (body) => ({
        url: '/api/payments/verify/',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetPaymentMethodsQuery, useCreatePaymentMutation, useVerifyPaymentMutation } = paymentsApi;
