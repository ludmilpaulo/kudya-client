import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const apiUrl = "https://www.sunshinedeliver.com";

export const fetchData = async (endpoint: string) => {
  try {
    const response = await axios.get(apiUrl + endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const googleAPi = "AIzaSyDn1X_BlFj-57ydasP6uZK_X_WTERNJb78";
