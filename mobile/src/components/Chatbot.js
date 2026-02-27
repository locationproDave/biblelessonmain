import React, { useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Modal, 
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { chatbotAPI } from '../services/api';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { MessageCircle, X, Send, BookOpen, Sparkles, RefreshCw } from 'lucide-react-native';

const QUICK_QUESTIONS = [
  { id: 1, text: 'How do I sign up for an account?', icon: 'user' },
  { id: 2, text: "I can't log in to my account", icon: 'login' },
  { id: 3, text: 'What can I do on this site?', icon: 'help' },
  { id: 4, text: 'How do I create a lesson?', icon: 'book' },
];

export function Chatbot() {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`mobile-${Date.now()}`);
  const scrollViewRef = useRef(null);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(text, sessionId);
      const assistantMessage = { role: 'assistant', content: response.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: "I'm having trouble connecting. Please try again later." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.gradientBlue, colors.gradientPurple, colors.gradientPink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <MessageCircle size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.chatContainer, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <LinearGradient
              colors={[colors.gradientBlue, colors.gradientPurple, colors.gradientPink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chatHeader}
            >
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Sparkles size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Help Assistant</Text>
                  <Text style={styles.headerSubtitle}>Ask me anything about the app</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                {messages.length > 0 && (
                  <TouchableOpacity onPress={resetChat} style={styles.headerButton}>
                    <RefreshCw size={18} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.headerButton}>
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Messages */}
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.chatContent}
            >
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.length === 0 ? (
                  <View style={styles.welcomeContainer}>
                    <View style={[styles.welcomeIcon, { backgroundColor: colors.gradientPurple + '20' }]}>
                      <BookOpen size={32} color={colors.gradientPurple} />
                    </View>
                    <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                      Welcome to Bible Lesson Planner!
                    </Text>
                    <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                      How can I help you today?
                    </Text>

                    {/* Quick Questions */}
                    <View style={styles.quickQuestions}>
                      {QUICK_QUESTIONS.map((q) => (
                        <TouchableOpacity
                          key={q.id}
                          style={[styles.quickQuestion, { 
                            backgroundColor: colors.background,
                            borderColor: colors.surfaceBorder 
                          }]}
                          onPress={() => sendMessage(q.text)}
                        >
                          <Text style={[styles.quickQuestionText, { color: colors.text }]}>
                            {q.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  messages.map((msg, index) => (
                    <View
                      key={index}
                      style={[
                        styles.messageBubble,
                        msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                        { 
                          backgroundColor: msg.role === 'user' 
                            ? colors.gradientPurple 
                            : colors.background 
                        }
                      ]}
                    >
                      <Text style={[
                        styles.messageText,
                        { color: msg.role === 'user' ? '#fff' : colors.text }
                      ]}>
                        {msg.content}
                      </Text>
                    </View>
                  ))
                )}

                {isLoading && (
                  <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="small" color={colors.gradientPurple} />
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <View style={[styles.inputContainer, { 
                backgroundColor: colors.surface,
                borderTopColor: colors.surfaceBorder 
              }]}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Type your question..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    color: colors.text 
                  }]}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  onPress={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  style={{ opacity: input.trim() && !isLoading ? 1 : 0.5 }}
                >
                  <LinearGradient
                    colors={[colors.gradientBlue, colors.gradientPurple]}
                    style={styles.sendButton}
                  >
                    <Send size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 1000,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: '85%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  chatContent: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  welcomeTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
  },
  quickQuestions: {
    width: '100%',
    gap: Spacing.sm,
  },
  quickQuestion: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  quickQuestionText: {
    fontSize: FontSizes.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: BorderRadius.sm,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: BorderRadius.sm,
  },
  messageText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
