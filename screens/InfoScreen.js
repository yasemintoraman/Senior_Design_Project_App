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
import { listProductDetailById, addFavoriteToFirestore, removeFavoriteFromFirestore, chatsRef, useUserEmail, auth } from "../config/firebase";

import { useNavigation } from "@react-navigation/native";

import { onSnapshot, addDoc, query, where, getDocs } from "firebase/firestore";

const InfoScreen = ({ route, navigation }) => {

  const favoriteProductIds = useSelector((state) => state.favoriteProducts.ids);
  const dispatch = useDispatch();

  const productId = route.params.productId;

  const [selectedProduct, setSelectedProduct] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

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
      console.error("Hata: Giriş yaptığınız e-posta ile alıcı e-posta aynı olamaz."); //bunu window haline getir!
      return;
    }
  
    try {
      // Kullanıcıları sıralayarak sorguyu oluştur
      const sortedUsers = [currentUserEmail, userEmail].sort().join(',');
      const chatQuery = query(
        chatsRef,
        where("users", "array-contains-any", [currentUserEmail, userEmail])
      );
      const chatSnapshot = await getDocs(chatQuery);
  
      let chatId = null;
  
      chatSnapshot.forEach(doc => {
        const chatData = doc.data();
        const chatUsers = chatData.users;
        if (chatUsers.length === 2 && chatUsers.includes(currentUserEmail) && chatUsers.includes(userEmail)) {
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

        <TouchableOpacity style={styles.rentButton} onPress={pressHandler}>
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
