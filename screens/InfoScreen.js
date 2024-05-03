import { React, useLayoutEffect, useState, useEffect } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useDispatch, useSelector } from 'react-redux';

import IconButton from '../components/IconButton';
import { addFavorite, removeFavorite } from '../store/redux/favorites';
import { listProductDetailById } from "../config/firebase";


const InfoScreen = ({ route, navigation }) => {
  const favoriteProductIds = useSelector((state) => state.favoriteProducts.ids);
  const dispatch = useDispatch();

  const productId = route.params.productId;
  console.log(productId);

  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productDetails = await listProductDetailById(productId);
        setSelectedProduct(productDetails[0]);
      } catch (error) {
        console.error('Ürün detaylarını getirirken hata oluştu:', error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const productIsFavorite = favoriteProductIds.includes(productId);

  function changeFavoriteStatusHandler() {
    if (productIsFavorite) {
      dispatch(removeFavorite({ id: productId }));
    } else {
      dispatch(addFavorite({ id: productId }));
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={productIsFavorite ? 'star' : 'star-outline'}
          color="white"
          onPress={changeFavoriteStatusHandler}
        />
      ),
    });
  }, [navigation, changeFavoriteStatusHandler]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.imageSection}>
          {selectedProduct && (
            <Image
              source={{ uri: selectedProduct.imageUrl }}
              resizeMode="contain"
              style={styles.productImage}
            />
          )}
        </View>

        <View style={styles.headSection}>
          <View style={styles.topTextArea}>
            <Text style={styles.makemodelText}>
              {selectedProduct && selectedProduct.title}
            </Text>
            <Text style={styles.price}>
              <Text style={styles.amount}>${selectedProduct && selectedProduct.price}</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.descriptionText}>{selectedProduct && selectedProduct.description}</Text>
        <Text style={styles.propertiesText}>Properties</Text>

        <TouchableOpacity style={styles.rentButton}>
          <Text style={styles.rentButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    paddingRight: 35,
    paddingLeft: 35,
  },
  headerSection: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuIconStyle: {
    width: 25,
  },
  HeaderText: {
    fontSize: 20,
    marginLeft: 5,
    fontWeight: "500",
  },
  faceIconStyle: {
    width: 30,
  },

  imageSection: {
    width: "100%",
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 300,
    height: 300,
  },

  headSection: {},
  topTextArea: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  makemodelText: {
    fontSize: 20,
    fontWeight: "500",
  },
  price: {
    fontWeight: "400",
  },
  amount: {
    fontWeight: "bold",
  },
  typetranText: {
    marginTop: 1,
    color: "#696969",
    fontWeight: "600",
    fontSize: 12,
  },
  descriptionText: {
    marginTop: 30,
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 18,
    color: "#696969",
    fontWeight: "500",
  },
  propertiesText: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: "500",
  },
  propertiesArea: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  level: {
    marginRight: 30,
  },
  propertyText: {
    fontSize: 12,
    color: "#696969",
  },
  valueText: {
    fontSize: 12,
    color: "black",
  },
  rentButton: {
    marginTop: 50,
    height: 40,
    // padding: 10,
    alignSelf: "center",
    width: 250,
    backgroundColor: "black",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rentButtonText: {
    color: "white",
    fontWeight: "500",
  },
});
