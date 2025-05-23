import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const ScreenforgotPassword = () => {
  const navigation: NavigationProp<any> = useNavigation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reauthModalVisible, setReauthModalVisible] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    const user = auth().currentUser;

    if (user) {
      try {
        await user.updatePassword(newPassword);
        Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.');
        navigation.goBack();
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          setReauthModalVisible(true); // yêu cầu xác thực lại
        } else {
          Alert.alert('Lỗi', error.message);
        }
      }
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy người dùng.');
    }
  };

  const handleReauthenticate = async () => {
    const user = auth().currentUser;

    if (user && user.email) {
      const credential = auth.EmailAuthProvider.credential(user.email, reauthPassword);

      try {
        await user.reauthenticateWithCredential(credential);
        setReauthModalVisible(false);
        handleChangePassword(); 
      } catch (error: any) {
        Alert.alert('Lỗi xác thực lại', 'Mật khẩu không chính xác hoặc có lỗi xảy ra.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi Mật Khẩu</Text>

      <TextInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Xác nhận</Text>
      </TouchableOpacity>

      {/* Modal xác thực lại */}
      <Modal
        visible={reauthModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReauthModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác thực lại</Text>
            <TextInput
              placeholder="Nhập lại mật khẩu"
              secureTextEntry
              style={styles.input}
              value={reauthPassword}
              onChangeText={setReauthPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleReauthenticate}>
              <Text style={styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReauthModalVisible(false)}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScreenforgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2e86de',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});
