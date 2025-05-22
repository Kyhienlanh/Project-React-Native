import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { Transaction } from '../types/Transaction'; // đảm bảo file types đã đúng
import { useNavigation ,NavigationProp} from '@react-navigation/native';
import { useRoute, RouteProp} from '@react-navigation/native';

const ScreenHome = () => {
  const user = auth().currentUser;
    const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const [transaction, setTransaction] = useState<Transaction[]>([]);
  const [transactionFull, setTransactionFull] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [total, setTotal] = useState(0);
  const [chartType, setChartType] = useState<'income' | 'expense'>('income');
  const formatCurrencyVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getChartDataFromTransactions = (transactions: Transaction[]) => {
    const amountsByDay: { [day: string]: number } = {};

    transactions.forEach((tran) => {
      if (tran.type === 'income') {
        const day = new Date(tran.date).getDate().toString();
        amountsByDay[day] = (amountsByDay[day] || 0) + tran.amount;
      }
    });

    const sortedDays = Object.keys(amountsByDay)
      .map(Number)
      .sort((a, b) => a - b)
      .map(String);

    const data = sortedDays.map((day) => amountsByDay[day]);

    return {
      labels: sortedDays,
      datasets: [{ data, strokeWidth: 2 }],
    };
  };
   const getChartDataFromTransactionsexpense = (transactions: Transaction[]) => {
    const amountsByDay: { [day: string]: number } = {};

    transactions.forEach((tran) => {
      if (tran.type === 'expense') {
        const day = new Date(tran.date).getDate().toString();
        amountsByDay[day] = (amountsByDay[day] || 0) + tran.amount;
      }
    });

    const sortedDays = Object.keys(amountsByDay)
      .map(Number)
      .sort((a, b) => a - b)
      .map(String);

    const data = sortedDays.map((day) => amountsByDay[day]);

    return {
      labels: sortedDays,
      datasets: [{ data, strokeWidth: 2 }],
    };
  };

  const chartData = getChartDataFromTransactions(transactionFull);
  const chartDataexpense = getChartDataFromTransactionsexpense(transactionFull);

  const getTransactions = async (userId: string) => {
    try {
      const snapshot = await firestore()
        .collection('transaction')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get();

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
          category: {
            id: d.category?.id || '',
            name: d.category?.name || '',
            icon: d.category?.icon || 'card-outline',
            color: d.category?.color || '#ccc',
          },
        };
      });

      setTransaction(data);
    } catch (error) {
      console.error('Lỗi lấy giao dịch:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách giao dịch');
    }
  };

  const getTransactionsFULL = async (userId: string) => {
    try {
      const snapshot = await firestore()
        .collection('transaction')
        .where('userId', '==', userId)
        .get();

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
          category: {
            id: d.category?.id || '',
            name: d.category?.name || '',
            icon: d.category?.icon || 'card-outline',
            color: d.category?.color || '#ccc',
          },
        };
      });

      setTransactionFull(data);
    } catch (error) {
      console.error('Lỗi khi tải toàn bộ giao dịch:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách giao dịch');
    }
  };

  const calculateTotal = () => {
    let totalAmount = 0;
    let income = 0;
    let expense = 0;

    transactionFull.forEach((item) => {
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

  const handleGetTransactions = () => {
    if (user?.uid) {
      getTransactions(user.uid);
      getTransactionsFULL(user.uid);
     
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy người dùng');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        handleGetTransactions();
      }
    }, [user?.uid])
  );

  useEffect(() => {
    calculateTotal();
  }, [transactionFull]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.email || 'Người dùng'}</Text>
          <Ionicons name="notifications-outline" size={28} color="#333" />
        </View>

        <View style={styles.accountBox}>
          <Text style={styles.balanceLabel}>Số dư tài khoản</Text>
          <Text style={styles.balanceValue}>{formatCurrencyVND(total)}</Text>

          <View style={styles.incomeExpenseRow}>
            <View style={styles.summaryBox}>
              <Ionicons name="arrow-down-circle-outline" size={20} color="white" />
              <Text style={styles.summaryLabel}>Thu</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrencyVND(totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Ionicons name="arrow-up-circle-outline" size={20} color="#fd3c4a" />
              <Text style={styles.summaryLabel}>Chi</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrencyVND(totalExpense)}
              </Text>
            </View>
          </View>
        </View>

<View style={styles.chartContainer}>
  <View style={styles.transactionHeaderRow}>
    <Text style={styles.chartTitle}>Báo cáo tháng này</Text>
    <TouchableOpacity onPress={()=>{navigation}}>
      <Text style={{ color: 'red', fontSize: 14 }}>Xem báo cáo</Text>
    </TouchableOpacity>
  </View>
  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
  <TouchableOpacity
    onPress={() => setChartType('income')}
    style={{
      backgroundColor: chartType === 'income' ? '#4CAF50' : '#ccc',
      padding: 10,
      borderRadius: 8,
      marginRight: 10,
    }}
  >
    <Text style={{ color: 'white' }}>Biểu đồ Thu</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setChartType('expense')}
    style={{
      backgroundColor: chartType === 'expense' ? '#fd3c4a' : '#ccc',
      padding: 10,
      borderRadius: 8,
    }}
  >
    <Text style={{ color: 'white' }}>Biểu đồ Chi</Text>
  </TouchableOpacity>
