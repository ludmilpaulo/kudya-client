// Mixpanel Analytics Configuration for React Native
import { Mixpanel } from 'mixpanel-react-native';

// Initialize Mixpanel with your token
const MIXPANEL_TOKEN = 'a8cf933c3054afed7f397f71249ba506';

// Create Mixpanel instance
const mixpanel = new Mixpanel(MIXPANEL_TOKEN, true); // true enables automatic events

// Initialize Mixpanel
mixpanel.init();

// Analytics class for tracking events
class Analytics {
  private mixpanelInstance: Mixpanel;

  constructor() {
    this.mixpanelInstance = mixpanel;
  }

  // Track events
  track(eventName: string, properties?: Record<string, any>) {
    this.mixpanelInstance.track(eventName, properties);
  }

  // Identify user
  identify(userId: string) {
    this.mixpanelInstance.identify(userId);
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    this.mixpanelInstance.getPeople().set(properties);
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

  // Track user logout
  trackLogout() {
    this.track('User Logout');
    this.mixpanelInstance.reset();
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

  // Set super properties (sent with every event)
  setSuperProperties(properties: Record<string, any>) {
    this.mixpanelInstance.registerSuperProperties(properties);
  }

  // Time an event
  timeEvent(eventName: string) {
    this.mixpanelInstance.timeEvent(eventName);
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export mixpanel instance for direct access if needed
export { mixpanel };

