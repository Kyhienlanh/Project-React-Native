import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Transaction } from '../types/Transaction';

type BudgetItem = {
  id: string;
  name: string;
  limit: number;
  selectedLabel: string;
  startDate: Date;
  endDate: Date;
};

const primaryColor = '#4CAF50'; // xanh lá chuẩn Material Design
const backgroundColor = '#FAFAFA'; // nền sáng nhẹ

const ScreenReports = () => {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const user = auth().currentUser;
  const userId = user?.uid;

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa ngân sách này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('budgets').doc(budgetId).delete();
              if (selectedBudget?.id === budgetId) {
                setSelectedBudget(null);
              }
            } catch (error) {
              console.error('Lỗi khi xóa ngân sách:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const fetchTransactions = async () => {
    if (!selectedBudget || !userId) return;

    try {
      const startDateStr = selectedBudget.startDate.toISOString().split('T')[0];
      const endDateStr = selectedBudget.endDate.toISOString().split('T')[0];

      const querySnapshot = await firestore()
        .collection('transaction')
        .where('userId', '==', userId)
        .where('type', '==', 'expense')
        .where('date', '>=', startDateStr)
        .where('date', '<=', endDateStr)
        .get();

      const list: Transaction[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          idTransaction: doc.id,
          amount: data.amount,
          note: data.note,
          type: data.type,
          date: data.date,
          createdAt: data.createdAt,
          userId: data.userId,
          imageUrl: data.imageUrl,
          spentWith: data.spentWith,
          category: data.category,
        });
      });

      setTransactions(list);
    } catch (error) {
      console.error('Lỗi khi lấy giao dịch:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedBudget]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = firestore()
      .collection('budgets')
      .where('userId', '==', userId)
      .onSnapshot(snapshot => {
        const list: BudgetItem[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          list.push({
            id: doc.id,
            name: data.name,
            limit: data.limit,
            selectedLabel: data.selectedLabel || 'Không xác định',
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
          });
        });
        setBudgets(list);
        if (list.length > 0 && !selectedBudget) {
          setSelectedBudget(list[0]);
        }
      });

    return () => unsubscribe();
  }, [userId]);

  const totalBudgetLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateBudget')}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.createButtonText}>Tạo ngân sách</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Chọn ngân sách:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {budgets.map(budget => {
          const isSelected = selectedBudget?.id === budget.id;
          return (
            <TouchableOpacity
              key={budget.id}
              style={[styles.labelButton, isSelected && styles.labelButtonSelected]}
              onPress={() => setSelectedBudget(budget)}
              onLongPress={() => handleDeleteBudget(budget.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.labelText, isSelected && styles.labelTextSelected]}>
                {budget.selectedLabel}
              </Text>
              <View style={styles.budgetInfo}>
                <Ionicons
                  name="wallet-outline"
                  size={16}
                  color={isSelected ? '#A5D6A7' : '#4A4A4A'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.limitText, isSelected && styles.labelTextSelected]}>
                  {budget.name}: {budget.limit.toLocaleString()} đ
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedBudget && (
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>Chi tiết ngân sách đã chọn</Text>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={20} color={primaryColor} />
            <Text style={styles.detailText}>
              Thời gian: {selectedBudget.startDate.toLocaleDateString('vi-VN')} -{' '}
              {selectedBudget.endDate.toLocaleDateString('vi-VN')}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="cash-outline" size={20} color={primaryColor} />
            <Text style={styles.detailText}>Hạn mức: {selectedBudget.limit.toLocaleString()} đ</Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="trending-up-outline" size={20} color={primaryColor} />
            <Text style={[styles.detailText, { fontWeight: '700' }]}>
              Tổng chi tiêu: {totalSpent.toLocaleString()} đ
            </Text>
          </View>

          <Text
            style={[
              styles.detailText,
              { fontWeight: '700', marginTop: 8 },
              totalSpent > selectedBudget.limit ? { color: '#D32F2F' } : { color: '#388E3C' },
            ]}
          >
            {totalSpent > selectedBudget.limit ? 'Bạn đã vượt hạn mức!' : 'Bạn đang trong hạn mức'}
          </Text>
        </View>
      )}

      {transactions.length > 0 && (
        <View style={styles.transactionsContainer}>
          <Text style={styles.detailTitle}>Danh sách chi tiêu</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {transactions.map(tx => (
              <View key={tx.idTransaction} style={styles.transactionItem}>
                <View style={styles.transactionRow}>
                  <Ionicons name="card-outline" size={18} color="#4CAF50" />
                  <Text style={styles.transactionAmount}>
                    {tx.amount.toLocaleString()} đ
                  </Text>
                </View>
                <View style={styles.transactionRow}>
                  <Ionicons name="pricetag-outline" size={16} color="#757575" />
                  <Text style={styles.transactionCategory}>
                    {tx.category?.name || '-'}
                  </Text>
                </View>
                <View style={styles.transactionRow}>
                  <Ionicons name="calendar-outline" size={16} color="#757575" />
                  <Text style={styles.transactionDate}>
                    {new Date(tx.date).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default ScreenReports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
    padding: 16,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  scrollContainer: {
    maxHeight: 110,
    marginBottom: 16,
  },
  labelButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 16,
    justifyContent: 'center',
    minWidth: 160,
    elevation: 2,
  },
  labelButtonSelected: {
    backgroundColor: primaryColor,
    elevation: 6,
  },
  labelText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'center',
  },
  labelTextSelected: {
    color: '#fff',
  },
  limitText: {
    fontSize: 14,
    color: '#388E3C',
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  detailBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2E7D32',
  },
  detailText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#4A4A4A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionsContainer: {
    marginTop: 20,
  },
  transactionItem: {
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  transactionAmount: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#388E3C',
    fontSize: 16,
  },
  transactionCategory: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6D6D6D',
  },
  transactionDate: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6D6D6D',
  },
});
