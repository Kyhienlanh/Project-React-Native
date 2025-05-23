type RootStackParamList = {
  BottomTabNavigator: undefined;
  loginNote: undefined;
  RegisterNote: undefined;
  category:undefined|{  onSelectCategory: (category: { categoryId: string; type: 'income' | 'expense' }) => void};
  addcategory:undefined;
  chooseIcon:{ onSelectIcon: (iconName: string) => void } ;
  detailTransactions:{id:string};
  Chart:{selectedMonth:number};
  Transactions:undefined;
  CreateBudget:undefined;
  forgotPassword:undefined;
  info:undefined;
  AllTrans:undefined;
  Mess:undefined;
  Chat:undefined;
};
