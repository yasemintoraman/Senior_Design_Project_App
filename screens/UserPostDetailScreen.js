import { React, useLayoutEffect, useState, useEffect } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";

import IconButton from "../components/IconButton";
import {
  addFavorite,
  removeFavorite,
  setFavorites,
} from "../store/redux/favorites";
import {
  listProductDetailById,
  addFavoriteToFirestore,
  removeFavoriteFromFirestore,
  chatsRef,
  useUserEmail,
  auth,
  database,
  useUserPosts,
} from "../config/firebase";

import { useNavigation } from "@react-navigation/native";

import {
  onSnapshot,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  collection,
} from "firebase/firestore";
import Ionic from "react-native-vector-icons/Ionicons";

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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {selectedProduct && selectedProduct.imageUrl && (
            <View style={styles.imageSection}>
              <Image
                source={{ uri: selectedProduct.imageUrl }}
                style={styles.productImage}
              />
              <Text style={styles.dateText}>
                {selectedProduct && selectedProduct.createdAt}
              </Text>
            </View>
          )}
          <View>
            <View style={styles.headSection}>
              <View style={styles.topTextArea}>
                <Text style={styles.title}>
                  {selectedProduct && selectedProduct.title}
                </Text>
                <Text style={styles.price}>
                  <Text style={styles.amount}>
                    ${selectedProduct && selectedProduct.price}
                  </Text>
                </Text>
              </View>
              {selectedProduct && selectedProduct.location && (
                <View style={styles.locationContainer}>
                  <Ionic name="location" size={18} color="#f57c00" />
                  <Text style={styles.locationText}>
                    {selectedProduct.location}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.descriptionText}>
              {selectedProduct && selectedProduct.description}
            </Text>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                style={styles.button}
                onPress={deletePostHandler}
              >
                <Text
                  style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}
                >
                  Delete Post
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserPostDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fdf5ed",
  },
  price: {
    fontWeight: "600",
    fontSize: 17,
  },
  container: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
  },
  dateText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "500",
  },
  headerSection: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  HeaderText: {
    fontSize: 15,
    marginLeft: 5,
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  addedByContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  locationText: {
    fontSize: 16,
    color: "black",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 35,
  },
  imageSection: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  productImage: {
    width: 300,
    height: 300,
    aspectRatio: 1,
  },

  headSection: {
    marginTop: 30,
  },
  topTextArea: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    color: "black",
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
  addedByText: {
    marginTop: 5,
    marginLeft: 5,
    fontSize: 16,
    color: "black",
    justifyContent: "center",
    //fontWeight: "500",
  },
  propertyText: {
    fontSize: 18,
    color: "black",
    marginTop: 5,
  },
  valueText: {
    fontSize: 12,
    color: "black",
  },
  descriptionText: {
    marginTop: 15,
    fontSize: 15,
    letterSpacing: 0.5,
    color: "#696969",
    fontWeight: "500",
    marginLeft: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: "#f57c00",
    height: 48,
    width: 250,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    width: "100%",
    height: "45%",
    position: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
});
