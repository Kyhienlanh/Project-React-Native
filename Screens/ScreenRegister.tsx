import { StyleSheet, Text, View,TextInput,Alert ,TouchableOpacity,SafeAreaView} from 'react-native'
import React, { useState } from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp} from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
const ScreenRegister = () => {
  //   const route: RouteProp<RootStackParamList, 'DetailNote'> = useRoute();
  // const noteId = route.params?.id;
    const navigation :NavigationProp<RootStackParamList>=useNavigation();
    const [taikhoan,settaikhoan]=useState('');
    const [matkhau,setmatkhau]=useState('');
     const [checkmatkhau,setcheckmatkhau]=useState('');
    const [loading,setloading]=useState(false);
    const createDefaultCategories = async (userId: string) => {
           const incomeDefaults = [
          { name: 'Lương', color: '#00ff00', icon: 'cash-outline' },
          { name: 'Thưởng', color: '#00aaff', icon: 'gift-outline' },
          { name: 'Bán hàng', color: '#33cc33', icon: 'cart-outline' },
          { name: 'Lãi ngân hàng', color: '#3399ff', icon: 'wallet-outline'},
          { name: 'Đầu tư', color: '#66ccff', icon: 'trending-up-outline' },
        ];

          const expenseDefaults = [            { name: 'Ăn uống', color: '#ff0000', icon: 'restaurant-outline' },
            { name: 'Đi lại', color: '#ffaa00', icon: 'car-outline' },
            { name: 'Giải trí', color: '#cc00cc', icon: 'game-controller-outline' },
            { name: 'Mua sắm', color: '#ff66cc', icon: 'bag-outline' },
            { name: 'Hóa đơn', color: '#9966ff', icon: 'document-text-outline' },
            { name: 'Sức khỏe', color: '#00cccc', icon: 'heart-outline' },
            { name: 'Giáo dục', color: '#ff9933', icon: 'school-outline' },
          ];



      const incomeRef = firestore().collection('users').doc(userId).collection('incomeCategories');
      const expenseRef = firestore().collection('users').doc(userId).collection('expenseCategories');

      for (const item of incomeDefaults) {
        await incomeRef.add(item);
      }

      for (const item of expenseDefaults) {
        await expenseRef.add(item);
      }

      console.log('Tạo danh mục mặc định xong');
    };

   const register = () => {
    if (!taikhoan || !matkhau || !checkmatkhau) {
  Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
  return;
}
  if (matkhau === checkmatkhau) {
    setloading(true);
   createUserWithEmailAndPassword(getAuth(), taikhoan, matkhau)
  .then((userCredential) => {
    console.log('Tài khoản tạo thành công:', userCredential.user.email);
    createDefaultCategories(userCredential.user.uid);

   
    Alert.alert(
      'Thành công',
      'Đăng ký tài khoản thành công!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(), 
        },
      ],
      { cancelable: false }
    );
  })

      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('Email đã được sử dụng!');
        }
        if (error.code === 'auth/invalid-email') {
          console.log('Email không hợp lệ!');
        }
        console.error(error);
      })
      .finally(() => setloading(false));
  } else {
    Alert.alert('Lỗi', 'Mật khẩu không trùng');
  return;
  }
};
 return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          onChangeText={settaikhoan}
          placeholder="Nhập tài khoản"
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          onChangeText={setmatkhau}
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#aaa"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          onChangeText={setcheckmatkhau}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#aaa"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      <Text
        style={styles.loginText}
        onPress={() => navigation.goBack()}>
        Đã có tài khoản? Đăng nhập
      </Text>
    </SafeAreaView>
  );
};

export default ScreenRegister;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginText: {
    marginTop: 24,
    color: '#007bff',
    textAlign: 'center',
    fontSize: 16,
  },
});