
import axios from "axios";
import { getDeviceLanguage } from './getDeviceLanguage'

//export const baseAPI = "http://192.168.1.109:8000"
//export const baseAPI = "http://192.168.100.106:8000";
//export const baseAPI = "http://192.168.42.161:8000";
export const baseAPI = "http://0.0.0.0:8000";



const API = axios.create({
  baseURL: baseAPI,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const url =
  (config.baseURL ?? "") + (config.url ?? "");
console.log("[API] Requesting:", url);
  config.headers['Accept-Language'] = getDeviceLanguage()
  return config
})

export default API;

// Use this `api` instance to make all backend calls