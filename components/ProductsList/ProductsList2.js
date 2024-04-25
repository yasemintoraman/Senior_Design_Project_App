import { View, FlatList, StyleSheet } from 'react-native';

import ProductItem2 from './ProductItem2';
import { useProductsListener } from '../../config/firebase';
import ProductItem3 from './ProductItem3';

function ProductsList2({items}) {

  const products = useProductsListener();

  function renderProductItem(itemData) {
    const item = itemData.item;

    const productItemProps = {
      id: item.id,
      title: item.title,
      price: item.price,
    };
    return <ProductItem3 {...productItemProps} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
      />
    </View>
  );
}

export default ProductsList2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
});