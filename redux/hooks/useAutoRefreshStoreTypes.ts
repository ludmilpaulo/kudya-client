import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../store'
import { fetchStoreTypes } from '../slices/storeTypeSlice' // ✅ FIXED

export const useAutoRefreshStoreTypes = (): void => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchStoreTypes())
    const interval = setInterval(() => {
      dispatch(fetchStoreTypes())
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [dispatch])
}
