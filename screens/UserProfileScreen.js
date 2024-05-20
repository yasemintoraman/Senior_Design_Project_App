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

const UserProfileScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabClicked = (index) => {
    setActiveIndex(index);

  }
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

  async function pressHandler() {}

  return (
    <View>
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
            <Text>100</Text>
            <Text>Following</Text>
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
            style={styles.rentButton}
            onPress={() => tabClicked(0)}
            activeOpacity={activeIndex === 0}
          >
            <Text>
              <Ionic
                name="apps-sharp"
                size={30}
                style={[activeIndex === 0 ? {} : { color: "gray" }]}
              />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rentButton}
            activeOpacity={activeIndex === 1}
            //onPress={pressHandler}
            onPress={() => tabClicked(1)}
          >
            <Ionic
              name="list-sharp"
              size={30}
              style={[activeIndex === 1 ? {} : { color: "gray" }]}
            />
          </TouchableOpacity>
        </View>
        {activeIndex === 1 && (
            <FlatList>
                <Text>Burayı Doldur</Text>
            </FlatList>
        )}
        {activeIndex === 0 && (
          <View style={{flexDirection: "row", flexWrap: "wrap"}}>
            {userPosts.map((item) => {
                return (
                    <TouchableOpacity>
                    <View
                    key={item.email}
                    style={[{width: width / 3, height: width/3, marginBottom: 2, marginTop: 15}]}>

                        <Image  style={{flex:1, alignSelf: "stretch", width: undefined, height:undefined}}
                        source={{uri: item.imageUrl}}/>

                        </View>
                        </TouchableOpacity>
                );
            })}
          </View>
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
});
