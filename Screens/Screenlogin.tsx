import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';

const Screenlogin = () => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const [taikhoan, settaikhoan] = useState('');
  const [matkhau, setmatkhau] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true); // State to toggle password visibility

  const CheckLogin = () => {
    if (!taikhoan || !matkhau) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
      return;
    }
    signInWithEmailAndPassword(getAuth(), taikhoan, matkhau)
      .then(() => {
        navigation.navigate('Home');
      })
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
      <View style={styles.item1}>
        <Text style={{ textAlign: 'center', fontFamily: 'Roboto_Condensed-Black', fontSize: 20 }}>Chào mừng đến app chú thích</Text>
      </View>
      <View style={styles.item2}>
        {/* <Image
          source={require('../assets/images/taking-notes-icon-design-free-vector.jpg')}
          style={styles.image}
        /> */}
      </View>
      <View style={styles.item3}>
        <TextInput
          style={styles.input}
          onChangeText={settaikhoan}
          placeholder="Tài khoản"
        />
        <View style={styles.customPass}>
          <TextInput
            style={styles.input1}
            onChangeText={setmatkhau}
            secureTextEntry={secureTextEntry} 
            placeholder="Mật khẩu"
          />
          <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.iconne}>
            <Text style={styles.icon}>{secureTextEntry ? '👁️' : '🙈'}</Text> 
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={CheckLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', paddingTop: 20, color: 'blue' }} onPress={() => navigation.navigate('RegisterNote')}>
          Đăng kí
        </Text>
      </View>
    </View>
  );
};

export default Screenlogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  item1: {
    flex: 0,
  },
  item2: {
    flex: 1,
    marginTop: 20
  },
  item3: {
    flex: 1.2
  },
  customPass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    margin: 15
  },
  iconne:{
    padding:5,
  },
  input: {
    height: 40,
    margin: 15,
    borderWidth: 1,
    borderColor: 'black',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  input1: {
    height: 40,
    borderRadius: 8,
    flex: 8,
    borderColor: 'white',
    padding: 10,
  },
  icon: {
    flex: 2,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'green'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center'
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 10,
  },
});