</View>
    {(chartType === 'income' ? chartData : chartDataexpense).labels.length === 0 ||
(chartType === 'income' ? chartData : chartDataexpense).datasets[0].data.length === 0 ? (
  <View style={{ padding: 20, alignItems: 'center' }}>
    <Text style={{ color: '#999' }}>Chưa có dữ liệu để hiển thị biểu đồ.</Text>
  </View>
) : (
  <LineChart
    data={chartType === 'income' ? chartData : chartDataexpense}
    width={Dimensions.get('window').width - 32}
    height={220}
    yAxisLabel=""
    yAxisSuffix="₫"
    chartConfig={{
      backgroundColor: chartType === 'income' ? '#4CAF50' : '#66BB6A',
      backgroundGradientFrom: chartType === 'income' ? '#81C784' : '#66BB6A',
      backgroundGradientTo: chartType === 'income' ? '#66BB6A' : '#66BB6A',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      propsForDots: {
        r: '5',
        strokeWidth: '2',
        stroke: '#fff',
      },
    }}
    bezier
    style={{ marginVertical: 8, borderRadius: 16 }}
  />
)}

</View>


        <View style={styles.transactionHeaderRow}>
          <Text style={styles.sectionTitle}>Giao dịch gần nhất</Text>
          <TouchableOpacity onPress={()=>{navigation.navigate('Transactions')}}>
            <Text style={{ color: '#4CAF50', fontSize: 14 }}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionListContainer}>
          {transaction.map((item) => (
            <View key={item.idTransaction} style={styles.transactionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name={item.type === 'income' ? item.category.icon : 'cart-outline'}
                  size={20}
                  color={item.category.color}
                  style={{ marginRight: 8 }}
                />
                <View>
                  <Text style={styles.transactionTitle}>{item.category.name}</Text>
                  <Text style={styles.transactionDesc}>{item.note}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    color: item.type === 'income' ? 'green' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  {item.type === 'income' ? '+' : '-'}
                  {formatCurrencyVND(item.amount)}
                </Text>
                <Text style={styles.transactionTime}>
                  {item.createdAt?.toDate?.()
                    ? item.createdAt.toDate().toLocaleString()
                    : 'N/A'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScreenHome;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  accountBox: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  accountTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
  },
  userName: {
    color: 'black',
    fontWeight: 'bold',
  },
  balanceValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryBox: {
    backgroundColor: '#66BB6A',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    paddingLeft: 4,
  },
  transactionItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDesc: {
    color: '#777',
    fontSize: 12,
  },
  transactionTime: {
    fontSize: 12,
    color: '#888',
  },
  chartContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionHeaderRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 10,
  paddingHorizontal: 4,
},

transactionListContainer: {
  gap: 12, // khoảng cách giữa các transaction
},

transactionCard: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 12,
  borderRadius: 12,
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3, // hiệu ứng đổ bóng trên Android
},

});
