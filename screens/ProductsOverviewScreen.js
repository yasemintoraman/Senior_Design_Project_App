import { useLayoutEffect, useState, useEffect } from 'react';
import {View, ActivityIndicator, TextInput, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import { listProductsByCategory } from '../config/firebase';
import {Picker}  from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import ProductsList from '../components/ProductsList/ProductsList';
import { useCategoriesListener } from '../config/firebase';

function ProductsOverviewScreen({ route, navigation }) {
  const catName = route.params.categoryName;

  const [loading, setLoading] = useState(true);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('none');
  const [pickerVisible, setPickerVisible] = useState(false);

  const categories = useCategoriesListener();

  function pressHandler() {
    navigation.navigate("ProductDetail", { //target screen
      productId: itemData.item.productId,
    });
  }

  useEffect(() => {

    const fetchProducts = async () => {
      try {
        const productsByCategory = await listProductsByCategory(catName);
        setDisplayedProducts(productsByCategory);
        setLoading(false);
      } catch (error) {
        console.error('Ürünleri getirirken hata oluştu:', error);
      }
    };

    fetchProducts(); 
  }, [catName]);

  const category = categories.find(category => category.categoryName === catName);
  const showImage = category ? category.showImage : false;
  console.log(showImage);

  const filteredProducts = displayedProducts
  .filter(product => product.title.toLowerCase().includes(searchQuery.toLowerCase()))
  .sort((a, b) => {
    if (sortOption === 'price-asc') {
      return a.price - b.price;
    } else if (sortOption === 'price-desc') {
      return b.price - a.price;
    } else if (sortOption === 'date-newest') {
      const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
      const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
      return dateB - dateA;
    } else if (sortOption === 'date-oldest') {
      const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
      const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
      return dateA - dateB;
    }
    return 0;
  });

  {/** 
  const filteredProducts = displayedProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );*/}


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setPickerVisible(true)}>
          <Ionicons name="options" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setPickerVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Picker
              selectedValue={sortOption}
              onValueChange={(itemValue) => {
                setSortOption(itemValue);
                setPickerVisible(false); 
              }}
              style={styles.picker}
            >
              <Picker.Item label="Low to High(Price)" value="price-asc" />
              <Picker.Item label="High to Low(Price)" value="price-desc" />
              <Picker.Item label="Newest First(Date)" value="date-newest" />
              <Picker.Item label="Oldest First(Date)" value="date-oldest" />
            </Picker>
          </View>
        </View>
      </Modal>
    <ProductsList items={filteredProducts} onPress={pressHandler} />
  </View>
  )

 {/*return showImage ? (
    <ProductsList items={displayedProducts} onPress={pressHandler} />
  ) : (
    <ProductsList2 items={displayedProducts} onPress={pressHandler} />
  );*/}



  {/*}
  return catName === "Jobs" ? (
    <ProductsList items={displayedProducts} onPress = {pressHandler}/>
  ) : (
    <ProductsList2 items={displayedProducts} onPress = {pressHandler}/>
  );

  {/*return
  
  <ProductsList items={displayedProducts} onPress = {pressHandler}/>*/}
}

export default ProductsOverviewScreen;
const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  picker: {
    width: '100%',
  },
});