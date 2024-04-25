import { View, FlatList, StyleSheet } from 'react-native';

import ProductItem2 from './ProductItem2';

import { useProductsListener } from '../../config/firebase';


function ProductsList3() {
 
  const products = useProductsListener();

  function renderProductItem(itemData) {
    const item = itemData.item;


    const productItemProps = {
      categoryName: item.categoryName,
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      price: item.price,
    };
    return <ProductItem2 {...productItemProps} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
      />
    </View>
  );
}

export default ProductsList3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});