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
  TouchableOpacity,Switch
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NavigationRouteContext, useFocusEffect } from '@react-navigation/native';
import { Transaction } from '../types/Transaction'; // đảm bảo file types đã đúng
import { useNavigation ,NavigationProp} from '@react-navigation/native';
import { useRoute, RouteProp} from '@react-navigation/native';
import { useTheme }  from './ThemeContext'


const ScreenSettings = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme() // 👈 Lấy từ context
    const user = auth().currentUser;
    const navigation: NavigationProp<RootStackParamList> = useNavigation();
    const [profileData, setProfileData] = useState<any>(null);
    useEffect(() => {
      const userId = auth().currentUser?.uid;

      if (!userId) return;

      const profileRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('infoUser')
        .doc('profile');

      const unsubscribe = profileRef.onSnapshot(doc => {
        if (doc.exists()) {
          setProfileData(doc.data());
        } else {
          console.log('Không có dữ liệu');
        }
      });

      return () => unsubscribe(); 
}, []);


    const handleLogout = async () => {
      try {
        await auth().signOut();
        navigation.reset({
          index: 0,
          routes: [{ name: 'loginNote' }], 
        });
      } catch (error) {
        console.error('Đăng xuất thất bại:', error);
        Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
      }
    };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Image
          source={{ uri: profileData?.avatar ?? 'null' }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.text }]}>{profileData?.fullName ?? 'Chưa có'}</Text>
        <Text style={[styles.email, { color: theme.text + '99' }]}>{auth().currentUser?.email}</Text>
      </View>

      {/* Settings Options */}
      <View style={[styles.options, { backgroundColor: theme.card }]}>
        <SettingOption label="👤 Hồ sơ cá nhân" onPress={() => navigation.navigate('info')} textColor={theme.text} />
        <SettingOption label="🔔 Tất cả giao dịch"onPress={() => {navigation.navigate('AllTrans')}} textColor={theme.text} />
        <SettingOption label="🔒 Đổi mật khẩu" onPress={() => {navigation.navigate('forgotPassword')}} textColor={theme.text} />

        {/* Dark mode toggle */}
        <View style={styles.option}>
          <Text style={[styles.optionText, { color: theme.text }]}>🔄 Bật Dark mode</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        {/* Language */}
        <SettingOption
          label="🌐 Ngôn ngữ"
          onPress={() => Alert.alert('Chọn ngôn ngữ', 'Chức năng đang phát triển')}
          textColor={theme.text}
        />

        {/* Terms */}
        <SettingOption
          label="📜 Điều khoản và Chính sách"
          onPress={() => Alert.alert('Thông báo', 'Liên kết đến trang chính sách')}
          textColor={theme.text}
        />

        {/* Logout */}
       <SettingOption
        label="🚪 Đăng xuất"
        onPress={handleLogout} 
        isLogout
        textColor={theme.text}
      />

      </View> 
    </ScrollView>
  )
}

const SettingOption = ({
  label,
  onPress,
  isLogout = false,
  textColor = '#333',
}: {
  label: string
  onPress: () => void
  isLogout?: boolean
  textColor?: string
}) => (
  <TouchableOpacity
    style={[styles.option, isLogout && styles.logout]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.optionText,
        { color: textColor },
        isLogout && styles.logoutText,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
)

export default ScreenSettings

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
  },
  options: {
    paddingVertical: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  logout: {
    backgroundColor: '#ffecec',
  },
  logoutText: {
    color: '#d9534f',
    fontWeight: 'bold',
  },
})
