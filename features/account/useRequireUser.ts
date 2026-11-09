import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../redux/store';
import { selectUser } from '../../redux/slices/authSlice';
import { useAppNavigation } from '../../navigation/hooks';

/** Current user + JWT; sends signed-out users to the login screen once. */
export function useRequireUser(options: { redirect?: boolean } = {}) {
  const { redirect = true } = options;
  const user = useAppSelector(selectUser);
  const storeToken = useAppSelector((state) => state.auth.token);
  const navigation = useAppNavigation();
  const redirected = useRef(false);

  useEffect(() => {
    if (!redirect || user || redirected.current) return;
    redirected.current = true;
    navigation.navigate('UserLogin');
  }, [navigation, redirect, user]);

  return { user, token: user?.token ?? storeToken ?? null, signedIn: !!user };
}
