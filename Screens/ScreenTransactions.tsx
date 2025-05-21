import { StyleSheet, Text, View, ScrollView,TouchableOpacity, Alert } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Transaction } from '../types/Transaction';
import firestore from '@react-native-firebase/firestore';
import React, { useState, useEffect, useCallback } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from '@react-native-firebase/auth';
import { launchCamera,launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import storage from '@react-native-firebase/storage';
import { LineChart } from 'react-native-chart-kit';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

const groupByDate = (data: Transaction[]) => {
  const grouped: { [key: string]: Transaction[] } = {};
  data.forEach((t) => {
    if (!grouped[t.date]) {
      grouped[t.date] = [];
    }
    grouped[t.date].push(t);
  });
  return grouped;
};
const getDay = (dateStr: string): string => new Date(dateStr).getDate().toString();

const getTodayLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.toDateString() === today.toDateString()
      ? 'Hôm nay'
      : date.toLocaleDateString('vi-VN', { weekday: 'long' })
  );
};
const getStartAndEndOfMonth = (month: number, year: number) => {
  const startDate = new Date(year, month, 1); 
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return {
    start: firestore.Timestamp.fromDate(startDate),
    end: firestore.Timestamp.fromDate(endDate),
  };
};


const formatMonthYear = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.toLocaleDateString('vi-VN', { month: 'long' });
  const year = date.getFullYear();
  return `tháng ${date.getMonth() + 1} ${year}`;
};
const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];
const ScreenTransactions = () => {

   const user = auth().currentUser;
   const [transaction, setTransactions] = useState<Transaction[]>([]);
   const [totalIncome, setTotalIncome] = useState(0);
   const [totalExpense, setTotalExpense] = useState(0);
   const [total, setTotal] = useState(0);
   const [chartType, setChartType] = useState<'income' | 'expense'>('income');
   useEffect(() => {
  calculateTotal();
}, [transaction]);
    const calculateTotal = () => {
  let totalAmount = 0;
  let income = 0;
  let expense = 0;

  transaction.forEach((item) => {
    if (item.type === 'income') {
      totalAmount += item.amount;
      income += item.amount;
    } else {
      totalAmount -= item.amount;
      expense += item.amount;
    }
  });

  setTotal(totalAmount);
  setTotalIncome(income);
  setTotalExpense(expense);
};

   const formatCurrencyVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(amount);
      };
  const currentMonth = new Date().getMonth(); // 0-11
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // mặc định tháng này
useEffect(() => {
  if (!user?.uid) return;

  const year = new Date().getFullYear();
  const { start, end } = getStartAndEndOfMonth(selectedMonth, year);

  const unsubscribe = firestore()
    .collection('transaction')
    .where('userId', '==', user.uid)
    .where('createdAtDate', '>=', start)
    .where('createdAtDate', '<=', end)
    .orderBy('createdAtDate', 'desc')
    .onSnapshot(
      querySnapshot => {
        if (!querySnapshot || querySnapshot.empty) {
          setTransactions([]);
          return;
        }

        const data: Transaction[] = querySnapshot.docs.map(doc => ({
          idTransaction: doc.id,
          ...doc.data(),
        })) as Transaction[];

        setTransactions(data);
      
      },
      error => {
        console.error('Firestore onSnapshot error:', error);
        setTransactions([]); // fallback
      }
    );

  return () => unsubscribe();
}, [user?.uid, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
     
      }
    }, [user?.uid])
  );

const test =()=>{
  transaction.forEach(element => {
        Alert.alert(element.date);
  });
}

const groupedData = groupByDate(transaction);


  const sortedDates = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));
