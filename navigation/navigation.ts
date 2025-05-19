// types/navigation.ts
// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Stores: { storeTypeId: number };
  Products: { storeId: number; storeName: string };
  Cart: undefined;
  Checkout: undefined;
};
