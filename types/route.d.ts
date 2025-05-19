type RootStackParamList = {
  BottomTabNavigator: undefined;
  loginNote: undefined;
  RegisterNote: undefined;
  category:undefined|{ onSelectCategory: (category: string) => void };
  addcategory:undefined;
  chooseIcon:{ onSelectIcon: (iconName: string) => void } ;
};
