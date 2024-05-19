import {
  View,
  Pressable,
  Text,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import ProductDetails from "../ProductDetails";

function ProductItem2({ id, title, imageUrl, price }) {
  const navigation = useNavigation();

  function selectProductItemHandler() {
    navigation.navigate("ProductDetail", {
      productId: id,
    });
  }

  return (
    <View style={styles.productItem}>
      <Pressable
        android_ripple={{ color: "#ccc" }}
        style={({ pressed }) => (pressed ? styles.buttonPressed : null)}
        onPress={selectProductItemHandler}
      >
        <View style={styles.innerContainer}>
          {imageUrl ? (
          <View>
              <Image source={{ uri: imageUrl }} style={styles.image} />
            <Text style={styles.title}>{title}</Text>
          </View>
          ) : (
            <View>
                          <Text style={styles.title}>{title}</Text>
            </View>)}

          <ProductDetails price={price} />
        </View>
      </Pressable>
    </View>
  );
}

export default ProductItem2;

const styles = StyleSheet.create({
  productItem: {
    margin: 8,
    borderRadius: 8,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    backgroundColor: "white",
    elevation: 4,
    shadowColor: "black",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  innerContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
    margin: 4,
  },
});
