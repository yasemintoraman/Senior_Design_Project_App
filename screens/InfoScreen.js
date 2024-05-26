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
  usersRef,
  auth,
} from "../config/firebase";

import { useNavigation } from "@react-navigation/native";

import { onSnapshot, addDoc, query, where, getDocs, doc, getDoc} from "firebase/firestore";
import Ionic from "react-native-vector-icons/Ionicons";

const InfoScreen = ({ route, navigation }) => {
  const favoriteProductIds = useSelector((state) => state.favoriteProducts.ids);
  const dispatch = useDispatch();

  const productId = route.params.productId;

  const [selectedProduct, setSelectedProduct] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userDetails, setUserDetails] = useState({ name: "", surname: "" });

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

  //console.log(selectedProduct.addedBy);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userEmail) {
        try {
          console.log("Fetching details for email:", userEmail); // Log email

          const userDocRef = query(usersRef, where("email", "==", userEmail));
          const querySnapshot = await getDocs(userDocRef);

          querySnapshot.forEach((doc) => {
            if (doc.exists()) {
              console.log("User data:", doc.data()); // Log user data
              setUserDetails(doc.data());
            } else {
              console.log("No such document!");
            }
          });
        } catch (error) {
          console.error("Kullanıcı bilgilerini getirirken hata oluştu:", error);
        }
      }
    };

    fetchUserDetails();
  }, [userEmail]);


  const productIsFavorite = favoriteProductIds.includes(productId);

  function changeFavoriteStatusHandler() {
    if (productIsFavorite) {
      dispatch(removeFavorite({ id: productId }));
      removeFavoriteFromFirestore(currentUserEmail, productId);
    } else {
      dispatch(addFavorite({ id: productId }));
      addFavoriteToFirestore(currentUserEmail, productId);
    }
  }

  async function pressHandler() {
    if (!currentUserEmail || !userEmail) return;

    if (currentUserEmail === userEmail) {
      console.error(
        "Hata: Giriş yaptığınız e-posta ile alıcı e-posta aynı olamaz."
      ); //bunu window haline getir!
      return;
    }

    try {
      // Kullanıcıları sıralayarak sorguyu oluştur
      const sortedUsers = [currentUserEmail, userEmail].sort().join(",");
      const chatQuery = query(
        chatsRef,
        where("users", "array-contains-any", [currentUserEmail, userEmail])
      );
      const chatSnapshot = await getDocs(chatQuery);

      let chatId = null;

      chatSnapshot.forEach((doc) => {
        const chatData = doc.data();
        const chatUsers = chatData.users;
        if (
          chatUsers.length === 2 &&
          chatUsers.includes(currentUserEmail) &&
          chatUsers.includes(userEmail)
        ) {
          // Tüm üyeler bu iki kullanıcıysa, chatId'yi güncelle ve döngüyü sonlandır
          chatId = doc.id;
          return;
        }
      });

      if (chatId) {
        // Mevcut bir sohbet bulundu, Chat ekranını aç
        navigation.navigate("Chat", { chatId });
      } else {
        // Mevcut bir sohbet yoksa yeni bir sohbet oluştur
        const response = await addDoc(chatsRef, {
          users: [currentUserEmail, userEmail], // Diziyi kullanıcıların e-postalarıyla oluştur
        });
        navigation.navigate("Chat", { chatId: response.id });
      }
    } catch (error) {
      console.error("Sohbet işlemi sırasında bir hata oluştu:", error);
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={productIsFavorite ? "star" : "star-outline"}
          color="white"
          onPress={changeFavoriteStatusHandler}
        />
      ),
    });
  }, [navigation, changeFavoriteStatusHandler]);

  console.log(selectedProduct.createdAt);

  //let dateAdded = new Date(parsedFileContents.selectedProduct.createdAt[i].DateAdded + "T00:00:00");
  //console.log(dateAdded);

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
                          <Text style={styles.addedByText}>
              {userDetails.name} {userDetails.surname} & {selectedProduct.addedBy}
            </Text>
            <Text style={styles.dateText}>
              {selectedProduct && selectedProduct.createdAt}
            </Text>
              {/** 
              <View style={styles.addedByContainer}>
              <Ionic name="person-outline" size={18}  />
            <Text style={styles.addedByText}>
              {userDetails.name} {userDetails.surname} & {selectedProduct.addedBy}
            </Text>
            </View>*/}
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
                  <Text style={styles.locationText}>{selectedProduct.location}</Text>
                </View>
              )}
            </View>

            <Text style={styles.descriptionText}>
              {selectedProduct && selectedProduct.description}
            </Text>

            <View style={{ alignItems: "center" }}>
              <TouchableOpacity style={styles.button} onPress={pressHandler}>
                <Text
                  style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}
                >
                  Send Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InfoScreen;

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
    marginTop: 22
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
    justifyContent:"center",
    //fontWeight: "500",
  },
  propertyText: {
    fontSize: 18,
    color: "black",
    marginTop: 5
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
    marginRight: 10
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
