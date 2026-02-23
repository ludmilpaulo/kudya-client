// Mixpanel Analytics Configuration for React Native
const MIXPANEL_TOKEN = 'a8cf933c3054afed7f397f71249ba506';

let mixpanel: import('mixpanel-react-native').Mixpanel | null = null;
let mixpanelInitialized = false;

function isExpoGo(): boolean {
  try {
    const Constants = require('expo-constants').default;
    return (
      Constants.executionEnvironment === 'storeClient' ||
      Constants.appOwnership === 'expo'
    );
  } catch {
    return false;
  }
}

function getMixpanel(): import('mixpanel-react-native').Mixpanel | null {
  if (mixpanel !== null) return mixpanel;
  if (isExpoGo()) return null; // Skip native module in Expo Go to avoid "using JavaScript mode" warning
  try {
    const { Mixpanel } = require('mixpanel-react-native');
    mixpanel = new Mixpanel(MIXPANEL_TOKEN, true);
    return mixpanel;
  } catch (_) {
    return null;
  }
}

function ensureInit() {
  if (mixpanelInitialized) return;
  const mp = getMixpanel();
  if (!mp) return;
  try {
    mp.init();
    mixpanelInitialized = true;
  } catch (_) {
    // Native init can fail in Expo Go / simulator; avoid crashing the app
  }
}

// Analytics class for tracking events (no-op when native Mixpanel unavailable, e.g. Expo Go)
class Analytics {
  track(eventName: string, properties?: Record<string, any>) {
    ensureInit();
    const mp = getMixpanel();
    if (!mp) return;
    try {
      mp.track(eventName, properties);
    } catch (_) {}
  }

  identify(userId: string) {
    ensureInit();
    const mp = getMixpanel();
    if (!mp) return;
    try {
      mp.identify(userId);
    } catch (_) {}
  }

  setUserProperties(properties: Record<string, any>) {
    ensureInit();
    const mp = getMixpanel();
    if (!mp) return;
    try {
      mp.getPeople().set(properties);
    } catch (_) {}
  }

  // Track user signup
  trackSignup(userId: string, properties?: Record<string, any>) {
    this.identify(userId);
    this.track('User Signup', properties);
    this.setUserProperties({
      $name: properties?.name,
      $email: properties?.email,
      signup_date: new Date().toISOString(),
      user_type: 'customer',
      ...properties,
    });
  }

  // Track user login
  trackLogin(userId: string, properties?: Record<string, any>) {
    this.identify(userId);
    this.track('User Login', {
      user_type: 'customer',
      ...properties,
    });
  }

  trackLogout() {
    this.track('User Logout');
    const mp = getMixpanel();
    if (!mp) return;
    try {
      ensureInit();
      mp.reset();
    } catch (_) {}
  }

  // Track screen views
  trackScreenView(screenName: string, properties?: Record<string, any>) {
    this.track('Screen View', {
      screen: screenName,
      ...properties,
    });
  }

  // Track store view
  trackStoreView(storeId: string, storeName: string) {
    this.track('Store Viewed', {
      store_id: storeId,
      store_name: storeName,
    });
  }

  // Track product view
  trackProductView(productId: string, productName: string, price: number, storeId?: string) {
    this.track('Product Viewed', {
      product_id: productId,
      product_name: productName,
      price,
      store_id: storeId,
    });
  }

  // Track add to cart
  trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    this.track('Product Added to Cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      total: price * quantity,
    });
  }

  // Track remove from cart
  trackRemoveFromCart(productId: string, productName: string) {
    this.track('Product Removed from Cart', {
      product_id: productId,
      product_name: productName,
    });
  }

  // Track checkout started
  trackCheckoutStarted(cartValue: number, itemCount: number) {
    this.track('Checkout Started', {
      cart_value: cartValue,
      item_count: itemCount,
    });
  }

  // Track order placed
  trackOrderPlaced(orderId: string, orderValue: number, items: any[]) {
    this.track('Order Placed', {
      order_id: orderId,
      order_value: orderValue,
      item_count: items.length,
    });
  }

  // Track order tracking
  trackOrderTracking(orderId: string, status: string) {
    this.track('Order Tracked', {
      order_id: orderId,
      order_status: status,
    });
  }

  // Track search
  trackSearch(query: string, resultsCount: number) {
    this.track('Search', {
      query,
      results_count: resultsCount,
    });
  }

  // Track category selection
  trackCategorySelected(categoryId: string, categoryName: string) {
    this.track('Category Selected', {
      category_id: categoryId,
      category_name: categoryName,
    });
  }

  // Track service view
  trackServiceView(serviceId: string, serviceName: string, price: number) {
    this.track('Service Viewed', {
      service_id: serviceId,
      service_name: serviceName,
      price,
    });
  }

  // Track service booking
  trackServiceBooking(serviceId: string, serviceName: string, price: number) {
    this.track('Service Booked', {
      service_id: serviceId,
      service_name: serviceName,
      price,
    });
  }

  // Track wishlist action
  trackWishlistAdd(productId: string, productName: string) {
    this.track('Product Added to Wishlist', {
      product_id: productId,
      product_name: productName,
    });
  }

  trackWishlistRemove(productId: string, productName: string) {
    this.track('Product Removed from Wishlist', {
      product_id: productId,
      product_name: productName,
    });
  }

  // Track review submission
  trackReviewSubmitted(productId: string, rating: number) {
    this.track('Review Submitted', {
      product_id: productId,
      rating,
    });
  }

  // Track location update
  trackLocationUpdate(latitude: number, longitude: number) {
    this.track('Location Updated', {
      latitude,
      longitude,
    });
  }

  // Track error
  trackError(error: string, errorDetails?: any) {
    this.track('Error Occurred', {
      error_message: error,
      error_details: errorDetails,
    });
  }

  setSuperProperties(properties: Record<string, any>) {
    ensureInit();
    const mp = getMixpanel();
    if (!mp) return;
    try {
      mp.registerSuperProperties(properties);
    } catch (_) {}
  }

  timeEvent(eventName: string) {
    ensureInit();
    const mp = getMixpanel();
    if (!mp) return;
    try {
      mp.timeEvent(eventName);
    } catch (_) {}
  }
}

// Export singleton instance
export const analytics = new Analytics();

