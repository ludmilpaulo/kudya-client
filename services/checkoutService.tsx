import { baseAPI } from "./types";

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

  
  export const fetchRestaurantDetails = async (restaurantId: string) => {
    const response = await fetch(`${baseAPI}/order/restaurant/restaurants/${restaurantId}/`);
    if (response.ok) {
        const resJson = await response.json();
        return resJson;
    } else {
        throw new Error("Failed to fetch restaurant details");
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
  