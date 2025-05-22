import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, Alert, Image,
  ScrollView, ActivityIndicator, Platform
} from 'react-native';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import { PermissionsAndroid } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Transaction {
  idTransaction: string;
  amount: number;
  note: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  userId: string;
  imageUrl: string | null;
  spentWith: string;
  category: Category;
}

const ScreendetailTransactions = () => {
  const route: RouteProp<RootStackParamList, 'detailTransactions'> = useRoute();
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const { id } = route.params;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Các state để chỉnh sửa
  const [amount, setAmount] = useState<string>(''); 
  const [note, setNote] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date());
  const [spentWith, setSpentWith] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lấy dữ liệu transaction
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const doc = await firestore()
          .collection('transaction')
          .doc(id)
          .get();

        if (doc.exists()) {
          const data = doc.data() as Transaction;
          setTransaction(data);

          // Khởi tạo state chỉnh sửa
          setAmount(data.amount.toString());
          setNote(data.note);
          setType(data.type);
          setDate(new Date(data.date));
          setSpentWith(data.spentWith);
          setCategoryName(data.category.name);
          setImageUri(data.imageUrl);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy giao dịch!');
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Lấy dữ liệu thất bại');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  // Hàm chọn ngày
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  // Quyền camera (Android)
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

  // Chụp ảnh
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await launchCamera({ mediaType: 'photo', saveToPhotos: true });

    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
    }
  };

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
    }
  };

  // Upload ảnh lên Firebase Storage
  const uploadImage = async () => {
    if (!imageUri || imageUri.startsWith('https://')) return imageUri; 

    const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
    const reference = storage().ref(`images/${filename}`);
    await reference.putFile(imageUri);
    const url = await reference.getDownloadURL();
    return url;
  };

  // Xử lý lưu chỉnh sửa
  const onSave = async () => {
    if (!transaction) return;

    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Lỗi', 'Số tiền không hợp lệ');
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await uploadImage();

      await firestore()
        .collection('transaction')
        .doc(id)
        .update({
          amount: Number(amount),
          note,
          type,
          date: date.toISOString().split('T')[0], // Lưu dạng YYYY-MM-DD
          spentWith,
          imageUrl,
          category: {
            ...transaction.category,
            name: categoryName,
          },
        });

      Alert.alert('Thành công', 'Cập nhật giao dịch thành công!');
      navigation.goBack();

    } catch (error) {
      Alert.alert('Lỗi', 'Cập nhật thất bại, thử lại sau!');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy giao dịch</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
     <Text style={styles.label}>
        <Ionicons name="cash-outline" size={16} /> Số tiền
        </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

     <Text style={styles.label}>
  <Ionicons name="swap-horizontal-outline" size={16} /> Loại
</Text>

      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeSelected]}
          onPress={() => setType('income')}
        >
          <Text>Thu nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeSelected]}
          onPress={() => setType('expense')}
        >
          <Text>Chi tiêu</Text>
        </TouchableOpacity>
      </View>
        <Text style={styles.label}>
         <Ionicons
                name={transaction.category.icon}
                size={20}
                color={transaction.category.color || '#000'}
                style={{ marginRight: 8 }}
                /> Danh mục
        </Text>
           
           
            <TextInput
                style={[styles.input, { flex: 1 }]}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Tên danh mục"
            />
          

        <Text style={styles.label}>
  <Ionicons name="calendar-outline" size={16} /> Ngày
</Text>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text>{date.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>
        <Ionicons name="create-outline" size={16} /> Ghi chú
        </Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
      />

    
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <Text style={styles.label}>
        <Ionicons name="people-outline" size={16} /> Chi tiêu với
        </Text>

      <TextInput
        style={styles.input}
        value={spentWith}
        onChangeText={setSpentWith}
      />

     

      

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

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.7, }]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ScreendetailTransactions;
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 15,
    marginBottom: 16,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 10,
  },
  typeSelected: {
    backgroundColor: '#a0d911',
  },
  datePicker: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  imagePreview: {
    marginTop: 12,
    height: 180,
    width: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flex: 0.48,
    justifyContent: 'center',
  },
  imageButtonText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#52c41a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },categoryContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 10,
  backgroundColor: '#fff',
  marginBottom: 16,
},

});
