/**
 * Typed client for the commerce (food + grocery) customer API.
 * Every screen in screens/food, screens/grocery, screens/orders and screens/account
 * talks to the backend through these functions.
 */
import API from '../../services/api';
import { baseAPI } from '../../services/types';

export type Vertical = 'food' | 'groceries';

const v1 = (path: string) => `${baseAPI}/api/v1${path}`;

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

/* ------------------------------------------------------------------ stores */

export type Cuisine = { id: number; name: string; slug: string; image?: string | null; store_count?: number };

export type StoreSummary = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  logo?: string | null;
  banner?: string | null;
  rating: number | null;
  rating_count: number;
  delivery_time_min: number | null;
  delivery_time_max: number | null;
  price_level?: number | null;
  cuisine?: { id: number; name: string; slug: string } | null;
  delivery_fee?: string | null;
  is_open?: boolean;
  promo_text?: string;
  vertical?: Vertical;
  minimum_order_amount?: string | null;
  opening_hours?: Array<{ day: number | string; from_hour: string; to_hour: string; is_closed: boolean }>;
  description?: string;
  currency?: string | null;
  accepting_orders?: boolean;
  supports_pickup?: boolean;
  distance_km?: number | null;
};

export type StoreOrdering = 'rating' | '-rating' | 'delivery_time' | 'price_level' | 'name' | '-created' | 'distance';

export type StoreFilters = {
  search?: string;
  cuisine?: string;
  min_rating?: number;
  max_delivery_min?: number;
  price_level?: number[];
  open_now?: boolean;
  has_promotion?: boolean;
  pickup?: boolean;
  /** Sent together; the server annotates `distance_km` and allows `ordering=distance`. */
  lat?: number;
  lng?: number;
  ordering?: StoreOrdering;
};

export function storeFilterParams(filters: StoreFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filters.search) params.search = filters.search;
  if (filters.cuisine) params.cuisine = filters.cuisine;
  if (filters.min_rating) params.min_rating = filters.min_rating;
  if (filters.max_delivery_min) params.max_delivery_min = filters.max_delivery_min;
  if (filters.price_level?.length) params.price_level = filters.price_level.join(',');
  if (filters.open_now) params.open_now = 'true';
  if (filters.has_promotion) params.has_promotion = 'true';
  if (filters.pickup) params.pickup = 'true';
  const hasLocation = typeof filters.lat === 'number' && typeof filters.lng === 'number';
  if (hasLocation) {
    params.lat = Number((filters.lat as number).toFixed(6));
    params.lng = Number((filters.lng as number).toFixed(6));
  }
  if (filters.ordering && (filters.ordering !== 'distance' || hasLocation)) params.ordering = filters.ordering;
  return params;
}

export async function fetchStores(vertical: Vertical, filters: StoreFilters = {}): Promise<StoreSummary[]> {
  const { data } = await API.get(v1(`/${vertical}/stores/`), { params: storeFilterParams(filters) });
  return unwrap<StoreSummary>(data);
}

export async function fetchStore(vertical: Vertical, storeId: number): Promise<StoreSummary> {
  const { data } = await API.get<StoreSummary>(v1(`/${vertical}/stores/${storeId}/`));
  return data;
}

export async function fetchCuisines(): Promise<Cuisine[]> {
  const { data } = await API.get(v1('/food/cuisines/'));
  return unwrap<Cuisine>(data);
}

export type StoreReview = {
  id: number;
  rating: number;
  comment: string;
  tags: string[];
  customer_name: string;
  created_at: string;
};

export async function fetchStoreReviews(vertical: Vertical, storeId: number): Promise<StoreReview[]> {
  const { data } = await API.get(v1(`/${vertical}/stores/${storeId}/reviews/`));
  return unwrap<StoreReview>(data);
}

export type StoreDeal = {
  id: number;
  title: string;
  description?: string;
  discount_type: string;
  discount_value: string | number;
  product?: { id: number; name: string; image?: string | null; price?: string | number } | null;
  end_date?: string | null;
};

export async function fetchStoreDeals(vertical: Vertical, storeId: number): Promise<StoreDeal[]> {
  const { data } = await API.get(v1(`/${vertical}/stores/${storeId}/deals/`));
  return unwrap<StoreDeal>(data);
}

/* ---------------------------------------------------------------- products */

export type ProductAddon = { id: number; name: string; price: string };
export type ProductAddonGroup = {
  id: number;
  name: string;
  required: boolean;
  min_select: number;
  max_select: number;
  addons: ProductAddon[];
};

export type CatalogProduct = {
  id: number;
  name: string;
  description?: string;
  short_description?: string;
  price: string | number;
  original_price?: string | number;
  price_with_markup?: string | number;
  on_sale?: boolean;
  discount_percentage?: number;
  image?: string | null;
  image_url?: string | null;
  images?: Array<string | { image?: string; url?: string }>;
  category?: { id: number; name: string; slug?: string } | string | null;
  store?: number;
  store_id?: number;
  store_name?: string;
  selling_unit?: string;
  stock?: number;
  is_purchasable?: boolean;
  sizes?: Array<{ id?: number; name?: string; size?: string; price?: string | number } | string>;
  addon_groups?: ProductAddonGroup[];
  is_featured?: boolean;
  currency?: string | null;
};

