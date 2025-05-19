import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import { RadioButton } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp} from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Colors } from 'react-native/Libraries/NewAppScreen';
const ScreenAddcate = () => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  // const route = useRoute<RouteProp<RootStackParamList, 'chooseIcon'>>();
  const [categoryName, setCategoryName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [parentGroup, setParentGroup] = useState('');
  const [icon,setIcon]=useState('heart');
  const isFormValid = categoryName.trim().length > 0;
  const auth = getAuth();
  const user = auth.currentUser;
  const ChoseIcon=()=>{
     navigation.navigate('chooseIcon', {
        onSelectIcon: (iconName: string) => {
          console.log('Icon được chọn:', iconName);
          // Xử lý icon được chọn ở đây
          Alert.alert(iconName)
          setIcon(iconName);
        },
      });

  }
  const addCate=async ()=>{
    try{
      if(type=='income'){
        const incomeRef = await firestore().collection('users').doc(user?.uid).collection('incomeCategories').add({
          name:categoryName,
          icon:icon,
          color:'green'
        });
    }
    else{
      const incomeRef = await firestore().collection('users').doc(user?.uid).collection('expenseCategories').add({
          name:categoryName,
          icon:icon,
          color:'green'
        });
    }Alert.alert('Thành công', 'Thêm nhóm thành công!');
    navigation.goBack();
    }catch(error){
    Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại.');
    console.error(error);
    }
  }
  return (
    <View style={styles.container}>
      <Text>
        
      </Text>
      {/* Tên nhóm */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={ChoseIcon}>
           <Ionicons name={icon} size={30} color='green' />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Tên nhóm"
          value={categoryName}
          onChangeText={setCategoryName}
        />
      </View>

      {/* Loại nhóm */}
      <View style={styles.radioGroup}>
        <View style={styles.radioOption}>
          <RadioButton
            value="expense"
            status={type === 'expense' ? 'checked' : 'unchecked'}
            onPress={() => setType('expense')}
            color="green"
          />
          <Text>Khoản chi</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton
            value="income"
            status={type === 'income' ? 'checked' : 'unchecked'}
            onPress={() => setType('income')}
              color="green"
          />
          <Text>Khoản thu</Text>
        </View>
      </View>

      {/* Nhóm cha */}
      {/* <Pressable style={styles.selectRow} onPress={() => {}}>
        <Ionicons name="cube-outline" size={20} color="#000" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: '#999', fontSize: 12 }}>Nhóm cha</Text>
          <Text style={{ fontSize: 14 }}>{parentGroup || 'Chọn nhóm'}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color="#999" />
      </Pressable> */}

      {/* Nút Lưu */}
      <TouchableOpacity
        
        style={[styles.saveButton, !isFormValid && styles.disabledButton]}
        disabled={!isFormValid}
        onPress={addCate}
      >
        <Text style={{ color: isFormValid ? '#fff' : '#ccc' }}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ScreenAddcate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingBottom: 10,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  disabledButton: {
    backgroundColor: '#eee',
  },
});
