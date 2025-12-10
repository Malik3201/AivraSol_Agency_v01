import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/cn'
import { API_BASE } from '@/lib/config'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

/**
 * Call backend AI assistant endpoint
 */
async function sendToAI(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/aiva/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to get AI response')
    }

    const data = await response.json()
    
    if (data.success && data.content) {
      return data.content
    }
    
    // Fallback if response format is unexpected
    return data.content || "I apologize, but I couldn't process that request. Please try again."
    
  } catch (error) {
    console.error('AI Backend Error:', error)
    throw error
  }
}

export function Aiva() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize with greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: '👋 Hi there! I\'m **Aiva** — your AI guide at AivraSol. How can I help you today?\n\nYou can ask me about:\n• Our services and expertise\n• Portfolio and past projects\n• Technologies we use\n• Getting a quote or consultation',
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  /**
   * Send message to AI assistant via backend
   */
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call backend AI endpoint with conversation history
      const aiResponse = await sendToAI([...messages, userMessage])

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error communicating with AI:', error)
      
      // Fallback error message
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to explore our services and portfolio directly on the website. You can also reach out to our team through the contact form!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Avatar Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 h-14 w-14 md:h-16 md:w-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary/80"></div>
        </motion.div>

        {/* Pulsing rings */}
        <motion.div
          className="absolute inset-0 h-14 w-14 md:h-16 md:w-16 rounded-full border-2 border-primary/40"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary via-[#2BB673] to-[#1F9960] shadow-2xl transition-all hover:shadow-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 group overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {/* Inner circle background */}
          <div className="absolute inset-2 rounded-full bg-bg/20 backdrop-blur-sm" />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-10"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1,
            }}
          />

          {/* Glowing core */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary"
            animate={{
              boxShadow: [
                '0 0 20px rgba(43, 182, 115, 0.4)',
                '0 0 40px rgba(43, 182, 115, 0.8)',
                '0 0 20px rgba(43, 182, 115, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Bot icon with animation - Made more prominent */}
          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-20"
          >
            {/* White background circle for icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-white/90 shadow-lg" />
            </div>
            
            {/* Bot icon */}
            <Bot className="h-7 w-7 md:h-9 md:w-9 text-primary relative z-10 drop-shadow-md" strokeWidth={2.5} />
            
            {/* Small sparkle icon */}
            <motion.div
              className="absolute -top-0.5 -right-0.5 z-20"
              animate={{
                rotate: [0, 180, 360],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-amber rounded-full blur-sm" />
                <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber relative z-10" fill="currentColor" />
              </div>
            </motion.div>
          </motion.div>

          {/* Particles effect on hover */}
          <motion.div
            className="absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  background: i % 2 === 0 ? '#2BB673' : '#E9A23B',
                }}
                animate={{
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 25],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 25],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        </motion.button>

        {/* Status indicator dot */}
        <motion.div
          className="absolute bottom-0 right-0 h-3 w-3 md:h-4 md:w-4 rounded-full bg-amber border-2 border-bg shadow-lg"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 flex h-[500px] md:h-[600px] w-[calc(100vw-32px)] md:w-[400px] max-h-[calc(100vh-100px)] flex-col overflow-hidden rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-5 w-5 text-bg" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-strong">Aiva</h3>
                  <p className="text-xs text-text-muted">AivraSol AI Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5',
                      message.role === 'user'
                        ? 'bg-primary text-bg'
                        : 'bg-card text-text-strong border border-border/50'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm [&_p]:mb-2 [&_p]:last:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:hover:underline">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                className="text-primary hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p {...props} className="mb-2 last:mb-0" />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul {...props} className="list-disc pl-4 mb-2" />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol {...props} className="list-decimal pl-4 mb-2" />
                            ),
                            li: ({ node, ...props }) => (
                              <li {...props} className="mb-1" />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong {...props} className="font-semibold" />
                            ),
                            em: ({ node, ...props }) => (
                              <em {...props} className="italic" />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-card border border-border/50 px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-strong placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-bg transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

