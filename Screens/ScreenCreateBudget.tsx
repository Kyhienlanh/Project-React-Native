import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DateRangePickerModal from './DateRangePickerModal';
import auth from '@react-native-firebase/auth';

const formatDate = (date: Date): string => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()}`;
};

const ScreenCreateBudget: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [limit, setLimit] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSaveBudget = async () => {
    if (!name || !limit || !startDate || !endDate) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin và chọn khoảng thời gian');
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để tạo ngân sách');
      return;
    }

    try {
      await firestore().collection('budgets').add({
        name,
        limit: parseFloat(limit),
        startDate: firestore.Timestamp.fromDate(startDate),
        endDate: firestore.Timestamp.fromDate(endDate),
        createdAt: firestore.FieldValue.serverTimestamp(),
        selectedLabel,
        userId: currentUser.uid,
      });

      Alert.alert('Thành công', 'Ngân sách đã được lưu');
      setName('');
      setLimit('');
      setSelectedLabel('');
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu ngân sách');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo Ngân Sách Mới</Text>

      <Text style={styles.label}>Tên ngân sách</Text>
      <TextInput
        style={styles.input}
        placeholder="Ví dụ: Chi tiêu tháng 5"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Số tiền giới hạn</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số tiền"
        keyboardType="numeric"
        value={limit}
        onChangeText={setLimit}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={styles.rangeButton}
        activeOpacity={0.7}
      >
        <Text style={startDate && endDate ? styles.rangeTextSelected : styles.rangeText}>
          {startDate && endDate
            ? `${selectedLabel} (${formatDate(startDate)} - ${formatDate(endDate)})`
            : 'Chọn khoảng thời gian'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveBudget}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Lưu ngân sách</Text>
      </TouchableOpacity>

      <DateRangePickerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={(label: string, start: Date, end: Date) => {
          setSelectedLabel(label);
          setStartDate(start);
          setEndDate(end);
          setShowModal(false);
        }}
      />
    </View>
  );
};

export default ScreenCreateBudget;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 28,
    textAlign: 'center',
    color: 'green', // màu xanh dương chuẩn Material
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rangeButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginTop: 16,
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rangeText: {
    fontSize: 16,
    color: '#999',
  },
  rangeTextSelected: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: 'green',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#1976D2',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
