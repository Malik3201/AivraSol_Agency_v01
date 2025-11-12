import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/cn'
import { getServices, getProjects, getTestimonials, getKnowledge, getCategories } from '@/api/client'
import type { ServiceDto, ProjectDto, TestimonialDto, KnowledgeDto } from '@/api/schemas'

const GEMINI_API_KEY = 'AIzaSyCOC369SvktPO-3_5ZbKP7pBMEobvkaDe0'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

let lastGeminiRequestTime = 0

async function requestGemini(payload: unknown, retries = 3): Promise<any> {
  let attempt = 0
  let delay = 1000

  while (attempt <= retries) {
    try {
      const now = Date.now()
      const elapsed = now - lastGeminiRequestTime
      if (elapsed < 1200) {
        await sleep(1200 - elapsed)
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      lastGeminiRequestTime = Date.now()

      if (response.status === 429) {
        if (attempt < retries) {
          await sleep(delay)
          attempt += 1
          delay *= 2
          continue
        }
        throw new RateLimitError()
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(errorText || 'Failed to get response from Gemini')
      }

      return (await response.json()) as any
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error
      }

      if (attempt < retries) {
        await sleep(delay)
        attempt += 1
        delay *= 2
        continue
      }

      if (error instanceof Error) {
        throw error
      }

      throw new Error('Network error')
    }
  }

  throw new Error('Failed to get response from Gemini')
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SiteData {
  services: ServiceDto[]
  projects: ProjectDto[]
  testimonials: TestimonialDto[]
  faqs: KnowledgeDto[]
  techStacks: string[]
}

export function Aiva() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [siteData, setSiteData] = useState<SiteData>({
    services: [],
    projects: [],
    testimonials: [],
    faqs: [],
    techStacks: [],
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch and cache site data on mount
  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const [servicesRes, projectsRes, testimonialsRes, faqsRes, techStacksRes] = await Promise.all([
          getServices(),
          getProjects(),
          getTestimonials(),
          getKnowledge(),
          getCategories({ type: 'tech' }),
        ])

        setSiteData({
          services: servicesRes.data || [],
          projects: projectsRes.data || [],
          testimonials: testimonialsRes.data || [],
          faqs: faqsRes.data || [],
          techStacks: techStacksRes.data?.map((t: { title: string }) => t.title) || [],
        })
      } catch (error) {
        console.error('Failed to load site data:', error)
        // Still allow chat even if data fails
      }
    }

    loadSiteData()
  }, [])

  // Initialize with greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: '👋 Hi there! I\'m **Aiva** — your AI guide at AivraSol. How can I help you today?',
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

  const getFallbackResponse = (userQuery: string): string => {
    const query = userQuery.toLowerCase()

    // Services related
    if (query.match(/\b(service|what do you|what can|offer|provide)\b/)) {
      const servicesList = siteData.services
        .slice(0, 5)
        .map((s) => `• **${s.title}**: ${s.summary || s.description}`)
        .join('\n')
      return `Great question! AivraSol specializes in professional web, AI, and software development. Here are some of our key services:\n\n${servicesList || 'Our services include web development, AI solutions, and custom software.'}\n\nWould you like to know more about any specific service?`
    }

    // Projects/Portfolio
    if (query.match(/\b(project|portfolio|work|built|example|case study)\b/)) {
      const projectsList = siteData.projects
        .slice(0, 3)
        .map((p) => `• **${p.title}**: ${p.summary}`)
        .join('\n')
      return `We've worked on some amazing projects! Here are a few highlights:\n\n${projectsList || 'We have an impressive portfolio of web, AI, and software projects.'}\n\nWould you like to explore our full portfolio?`
    }

    // Website request
    if (query.match(/\b(website|web app|site|landing page|web development)\b/)) {
      const webProjects = siteData.projects.filter(p => 
        p.title.toLowerCase().includes('web') || p.summary.toLowerCase().includes('web')
      ).slice(0, 2)
      const examples = webProjects.length > 0 
        ? `\n\nHere are some websites we've built:\n${webProjects.map(p => `• ${p.title}`).join('\n')}`
        : ''
      return `I'd love to help you with your website project! AivraSol builds modern, responsive websites tailored to your needs.${examples}\n\nWould you like me to connect you with our team for a free consultation?`
    }

    // AI related
    if (query.match(/\b(ai|artificial intelligence|machine learning|ml|chatbot)\b/)) {
      return `AivraSol specializes in AI solutions! We build intelligent systems including chatbots, machine learning models, and AI-powered applications.\n\nWe use cutting-edge technologies to solve real-world problems. Would you like to discuss an AI project with our team?`
    }

    // Contact/pricing
    if (query.match(/\b(contact|reach|email|phone|call|price|cost|quote|budget)\b/)) {
      return `I'd be happy to connect you with our team! You can reach us through our contact form, and we'll get back to you promptly.\n\nWe offer free consultations and custom quotes based on your project needs. Would you like me to guide you to our contact page?`
    }

    // Tech stack
    if (query.match(/\b(tech|technology|stack|tools|framework|language)\b/)) {
      const techList = siteData.techStacks.slice(0, 15).join(', ')
      return `We work with modern, industry-leading technologies including:\n\n${techList || 'React, Node.js, Python, AI/ML frameworks, and more'}\n\nWe choose the best tech stack for each project. What kind of technology are you interested in?`
    }

    // Generic/greeting
    if (query.match(/\b(hi|hello|hey|help|assist)\b/)) {
      return `Hello! 👋 I'm here to help you learn about AivraSol's services, projects, and expertise.\n\nYou can ask me about:\n• Our services and offerings\n• Portfolio and past projects\n• Technologies we use\n• Getting a quote or contacting the team\n\nWhat would you like to know?`
    }

    // Default fallback
    return `That's a great question! While I'm here to help you explore AivraSol's services and capabilities, I'd love to know more about what you're looking for.\n\nAre you interested in:\n• Building a website or web app?\n• AI/ML solutions?\n• Custom software development?\n• Viewing our portfolio?\n\nOr would you like me to connect you with our team directly?`
  }

  const buildContextPrompt = (): string => {
    const servicesList = siteData.services
      .slice(0, 10)
      .map((s) => `- ${s.title}: ${s.summary || s.description}`)
      .join('\n')

    const projectsList = siteData.projects
      .slice(0, 10)
      .map((p) => `- ${p.title}: ${p.summary}`)
      .join('\n')

    const techList = siteData.techStacks.slice(0, 20).join(', ')

    return `You are Aiva, the official AI assistant of AivraSol — a professional web, AI, and software agency.

You are friendly, intelligent, confident, and brand-aligned. You talk like a human brand representative — not robotic.

**Company Information:**
- AivraSol is a professional web, AI, and software development agency
- We specialize in web development, AI solutions, and custom software

**Available Services:**
${servicesList || 'Services data not available yet'}

**Portfolio Projects:**
${projectsList || 'Projects data not available yet'}

**Tech Stacks We Use:**
${techList || 'Tech stacks data not available yet'}

**Your Role:**
- Guide users about company services, portfolio, tech stacks, and processes
- If user says "I want a website", suggest relevant projects from portfolio
- If user says "I want to contact", mention they can use the contact form
- If user says "I want AI project", suggest AivraSol's AI services
- Always end with a helpful next step like "Would you like me to connect you with our team?" or "Here's a similar project we built..."
- If you don't have specific information, say: "I don't have that info yet, but I'll confirm with our development team."
- Keep responses simple, warm, and professional
- Don't invent facts about AivraSol
- If asked about unrelated topics, politely redirect: "That's an interesting question! My main focus is helping you explore AivraSol's services — would you like to see what we offer?"

**Current Conversation:**
${messages
  .map((m) => `${m.role === 'user' ? 'User' : 'Aiva'}: ${m.content}`)
  .join('\n')}

Now respond as Aiva to the user's latest message. Keep it conversational and helpful.`
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const contextPrompt = buildContextPrompt()
      const userQuery = userMessage.content

      const payload = {
        contents: [
          {
            parts: [
              {
                text: `${contextPrompt}\n\nUser: ${userQuery}\n\nAiva:`,
              },
            ],
          },
        ],
      }

      const data = await requestGemini(payload)
      const assistantContent =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm having trouble processing that right now. Could you try rephrasing your question?"

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Use fallback response when Gemini is unavailable
      const fallbackContent = getFallbackResponse(userMessage.content)
      
      const errorMessage: Message = {
        role: 'assistant',
        content: fallbackContent,
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