export async function fetchStoreProducts(vertical: Vertical, storeId: number, search?: string): Promise<CatalogProduct[]> {
  const params: Record<string, string | number> = { store: storeId };
  if (search) params.search = search;
  const { data } = await API.get(v1(`/${vertical}/products/`), { params });
  return unwrap<CatalogProduct>(data);
}

export async function fetchProduct(vertical: Vertical, productId: number): Promise<CatalogProduct> {
  const { data } = await API.get<CatalogProduct>(v1(`/${vertical}/products/${productId}/`));
  return data;
}

/* --------------------------------------------------------------- addresses */

export type SavedAddress = {
  id: number;
  label: string;
  address: string;
  latitude: string | number | null;
  longitude: string | number | null;
  instructions: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AddressInput = {
  label: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  instructions?: string;
  is_default?: boolean;
};

export async function fetchAddresses(): Promise<SavedAddress[]> {
  const { data } = await API.get(v1('/customers/addresses/'));
  return unwrap<SavedAddress>(data);
}

export async function createAddress(input: AddressInput): Promise<SavedAddress> {
  const { data } = await API.post<SavedAddress>(v1('/customers/addresses/'), input);
  return data;
}

export async function updateAddress(id: number, input: Partial<AddressInput>): Promise<SavedAddress> {
  const { data } = await API.patch<SavedAddress>(v1(`/customers/addresses/${id}/`), input);
  return data;
}

export async function deleteAddress(id: number): Promise<void> {
  await API.delete(v1(`/customers/addresses/${id}/`));
}

export async function setDefaultAddress(id: number): Promise<SavedAddress> {
  const { data } = await API.post<SavedAddress>(v1(`/customers/addresses/${id}/set-default/`));
  return data;
}

/* ----------------------------------------------------------------- coupons */

export type AvailableCoupon = {
  code: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string;
  min_order: string | null;
  expires_at: string | null;
  store_id: number | null;
  store_name: string | null;
  eligible: boolean;
  reason: string | null;
};

export async function fetchAvailableCoupons(vertical?: Vertical, subtotal?: string): Promise<AvailableCoupon[]> {
  const path = vertical ? `/${vertical}/coupons/available/` : '/marketplace/coupons/available/';
  const { data } = await API.get(v1(path), { params: subtotal ? { subtotal } : undefined });
  return unwrap<AvailableCoupon>(data);
}

/* ---------------------------------------------------------- delivery slots */

export type DeliverySlotOption = {
  id: number | null;
  start: string;
  end: string;
  available: boolean;
  remaining: number;
};

export type DeliverySlotDay = { date: string; label: string; slots: DeliverySlotOption[] };

export type DeliverySlotsResponse = {
  store_id: number;
  asap: { available: boolean; eta_minutes: number };
  days: DeliverySlotDay[];
};

export async function fetchDeliverySlots(storeId: number, days = 7): Promise<DeliverySlotsResponse> {
  const { data } = await API.get<DeliverySlotsResponse>(v1(`/groceries/stores/${storeId}/slots/`), { params: { days } });
  return data;
}

/* ------------------------------------------------------------------ orders */

export type OrderStatusKey =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'picking'
  | 'packed'
  | 'ready'
  | 'courier_assigned'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type FulfilmentType = 'delivery' | 'pickup';

export type OrderStep = { key: string; label: string; state: 'done' | 'active' | 'pending'; at: string | null };

export type OrderListItem = {
  id: number;
  number: string;
  store: { id: number; name: string; logo: string | null; vertical: Vertical | null };
  status: OrderStatusKey;
  status_label: string;
  status_code: number;
  grocery_status: string;
  total: string;
  currency: string;
  item_count: number;
  items_preview: string[];
  fulfilment_type?: FulfilmentType;
  created_at: string;
  can_reorder: boolean;
  can_rate: boolean;
  rated: boolean;
};

export type OrderLine = {
  id: number;
  product_id: number | null;
  name: string;
  image: string | null;
  quantity: string;
  selling_unit: string;
  unit_price: string;
  subtotal: string;
  addons: Array<{ id?: number | null; name: string; price: string }>;
  special_instructions?: string;
  substitution_preference: string;
  substitution_status: string;
  substituted_product_name: string | null;
};

export type OrderDriver = { name: string; phone: string | null; avatar: string | null; vehicle?: string | null };

export type OrderDetail = OrderListItem & {
  lines: OrderLine[];
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  payment_method: string;
  payment_status: string;
  /** Only true after server-side payment verification; never infer it from the client. */
  is_paid?: boolean;
  address: string;
  location: string | null;
  delivery_notes: string;
  delivery_slot: { start: string; end: string } | null;
  secret_pin: string | null;
  driver: OrderDriver | null;
  driver_location: { latitude: number; longitude: number } | null;
  timeline: Array<{ status: string; label: string; at: string }>;
  steps: OrderStep[];
  receipt_url: string | null;
  rating: { store_rating: number; driver_rating: number | null; comment: string; tags: string[] } | null;
  refund: { id: number; status: string; amount: string; reason: string } | null;
  chat_enabled: boolean;
  eta_minutes: number | null;
  can_cancel?: boolean;
  cancellation_reason?: string | null;
  prep_estimate_minutes?: number | null;
};

export type OrderListResponse = { count: number; next: string | null; previous: string | null; results: OrderListItem[] };

export async function fetchOrders(
  params: { status?: 'active' | 'completed' | 'cancelled'; vertical?: Vertical; page?: number } = {},
): Promise<OrderListResponse> {
  const { data } = await API.get(v1('/orders/'), { params });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data as OrderListItem[] };
  return data as OrderListResponse;
}

