import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Transaction } from '../types/Transaction';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
  labelColor: () => '#000',
  strokeWidth: 2,
  barPercentage: 0.7,
};

const getCategoryTotals = (data: Transaction[], type: 'income' | 'expense') => {
  const filtered = data.filter((t) => t.type === type);
  const totals: { [key: string]: { name: string; amount: number; color: string } } = {};

  filtered.forEach((t) => {
    const catId = t.category.id;
    if (!totals[catId]) {
      totals[catId] = {
        name: t.category.name,
        amount: 0,
        color: t.category.color || '#3498db',
      };
    }
    totals[catId].amount += Math.abs(t.amount);
  });

  const totalAmount = Object.values(totals).reduce((sum, item) => sum + item.amount, 0);

  return Object.values(totals).map((item) => ({
    name: item.name,
    amount: parseFloat(((item.amount / totalAmount) * 100).toFixed(2)), // Phần trăm
    color: item.color,
    legendFontColor: '#333',
    legendFontSize: 13,
  }));
};

const getSummary = (data: Transaction[]) => {
  let income = 0;
  let expense = 0;

  data.forEach((t) => {
    if (t.type === 'income') income += t.amount;
    else expense += Math.abs(t.amount);
  });

  return {
    labels: ['Thu', 'Chi'],
    datasets: [
      {
        data: [income, expense],
      },
    ],
  };
};

const ScreenChart = () => {
  const route: RouteProp<RootStackParamList, 'Chart'> = useRoute();
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const { selectedMonth } = route.params;

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('transaction')
      .onSnapshot((querySnapshot) => {
        const list: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Transaction;
          const date = new Date(data.date);
          if (date.getMonth() === selectedMonth) {
            list.push(data);
          }
        });
        setTransactions(list);
      });

    return () => unsubscribe();
  }, [selectedMonth]);

  const incomeData = getCategoryTotals(transactions, 'income');
  const expenseData = getCategoryTotals(transactions, 'expense');
  const summaryData = getSummary(transactions);

  return (
    // Thêm vào trong phần return của ScreenChart
<ScrollView style={styles.container}>
  {/* Tổng Thu & Chi */}
  <View style={styles.card}>
    <Text style={styles.title}>Biểu đồ Tổng Thu & Chi</Text>
    <BarChart
      data={summaryData}
      width={screenWidth - 64}
      height={220}
      chartConfig={chartConfig}
      fromZero={true}
      showValuesOnTopOfBars={true}
      yAxisLabel="₫"
      yAxisSuffix=""
      style={styles.chart}
    />
  </View>

  {/* Thu theo Mục */}
  <View style={styles.card}>
    <Text style={styles.title}>Biểu đồ Thu</Text>
    {incomeData.length > 0 ? (
      <PieChart
        data={incomeData}
        width={screenWidth - 64}
        height={220}
        chartConfig={chartConfig}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />
    ) : (
      <Text style={styles.emptyText}>Không có dữ liệu thu</Text>
    )}
  </View>

  {/* Chi theo Mục */}
  <View style={styles.card}>
    <Text style={styles.title}>Biểu đồ Chi</Text>
    {expenseData.length > 0 ? (
      <PieChart
        data={expenseData}
        width={screenWidth - 64}
        height={220}
        chartConfig={chartConfig}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={styles.chart}
      />
    ) : (
      <Text style={styles.emptyText}>Không có dữ liệu chi</Text>
    )}
  </View>
</ScrollView>

  );
};

export default ScreenChart;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f6f8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 12,
  },
  chart: {
    alignSelf: 'center',
  },
});
