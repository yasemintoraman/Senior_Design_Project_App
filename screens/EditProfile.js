import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image
} from "react-native";
import {
  auth,
  database,
  useUserEmail,
  storage
} from "../config/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage işlemleri için gerekli importlar
export default function EditProfile({ navigation }) {

  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userDocId, setUserDocId] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [imageData, setImageData] = useState({
    assets: [
      {
        uri: "",
      },
    ],
  });

  useEffect(() => {
    const fetchUserData = async () => {
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
          //const userProfile = querySnapshot.docs[0].data();
          const userDoc = querySnapshot.docs[0];
          const userProfile = userDoc.data();
          setUserDocId(userDoc.id);
          setUserName(userProfile.userName);
          setName(userProfile.name);
          setSurname(userProfile.surname);
          setCurrentImageUrl(userProfile.imageUrl);
          
          //setEmail(userProfile.email);
          //console.log(userProfile.email);
        } else {
          console.log("No user is signed in.");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
      throw error;
    };

    fetchUserData();
  }, []);

  const selectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Kamera rulosuna erişim izni gerekiyor!");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!res.cancelled) {
        setImageData(res);
        const uri = res.assets[0].uri;
        setCurrentImageUrl(uri);
      }
    } catch (error) {
      console.error("Error selecting image: ", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      let imageUrl = currentImageUrl;
      if (imageData.assets[0].uri) {
        const uri = imageData.assets[0].uri;
        const fileName = "file_" + Date.now();
        const storageRef = ref(storage, fileName);
  
        const response = await fetch(uri);
        const blob = await response.blob();
  
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
        console.log("Dosya URL'si:", imageUrl);
        setCurrentImageUrl(imageUrl);
      }

      if (userDocId) {
        const userDocRef = doc(database, "users", userDocId);

        await updateDoc(userDocRef, {
          userName: userName,
          name: name,
          surname: surname,
          imageUrl: imageUrl,
        });

        const user = auth.currentUser;
        // Kullanıcının kimliğini yeniden doğrulama
        //const credential = EmailAuthProvider.credential(user.email, currentPassword);
        //await reauthenticateWithCredential(user, credential);

        // Yeni şifreyi güncelleme
        await updatePassword(user, password);

        // Optionally, update the user's profile in Firebase Authentication
        await updateProfile(auth.currentUser, {
          displayName: `${name} ${surname}`,
        });

        Alert.alert(
          "Success",
          "User profile updated successfully",
          [
            {
              text: "Ok",
              onPress: () => navigation.navigate("UserProfile"),
            },
          ],
          { cancelable: false }
        );
      } else {
        throw new Error("User document ID not found");
      }

    } catch (error) {
      console.error("Error updating user profile: ", error);
      alert("Failed to update user profile");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>

                
        {/* Avatar için TouchableOpacity */}
        <TouchableOpacity onPress={selectImage}>
          <Image source={{ uri: currentImageUrl }} style={styles.avatar} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="characters"
          keyboardType="default"
          textContentType="username"
          value={userName}
          onChangeText={(text) => setUserName(text)}
        />
        <TextInput
          style={styles.input}
          autoCapitalize="characters"
          keyboardType="ascii-capable"
          value={name}
          onChangeText={(value) => setName(value)}
          editable={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Surname"
          autoCapitalize="characters"
          keyboardType="ascii-capable"
          textContentType="familyName"
          value={surname}
          onChangeText={(text) => setSurname(text)}
        />
        {/** 
        <TextInput
          style={styles.input}
          placeholder={email}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        */}

        <TextInput
          style={styles.input}
          placeholder="Enter New Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
            Save Changes
          </Text>
        </TouchableOpacity>
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
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
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
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});
