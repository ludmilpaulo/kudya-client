import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistReducer, persistStore } from 'redux-persist'

// ✅ Your slice imports
import authReducer from './slices/authSlice'
import basketReducer from './slices/basketSlice'
import storesReducer from './slices/storesSlice'
import productsReducer from './slices/productsSlice'
import storeTypeReducer from './slices/storeTypeSlice'

// ✅ Combine full reducer
const rootReducer = combineReducers({
  auth: authReducer,
  basket: basketReducer,
  storeTypes: storeTypeReducer,
  stores: storesReducer,
  products: productsReducer,
})

// ✅ Persist config
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'basket'], // only persist what’s needed
}

const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

// ✅ Store config
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

// ✅ Types and Hooks
export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
