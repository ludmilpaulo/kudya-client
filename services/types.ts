export const baseAPI: string =
  (typeof process !== "undefined" && (process.env?.EXPO_PUBLIC_BASE_API || process.env?.NEXT_PUBLIC_BASE_API)) ||
  "https://www.kudya.store";




export type RootStackParamList = {
  HomeScreen: undefined;
  SignupScreen: undefined;
  storeDashboard: undefined;
  LoginScreenUser: undefined;

  CartPage: undefined;
  storeMenu: { store_id: number; store_logo: string };
  CheckoutPage: { storeId: number };
};




//export type Category = string; // Define Category as a string

import { ReactNode } from "react";

export type UserDetails = {
    // customer_detais: string;
    address: string;
    avatar: string;
    id: number;
    phone: number;
  };
  
  export type FornecedorType = {
    id: number;
    user: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    licenca: string;
    aprovado: boolean;
    criado_em: string;
    modificado_em: string;
    children: ReactNode;
  };
  
  
  export interface OrderTypes {
    id: number;
    order_details: {
      id: number;
      meal: {
        name: string;
        price: number;
      };
      quantity: number;
      sub_total: number;
    }[];
    customer: {
      name: string;
    };
    driver: string | null;
    total: number;
    status: string;
  }
  

 // @/services/types.ts
 export type OpeningHour = {
  day: string;
  from_hour: string;
  to_hour: string;
  is_closed: boolean;
};

export interface store {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
  category: {
    id: number;
    name: string;
    image: string | null;
  };
  barnner: boolean;
  is_approved: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  opening_hours: {
    day: string;
    from_hour: string;
    to_hour: string;
    is_closed: boolean;
  }[];
}




  export interface OpeningHourType {
    id?: number;
    store: number;
    day: number;
    from_hour: string;
    to_hour: string;
    is_closed: boolean;
  }
  
  
  


  export type CategoryType = {
    id: number;
    name: string;
    image: string | null;
  };
  
 

  export interface AboutUsData {
    id: number;
    title: string;
    logo: string;
    back: string;
    backgroundApp: string;
    backgroundImage: string;
    bottomImage: string;
    about: string;
    born_date: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
    linkedin: string | null;
    facebook: string;
    twitter: string;
    instagram: string;
  }


  // types.ts
export interface Career {
  id: number;
  title: string;
  description: string;
}

export interface JobApplication {
  career: number;
  full_name: string;
  email: string;
  resume: File | null;
}

export interface StoreType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Store {
  id: number;
  store_type: number;
  category: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
  location?: string;
  banner?: boolean;
  is_approved?: boolean;
}


export interface ProductImage {
  id: number;
  image: string;
}

export interface Product {
  id: number;
  store_id: number;
  name: string;
  category?: string;
  description?: string;
  price: number;
  stock: number;
  on_sale: boolean;
  bulk_sale: boolean;
  discount_percentage: number;
  season?: string;
  images?: string[];
  gender?: string;
  sizes?: string[];

}


// For items in the cart:
export interface CartItem {
  id: number;            // productId
  name: string;
  price: number;
  image?: string;
  size: string;
  quantity: number;
  store: number;  
     // storeId
}

export interface WishlistItem {
  id: number;
  user: number;
  product: Product;
}

export interface Review {
  id: number;
  user: string;
  product: number;
  rating: number;
  comment: string;
  created_at: string;
  likes: number[];
  dislikes: number[];
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
}
