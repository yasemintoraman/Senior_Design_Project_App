import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform,
  Alert, 
  ActivityIndicator
} from "react-native";
import {Picker} from '@react-native-picker/picker';

import React, { useState } from "react";
import CustomTextInput from "../components/CustomTextInput";

import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { storage, useCategoriesListener } from "../config/firebase";

import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

import { addProduct } from "../config/firebase";

import RNPickerSelect from 'react-native-picker-select';

import UserPostDetailScreen from "./UserPostDetailScreen";
import { useNavigation } from '@react-navigation/native';
const AddProducts = ({ navigation }) => {
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const[productCategory, setProductCategory] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = useCategoriesListener();

  const [loading, setLoading] = useState(false);

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

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
        aspect: [1, 1],
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
      setLoading(true);
      let imageUrl = "";

      if (imageData.assets[0].uri) {
        //console.error("Dosya seçilmedi.");
        const uri = imageData.assets[0].uri;
        const fileName = "file_" + Date.now(); // Zaman damgası kullanma: Dosyanın yüklendiği zamanı içeren bir zaman damgası kullanabilirsiniz. Bu, dosyaların sıralanmasına ve tanımlanmasına yardımcı olabilir.
        const storageRef = ref(storage, fileName);
  
        const response = await fetch(uri);
        const blob = await response.blob();
  
        await uploadBytes(storageRef, blob);
  
        // Dosyanın URL'sini alın
        imageUrl = await getDownloadURL(storageRef);
        console.log("Dosya URL'si:", imageUrl);

        setImageUrl(imageUrl);
      }

      await addProduct(
        productCategory,
        productName,
        productDesc,
        productPrice,
        imageUrl,
      );

      resetForm();

      Alert.alert(
        "Success",
        "Product added successfully",
        [
          {
            text: "OK",
          },
        ],
        { cancelable: false }
      );

    } catch (error) {
      console.error("Ürün kaydedilirken bir hata oluştu:", error);
     } finally{
      setLoading(false);
     }
  };
  const pickerItems = categories.map(category => ({
    label: category.categoryName,
    value: category.categoryName,
  }));

  const resetForm = () => {
    setProductName('');
    setProductDesc('');
    setProductPrice('');
    setImageUrl('');
    setProductCategory('');
      setImageData({
    assets: [{ uri: "" }],
  });
  };


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
    <View style={styles.pickerContainer}>
      <RNPickerSelect
        style={pickerSelectStyles}
        onValueChange={setProductCategory}
        items={pickerItems}
        placeholder={{ label: "Select a category", value: "" }}
        value={productCategory}
        />
    </View>

    <TouchableOpacity
        style={styles.button}
        onPress={() => {
          saveProduct();
        }}
      >
        {loading ? (
          <ActivityIndicator size="large" style={styles.loadingContainer}/>
        ) : (
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
            Add Product
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AddProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 0,
    backgroundColor :"#fdf5ed",
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
    height: 48,
    width: 250,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12
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
  pickerContainer: {
    width: 300,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    marginTop: 20,
    alignItems:"center",
    justifyContent: "center",
    textAlign: "center"
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
const pickerSelectStyles = {
  inputIOS: {
    fontSize: 14,
    height: 40,
    width: 300,
    marginTop: 5,
    //borderWidth: 1,
    //borderColor: 'gray',
    //borderRadius: 10,
    color: 'black',
    paddingVertical: 12,
    paddingHorizontal: 10,
    textAlign: "center",
    //paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 14,
    height: 40,
    width: 300,
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    //borderWidth: 1,
    //borderColor: 'gray',
    //borderRadius: 10,
    color: 'black',
    //paddingRight: 30,
    textAlign: "center"
  },
};