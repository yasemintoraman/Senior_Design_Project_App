import { useLayoutEffect, useState, useEffect } from 'react';
import {View, ActivityIndicator} from 'react-native';
import { listProductsByCategory } from '../config/firebase';

import ProductsList from '../components/ProductsList/ProductsList';
import { useCategoriesListener } from '../config/firebase';
import ProductsList2 from '../components/ProductsList/ProductsList2';

function ProductsOverviewScreen2({ route, navigation }) {
  const catName = route.params.categoryName;

  const [loading, setLoading] = useState(true);
  const [displayedProducts, setDisplayedProducts] = useState([]);


  const categories = useCategoriesListener();

  function pressHandler() {
    navigation.navigate("ProductDetail", { //target screen
      productId: itemData.item.productId,
    });
  }

  useEffect(() => {
    // Belirli bir kategoriye ait ürünleri Firestore'dan çekiyoruz
    const fetchProducts = async () => {
      try {
        const productsByCategory = await listProductsByCategory(catName);
        setDisplayedProducts(productsByCategory);
        setLoading(false);
      } catch (error) {
        console.error('Ürünleri getirirken hata oluştu:', error);
      }
    };

    fetchProducts(); // fetchProducts fonksiyonunu çağırarak ürünleri çekiyoruz
  }, [catName]);

  const category = categories.find(category => category.categoryName === catName);
  const showImage = category ? category.showImage : false;
  console.log(showImage);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return showImage ? (
    <ProductsList items={displayedProducts} onPress={pressHandler} />
  ) : (
    <ProductsList2 items={displayedProducts} onPress={pressHandler} />
  );

  {/*}
  return catName === "Jobs" ? (
    <ProductsList items={displayedProducts} onPress = {pressHandler}/>
  ) : (
    <ProductsList2 items={displayedProducts} onPress = {pressHandler}/>
  );

  {/*return
  
  <ProductsList items={displayedProducts} onPress = {pressHandler}/>*/}
}

export default ProductsOverviewScreen2;
