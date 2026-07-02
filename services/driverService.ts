import { baseAPI } from "./types";

import type { Order } from "../configs/types";

export type LatestOrderResponse = { orders: Order[] };

export const fetchLatestOrder = async (accessToken: string): Promise<LatestOrderResponse> => {
  const response = await fetch(`${baseAPI}/customer/customer/order/latest/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: accessToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch the latest order');
  }

  return await response.json();
};

export const fetchDriverLocation = async (accessToken: string) => {
  const response = await fetch(`${baseAPI}/customer/customer/driver/location/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: accessToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch driver location');
  }

  return await response.json();
};
