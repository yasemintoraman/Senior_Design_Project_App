import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { listProductsByCategory } from '../config/firebase'; // Firebase bağlantılarını ve işlemlerini içeren dosyadan gerekli fonksiyonları import ediyoruz
import ProductsList2 from '../components/ProductsList/ProductsList2';
import ProductsList from '../components/ProductsList/ProductsList';
import InfoScreen from './InfoScreen';

function ProductsOverviewScreen3({ route, navigation }) {
  
  const catName= route.params.categoryName;
  const [loading, setLoading] = useState(true);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState('Ürünler');

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

  useEffect(() => {
    // Firestore'dan kategori başlığını çekiyoruz
    const getCategoryTitle = async () => {
      try {
        // Firestore'dan kategori başlığını çekmek için gerekli işlemleri yapın
        // Örnek olarak, categoryTitle'ı Firestore'dan çekilen verilere göre ayarlayın
        setCategoryTitle('Firestore ile gelen kategori basligi');
      } catch (error) {
        console.error('Kategori basligini getirirken hata olustu:', error);
      }
    };

    getCategoryTitle(); // getCategoryTitle fonksiyonunu çağırarak kategori başlığını çekiyoruz
  }, []); // useEffect sadece bir kere çalışması gerektiği için boş bağımlılık dizisi kullanıyoruz

  // Ürünler yüklenene kadar yüklenme animasyonunu göster
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#black" />
      </View>
    );
  }
  return catName === "Community" ? (
    <ProductsList items={displayedProducts} />
  ) : (
    <ProductsList2 items={displayedProducts} />
  );
}

export default ProductsOverviewScreen3;
