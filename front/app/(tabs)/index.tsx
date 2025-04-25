import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Linking, // ✅ Import Linking
} from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');

    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: question }]);

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnswer(data.response);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'ai', text: data.response },
        ]);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Welcome! Please ask your Question about the I-130 form</Text>
        <View style={styles.chatContainer}>
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
          {loading && <ActivityIndicator size="large" color="#00ff99" />}
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </ScrollView>

      <View style={styles.inputDownloadContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            placeholderTextColor="#aaa"
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <TouchableOpacity
            onPress={askQuestion}
            style={[styles.sendButton, !question.trim() && styles.disabledButton]}
            disabled={!question.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Updated PDF Link Button */}
        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.uscis.gov/sites/default/files/document/forms/i-130.pdf')}
          style={styles.downloadButton}
        >
          <Text style={styles.downloadButtonText}>Open PDF Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080e20',
    justifyContent: 'flex-end',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
    textAlign: 'center',
  },
  chatContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: width - 80,
    padding: 12,
    borderRadius: 15,
    marginVertical: 6,
    marginHorizontal: 10,
  },
  userMessage: {
    backgroundColor: '#0b845c',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#088f4e',
  },
  aiMessage: {
    backgroundColor: '#1173d0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#f0f0f0',
  },
  inputDownloadContainer: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    paddingLeft: 15,
    backgroundColor: '#2c2c2c',
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#0b845c',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  sendButtonText: {
    color: '#ffff',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  error: {
    color: '#ff5555',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  downloadButton: {
    backgroundColor: '#1173d0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
