import { StyleSheet, Text, View,TextInput ,TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp} from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';

const ScreenRegister = () => {
  //   const route: RouteProp<RootStackParamList, 'DetailNote'> = useRoute();
  // const noteId = route.params?.id;
    const navigation :NavigationProp<RootStackParamList>=useNavigation();
    const [taikhoan,settaikhoan]=useState('');
    const [matkhau,setmatkhau]=useState('');
     const [checkmatkhau,setcheckmatkhau]=useState('');
    const [loading,setloading]=useState(false);
    const register=()=>{
        if(matkhau==checkmatkhau){
        createUserWithEmailAndPassword(getAuth(), taikhoan, matkhau)
                    .then(() => {
                        console.log('Tài khoản người dùng đã được tạo và đăng nhập!');
                    })
                    .catch(error => {
                        if (error.code === 'auth/email-already-in-use') {
                        console.log('Địa chỉ email đó đã được sử dụng!');
                        }

                        if (error.code === 'auth/invalid-email') {
                        console.log('Địa chỉ email đó không hợp lệ!');
                        }

                        console.error(error);
                    });
        }
        else{
              console.log('mật khẩu không trùng');
        }
     

    }
 return (
    <View style={styles.container}>
        <Text style={{textAlign:'center'}}>Đăng ký</Text>
        <TextInput
          style={styles.input}
           onChangeText={settaikhoan}

          placeholder="Tài khoản"
        />
        <TextInput
          style={styles.input}
           onChangeText={setmatkhau}
        //   value={number}
          placeholder="Mật khẩu"
        />
         <TextInput
          style={styles.input}
           onChangeText={setcheckmatkhau}
        //   value={number}
          placeholder="Mật khẩu"
        />
        <TouchableOpacity style={styles.button} onPress={() => register()}>
            <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
        <Text style={{textAlign:'center',paddingTop:20,color:'blue'}} onPress={() => navigation.navigate('RegisterNote')}>
            Đăng nhập
        </Text>


    </View>

  )
}

export default ScreenRegister

const styles = StyleSheet.create({
    container:{
        flex:1,
       justifyContent:'center'
    },
    input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
   button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign:'center'
  },
})