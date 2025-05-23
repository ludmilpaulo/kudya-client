import API from './api'; // Your axios instance or fetch wrapper
import { Product } from './types';

// Type for a wishlist item
export interface WishlistItem {
  id: number; // Wishlist row id
  product: Product;
  added_at: string;
}

export async function getWishlist(userId: number): Promise<WishlistItem[]> {
  try {
    const resp = await API.get(`/restaurant/wishlist/?user_id=${userId}`);
    return resp.data;
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    return [];
  }
}

export async function addToWishlist(userId: number, productId: number): Promise<boolean> {
  try {
    await API.post(`/restaurant/wishlist/`, {
      user: userId,
      product: productId,
    });
    return true;
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
    return false;
  }
}

export async function removeFromWishlist(userId: number, productId: number): Promise<boolean> {
  try {
    // Option 1: If you use a DELETE with user+product as query params
    await API.delete(`/restaurant/wishlist/`, {
      params: { user_id: userId, product_id: productId },
    });
    // Option 2: If you use /wishlist/:id/
    // await API.delete(`/wishlist/${wishlistId}/`);
    return true;
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
    return false;
  }
}

// (Optional) Get wishlist count for badge
export async function fetchWishlistCount(userId: number): Promise<number> {
  try {
    const resp = await API.get(`/restaurant/wishlist/count/?user_id=${userId}`);
    return resp.data.count ?? 0;
  } catch (error) {
    console.error('Failed to fetch wishlist count:', error);
    return 0;
  }
}
