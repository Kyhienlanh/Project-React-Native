import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, Button, Platform, Alert,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
const ScreenAdd = () => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [spentWith, setSpentWith] = useState('');


  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = () => {
    if (!amount || !category) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const transaction = {
      type,
      category,
      amount: parseFloat(amount),
      date: date.toISOString(),
      note,
    };
    console.log('Save transaction:', transaction);
    Alert.alert('Lưu giao dịch thành công!');
    // Reset nếu cần
  };
    const handleOpenCategory = () => {
     navigation.navigate('category', {
        onSelectCategory: (data) => {
          if(data.type=="income"){
            setType(data.type);
            setCategory(data.categoryId);
          }
          else{
             setType("expense");
            setCategory(data.categoryId);
          }
        }
      });

    };

  return (
      <ScrollView>
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
        <Ionicons name="pricetag-outline" size={20} color="#4caf50" />
        <Text style={styles.selectBoxText}>{category || 'Chọn danh mục'}</Text>
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
      <TouchableOpacity style={styles.imageButton}>
        <Ionicons name="image-outline" size={20} color="#4caf50" />
        <Text style={styles.imageButtonText}>Chọn hình</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.imageButton}>
        <Ionicons name="camera-outline" size={20} color="#4caf50" />
        <Text style={styles.imageButtonText}>Chụp hình</Text>
      </TouchableOpacity>
    </View>
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
