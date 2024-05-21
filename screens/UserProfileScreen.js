import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import { Avatar } from "react-native-paper";
import { auth, useUserPosts } from "../config/firebase";
import Ionic from "react-native-vector-icons/Ionicons";
const width = Dimensions.get("window").width;
import ProductItem2 from "../components/ProductsList/ProductItem2";
import { signOut } from "firebase/auth";

import ProductsList from "../components/ProductsList/ProductsList";

import ProductDetails from "../components/ProductDetails";
import { useNavigation, useRoute } from "@react-navigation/native";

import Login from "./Login";

const UserProfileScreen = ({navigation}) => {

  const onHandleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Logout success");
        navigation.navigate("BackToLogin");
      })
      .catch((err) => Alert.alert("Logout error", err.message));
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const tabClicked = (index) => {
    setActiveIndex(index);
  };
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const userPosts = useUserPosts(currentUserEmail);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserEmail(user?.email ?? ""); // Eğer kullanıcı oturum açık değilse null dönecek
    });
    return unsubscribe; // useEffect içinde fonksiyon dönerek, component kaldırıldığında dinleyiciyi kaldırıyoruz
  }, []);

  if (currentUserEmail === "") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  function renderProductItem(itemData) {
    const item = itemData.item;

    const productItemProps = {
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      price: item.price,
    };
    return <ProductItem2 {...productItemProps} />;
  }

  function pressHandler(productId) {
    navigation.navigate("UserProductDetail", {
      productId: productId,
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Avatar.Text label={currentUserEmail[0].toUpperCase()} size={100} />
          </View>
        </View>
      </View>
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <Text>100</Text>
            <Text>Post</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text>Post</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={onHandleLogout}>
              <Text
                style={{ color: "#f57c00", fontWeight: "600", fontSize: 14 }}
              >
                {" "}
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            borderTopWidth: 1,
            borderTopColor: "#ccc",
            paddingVertical: 10,
          }}
        >
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() => tabClicked(0)}
            activeOpacity={0.7}
          >
            <Ionic
              name="apps-sharp"
              size={30}
              style={{ color: activeIndex === 0 ? "black" : "gray" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() => tabClicked(1)}
            activeOpacity={0.7}
          >
            <Ionic
              name="list-sharp"
              size={30}
              style={{ color: activeIndex === 1 ? "black" : "gray" }}
            />
          </TouchableOpacity>
        </View>

        {activeIndex === 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {userPosts.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => pressHandler(item.id)}
              >
                <View
                  style={{
                    width: width / 3,
                    height: width / 3,
                    marginBottom: 2,
                    marginTop: 2,
                    // marginRight: 2,
                  }}
                >
                  <Image
                    style={{
                      flex: 1,
                      alignSelf: "stretch",
                      width: undefined,
                      height: undefined,
                      borderRadius: 12,
                    }}
                    source={{ uri: item.imageUrl }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeIndex === 1 && ( //burasi düzenlenecek!! 21.05.24 (14:22)
          <FlatList
            data={userPosts}
            numColumns={3}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  margin: 3,
                }}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: "100%", height: "100%", borderRadius: 12 }}
                />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default UserProfileScreen;
const styles = StyleSheet.create({
  rentButton: {
    marginTop: 30,
    height: 40,
    alignSelf: "center",
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
