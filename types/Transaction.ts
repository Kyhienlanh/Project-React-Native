import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Transaction {
  amount: number;
  note: string;
  type: 'income' | 'expense';
  date: string; 
  createdAt: FirebaseFirestoreTypes.Timestamp; 
  userId: string;
  imageUrl: string | null;
  spentWith: string;
  category: Category;
}
