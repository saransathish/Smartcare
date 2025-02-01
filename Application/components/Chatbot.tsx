import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const ChatbotMobile: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      const savedSessionId = await AsyncStorage.getItem('chat_session_id');
      const newSessionId = savedSessionId || uuidv4();
      if (!savedSessionId) {
        await AsyncStorage.setItem('chat_session_id', newSessionId);
      }
      setSessionId(newSessionId);

      const savedChat = await AsyncStorage.getItem('chat_history');
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const saveMessages = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem('chat_history', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      saveMessages(newMessages);
      return newMessages;
    });
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          session_id: sessionId,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const botMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
        };

        setMessages((prev) => {
          const newMessages = [...prev, botMessage];
          saveMessages(newMessages);
          return newMessages;
        });
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get response from server');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await AsyncStorage.removeItem('chat_history');
      const newSessionId = uuidv4();
      await AsyncStorage.setItem('chat_session_id', newSessionId);
      setSessionId(newSessionId);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    clearChat();
    setRefreshing(false);
  }, []);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.message, isUser ? styles.userMessage : styles.assistantMessage]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        inverted={messages.length > 0}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4a90e2" />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your medical question..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4a90e2',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  userMessageText: {
    color: '#fff',
  },
  loadingContainer: {
    padding: 8,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatbotMobile;