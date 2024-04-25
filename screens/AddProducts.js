import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform,
} from "react-native";
import React, { useState } from "react";
import CustomTextInput from "../components/CustomTextInput";

import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { storage } from "../config/firebase";

import {
  ref,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import * as FileSystem from "expo-file-system";

import { addProduct } from "../config/firebase";

const AddProducts = () => {
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");

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
            message:
              "Cool Photo App needs access to your camera " +
              "so you can take awesome pictures.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can use the camera");
          openGallery();
        } else {
          console.log("Camera permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === "ios") {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === "granted") {
        console.log("Camera permission granted");
        openGallery();
      } else {
        console.log("Camera permission denied");
      }
    }
  };
  const openGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!res.didCancel) {
        setImageData(res);
      }
    } catch (error) {
      console.error("Galeri acilirken bir hata oluştu:", error);
    }
  };

  const saveProduct = async () => {
    //console.log("Dosya adı:", imageData.assets[0].fileName);
    //const reference = storage().ref(imageData.assets[0].fileName);
    try {
      if (!imageData.assets[0].uri) {
        console.error("Dosya seçilmedi.");
        return;
      }

      const uri = imageData.assets[0].uri;
      const fileName = "file_" + Date.now(); // Zaman damgası kullanma: Dosyanın yüklendiği zamanı içeren bir zaman damgası kullanabilirsiniz. Bu, dosyaların sıralanmasına ve tanımlanmasına yardımcı olabilir.
      const storageRef = ref(storage, fileName);

      const response = await fetch(uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);

      // Dosyanın URL'sini alın
      const imageUrl = await getDownloadURL(storageRef);
      console.log("Dosya URL'si:", imageUrl);

      setImageUrl(imageUrl);
      addProduct(productName, productDesc, productPrice, imageUrl);
    } catch (error) {
      console.error("Ürün kaydedilirken bir hata oluştu:", error);
    }
  };

  {
    /*   const url = await storage()
      .ref(imageData.assets[0].fileName)
      .getDownloadURL();
    console.log(url);
  } catch (error) {
    console.error("Ürün kaydedilirken bir hata oluştu:", error);
  }
  };
  */
  }

  {
    /* const pickImage = async () => {
    //No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };*/
  }

  return (
    <View style={styles.container}>
      <View style={styles.bannerView}>
        {imageData.assets[0].uri == "" ? (
          <TouchableOpacity
            onPress={() => {
              requestCameraPermission();
            }}
          >
            <Image
              source={require("../assets/camera.png")}
              style={styles.camera}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.banner}
            onPress={() => {
              requestCameraPermission();
            }}
          >
            <Image
              source={{ uri: imageData.assets[0].uri }}
              style={styles.banner}
            />
          </TouchableOpacity>
        )}
      </View>
      <CustomTextInput
        
        placeholder={"Product Name"}
        value={productName}
        onChangeText={(txt) => {
          setProductName(txt);
        }}
      />
      <CustomTextInput
        placeholder={"Product Description"}
        value={productDesc}
        onChangeText={(txt) => {
          setProductDesc(txt);
        }}
      />
      <CustomTextInput
        placeholder={"Price"}
        value={productPrice}
        type={"number-pad"}
        onChangeText={(txt) => {
          setProductPrice(txt);
        }}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          saveProduct();
        }}
      >
        <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
          {" "}
          Add Product
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  button: {
    backgroundColor: "#f57c00",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  camera: {
    width: 50,
    height: 50,
  },
  banner: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});
