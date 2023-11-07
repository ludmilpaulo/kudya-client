import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import basketReducer from './slices/basketSlice';
import locationSlice from './slices/locationSlice';
import driverLocationSlice from './slices/driverLocationSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  basket: basketReducer,
  location: locationSlice,
  driverLocation: driverLocationSlice,
});

export default rootReducer;
