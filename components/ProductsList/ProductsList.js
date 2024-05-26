import { View, FlatList, StyleSheet } from 'react-native';

import ProductItem from './ProductItem';
import { useProductsListener } from '../../config/firebase';

function ProductsList({items}) {

  const products = useProductsListener();

  function renderProductItem(itemData) {
    const item = itemData.item;

    const productItemProps = {
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      price: item.price,
    };
    return <ProductItem {...productItemProps} />;
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

export default ProductsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fdf5ed"
  },
});