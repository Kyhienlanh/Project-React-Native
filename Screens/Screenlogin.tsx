import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Screenlogin = () => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const [taikhoan, settaikhoan] = useState('');
  const [matkhau, setmatkhau] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const CheckLogin = () => {
    if (!taikhoan || !matkhau) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
      return;
    }
    signInWithEmailAndPassword(getAuth(), taikhoan, matkhau)
      .then(() => navigation.navigate('BottomTabNavigator'))
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
          Alert.alert('Lỗi', 'Tài khoản không tồn tại!');
        } else if (error.code === 'auth/wrong-password') {
          Alert.alert('Lỗi', 'Mật khẩu không đúng!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Lỗi', 'Email không hợp lệ!');
        } else {
          Alert.alert('Lỗi', 'Đăng nhập thất bại!');
          console.error(error);
        }
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📓 Ứng dụng quản lí chi tiêu</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={24} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          onChangeText={settaikhoan}
          placeholder="Email hoặc tài khoản"
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#333" style={styles.icon} />
        <TextInput
          style={styles.input}
          onChangeText={setmatkhau}
          secureTextEntry={secureTextEntry}
          placeholder="Mật khẩu"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
          <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={CheckLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        Bạn chưa có tài khoản?{' '}
        <Text style={styles.linkText} onPress={() => navigation.navigate('RegisterNote')}>
          Đăng ký
        </Text>
      </Text>
    </View>
  );
};

export default Screenlogin;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  registerText: {
    textAlign: 'center',
    marginTop: 25,
    fontSize: 14,
    color: '#555',
  },
  linkText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});
