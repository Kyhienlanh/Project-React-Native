import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Button, Platform,Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const categories = {
  income: ['Lương', 'Quà tặng', 'Khác'],
  expense: ['Ăn uống', 'Đi lại', 'Mua sắm', 'Giải trí'],
};

const ScreenAdd = () => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    // Reset nếu muốn
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Loại giao dịch</Text>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
          onPress={() => setType('income')}
        >
          <Text style={type === 'income' ? styles.typeTextActive : styles.typeText}>Thu nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          onPress={() => setType('expense')}
        >
          <Text style={type === 'expense' ? styles.typeTextActive : styles.typeText}>Chi tiêu</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Danh mục</Text>
      <View style={styles.categoryList}>
        {categories[type].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryItem, category === cat && styles.categoryItemSelected]}
            onPress={() => setCategory(cat)}
          >
            <Text style={category === cat ? styles.categoryTextSelected : styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Số tiền</Text>
      <TextInput
        keyboardType="numeric"
        placeholder="Nhập số tiền"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Ngày</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
      )}

      <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
      <TextInput
        placeholder="Nhập ghi chú"
        style={[styles.input, { height: 80 }]}
        value={note}
        onChangeText={setNote}
        multiline
      />

      <Button title="Lưu" onPress={handleSave} />
    </View>
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
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
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
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryItem: {
    borderWidth: 1,
    borderColor: '#4caf50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryItemSelected: {
    backgroundColor: '#4caf50',
  },
  categoryText: {
    color: '#4caf50',
  },
  categoryTextSelected: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  datePicker: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 8,
  },
});
