import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView,TouchableOpacity, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addProduct } from '../config/firebase'; // Firestore'a göndermek için fonksiyonu içeri aktarın
import { CATEGORIES } from '../data/dummy-data';
const PostScreen = () => {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // Seçilen kategori state'ini oluşturun

  const handlePost = async () => {
    try {
      await addProduct(description, parseFloat(price), selectedCategory); // Firestore'a göndermek için fonksiyonu çağırın
      // Başarı mesajı veya başka bir işlem yapılabilir.
    } catch (error) {
      console.error('Post paylaşılırken hata oluştu:', error);
      // Hata durumunda kullanıcıya bir hata mesajı gösterebilirsiniz.
    }
  }
  const handleCategoryPress = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Açıklama"
        value={description}
        onChangeText={text => setDescription(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Fiyat"
        value={price}
        onChangeText={text => setPrice(text)}
        keyboardType="numeric"
      />
      <ScrollView style={styles.pickerContainer}>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryItem, selectedCategory === category ? styles.selectedCategoryItem : null]}
            onPress={() => handleCategoryPress(category)}
          >
            <Text>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Button title="Gönder" onPress={handlePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    maxHeight: 150,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  selectedCategoryItem: {
    backgroundColor: '#eee',
  },
});

export default PostScreen;