const handleDeleteTransaction = (t: Transaction) => {
  Alert.alert(
    'Xóa giao dịch',
    `Bạn có chắc chắn muốn xóa giao dịch "${t.category.name}"?`,
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('transaction').doc(t.idTransaction).delete();
          } catch (error) {
            console.error('Xóa giao dịch thất bại:', error);
            Alert.alert('Lỗi', 'Không thể xóa giao dịch.');
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  return (
    <View style={styles.container}>
      {/* PHẦN TỔNG QUAN CỐ ĐỊNH */}
      <View style={styles.summaryContainer}>
        <Text style={styles.balanceText}>Số dư</Text>
        <Text style={styles.balanceAmount}>{total}</Text>
         <TouchableOpacity  
              onPress={test}
            >
              <Text >
               click thu
              </Text>
            </TouchableOpacity>
        {/* TAB CÓ TƯƠNG TÁC */}
       <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 10 }}
      style={{ marginBottom: 16 }}
        >
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedMonth(index)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 20,
                backgroundColor: selectedMonth === index ? '#3498db' : '#ecf0f1',
                marginRight: 10,
              }}
            >
              <Text style={{ color: selectedMonth === index ? '#fff' : '#2c3e50' }}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        <View style={styles.inOutRow}>
          <View style={styles.inOutItem}>
            <Text style={styles.label}>Tiền vào</Text>
            <Text style={styles.inAmount}>{totalIncome}</Text>
          </View>
          <View style={styles.inOutItem}>
            <Text style={styles.label}>Tiền ra</Text>
            <Text style={styles.outAmount}>{totalExpense}</Text>
          </View>
        </View>

        <Text style={styles.totalBalance}>{}</Text>

        <View style={styles.reportButton}>
          <Text style={styles.reportButtonText}>Xem báo cáo cho giai đoạn này</Text>
        </View>
      </View>

   <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
  {sortedDates.map((date) => {
    const transactionsForDate = groupedData[date];

    return (
      <View key={date} style={styles.dateGroup}>
        {/* Header NGÀY - HIỂN THỊ 1 LẦN */}
        <View style={styles.dateHeader}>
          <Text style={styles.dayText}>{getDay(date)}</Text>
          <View style={styles.dateInfo}>
            <Text style={styles.todayText}>{getTodayLabel(date)}</Text>
            <Text style={styles.monthYearText}>{formatMonthYear(date)}</Text>
          </View>
        </View>

        {/* Danh sách giao dịch trong ngày đó */}
        {transactionsForDate.map((t) => (
          // <View key={t.idTransaction} style={styles.transactionItem}>
           <TouchableOpacity
              key={t.idTransaction}
              style={styles.transactionItem}
              onLongPress={() => handleDeleteTransaction(t)}
            >
              <View style={styles.transactionRow}>
                <View style={styles.iconWithLabel}>
                  <Ionicons
                    name={t.category.icon || 'wallet-outline'}
                    size={24}
                    color={t.category.color || '#555'}
                    style={styles.icon}
                  />
                  <View>
                    <Text style={styles.transactionName}>{t.category.name}</Text>
                    <Text style={styles.categoryName}>{t.note}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: t.type === 'expense' ? '#e74c3c' : '#2ecc71' },
                  ]}
                >
                  {Math.abs(t.amount).toLocaleString()} vnđ
                </Text>
              </View>
            </TouchableOpacity>

          // </View>
        ))}
      </View>
    );
  })}
</ScrollView>

      
    </View>
  );
};


// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fa',
    padding: 16,
  },
  dateGroup: {
    marginBottom: 32,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 12,
  },
  dateInfo: {
    flexDirection: 'column',
  },
  todayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  monthYearText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    marginRight: 10,
  },
  transactionName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  categoryName: {
    fontSize: 13,
    color: '#95a5a6',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 24,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
},
balanceText: {
  fontSize: 16,
  color: '#7f8c8d',
},
balanceAmount: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#e74c3c',
  marginTop: 4,
  marginBottom: 12,
},
tabContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
},
tab: {
  fontSize: 14,
  color: '#7f8c8d',
},
tabActive: {
  fontWeight: 'bold',
  borderBottomWidth: 2,
  borderBottomColor: '#000',
  color: '#000',
},
inOutRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 8,
},
inOutItem: {
  flex: 1,
},
label: {
  fontSize: 14,
  color: '#7f8c8d',
},
inAmount: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#3498db',
},
outAmount: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#e74c3c',
},
totalBalance: {
  textAlign: 'right',
  fontSize: 16,
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: 12,
},
reportButton: {
  alignSelf: 'center',
  backgroundColor: '#eafaf1',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
},
reportButtonText: {
  color: '#27ae60',
  fontWeight: '500',
  fontSize: 14,
},

});

export default ScreenTransactions;
