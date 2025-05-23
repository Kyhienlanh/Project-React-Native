import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PRIMARY_COLOR = '#8BC34A'; // xanh lá nhạt

const ScreenInfo = () => {
  const user = auth().currentUser;
  const userId = user?.uid || '';

  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    birthday: '',
    avatar: '',
  });

  const loadProfile = async () => {
    try {
      if (!userId) return;
      const doc = await firestore()
        .collection('users')
        .doc(userId)
        .collection('infoUser')
        .doc('profile')
        .get();

      if (doc.exists()) {
        const data = doc.data();
        setProfile({
          fullName: data?.fullName || '',
          phoneNumber: data?.phoneNumber || '',
          address: data?.address || '',
          birthday: data?.birthday || '',
          avatar: data?.avatar || '',
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin profile');
      console.error(error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const uploadImage = async (uri: string, userId: string): Promise<string> => {
    try {
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      const storageRef = storage().ref(`avatars/${userId}/${filename}`);
      await storageRef.putFile(uploadUri);
      const downloadURL = await storageRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.log('Upload image error:', error);
      throw error;
    }
  };

  const chooseAvatar = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) {
          // Hủy chọn ảnh
        } else if (response.errorCode) {
          Alert.alert('Lỗi', 'Không thể chọn ảnh');
        } else {
          const uri = response.assets && response.assets[0].uri;
          if (uri) {
            setProfile((prev) => ({ ...prev, avatar: uri }));
          }
        }
      }
    );
  };

  const saveProfile = async () => {
    try {
      if (!userId) return;
      let avatarUrl = profile.avatar;
      if (profile.avatar && profile.avatar.startsWith('file://')) {
        avatarUrl = await uploadImage(profile.avatar, userId);
      }
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('infoUser')
        .doc('profile')
        .set({ ...profile, avatar: avatarUrl });

      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin profile');
      console.error(error);
    }
  };

  // Component input với icon và label
  const InputField = ({
    iconName,
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
  }: {
    iconName: string;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: any;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={iconName} size={20} color={PRIMARY_COLOR} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          underlineColorAndroid="transparent"
        />
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={chooseAvatar} style={styles.avatarContainer} activeOpacity={0.7}>
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.noAvatar}>
            <Ionicons name="camera" size={40} color="#bbb" />
            <Text style={styles.noAvatarText}>Chọn ảnh đại diện</Text>
          </View>
        )}
      </TouchableOpacity>

      <InputField
        iconName="person-outline"
        label="Họ và tên"
        value={profile.fullName}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, fullName: text }))}
        placeholder="Nhập họ và tên"
      />

      <InputField
        iconName="call-outline"
        label="Số điện thoại"
        value={profile.phoneNumber}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, phoneNumber: text }))}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
      />

      <InputField
        iconName="location-outline"
        label="Địa chỉ"
        value={profile.address}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, address: text }))}
        placeholder="Nhập địa chỉ"
      />

      <InputField
        iconName="calendar-outline"
        label="Ngày sinh"
        value={profile.birthday}
        onChangeText={(text) => setProfile((prev) => ({ ...prev, birthday: text }))}
        placeholder="Nhập ngày sinh (VD: 01/01/1990)"
      />

      <TouchableOpacity style={styles.button} onPress={saveProfile} activeOpacity={0.8}>
        <Ionicons name="save-outline" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Lưu thông tin</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ScreenInfo;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fff7', // nền màu xanh lá nhạt rất nhẹ
    flexGrow: 1,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
  noAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#e0f2d7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c8e6a9',
  },
  noAvatarText: {
    color: '#7b9a3a',
    marginTop: 8,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#557a1f',
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#c8e6a9',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  button: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