export async function fetchOrder(orderId: number): Promise<OrderDetail> {
  const { data } = await API.get<OrderDetail>(v1(`/orders/${orderId}/`));
  return data;
}

export type ReorderLine = {
  product_id: number;
  name: string;
  price: string;
  image: string | null;
  store: number;
  store_name: string;
  vertical: Vertical | null;
  quantity: number;
  selling_unit: string;
  addons?: Array<{ id: number; name: string; price: string }>;
  special_instructions?: string;
};

/** Only allowed while the restaurant has not accepted the order (`can_cancel`). Returns the updated order. */
export async function cancelOrder(orderId: number, reason: string): Promise<OrderDetail> {
  const { data } = await API.post<OrderDetail>(v1(`/orders/${orderId}/cancel/`), { reason });
  return data;
}

export async function reorder(orderId: number): Promise<{ lines: ReorderLine[]; unavailable: Array<{ product_id: number; name: string; reason: string }> }> {
  const { data } = await API.post(v1(`/orders/${orderId}/reorder/`));
  return data;
}

export async function rateOrder(
  orderId: number,
  input: { store_rating: number; driver_rating?: number | null; tags?: string[]; comment?: string },
): Promise<void> {
  await API.post(v1(`/orders/${orderId}/rating/`), input);
}

export type RefundRequest = {
  id: number;
  order_id: number;
  order_number: string;
  store_name: string;
  amount: string;
  currency: string;
  status: string;
  reason: string;
  details?: string;
  created_at: string;
  updated_at: string;
};

export async function requestRefund(orderId: number, input: { reason: string; details?: string; amount?: string }): Promise<RefundRequest> {
  const { data } = await API.post<RefundRequest>(v1(`/orders/${orderId}/refund-request/`), input);
  return data;
}

export async function fetchRefunds(): Promise<RefundRequest[]> {
  const { data } = await API.get(v1('/refunds/'));
  return unwrap<RefundRequest>(data);
}

export type OrderChatMessage = { id: number; sender: 'customer' | 'driver' | 'store'; text: string; created_at: string };

export async function fetchOrderChat(orderId: number): Promise<OrderChatMessage[]> {
  const { data } = await API.get(v1(`/orders/${orderId}/chat/`));
  return unwrap<OrderChatMessage>(data);
}

export async function sendOrderChat(orderId: number, text: string): Promise<OrderChatMessage> {
  const { data } = await API.post<OrderChatMessage>(v1(`/orders/${orderId}/chat/`), { text });
  return data;
}

/** ws(s)://host/ws/orders/<id>/?token=<jwt> — events: order.status, chat.message, driver.location */
export function orderSocketUrl(orderId: number, token: string): string {
  const http = baseAPI.replace(/\/$/, '');
  const ws = http.startsWith('https') ? http.replace(/^https/, 'wss') : http.replace(/^http/, 'ws');
  return `${ws}/ws/orders/${orderId}/?token=${encodeURIComponent(token)}`;
}

/* ------------------------------------------------------------- phone OTP */

export async function sendPhoneOtp(phone: string): Promise<{ sent: boolean; expires_in: number; resend_in: number; debug_code?: string }> {
  const { data } = await API.post(`${baseAPI}/api/auth/phone/send-otp/`, { phone });
  return data;
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<{ verified: boolean; phone: string }> {
  const { data } = await API.post(`${baseAPI}/api/auth/phone/verify-otp/`, { phone, code });
  return data;
}

/* ------------------------------------------------------------ onboarding */

export type OnboardingSlide = {
  id: number;
  vertical: 'app' | Vertical;
  title: string;
  body: string;
  image: string | null;
  icon: string;
  sort_order: number;
};

export async function fetchOnboarding(vertical: 'app' | Vertical, lang: string): Promise<OnboardingSlide[]> {
  const { data } = await API.get(`${baseAPI}/api/platform/onboarding/`, { params: { vertical, lang } });
  return unwrap<OnboardingSlide>(data);
}
