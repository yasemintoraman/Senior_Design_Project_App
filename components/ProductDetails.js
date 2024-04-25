import { View, Text, StyleSheet } from 'react-native';

function ProductDetails({
  price,
  style,
  textStyle,
}) {
  return (
    <View style={[styles.details, style]}>
      <Text style={[styles.detailItem, textStyle]}>Price: {price}</Text>
    </View>
  );
}

export default ProductDetails;

const styles = StyleSheet.create({
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  detailItem: {
    marginHorizontal: 4,
    fontSize: 12,
  },
});
