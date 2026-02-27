/**
 * Help Chatbot Component
 * AI-powered floating chat bubble for user assistance
 */

import { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  HelpCircle,
  BookOpen,
  FileText,
  Download,
  WifiOff,
  ChevronRight,
  RefreshCw,
  LogIn,
  UserPlus,
  Mail,
  Settings,
  Star,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { useI18n } from '@/i18n'

// Use the same base URL as the rest of the app
const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SuggestedQuestion {
  id: string
  textKey: string
  category: string
  icon?: any
}

// Suggestions for logged OUT users
const GUEST_SUGGESTIONS: SuggestedQuestion[] = [
  { id: 'g1', textKey: 'chatbot.guest.signup', category: 'chatbot.category.account', icon: UserPlus },
  { id: 'g2', textKey: 'chatbot.guest.cantLogin', category: 'chatbot.category.account', icon: LogIn },
  { id: 'g3', textKey: 'chatbot.guest.whatCanIDo', category: 'chatbot.category.gettingStarted', icon: HelpCircle },
  { id: 'g4', textKey: 'chatbot.guest.tryWithoutSignup', category: 'chatbot.category.gettingStarted', icon: BookOpen },
  { id: 'g5', textKey: 'chatbot.guest.freeVsPremium', category: 'chatbot.category.gettingStarted', icon: Star },
  { id: 'g6', textKey: 'chatbot.guest.contactSupport', category: 'chatbot.category.support', icon: Mail },
]

// Suggestions for logged IN users
const USER_SUGGESTIONS: SuggestedQuestion[] = [
  { id: 'u1', textKey: 'chatbot.user.createLesson', category: 'chatbot.category.lessons', icon: BookOpen },
  { id: 'u2', textKey: 'chatbot.user.templates', category: 'chatbot.category.templates', icon: FileText },
  { id: 'u3', textKey: 'chatbot.user.exportPrint', category: 'chatbot.category.export', icon: Printer },
  { id: 'u4', textKey: 'chatbot.user.offlineMode', category: 'chatbot.category.offline', icon: WifiOff },
  { id: 'u5', textKey: 'chatbot.user.favorites', category: 'chatbot.category.lessons', icon: Star },
  { id: 'u6', textKey: 'chatbot.user.customize', category: 'chatbot.category.lessons', icon: Settings },
  { id: 'u7', textKey: 'chatbot.user.editLesson', category: 'chatbot.category.lessons', icon: BookOpen },
  { id: 'u8', textKey: 'chatbot.user.contactSupport', category: 'chatbot.category.support', icon: Mail },
]

// Category icons mapping
const categoryIcons: Record<string, any> = {
  'chatbot.category.gettingStarted': HelpCircle,
  'chatbot.category.account': UserPlus,
  'chatbot.category.templates': FileText,
  'chatbot.category.export': Printer,
  'chatbot.category.offline': WifiOff,
  'chatbot.category.lessons': BookOpen,
  'chatbot.category.support': Mail,
}

export function HelpChatbot() {
  const { data: session } = useSession()
  const { t } = useI18n()
  const isLoggedIn = !!session
  
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get suggestions based on login state
  const suggestions = isLoggedIn ? USER_SUGGESTIONS : GUEST_SUGGESTIONS

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const response = await fetch(`${API_BASE}/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: text.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('[Chatbot] Error:', error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: t('chatbot.errorMessage'),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleSuggestionClick = (textKey: string) => {
    sendMessage(t(textKey))
  }

  const resetChat = () => {
    setMessages([])
    setShowSuggestions(true)
  }

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-stone-700 hover:bg-stone-800 rotate-0' 
            : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:scale-110 shadow-purple-500/30'
        }`}
        aria-label={isOpen ? 'Close help chat' : 'Open help chat'}
        data-testid="help-chat-bubble"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Tooltip when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-24 z-50 bg-stone-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          {t('chatbot.needHelp')}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px] h-[500px] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
          data-testid="help-chat-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{t('chatbot.helpAssistant')}</h3>
                <p className="text-xs text-white/80">{t('chatbot.askMeAnything')}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Start new conversation"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                  {t('chatbot.welcomeTitle')}
                </h4>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                  {t('chatbot.welcomeSubtitle')}
                </p>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && messages.length === 0 && (
              <div className="space-y-2">
                {suggestions.map(q => {
                  const Icon = q.icon || categoryIcons[q.category] || HelpCircle
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSuggestionClick(q.textKey)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm text-stone-700 dark:text-stone-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors flex items-center gap-3 group border border-transparent hover:border-purple-200 dark:hover:border-purple-800/50"
                      data-testid={`suggestion-${q.id}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                        <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="flex-1">{t(q.textKey)}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Message History */}
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span className="text-sm text-stone-500">{t('chatbot.thinking')}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions after messages */}
          {messages.length > 0 && !isLoading && (
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                {showSuggestions ? t('chatbot.hideSuggestions') : t('chatbot.showSuggestions')}
              </button>
              {showSuggestions && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestions.slice(0, 4).map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s.textKey)}
                      className="text-xs px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                    >
                      {(() => {
                        const text = t(s.textKey)
                        return text.length > 25 ? text.substring(0, 25) + '...' : text
                      })()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chatbot.typeQuestion')}
                className="flex-1 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                disabled={isLoading}
                data-testid="chat-input"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                data-testid="chat-send-btn"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
