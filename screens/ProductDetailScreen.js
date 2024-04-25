import { useContext, useLayoutEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import {useDispatch, useSelector} from 'react-redux';

import IconButton from '../components/IconButton';
import List from '../components/ProductDetail/List';
import Subtitle from '../components/ProductDetail/Subtitle';
import ProductDetails from '../components/ProductDetails';

import {addFavorite, removeFavorite} from '../store/redux/favorites';

function ProductDetailScreen({ route, navigation }) {
  const favoriteProductIds = useSelector((state) => state.favoriteProducts.ids);
  const dispatch = useDispatch();

  const productId = route.params.productId;

  const selectedProduct = PRODUCTS.find((product) => product.id === productId);


  const productIsFavorite = favoriteProductIds.includes(productId);

  function changeFavoriteStatusHandler() {
    if(productIsFavorite){

      dispatch(removeFavorite({ id: productId }));
    } else {

      dispatch(addFavorite({ id: productId }));
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
        <IconButton
          icon={productIsFavorite ? 'star' : 'star-outline'}
          color="white"
          onPress={changeFavoriteStatusHandler}
        />
        );
      },
    });
  }, [navigation, changeFavoriteStatusHandler]);

  return (
    <ScrollView style={styles.rootContainer}>
      <Image style={styles.image} source={{ uri: selectedProduct.imageUrl }} />
      <Text style={styles.title}>{selectedProduct.title}</Text>
      <ProductDetails
        duration={selectedProduct.duration}
        complexity={selectedProduct.complexity}
        affordability={selectedProduct.affordability}
        textStyle={styles.detailText}
      />
      <View style={styles.listOuterContainer}>
        <View style={styles.listContainer}>
          <Subtitle>Ingredients</Subtitle>
          <Text>{selectedProduct.ingredients}</Text>
          <Subtitle>Steps</Subtitle>
          <List data={selectedProduct.steps} />
        </View>
      </View>
    </ScrollView>
  );
}


export default ProductDetailScreen;

const styles = StyleSheet.create({
  rootContainer: {
    marginBottom: 32,
  },
  image: {
    width: "100%",
    height: 350,
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    margin: 8,
    textAlign: "center",
    color: "white",
  },
  detailText: {
    color: "white",
  },
  listOuterContainer: {
    alignItems: "center",
  },
  listContainer: {
    width: "80%",
  },
});
