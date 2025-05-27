
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseAPI } from '../../services/types';

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${baseAPI}` }),
  endpoints: (builder) => ({
    createPayment: builder.mutation<{ payment_url: string }, { email: string; amount: number; country: string; currency: string }>({
      query: (body) => ({
        url: 'payments/',
        method: 'POST',
        body,
      }),
    }),
    // You can add more payment endpoints here
  }),
});

export const { useCreatePaymentMutation } = paymentsApi;
