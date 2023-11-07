import { AuthState } from './slices/authSlice'; // Import your specific slice state types
import { BasketState } from './slices/basketSlice';
import { LocationState } from './slices/locationSlice';
import { DriverLocationState } from './slices/driverLocationSlice';

export interface RootState {
  auth: AuthState;
  basket: BasketState;
  location: LocationState;
  driverLocation: DriverLocationState;
}
