export type RootStackParamList = {
  MainTabs: undefined; // <--- ADD THIS LINE
  Home: undefined;
  Stores: { storeTypeId: number };
  Products: { storeId: number; storeName: string };
  Cart: undefined;
  Checkout: undefined;
  ProductDetails: { productId: number };
  Categories: undefined;
  ProductsByCategory: { categoryId: number; categoryName: string };
  UserLogin: undefined;
  SignupScreen: undefined;
  ForgotPassword: undefined;
};
