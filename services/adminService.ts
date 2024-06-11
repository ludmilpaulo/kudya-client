import axios from 'axios';
import { baseAPI } from './types';
import { User } from './adminTypes';



const API_URL = baseAPI;



const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API,
});

export const fetchAboutUs = async () => {
  const response = await api.get(`${baseAPI}/info/aboutus/`);
  return response.data;
};

export const createAboutUs = async (data: any) => {
  const response = await api.post(`${baseAPI}/info/aboutus/`, data);
  return response.data;
};

export const updateAboutUs = async (id: number, data: any) => {
  const response = await api.put(`${baseAPI}/info/aboutus/${id}/`, data);
  return response.data;
};

export const deleteAboutUs = async (id: number) => {
  const response = await api.delete(`${baseAPI}/info/aboutus/${id}/`);
  return response.data;
};

export const fetchWhyChooseUs = async () => {
  const response = await api.get(`${baseAPI}/info/whychooseus/`);
  return response.data;
};

export const createWhyChooseUs = async (data: any) => {
  const response = await api.post('${baseAPI}/info/whychooseus/', data);
  return response.data;
};

export const updateWhyChooseUs = async (id: number, data: any) => {
  const response = await api.put(`${baseAPI}/info/whychooseus/${id}/`, data);
  return response.data;
};

export const deleteWhyChooseUs = async (id: number) => {
  const response = await api.delete(`${baseAPI}/info/whychooseus/${id}/`);
  return response.data;
};

export const fetchTeams = async () => {
  const response = await api.get(`${baseAPI}/info/teams/`);
  return response.data;
};

export const createTeam = async (data: any) => {
  const response = await api.post('${baseAPI}/info/teams/', data);
  return response.data;
};

export const updateTeam = async (id: number, data: any) => {
  const response = await api.put(`${baseAPI}/info/teams/${id}/`, data);
  return response.data;
};

export const deleteTeam = async (id: number) => {
  const response = await api.delete(`${baseAPI}/info/teams/${id}/`);
  return response.data;
};

export const fetchContacts = async () => {
  const response = await api.get('/contacts/');
  return response.data;
};

export const createContact = async (data: any) => {
  const response = await api.post('${baseAPI}/info/contacts/', data);
  return response.data;
};

export const updateContact = async (id: number, data: any) => {
  const response = await api.put(`${baseAPI}/info/contacts/${id}/`, data);
  return response.data;
};

export const deleteContact = async (id: number) => {
  const response = await api.delete(`${baseAPI}/info/contacts/${id}/`);
  return response.data;
};


export const checkAdmin = async (user_id: string) => {
    const response = await api.get(`/users/${user_id}/`);
    return response.data.is_admin;
  };

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await axios.get(`${API_URL}/${id}/`);
  return response.data;
};

export const createUser = async (user: User): Promise<User> => {
  const response = await axios.post(API_URL, user);
  return response.data;
};

export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await axios.put(`${API_URL}/${id}/`, user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}/`);
};




export const fetchResources = async (resource: string) => {
  const response = await api.get(`/${resource}/`);
  return response.data;
};

export const createResource = async (resource: string, data: any) => {
  const response = await api.post(`/${resource}/`, data);
  return response.data;
};

export const updateResource = async (resource: string, id: number, data: any) => {
  const response = await api.put(`/${resource}/${id}/`, data);
  return response.data;
};

export const deleteResource = async (resource: string, id: number) => {
  const response = await api.delete(`/${resource}/${id}/`);
  return response.data;
};
