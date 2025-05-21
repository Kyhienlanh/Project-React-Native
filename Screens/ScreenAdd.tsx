import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, Button, Alert,Image,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { launchCamera,launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import storage from '@react-native-firebase/storage';
interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

const ScreenAdd = () => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [spentWith, setSpentWith] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const currentUser = getAuth().currentUser;

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      const cameraGranted = granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
      const storageGranted = granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;

      if (!cameraGranted || !storageGranted) {
        Alert.alert('Bạn cần cấp quyền để dùng camera hoặc thư viện ảnh');
        return false;
      }

      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const takePhoto = async () => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return;

  const result = await launchCamera({ mediaType: 'photo', saveToPhotos: true });

  if (result.assets && result.assets.length > 0) {
    setImageUri(result.assets[0].uri || null);
  }
};

const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
    }
  };
const uploadImage = async () => {
    if (!imageUri) return null;
    const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
    const reference = storage().ref(`images/${filename}`);
    await reference.putFile(imageUri);
    const url = await reference.getDownloadURL();
    return url;
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = async () => {
  if (!amount || !category) {
    Alert.alert('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  try {
    const imageUrl = await uploadImage();
    await firestore().collection('transaction').add({
      userId: currentUser?.uid,
      type,
      category,
      imageUrl: imageUrl || null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      amount: parseFloat(amount),
      date: date.toISOString(),
      note,
      spentWith,
    });

    setType('expense');
    setCategory(null);
    setAmount('');
    setDate(new Date());
    setNote('');
    setSpentWith('');
    setImageUri(null);

    Alert.alert('Lưu giao dịch thành công!');
    navigation.goBack();
  } catch (error) {
    console.error('Lỗi thêm ghi chú:', error);
    Alert.alert('Thêm thu chi thất bại.');
  }
};


  const handleOpenCategory = () => {
    navigation.navigate('category', {
      onSelectCategory: (data: { categoryId: string, type: 'income' | 'expense' }) => {
        setType(data.type);
        loadCategoryById(data.categoryId, data.type);
      }
    });
  };

  const loadCategoryById = async (categoryId: string, categoryType: 'income' | 'expense') => {
    if (!currentUser) return;

    try {
      const ref = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection(categoryType === 'income' ? 'incomeCategories' : 'expenseCategories')
        .doc(categoryId);

      const snapshot = await ref.get();
      const data = snapshot.data() as Category;

      if (data) {
        setCategory({ ...data, id: categoryId });
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy danh mục.');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      Alert.alert('Lỗi', 'Không thể tải danh mục');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.label}>Loại giao dịch</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => setType('income')}
            disabled={true}
          >
            <Ionicons name="arrow-down-circle-outline" size={20} color={type === 'income' ? 'white' : '#4caf50'} />
            <Text style={type === 'income' ? styles.typeTextActive : styles.typeText}> Thu nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => setType('expense')}
            disabled={true}
          >
            <Ionicons name="arrow-up-circle-outline" size={20} color={type === 'expense' ? 'white' : '#4caf50'} />
            <Text style={type === 'expense' ? styles.typeTextActive : styles.typeText}> Chi tiêu</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Danh mục</Text>
        <TouchableOpacity style={styles.selectBox} onPress={handleOpenCategory}>
          <Ionicons name={category?.icon||"pricetag-outline"} size={20} color={category?.color||"#4caf50"} />
          <Text style={styles.selectBoxText}>{category?.name || 'Chọn danh mục'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Số tiền</Text>
        <View style={styles.inputWithIcon}>
          <Ionicons name="cash-outline" size={20} color="#4caf50" />
          <TextInput
            keyboardType="numeric"
            placeholder="Nhập số tiền"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.label}>Ngày</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.selectBox}>
          <Ionicons name="calendar-outline" size={20} color="#4caf50" />
          <Text style={styles.selectBoxText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
        )}

        <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
        <View style={[styles.inputWithIcon, { alignItems: 'flex-start' }]}>
          <Ionicons name="document-text-outline" size={20} color="#4caf50" style={{ marginTop: 10 }} />
          <TextInput
            placeholder="Nhập ghi chú"
            style={[styles.input, { height: 80 }]}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
          <Text style={{ color: '#4caf50', marginTop: 20, fontWeight: 'bold' }}>
            {showDetails ? 'Ẩn chi tiết' : 'Thêm chi tiết'}
          </Text>
        </TouchableOpacity>

        {showDetails && (
          <>
            <Text style={styles.label}>Chi tiêu với ai</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="people-outline" size={20} color="#4caf50" />
              <TextInput
                placeholder="Nhập tên người"
                style={styles.input}
                value={spentWith}
                onChangeText={setSpentWith}
              />
            </View>

            <Text style={styles.label}>Hình ảnh</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color="#4caf50" />
                <Text style={styles.imageButtonText}>Chọn hình</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={20} color="#4caf50" />
                <Text style={styles.imageButtonText}>Chụp hình</Text>
              </TouchableOpacity>
            </View>
            
            {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
          </>
        )}

        <Button title="Lưu" onPress={handleSave} />
      </View>
    </ScrollView>
  );
};

export default ScreenAdd;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  }, 
  scrollContent: {
  paddingBottom: 60, 
},

  imagePreview: {
    marginTop: 10,
    height: 150,
    width: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
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
  },
  typeTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  selectBoxText: {
    marginLeft: 10,
    color: '#333',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 8,
    color: '#000',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    flex: 0.48,
    justifyContent: 'center',
  },
  imageButtonText: {
    marginLeft: 8,
    color: '#333',
  },
});
