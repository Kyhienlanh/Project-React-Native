type RootStackParamList = {
  BottomTabNavigator: undefined;
  loginNote: undefined;
  RegisterNote: undefined;
  category:undefined|{  onSelectCategory: (category: { categoryId: string; type: 'income' | 'expense' }) => void};
  addcategory:undefined;
  chooseIcon:{ onSelectIcon: (iconName: string) => void } ;
};
