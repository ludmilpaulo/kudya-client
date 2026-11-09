import React from 'react';
import { View } from 'react-native';
import GroceryProductCardBase from './components/GroceryProductCard';
import type { GroceryProduct } from './types';

type Props = {
  product: GroceryProduct;
  regionCode?: string;
  width?: number;
};

/** Legacy entry point; renders the maintained grocery card (favourites via groceriesApi). */
export default function GroceryProductCard({ product, width }: Props) {
  return (
    <View style={{ width, flex: width ? undefined : 1 }}>
      <GroceryProductCardBase product={product} />
    </View>
  );
}
