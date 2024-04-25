import { FlatList } from "react-native";
import CategoryGridTile from '../components/CategoryGridTile';
import { useCategoriesListener } from "../config/firebase";


function CategoriesScreen({ navigation }) {
  const categories = useCategoriesListener();
  
  function renderCategoryItem(itemData) {
    function pressHandler() {
      navigation.navigate("ProductsOverview", { //target screen
        categoryName: itemData.item.categoryName,
      });
    }

    return (
      <CategoryGridTile
        name={itemData.item.categoryName}
        imageUrl={itemData.item.imageUrl}
        onPress={pressHandler}
      />
    );
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      renderItem={renderCategoryItem}
      numColumns={2}
    />
  );
}

export default CategoriesScreen;
