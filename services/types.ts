//export const baseAPI: string = "http://192.168.1.108:8000";
export const baseAPI: string = "https://kudya.pythonanywhere.com";




export type RootStackParamList = {
  HomeScreen: undefined;
  SignupScreen: undefined;
  RestaurantDashboard: undefined;
  LoginScreenUser: undefined;
  FoodDetailsPage: { meal: Meal };
  CartPage: undefined;
  RestaurantMenu: { restaurant_id: number; restaurant_logo: string };
  CheckoutPage: { restaurantId: number };
};


export type Meal = {
  id: number;
  image_url: string;
  name: string;
  short_description: string;
  price: number;
  quantity: number;
  category: string;
  restaurant: number;
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

export interface Restaurant {
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


export type Category = {
  id: number;
  name: string;
  image: string | null;
};


  export interface OpeningHourType {
    id?: number;
    restaurant: number;
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
  
  export type RestaurantType = {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category?: CategoryType;
    barnner: boolean;
    is_approved: boolean;
    opening_hours: OpeningHourType[];
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


export interface Product {
  id: number
  name: string
  price: number
  stock: number
  store: number
  category: number
  image_urls: string[]
  description: string
}

