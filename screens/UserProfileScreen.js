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
  ScrollView
} from "react-native";
import { Avatar } from "react-native-paper";
import { auth, useUserPosts } from "../config/firebase";
import Ionic from "react-native-vector-icons/Ionicons";
const width = Dimensions.get("window").width;
import ProductItem2 from "../components/ProductsList/ProductItem";
import { signOut } from "firebase/auth";

import ProductsList from "../components/ProductsList/ProductsList";

import ProductDetails from "../components/ProductDetails";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import Login from "./Login";

import EditProfile from "./EditProfile";

const UserProfileScreen = ({navigation}) => {

  const onHandleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Logout success");
      })
      .catch((err) => Alert.alert("Logout error", err.message));
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const tabClicked = (index) => {
    setActiveIndex(index);
  };
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserNameSurname, setCurrentUserNameSurname] = useState("");

  const userPosts = useUserPosts(currentUserEmail);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserEmail(user?.email ?? ""); // Eğer kullanıcı oturum açık değilse null dönecek
      setCurrentUserNameSurname(user?.displayName ?? "");
    });
    return unsubscribe; // useEffect içinde fonksiyon dönerek, component kaldırıldığında dinleyiciyi kaldırıyoruz
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setCurrentUserEmail(auth.currentUser?.email ?? "");
      setCurrentUserNameSurname(auth.currentUser?.displayName ?? "");
    }, [])
  );

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
  
  function editPressHandler() {
    navigation.navigate("EditProfile");
  }

  function pressHandler(productId) {
    navigation.navigate("UserProductDetail", {
      productId: productId,
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fdf5ed"}}>
      <View style={{ padding: 10}}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Avatar.Text label={currentUserNameSurname ? currentUserNameSurname[0].toUpperCase() : ""} size={80} style={{backgroundColor: "#E0E0E0"}} />
            <Text style={{fontSize: 20, paddingTop: 3, color: "gray"}}>{currentUserNameSurname}</Text>
          </View>
        </View>
      </View>
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-around", paddingBottom:10 }}>
          <View style={{ alignItems: "center", paddingLeft:10, }}>
            <TouchableOpacity onPress={editPressHandler}>
            <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 18, marginRight:-80 }}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={onHandleLogout}>
              <Text
                style={{ color: "#f57c00", fontWeight: "600", fontSize: 18 }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/** */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            borderTopWidth: 1,
            borderTopColor: "#ccc",
            paddingVertical: 8,
          }}
        >{/** 
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
          </TouchableOpacity>*/}
        </View>

      
          <FlatList
          data={userPosts}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => pressHandler(item.id)}
            >
              <View
                style={{
                  width: (width - 10) / 3,
                  height: (width - 10) / 3,
                  marginBottom: 2,
                  marginTop: 2,
                  paddingRight: 3,
                  marginRight: 4,
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
                  source={item.imageUrl ? { uri: item.imageUrl } : require("../assets/image_not_found.jpg")}
                />
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
        
{/** 
        {activeIndex === 1 && ( //burasi düzenlenecek!! 21.05.24 (14:22)
          <FlatList
            data={userPosts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  aspectRatio: 3 / 1,
                  marginVertical: 3,
                  padding: 3,
                  marginLeft: 3,
                  marginRight: 6
                }}
              >
                <Image
                 source={item.imageUrl ? { uri: item.imageUrl } : require("../assets/image_not_found.jpg")}
                  style={{ width: "100%", height: "100%", borderRadius: 12 }}
                />
              </View>
            )}
          />
        )}
        */}
      </View>
    </View>
  );
};

export default UserProfileScreen;

