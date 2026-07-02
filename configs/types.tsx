export interface store {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
  category?: {
    id: number;
    name: string;
    image: string;
  };
  is_approved: boolean;
  barnner: boolean;
}



export interface DriverSummary {
  id?: number;
  name?: string;
  phone?: string;
  avatar?: string | null;
}

export interface Meals {
  foods: unknown;
  food: unknown;
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
  store: {
    id: number;
    name: string;
    phone: string;
    address: string;
  };
  driver: DriverSummary | null;
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
  store: store;
  driver: DriverSummary | null;
  order_details: OrderDetail[];
  total: number;
  status: string;
  address: string;
}


// interfaces.ts

export interface ForgotPasswordRequest {
  email: string;
}


export interface Simplestore {
  id: number;
  name: string;
  phone: number;
  address: string;
}

