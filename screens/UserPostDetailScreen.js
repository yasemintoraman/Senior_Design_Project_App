import { React, useLayoutEffect, useState, useEffect } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";

import IconButton from "../components/IconButton";
import { addFavorite, removeFavorite, setFavorites } from "../store/redux/favorites";
import { listProductDetailById, addFavoriteToFirestore, removeFavoriteFromFirestore, chatsRef, useUserEmail, auth, database, useUserPosts } from "../config/firebase";

import { useNavigation } from "@react-navigation/native";

import { onSnapshot, addDoc, query, where, getDocs, deleteDoc, doc, collection } from "firebase/firestore";

const UserPostDetailScreen = ({ route, navigation }) => {

  const favoriteProductIds = useSelector((state) => state.favoriteProducts.ids);
  const dispatch = useDispatch();

  const productId = route.params.productId;

  const [selectedProduct, setSelectedProduct] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const userPosts = useUserPosts(currentUserEmail);


  const userEmail = selectedProduct.addedBy;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productDetails = await listProductDetailById(productId);
        setSelectedProduct(productDetails[0]);
      } catch (error) {
        console.error("Ürün detaylarını getirirken hata oluştu:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  console.log(userEmail);

  // Kullanıcının oturum durumunu dinleyip, emailini alıyoruz
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserEmail(user?.email ?? ""); // Eğer kullanıcı oturum açık değilse null dönecek
    });
    return unsubscribe; // useEffect içinde fonksiyon dönerek, component kaldırıldığında dinleyiciyi kaldırıyoruz
  }, []);


  const deletePostHandler = async () => {
    try {
      await deleteDoc(doc(database, "products", productId));
      navigation.navigate("UserProfile");
    } catch (error) {
      console.error("Post silinirken hata oluştu:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      {selectedProduct && selectedProduct.imageUrl && (
        <View style={styles.imageSection}>
          <Image
            source={{ uri: selectedProduct.imageUrl }}
            resizeMode="contain"
            style={styles.productImage}
          />
        </View>
      )}

        <View style={styles.headSection}>
          <View style={styles.topTextArea}>
            <Text style={styles.makemodelText}>
              {selectedProduct && selectedProduct.title}
            </Text>
            <Text style={styles.price}>
              <Text style={styles.amount}>
                ${selectedProduct && selectedProduct.price}
              </Text>
            </Text>
          </View>
        </View>

        <Text style={styles.descriptionText}>
          {selectedProduct && selectedProduct.description}
        </Text>
        <Text style={styles.propertiesText}>Properties:{selectedProduct && selectedProduct.createdAt}</Text>

        <TouchableOpacity style={styles.rentButton} onPress={deletePostHandler}>
          <Text style={styles.rentButtonText}>Delete Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UserPostDetailScreen;

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
    height: 350,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },

  headSection: {
    marginTop: 20,
  },
  topTextArea: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  makemodelText: {
    fontSize: 20,
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
