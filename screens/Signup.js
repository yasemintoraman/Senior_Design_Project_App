import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database, storage } from "../config/firebase"; // Firebase Storage eklenmeli
const backImage = require("../assets/backImage.png");
import { addDoc, collection } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage işlemleri için gerekli importlar

export default function Signup({ navigation }) {
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageData, setImageData] = useState({
    assets: [
      {
        uri: "",
      },
    ],
  });

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Cool Photo App Camera Permission",
            message: "Cool Photo App needs access to your camera so you can take awesome pictures.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can use the camera");
          openGallery(); // Kameraya erişim izni verildiğinde galeriyi aç
        } else {
          console.log("Camera permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === "ios") {
      // iOS'ta kamera izni zaten galeri için isteniyor, burada ayrıca bir işlem yapmaya gerek yok
      openGallery(); // iOS'ta da galeriyi aç
    }
  };

  const openGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!res.cancelled) {
        setImageData(res);
      }
    } catch (error) {
      console.error("Galeri açılırken bir hata oluştu:", error);
    }
  };
  const onHandleSignup = async () => {
    try {
      let imageUrl = "";
  
      if (imageData.assets[0].uri) {
        const uri = imageData.assets[0].uri;
        const fileName = "file_" + Date.now();
        const storageRef = ref(storage, fileName);
  
        const response = await fetch(uri);
        const blob = await response.blob();
  
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
        console.log("Dosya URL'si:", imageUrl);
        setImageUrl(imageUrl);
      }
  
      if (email !== "" && password !== "") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        await addDoc(collection(database, "users"), {
          uid: user.uid,
          userName: userName,
          name: name,
          surname: surname,
          email: email,
          imageUrl: imageUrl,
        });
        
        console.log("Signup success");
      } else {
        Alert.alert("Error", "Email and password fields cannot be empty");
      }
    } catch (err) {
      Alert.alert("Signup error", err.message);
      console.error("Signup error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Sign Up</Text>
        <View style={{alignItems: "center", marginTop: -12, marginBottom:15}}>
        <View style={styles.avatar}>
          {imageData.assets[0].uri === "" ? (
            <TouchableOpacity onPress={requestCameraPermission}>
              <Image source={require("../assets/camera.png")} style={styles.camera} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.avatar} onPress={requestCameraPermission}>
              <Image source={{ uri: imageData.assets[0].uri }} style={styles.avatar} />
            </TouchableOpacity>
          )}
        </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          autoCapitalize="characters"
          keyboardType="default"
          textContentType="userName"
          autoFocus={true}
          value={userName}
          onChangeText={(text) => setUserName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          autoCapitalize="characters"
          keyboardType="ascii-capable"
          textContentType="name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Surname"
          autoCapitalize="characters"
          keyboardType="ascii-capable"
          textContentType="surname"
          value={surname}
          onChangeText={(text) => setSurname(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>Sign Up</Text>
        </TouchableOpacity>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 14 }}> Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "orange",
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  camera: {
    width: 50,
    height: 50,
  },
  backImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    resizeMode: "cover",
  },
  bannerView: {
    width: "90%",
    height: 200,
    borderWidth: 0.5,
    alignSelf: "center",
    marginTop: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  whiteSheet: {
    width: "100%",
    height: "75%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: "#f57c00",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 17,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "orange",
    marginHorizontal: 200,
  },
});
