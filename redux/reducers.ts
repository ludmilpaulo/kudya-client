import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import basketReducer from './slices/basketSlice';
import locationSlice from './slices/locationSlice';
import driverLocationSlice from './slices/driverLocationSlice';

import storesReducer from './slices/storesSlice'
import productsReducer from './slices/productsSlice'
import storeTypeReducer from './slices/storeTypeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  basket: basketReducer,
  location: locationSlice,
  driverLocation: driverLocationSlice,
  storeTypes: storeTypeReducer,
  stores: storesReducer,
  products: productsReducer,
});

export default rootReducer;
