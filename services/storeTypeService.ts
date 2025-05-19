
import API from './api'
import { StoreType } from './types'

export const fetchStoreTypes = async (): Promise<StoreType[]> => {
  const response = await API.get('/restaurant/store-types/')
  return response.data
}
