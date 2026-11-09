import { useEffect, useState } from 'react';
import { useAppSelector } from '../../redux/store';
import { selectUser } from '../../redux/slices/authSlice';
import { useAddGroceryFavouriteMutation, useRemoveGroceryFavouriteMutation } from '../../redux/api/groceriesApi';
import { useAppNavigation } from '../../navigation/hooks';
import { errorMessage, toast } from '../../utils/notify';

/** Optimistic favourite heart; guests are sent to login. */
export function useFavouriteToggle(productId: number | null, initial: boolean, failedLabel: string) {
  const navigation = useAppNavigation();
  const user = useAppSelector(selectUser);
  const [addFavourite, addState] = useAddGroceryFavouriteMutation();
  const [removeFavourite, removeState] = useRemoveGroceryFavouriteMutation();
  const [favourite, setFavourite] = useState(initial);

  useEffect(() => setFavourite(initial), [initial]);

  const toggle = async () => {
    if (!productId) return;
    if (!user) {
      navigation.navigate('UserLogin');
      return;
    }
    const next = !favourite;
    setFavourite(next);
    try {
      if (next) await addFavourite(productId).unwrap();
      else await removeFavourite(productId).unwrap();
    } catch (error) {
      setFavourite(!next);
      toast('error', failedLabel, errorMessage(error, '') || undefined);
    }
  };

  return { favourite, toggle, busy: addState.isLoading || removeState.isLoading };
}
