import { View, Text, StyleSheet } from 'react-native';
import {useSelector} from 'react-redux';


import ProductsList from '../components/ProductsList/ProductsList';
import { useProductsListener } from '../config/firebase';

function FavoritesScreen() {
 const favoriteProductIds = useSelector(state => state.favoriteProducts.ids);


 const products = useProductsListener();

  const favoriteProducts = products.filter((product) =>
    favoriteProductIds.includes(product.id)
  );

  if (favoriteProducts.length === 0) {
    return (
      <View style={styles.rootContainer}>
        <Text style={styles.text}>You have no favorite products yet.</Text>
      </View>
    );
  }

  return <ProductsList items={favoriteProducts} />;
}

export default FavoritesScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
