import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Animated,
  ViewStyle,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputContainerPosition = useRef(new Animated.Value(0)).current;

  // Predefined Q&A array
  const qaData: { question: string; answer: string }[] = [
    { question: "Can I schedule a Test drive", answer: "Absolutely! You can schedule a test drive with our test drive booking feature in the app" },
    { question: "What is the opening hours?", answer: "Our dealership is open Mon-Sat, 9am to 7pm." },
    { question: "Query about Used cars", answer: "We have a selection of certified pre-owned cars available." },
    { question: "Showroom location", answer: "Our showroom is located at various areas, we display the workshops and dealer on the basis of your current location in the radius of 50km by default." },
    { question: "Financing", answer: "Yes, we provide a lot of financing options." },
  ];

  const sendMessage = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    Keyboard.dismiss();

    // Find predefined answer
    const matchedQA = qaData.find(q => q.question.toLowerCase() === messageText.toLowerCase());
    const botReply = matchedQA
      ? matchedQA.answer
      : "Thank you for reaching out! Our dealer support will get back to you shortly regarding your query.";

    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bot", text: botReply }]);
      setLoading(false);
    }, 500);
  };

  const renderMessage = ({ item }: any) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={{ color: item.role === "user" ? "#fff" : "#000" }}>
        {item.text}
      </Text>
    </View>
  );

  // Keyboard animation
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      const moveDistance = event.endCoordinates.height;
      Animated.timing(inputContainerPosition, {
        toValue: -moveDistance,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(inputContainerPosition, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [inputContainerPosition]);

  // Scroll to bottom on new message
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <LottieView
          source={require('../../../assets/lottie/bubble.json')}
          autoPlay
          loop
          style={styles.avatar}
        />
        <Text style={styles.headerText}>Hey! How can I assist you today?</Text>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ padding: 22, paddingBottom: 200 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Input and Predefined Questions Container */}
      <Animated.View 
        style={[
          styles.inputFixedContainer,
          { transform: [{ translateY: inputContainerPosition }] }
        ]}
      >
        {/* Predefined Questions */}
        <View style={styles.predefinedContainer}>
          <View style={styles.predefinedWrapper}>
            {qaData.map((qa, index) => (
              <TouchableOpacity
                key={index}
                style={styles.predefinedButton}
                onPress={() => sendMessage(qa.question)}
              >
                <Text style={styles.predefinedText}>{qa.question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#555"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            multiline={false}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            style={[styles.sendButton, loading && { opacity: 0.6 }]}
            disabled={loading}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#f8f9fa" },
  headerText: { color: "#171C8F", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  avatar: { width: 60, height: 60, borderRadius: 25 },
  messagesContainer: { flex: 1 },
  messageBubble: { padding: 12, borderRadius: 20, marginVertical: 6, maxWidth: "80%" },
  userBubble: { backgroundColor: "#171C8F", alignSelf: "flex-end", borderBottomRightRadius: 0 },
  botBubble: { backgroundColor: "#E9ECEF", alignSelf: "flex-start", borderBottomLeftRadius: 0 },
  inputFixedContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", paddingBottom: 10, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderColor: "#ddd", paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#fff", height: 65 } as ViewStyle,
  input: { flex: 1, height: 45, backgroundColor: "#f1f3f5", borderRadius: 25, paddingHorizontal: 16, fontSize: 15, color: "#000" },
  sendButton: { backgroundColor: "#171C8F", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, marginLeft: 8 },
  sendText: { color: "#fff", fontWeight: "bold" },
  predefinedContainer: { backgroundColor: "#f8f9fa", paddingVertical: 15, paddingHorizontal: 10 },
  predefinedWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  predefinedButton: { backgroundColor: "#E9ECEF", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 5 },
  predefinedText: { color: "#171C8F", fontWeight: "500", fontSize: 12 },
});
