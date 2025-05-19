import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Alert, ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation ,NavigationProp} from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute, RouteProp} from '@react-navigation/native';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

const CategoryScreen = () => {
  const route: RouteProp<RootStackParamList, 'category'> = useRoute();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const currentUser = getAuth().currentUser;
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  
  const handleCategorySelect = (category: Category) => {
  if (route.params?.onSelectCategory) {
    route.params.onSelectCategory({
      categoryId: category.id,
      type: type
    });
  }
  navigation.goBack();
};

  const loadCategories = async () => {
    if (!currentUser) return;

    try {
      const ref = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection(type === 'income' ? 'incomeCategories' : 'expenseCategories');

      const snapshot = await ref.get();
      const data: Category[] = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: docData.name,
          icon: docData.icon,
          color: docData.color,
        };
      });

      setCategories(data);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      Alert.alert('Lỗi', 'Không thể tải danh mục');
    }
  };

  // Dùng useFocusEffect để reload dữ liệu mỗi khi màn hình được focus (được active)
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [type])
  );

  const AddCate = () => {
    navigation.navigate('addcategory');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Loại giao dịch</Text>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
          onPress={() => setType('income')}
        >
          <Ionicons name="arrow-down-circle-outline" size={20} color={type === 'income' ? 'white' : '#4caf50'} />
          <Text style={type === 'income' ? styles.typeTextActive : styles.typeText}>Khoản thu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          onPress={() => setType('expense')}
        >
          <Ionicons name="arrow-up-circle-outline" size={20} color={type === 'expense' ? 'white' : '#4caf50'} />
          <Text style={type === 'expense' ? styles.typeTextActive : styles.typeText}>Khoản chi</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { marginTop: 24 }]}>Danh mục {type === 'income' ? 'thu' : 'chi'}</Text>
      <TouchableOpacity onPress={AddCate}>
        <View style={styles.categoryItem}>
          <Ionicons name={'pricetag-outline'} size={20} color={'#333'} />
          <Text style={styles.categoryText}>Thêm mới</Text>
        </View>
      </TouchableOpacity>

     <ScrollView style={{ marginTop: 8 }}>
  {categories.length === 0 ? (
    <Text style={{ color: '#999', fontStyle: 'italic' }}>Không có danh mục nào.</Text>
  ) : (
    categories.map((cat) => (
      <TouchableOpacity
        key={cat.id}
        style={styles.categoryItem}
        onPress={() => handleCategorySelect(cat)} 
      >
        <Ionicons name={cat.icon || 'pricetag-outline'} size={20} color={cat.color || '#333'} />
        <Text style={styles.categoryText}>{cat.name}</Text>
      </TouchableOpacity>
    ))
  )}
</ScrollView>

    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  typeButton: {
    flexDirection: 'row',
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4caf50',
  },
  typeText: {
    color: '#4caf50',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  typeTextActive: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  categoryText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});
