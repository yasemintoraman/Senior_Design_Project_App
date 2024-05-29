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
  Alert, Platform
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
      })
      .catch((err) => Alert.alert("Logout error", err.message));
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const tabClicked = (index) => {
    setActiveIndex(index);
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
            <Avatar.Image source={{ uri: currentUserImage || "https://firebasestorage.googleapis.com/v0/b/seniorapp-d5b91.appspot.com/o/no-profile-picture.jpeg?alt=media&token=1b141542-8883-4dcf-b5b7-aef231d0fd3a"}} size={80} />
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
              size={26}
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
              size={29
              }
              style={{ color: activeIndex === 1 ? "black" : "gray" }}
            />
          </TouchableOpacity>
        </View>

        {activeIndex === 1 && (
          <ScrollView>
            {userPosts.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => pressHandler(item.id)}>
                <View
                  style={styles.productItem}>
                  <Text style={styles.title}>{item.title}</Text>
                  <View style={styles.details}>
                  <Text style={styles.detailItem}>Price: {item.price}</Text></View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

      {activeIndex === 0 && (
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
      )}
      </View>
    </View>
  );
};

export default UserProfileScreen;
const styles = StyleSheet.create({
  productItem: {
    margin: 5,
    marginTop:10,
    borderRadius: 8,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    backgroundColor: "#e2eae3",
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
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  detailItem: {
    marginHorizontal: 4,
    fontSize: 12,
  },
});