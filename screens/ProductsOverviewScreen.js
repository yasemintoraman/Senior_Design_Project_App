import { useLayoutEffect } from 'react';
import {View} from 'react-native';

import { PRODUCTS, CATEGORIES } from '../data/dummy-data';
import ProductsList from '../components/ProductsList/ProductsList';

function ProductsOverviewScreen({ route, navigation }) {
  const catId = route.params.categoryId;
  const [loading, setLoading] = useState(true);
  const [displayedProducts, setDisplayedProducts] = useState([]);

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


  useLayoutEffect(() => {
    const categoryTitle = CATEGORIES.find(
      (category) => category.id === catId
    ).title;

    navigation.setOptions({
      title: categoryTitle,
    });
  }, [catId, navigation]);

  return <ProductsList items={displayedProducts} />
}

export default ProductsOverviewScreen;
