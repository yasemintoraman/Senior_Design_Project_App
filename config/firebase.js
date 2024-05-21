// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, onSnapshot, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, orderBy} from "firebase/firestore";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";
import { setFavorites } from "../store/redux/favorites";


const firebaseConfig = {
  apiKey: "AIzaSyALUMbaHmGId7oy-ijuTjjD0tceIbOS0kc",
  authDomain: "sdpapp-5a06e.firebaseapp.com",
  projectId: "sdpapp-5a06e",
  storageBucket: "sdpapp-5a06e.appspot.com",
  messagingSenderId: "384968976538",
  appId: "1:384968976538:web:bd8aa00837a3fe5812d723",
  //databaseURL: Constants.manifest2.extra.databaseURL,
  databaseURL: "https://sdpapp-5a06e-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
export const storage = getStorage();

const productsRef = collection(database,"products"); //eger collection olarak okumak istiyorsak
//doc olarak okumak istersek:
//const docRef = doc(database, "products/nuz9h8KZoqQnMZ8XjhSq");
const categoriesRef = collection(database, "categories");

export const chatsRef = collection(database, "chats");

const favoritesRef = collection(database, "favorites");

export const useProductsListener = () => {
const [products, setProducts] = useState([]);

  useEffect(() => {
    return onSnapshot(productsRef, snapshot => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {id: doc.id, ...data, createdAt: data.createdAt?.toDate()}; //burada problem cikiyor
      });

      setProducts(docs);
    });

  }, []);
  return products;
};

{/* 
export const useProductDetails = (productId) => {
  const [productDetails, setProductDetails] = useState();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const q = query(collection(database, 'products'), where('id', '==', productId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            setProductDetails(doc.data());
          });
      } catch (error) {
        console.error('Ürün detaylarini getirirken hata oluştu:', error);
      }
    };

    fetchProductDetails();

    // Cleanup function
    return () => {
      // Cleanup işlemleri
    };
  }, [productId]);

  return productDetails;
};
*/}


{/* 
// Belirli bir idye ait ürünün bilgilerini listeleme fonksiyonu
export const listProductDetails = async (id) => {
  try {
    const q = query(productsRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]; // Tek bir belge bekliyoruz
      return doc.data();
    } else {
      console.error('Ürün bulunamadı.');
      return null;
    }


  } catch (error) {
    console.error("Ürünleri getirirken hata oluştu:", error);
    throw error;
  }
};
*/}

export const useUserEmail = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setEmail(user?.email ?? "");
    });
    return unsubscribe;
  }, []);

  return email;
};


export const useCategoriesListener = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(categoriesRef, snapshot => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    });

    return () => unsubscribe();
  }, []);

  return categories;
};

// Belirli bir kategoriye ait ürünleri listeleme fonksiyonu
export const listProductsByCategory = async (categoryName) => {
  try {
    const q = query(productsRef, where("categoryName", "==", categoryName));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  } catch (error) {
    console.error("Ürünleri getirirken hata oluştu:", error);
    throw error;
  }
};


export const listProductDetailById = async(productId) => {
  try {
    const q = query(productsRef, where("id", "==", productId));
    const querySnapshot = await getDocs(q);
    const productDetails = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      createdAt : doc.data().createdAt?.toDate(),
      ...doc.data(),
    }));

    return productDetails;
  } catch (error) {
    console.error("Ürünleri getirirken hata oluştu:", error);
    throw error;
  }
}

export const addFavoriteToFirestore = async (userId, productId) => {
  try {
    await setDoc(doc(database, "favorites", `${userId}_${productId}`), {
      userId,
      productId,
    });
  } catch (error) {
    console.error("Favori ürünü eklerken hata oluştu:", error);
  }
};

export const removeFavoriteFromFirestore = async (userId, productId) => {
  try {
    await deleteDoc(doc(database, "favorites", `${userId}_${productId}`));
  } catch (error) {
    console.error("Favori ürünü kaldırırken hata oluştu:", error);
  }
};

export const useLoadFavorites = (userId, dispatch) => {
  useEffect(() => {
    if (!userId) return;

    const q = query(favoritesRef, where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favorites = snapshot.docs.map((doc) => doc.data().productId);
      dispatch(setFavorites({ ids: favorites }));
    });

    return unsubscribe;
  }, [userId, dispatch]);
};

export const useUserPosts = (email) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!email) return;

    //const q = query(collection(database, "products"), where("addedBy", "==", email), orderBy("createdAt", "desc"));
    const q = query(collection(database, "products"), where("addedBy", "==", email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(userPosts);
    });

    return () => unsubscribe(); // Cleanup için unsubscribe
  }, [email]);

  return posts;
};


export const addProduct = async (categoryName,title, description, price, imageUrl = "") => {
  try {
    const uid = auth.currentUser?.uid;
    const user = auth.currentUser;
    
    if (!uid) {
      throw new Error('Kullanici oturumu bulunamadi.');
    }
    if (!user) {
      throw new Error('Kullanici oturumu bulunamadi.');
    }

        // Kullanıcı profilini Firestore'dan al
        const userRef = collection(database, "users");
        const q = query(userRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('Kullanıcı bilgileri bulunamadı.');
        }
    
        const userProfile = querySnapshot.docs[0].data();

    const productsRef = collection(database, 'products');
    const docRef = await addDoc(productsRef, {
      //addedBy: userProfile.userName,
      addedBy : user.email,
      categoryName: categoryName,
      description: description,
      imageUrl: imageUrl,
      price: price,
      title: title,
      uid: uid,
      //createdAt: new Date(), bunu eklersem yukaridaki useProductListener'da hata aliyorum. düzeltmem lazim
    });
    await updateDoc(doc(productsRef, docRef.id), {id: docRef.id});
   // await updateDoc(doc(productsRef, docRef.id));
    console.log('Ürün basariyla Firestore\'a kaydedildi.');
  } catch (error) {
    console.error('Firestore\'a ürün kaydedilirken hata olustu:', error);
    throw error;
  }
}