import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Button,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const API_KEY = 'AIzaSyCg3EqNru0Snzaf-rXSP0bH1Pr4717cnVo';

const ScreenChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const userId = auth().currentUser?.uid || '';

  // ** Context để lưu dữ liệu "ẩn" gửi kèm cho bot **
  const [context, setContext] = useState<string>('');

  // Lấy dữ liệu transaction
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('transaction')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              idTransaction: doc.id,
              amount: d.amount || 0,
              note: d.note || '',
              type: d.type,
              date: d.date,
              createdAt: d.createdAt,
              userId: d.userId,
              imageUrl: d.imageUrl || null,
              spentWith: d.spentWith || '',
              seen: d.seen,
              category: {
                id: d.category?.id || '',
                name: d.category?.name || '',
                icon: d.category?.icon || 'card-outline',
                color: d.category?.color || '#A5D6A7',
              },
            };
          });

          setTransactions(data);

          // Tạo chuỗi context gửi ẩn, ví dụ:
          const contextString = data
            .map(
              (tx) =>
                `Giao dịch: ${tx.type} ${tx.amount} VND, ghi chú: ${tx.note}, ngày: ${new Date(tx.date).toLocaleDateString()}`
            )
            .join('\n');
          setContext(contextString);
        },
        (error) => {
          console.error('Lỗi khi theo dõi giao dịch:', error);
        }
      );

    return () => unsubscribe();
  }, [userId]);

  // Hàm gửi message, gửi kèm context ẩn
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Thêm tin nhắn người dùng hiển thị
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    const promptText = input;
    setInput('');

    // Gửi API với context + input của user
    try {
      const combinedPrompt = context
        ? `Dưới đây là dữ liệu giao dịch của người dùng:\n${context}\n\nCâu hỏi của người dùng: ${promptText}`
        : promptText;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: combinedPrompt }],
              },
            ],
          }),
        }
      );

      const json = await response.json();

      if (
        json.candidates &&
        json.candidates.length > 0 &&
        json.candidates[0].content &&
        json.candidates[0].content.parts &&
        json.candidates[0].content.parts.length > 0
      ) {
        const botReply = json.candidates[0].content.parts[0].text;

        setMessages((prev) => [...prev, { role: 'bot', content: botReply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: 'Xin lỗi, tôi không hiểu câu hỏi của bạn.' },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Có lỗi xảy ra khi gọi API.' },
      ]);
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.chatContainer}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.role === 'user' ? styles.userMsg : styles.botMsg,
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập câu hỏi..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <Button title="Gửi" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ScreenChat;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  chatContainer: { flex: 1, marginBottom: 12 },
  message: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMsg: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  botMsg: {
    backgroundColor: '#EEE',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: '#CCC',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
});
