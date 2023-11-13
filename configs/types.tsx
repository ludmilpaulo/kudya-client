export interface Restaurant {
  id: number;
  name: string;
  phone: number;
  address: string;
  logo: string;
  category?: {
    name: string;
    image: string;
  };
}

export interface Meals {
  foods: any;
  food: any;
  resImage: string;
  resName: string;
  resId: number;
  category: string;
  id: number;
  image: string;
  name: string;
  price: number;
  quantity: number;
  short_description: string;
}


export interface UserOrder {
  id: number;
  customer: {
    id: number;
    name: string;
    avatar: string | null;
    phone: string;
    address: string;
  };
  restaurant: {
    id: number;
    name: string;
    phone: string;
    address: string;
  };
  driver: any; // You might want to define a proper type for the 'driver' field
  order_details: {
    id: number;
    meal: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
    sub_total: number;
  }[];
  total: number;
  status: string;
  address: string;
}

export interface Customer {
  id: number;
  name: string;
  avatar: string | null;
  phone: string;
  address: string;
}

export interface Restaurant {
  id: number;
  name: string;
  phone: number;
  address: string;
}

export interface Meal {
  id: number;
  name: string;
  price: number;
}

export interface OrderDetail {
  id: number;
  meal: Meal;
  quantity: number;
  sub_total: number;
}

export interface Order {
  id: number;
  customer: Customer;
  restaurant: Restaurant;
  driver: any; // You might want to define a proper type for the 'driver' field
  order_details: OrderDetail[];
  total: number;
  status: string;
  address: string;
}


// interfaces.ts

export interface ForgotPasswordRequest {
  email: string;
}

