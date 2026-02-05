export type RootStackParamList = {
  MainTabs: undefined;
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
  ServiceDetail: { serviceId: number };
  Properties: undefined;
  PropertyDetail: { propertyId: number };
};
