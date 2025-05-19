import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const iconList = [
  'briefcase-outline', 'refresh-outline', 'home-outline', 'pie-chart-outline',
  'barbell-outline', 'sparkles-outline', 'pricetags-outline', 'receipt-outline',
  'business-outline', 'cut-outline', 'airplane-outline', 'shield-checkmark-outline',
  'flash-outline', 'water-outline', 'construct-outline', 'bicycle-outline',
  'shirt-outline', 'card-outline', 'restaurant-outline', 'car-outline','camera-outline',"pizza-outline",'pint-outline','umbrella-outline',
  'game-controller-outline','diamond-outline','extension-puzzle-outline','football-outline'
];

const ScreenchooseIcon = ({ navigation, route }: any) => {
  const handleIconSelect = (iconName: string) => {
    if (route.params?.onSelectIcon) {
      route.params.onSelectIcon(iconName);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn biểu tượng</Text>
      <FlatList
        data={iconList}
        keyExtractor={(item) => item}
        numColumns={4}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => handleIconSelect(item)}
          >
            <Ionicons name={item as any} size={30} color="#333" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ScreenchooseIcon;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    margin: 10,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
