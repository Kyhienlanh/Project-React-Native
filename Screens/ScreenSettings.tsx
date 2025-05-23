import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Alert,
} from 'react-native'
import { useTheme }  from './ThemeContext'

const ScreenSettings = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme() // 👈 Lấy từ context

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.text }]}>Nguyễn Văn A</Text>
        <Text style={[styles.email, { color: theme.text + '99' }]}>vana@example.com</Text>
      </View>

      {/* Settings Options */}
      <View style={[styles.options, { backgroundColor: theme.card }]}>
        <SettingOption label="👤 Hồ sơ cá nhân" onPress={() => {}} textColor={theme.text} />
        <SettingOption label="🔔 Thông báo" onPress={() => {}} textColor={theme.text} />
        <SettingOption label="🔒 Đổi mật khẩu" onPress={() => {}} textColor={theme.text} />

        {/* Dark mode toggle */}
        <View style={styles.option}>
          <Text style={[styles.optionText, { color: theme.text }]}>🔄 Bật Dark mode</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        {/* Language */}
        <SettingOption
          label="🌐 Chọn ngôn ngữ"
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
          onPress={() => {}}
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
