import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { GroceryProduct } from '../../groceries/types';
import ProductTile from './ProductTile';

export default function ProductGrid({ products, currency }: { products: GroceryProduct[]; currency?: string }) {
  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <ProductTile key={product.id} product={product} width="48.5%" currency={currency} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
});
