import { baseAPI } from "./types";
import axios from 'axios';

export const fetchUserDetails = async (userId: number, token: string) => {
  const response = await fetch(`${baseAPI}/customer/customer/profile/?user_id=${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const resJson = await response.json();
    console.log("user details=>", resJson)
    return resJson.customer_details;
  } else {
    throw new Error("Failed to fetch user details");
  }
};

  
  export const fetchstoreDetails = async (storeId: number) => {
    const response = await fetch(`${baseAPI}/order/store/stores/${storeId}/`);
    if (response.ok) {
        const resJson = await response.json();
        return resJson;
    } else {
        throw new Error("Failed to fetch store details");
    }
};

  
  export const completeOrderRequest = async (orderData: any) => {
    console.log('Sending order data:', orderData);
    const response = await fetch(`${baseAPI}/order/orders/add/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
  
    const responseData = await response.json();
    console.log('Received response data:', responseData);
    return responseData;
  };

  export const validateCouponRequest = async (couponCode: string) => {
    const response = await axios.post(`${baseAPI}/order/coupons/validate/`, { coupon_code: couponCode });
    return response.data;
  };
  
  // New function to check if the user has a coupon
  export const checkUserCoupon = async (token: string) => {
    const response = await axios.post(`${baseAPI}/order/coupons/check/`, { access_token: token });
    return response.data;
  };