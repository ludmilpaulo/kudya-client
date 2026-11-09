export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Stores: { storeTypeId?: number; vertical?: 'food' | 'groceries' };
  Products: { storeId: number; storeName: string; vertical?: 'food' | 'groceries' };
  Cart: { vertical?: 'food' | 'groceries' } | undefined;
  Checkout: { storeId?: number; vertical?: 'food' | 'groceries' } | undefined;
  /* Onboarding & account */
  Onboarding: { vertical?: 'app' | 'food' | 'groceries'; next?: 'FoodHome' | 'GroceryHome' | 'MainTabs' } | undefined;
  OtpVerification: { phone?: string } | undefined;
  LocationSetup: { vertical?: 'food' | 'groceries'; next?: 'FoodHome' | 'GroceryHome' | 'MainTabs' } | undefined;
  Settings: undefined;
  /* Food (purple) */
  FoodHome: undefined;
  RestaurantList: { cuisine?: string; query?: string; sort?: string } | undefined;
  RestaurantDetails: { storeId: number };
  ItemCustomise: { productId: number; storeId: number };
  /* Grocery (green) */
  GroceryHome: undefined;
  GroceryCategories: undefined;
  GroceryProductSearch: { categorySlug?: string; query?: string; storeId?: number; title?: string } | undefined;
  GroceryStoreDetails: { storeId: number };
  GroceryProductDetails: { productId: number };
  Substitutions: undefined;
  DeliverySlot: { storeId: number };
  /* Shared checkout pickers */
  Addresses: { selectMode?: boolean; vertical?: 'food' | 'groceries' } | undefined;
  Coupons: { vertical?: 'food' | 'groceries'; subtotal?: string } | undefined;
  /* Post-order */
  OrderPlaced: {
    orderIds: number[];
    vertical?: 'food' | 'groceries';
    notices?: string[];
    orders?: Array<{
      order_id: number;
      store_id: number;
      secret_pin: string | null;
      total: string;
      currency: string;
      payment_method: string;
      fulfilment_type?: 'delivery' | 'pickup';
    }>;
  };
  OrderTracking: { orderId: number; vertical?: 'food' | 'groceries' };
  LiveTracking: { orderId: number; vertical?: 'food' | 'groceries' };
  OrderChat: { orderId: number; vertical?: 'food' | 'groceries' };
  OrderDelivered: { orderId: number; vertical?: 'food' | 'groceries' };
  RateOrder: { orderId: number; vertical?: 'food' | 'groceries' };
  OrderReceipt: { orderId: number; vertical?: 'food' | 'groceries' };
  RefundsDisputes: undefined;
  RefundRequest: { orderId: number; vertical?: 'food' | 'groceries' };
  ProductDetails: { productId: number };
  Categories: undefined;
  ProductsByCategory: { categoryId: number; categoryName: string };
  UserLogin: undefined;
  SignupScreen: undefined;
  CompleteProfile: undefined;
  ForgotPassword: undefined;
  Services: undefined;
  ServiceDetail: { serviceId: number };
  Properties: undefined;
  PropertyDetail: { propertyId: number };
  PropertyApplicationWizard: { propertyId: number };
  PropertyApplications: undefined;
  PropertyApplicationDetail: { applicationId: number };
  PropertyActiveRentals: undefined;
  PropertyDocumentsVault: undefined;
  StayBookings: undefined;
  StayBookingConfirm: { bookingId: number };
  Doctors: undefined;
  DoctorDetail: {
    doctorId: number;
    openSection?: 'overview' | 'location' | 'availability' | 'reviews';
  };
  BookAppointment: { doctorId: number };
  Accommodation: undefined;
  Wallet: undefined;
  BusinessDashboard: undefined;
  ComingSoon: undefined;
  Rides: undefined;
  RideTracking: { rideId: number };
  SendPackage: undefined;
  CarRental: undefined;
  CarRentalDetail: { vehicleId: number };
  Grocery:
    | {
        categorySlug?: string;
        section?: 'home' | 'categories' | 'favourites' | 'deals' | 'popular';
      }
    | undefined;
  Food: undefined;
  Notifications: undefined;
  Wishlist: undefined;
  UserProfile: undefined;
  SuccessScreen: undefined;
  CheckoutPage: { storeId?: number } | undefined;
  Delivery: undefined;
  CartPage: undefined;
  storeMenu: { storeId?: number } | undefined;
  FoodDetailsPage: { foodId?: number } | undefined;
  OrderHistory: { vertical?: 'food' | 'groceries' } | undefined;
  HomeScreen: undefined;
  Profile: undefined;
  Activity: undefined;
  Support: undefined;
};
