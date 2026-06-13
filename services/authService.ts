import { baseAPI } from "./types";
import { normalizeAuthResponse, AuthSessionPayload } from "./authTypes";

import axios, { isAxiosError } from 'axios';
const API_URL = baseAPI;

type SignupRole = "client" | "store";

type SignupFile = {
  uri: string;
  type?: string;
  name?: string;
};

type SignupPayload = {
  username: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
  logo?: SignupFile | null;
  store_license?: SignupFile | null;
  business_category?: string;
};

// services/authService.ts

export const loginUserService = async (
  username: string,
  password: string,
): Promise<AuthSessionPayload> => {
  const response = await fetch(`${baseAPI}/api/auth/login/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || "Erro desconhecido.");
  }

  return normalizeAuthResponse(data);
};

export const refreshAccessToken = async (
  refresh: string,
): Promise<{ access: string; refresh?: string; token: string }> => {
  const response = await fetch(`${baseAPI}/api/auth/refresh/`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Sessão expirada.");
  }
  const access = String(data.access || data.token || "");
  return { access, refresh: data.refresh, token: access };
};

export const signup = async (role: SignupRole, signupData: SignupPayload) => {
  const url = role === "client" ? `${baseAPI}/customer/signup/` : `${baseAPI}/store/fornecedor/`;

  let body: FormData | string | null = null;

  if (role === "client") {
    body = JSON.stringify({
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      password2: signupData.password,
    });
  } else if (role === "store") {
    const formData = new FormData();
    if (signupData.username) formData.append("username", signupData.username);
    if (signupData.email) formData.append("email", signupData.email);
    if (signupData.password) formData.append("password", signupData.password);
    if (signupData.name) formData.append("name", signupData.name);
    if (signupData.phone) formData.append("phone", signupData.phone);
    if (signupData.address) formData.append("address", signupData.address);
    if (signupData.business_category) formData.append("business_category", signupData.business_category);

    if (signupData.logo?.uri) {
      formData.append("logo", {
        uri: signupData.logo.uri,
        type: signupData.logo.type || "image/jpeg",
        name: signupData.logo.name || "logo.jpg",
      } as unknown as Blob);
    }
    if (signupData.store_license?.uri) {
      formData.append("store_license", {
        uri: signupData.store_license.uri,
        type: signupData.store_license.type || "application/octet-stream",
        name: signupData.store_license.name || "license.dat",
      } as unknown as Blob);
    }

    body = formData;
  }

  const headers = role === "client"
    ? {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    : undefined; // For form data, no need for specific headers

  const res = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body as BodyInit, // Type assertion to satisfy TypeScript
  });

  const data = await res.json();
  return { status: res.status, data };
};


export const resetPassword = async (uid: string, token: string, newPassword: string) => {
  try {
    const response = await axios.post(`${baseAPI}/conta/reset-password-confirm/`, { uid, token, newPassword });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw error.response?.data;
    }
    throw error;
  }
};

export const getCurrentUser = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw error.response?.data;
    }
    throw error;
  }
};


export const updateUserDetails = async (token: string, data: FormData) => {
  const response = await fetch(`${baseAPI}/customer/customer/profile/update/`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
    },
    body: data
  });
  return response;
};
