
import axios from "axios";
import { baseAPI,  Category, FornecedorType, OpeningHourType, OrderTypes, Product, storeType } from "./types";

export const fetchFornecedorData = async (userId: number): Promise<FornecedorType | null> => {
    try {
      const response = await fetch(`${baseAPI}/store/get_fornecedor/?user_id=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch fornecedor data");
      }
      const data = await response.json();
      if (data.fornecedor && data.fornecedor.length > 0) {
        return data.fornecedor[0];
      }
      return null;
    } catch (error) {
      console.error("An error occurred while fetching fornecedor data:", error);
      throw error;
    }
  };

  // services/apiService.ts



export const fetchCategorias = async (): Promise<Category[]> => {
  const response = await fetch(`${baseAPI}/store/meal-categories/`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
};

export const fetchstoreCategory = async (): Promise<Category[]> => {
    const response = await fetch(`${baseAPI}/store/store-categories/`);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  };

export const fetchProducts = async (userId: number): Promise<Product[]> => {
  const response = await fetch(`${baseAPI}/store/get_products/?user_id=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
};

export const addProduct = async (formData: FormData): Promise<Product> => {
    const response = await fetch(`${baseAPI}/store/add-product/`, {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || "Failed to add product";
      throw new Error(errorMessage);
    }
  
    return response.json();
  };
  
  export const updateProduct = async (productId: number, formData: FormData): Promise<void> => {
    const response = await fetch(`${baseAPI}/store/update-product/${productId}/`, {
      method: "PUT",
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || "Failed to update product";
      throw new Error(errorMessage);
    }
  };
  

export const deleteProduct = async (productId: number, userId: number): Promise<void> => {
  const response = await fetch(`${baseAPI}/store/delete-product/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
};


export const fetchOrders = async (userId: number): Promise<OrderTypes[]> => {
    const response = await fetch(`${baseAPI}/store/store/orders/?user_id=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return response.json();
  };

  export const updateOrderStatus = async (userId: number, orderId: number): Promise<void> => {
    console.log("order status");
    const response = await fetch(`${baseAPI}/store/store/status/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, id: orderId }),
    });
    if (!response.ok) {
      throw new Error("Falha ao atualizar o status do pedido");
    }
  };
  


const API_URL = baseAPI;

export const getstore = async (userId: number): Promise<storeType> => {
    const response = await axios.get(`${API_URL}/store/stores/${userId}/`);
    return response.data;
};

export const updatestore = async (userId: number, data: FormData): Promise<storeType> => {
    const response = await axios.put(`${API_URL}/store/stores/${userId}/`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getOpeningHours = async (storeId: number): Promise<OpeningHourType[]> => {
    const response = await axios.get(`${API_URL}/store/stores/${storeId}/opening_hours/`);
    return response.data;
};

export const createOpeningHour = async (storeId: number, data: OpeningHourType): Promise<OpeningHourType> => {
    const response = await axios.post(`${API_URL}/store/stores/${storeId}/opening_hours/`, data);
    return response.data;
};