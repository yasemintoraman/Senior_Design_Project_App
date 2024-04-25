import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
function CategoryGridTile({ name, imageUrl, onPress }) {
  //required props
  return (
    <View style={styles.outer}>
      <View style={styles.gridItem}>
        <Pressable
          android_ripple={{ color: "#ccc" }} //for android
          style={({ pressed }) => [
            //for ios
            styles.button,
            pressed ? styles.buttonPressed : null,
          ]}
          onPress={onPress} //{onPress -> prop(CategoryGridTile)}
        >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>
        </Pressable>
      </View>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{name}</Text>
      </View>
    </View>
  );
}

export default CategoryGridTile;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#fdf5ed"
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "85%",
    height: "85%",
    resizeMode: "contain",
   // alignSelf: "center",
   // marginVertical: 12,
  },
  gridItem: {
    flex: 1,
    margin: 8,
    marginTop: 10,
    height: 155,
    borderRadius: 8,
    elevation: 4, //for android
    backgroundColor: "#e2eae3", //for ios
    shadowColor: "black", //ios
    shadowOpacity: 0.25, //ios
    shadowOffset: { width: 0, height: 2 }, //ios
    shadowRadius: 8, //ios
    overflow: Platform.OS === "android" ? "hidden" : "visible", //both
  },
  button: {
    flex: 1,
  },
  buttonPressed: {
    opacity: 0.3, //for ios ripple effect
  },
  innerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginLeft: 12,
    marginBottom: 30,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fda600",
  },
});
