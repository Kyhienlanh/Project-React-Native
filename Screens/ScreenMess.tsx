import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Transaction } from '../types/Transaction';
const ScreenMess = () => {
     const [transactions, setTransactions] = useState<Transaction[]>([]);
  const userId = auth().currentUser?.uid || '';
useEffect(() => {
  const updateUnseenTransactions = async () => {
    try {
      const snapshot = await firestore()
        .collection('transaction')
        .where('userId', '==', userId)
        .where('seen', '==', false)
        .get();

      const batch = firestore().batch();

      snapshot.forEach((doc) => {
        batch.update(doc.ref, { seen: true });
      });

      await batch.commit();
      console.log('Đã cập nhật seen thành true cho các giao dịch chưa xem.');
    } catch (error) {
      console.error('Lỗi khi cập nhật seen:', error);
    }
  };

  // Gọi cập nhật seen
  updateUnseenTransactions();

  // Sau đó lắng nghe thay đổi
  const unsubscribe = firestore()
    .collection('transaction')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            idTransaction: doc.id,
            amount: d.amount || 0,
            note: d.note || '',
            type: d.type,
            date: d.date,
            createdAt: d.createdAt,
            userId: d.userId,
            imageUrl: d.imageUrl || null,
            spentWith: d.spentWith || '',
            seen: d.seen,
            category: {
              id: d.category?.id || '',
              name: d.category?.name || '',
              icon: d.category?.icon || 'card-outline',
              color: d.category?.color || '#A5D6A7',
            },
          };
        });

        setTransactions(data);
      },
      (error) => {
        console.error('Lỗi khi theo dõi giao dịch:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách giao dịch');
      }
    );

  return () => unsubscribe();
}, [userId]);

    const formatFullDateTime = (rawDate: any): string => {
    const dateObj = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate);
    return dateObj.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  return (
     <ScrollView contentContainerStyle={styles.container}>
         <Text style={styles.title}>Tất cả giao dịch</Text>
         {transactions.map((item) => (
           <TouchableOpacity key={item.idTransaction} style={styles.card}>
             <Ionicons
               name={item.category.icon}
               size={28}
               color={item.category.color}
               style={styles.icon}
             />
             <View style={styles.info}>
               <Text style={styles.name}>{item.category.name}</Text>
               <Text style={styles.note}>{item.note || 'Không có ghi chú'}</Text>
             </View>
             <View style={styles.amountContainer}>
               <Text style={[styles.amount, item.type === 'expense' ? styles.expense : styles.income]}>
                 {item.type === 'expense' ? '-' : '+'}{item.amount.toLocaleString()}đ
               </Text>
               <Text style={styles.date}>{formatFullDateTime(item.date)}</Text>
             </View>
           </TouchableOpacity>
         ))}
       </ScrollView>
  )
}

export default ScreenMess

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E7D32',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: {
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#388E3C',
  },
  note: {
    fontSize: 13,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expense: {
    color: '#D32F2F',
  },
  income: {
    color: '#388E3C',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
