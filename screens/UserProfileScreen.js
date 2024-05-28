import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert
} from "react-native";
import { Avatar } from "react-native-paper";
import { auth, getUserImageUrl, useUserPosts, getUserProfile, database } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Ionic from "react-native-vector-icons/Ionicons";
import { signOut } from "firebase/auth";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ProductItem2 from "../components/ProductsList/ProductItem";
import ProductsList from "../components/ProductsList/ProductsList";
import ProductDetails from "../components/ProductDetails";
import Login from "./Login";
import EditProfile from "./EditProfile";

const width = Dimensions.get("window").width;

const UserProfileScreen = ({ navigation }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserNameSurname, setCurrentUserNameSurname] = useState("");
  const [currentUserImage, setCurrentUserImage] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [userDocId, setUserDocId] = useState("");

  const userPosts = useUserPosts(currentUserEmail);

  const fetchUserData = useCallback(async () => {
    try {
      const uid = auth.currentUser?.uid;
      const user = auth.currentUser;

      if (!uid) {
        throw new Error("Kullanici oturumu bulunamadi.");
      }

      if (user) {
        console.log("Current user ID:", user.uid);

        const userRef = collection(database, "users");
        const q = query(userRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Kullanici bilgileri bulunamadi.");
        }

        const userDoc = querySnapshot.docs[0];
        const userProfile = userDoc.data();
        setUserDocId(userDoc.id);
        setName(userProfile.name);
        setSurname(userProfile.surname);
        setCurrentUserImage(userProfile.imageUrl);
      } else {
        console.log("No user is signed in.");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      setCurrentUserEmail(auth.currentUser?.email ?? "");
      setCurrentUserNameSurname(auth.currentUser?.displayName ?? "");
      setCurrentUserImage(auth.currentUser?.photoURL ?? "");
    }, [fetchUserData])
  );

  const onHandleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Logout success");
        navigation.navigate("Login");
      })
      .catch((err) => Alert.alert("Logout error", err.message));
  };

  if (currentUserEmail === "") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderProductItem = (itemData) => {
    const item = itemData.item;

    const productItemProps = {
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      price: item.price,
    };
    return <ProductItem2 {...productItemProps} />;
  };

  const editPressHandler = () => {
    navigation.navigate("EditProfile");
  };

  const pressHandler = (productId) => {
    navigation.navigate("UserProductDetail", {
      productId: productId,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fdf5ed" }}>
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Avatar.Image source={{ uri: currentUserImage }} size={80} />
            <Text style={{ fontSize: 20, paddingTop: 3, color: "gray" }}>{name} {surname}</Text>
          </View>
        </View>
      </View>
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-around", paddingBottom: 10 }}>
          <View style={{ alignItems: "center", paddingLeft: 10 }}>
            <TouchableOpacity onPress={editPressHandler}>
              <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 18, marginRight: -80 }}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={onHandleLogout}>
              <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 18 }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
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
      </View>
    </View>
  );
};

export default UserProfileScreen;
