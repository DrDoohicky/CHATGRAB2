import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  RotateCcw,
  Zap,
  ShieldAlert,
  FileSpreadsheet,
  Settings,
  Copy,
  Check,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  GripHorizontal,
  BarChart2
} from 'lucide-react';
import { MarkdownView } from './MarkdownView';
import { ConversationThread } from '../types';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export type BotRole = 'copilot' | 'critic' | 'synthesizer' | 'fast';

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  activeThread: ConversationThread | null;
  onOpenAnalysis?: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  activeThread,
  onOpenAnalysis,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: activeThread
        ? `Hello! I'm your **Gemini Continuity Assistant**. I am grounded in your captured thread: **${activeThread.title}**.\n\nAsk me to continue the conversation, write code implementations, critique decisions, or run deep analysis!`
        : `Hello! I'm your **Gemini Assistant**. Capture a ChatGPT share URL to analyze and continue conversations, or ask me any questions directly!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<BotRole>('copilot');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [groundInThread, setGroundInThread] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Microphone (Speech-to-Text) state
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Speaker (Text-to-Speech) state
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Draggable Window Position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize position to bottom-right on mount/open
  useEffect(() => {
    if (isOpen && !position) {
      const defaultX = Math.max(20, window.innerWidth - 490);
      const defaultY = Math.max(20, window.innerHeight - 660);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update welcome message if thread changes and chat is fresh
  useEffect(() => {
    if (messages.length <= 1 && activeThread) {
      setMessages([
        {
          id: `welcome-${activeThread.id}`,
          role: 'assistant',
          content: `Hello! I am grounded in your captured thread: **${activeThread.title}**.\n\nHow can I help you take these insights further?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [activeThread]);

  // Dragging event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking the header area (not buttons or inputs)
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    const currentX = position?.x || (window.innerWidth - 490);
    const currentY = position?.y || (window.innerHeight - 660);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: currentX,
      startY: currentY,
    };
    setIsDragging(true);
  };

  // Touch dragging event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea')) {
      return;
    }
    const touch = e.touches[0];
    const currentX = position?.x || Math.max(10, window.innerWidth - 490);
    const currentY = position?.y || Math.max(10, window.innerHeight - 660);

    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      startX: currentX,
      startY: currentY,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(10, Math.min(window.innerWidth - 470, dragStartRef.current.startX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.startY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.mouseX;
      const deltaY = touch.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(10, Math.min(window.innerWidth - 470, dragStartRef.current.startX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.startY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Microphone: Speech-to-Text
  const toggleMicrophone = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setInput((prev) => (prev ? `${prev} [Voice input not supported in browser]` : '[Voice input not supported in browser]'));
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  // Speaker: Text-to-Speech
  const toggleSpeech = (msgId: string, rawText: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown formatting characters for clean speech
    const cleanText = rawText
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_>~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (speakingId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      let threadContext = undefined;
      if (groundInThread && activeThread) {
        threadContext = {
          title: activeThread.title,
          model: activeThread.model,
          summary: activeThread.insights?.summary,
          keyTakeaways: activeThread.insights?.keyTakeaways,
          snippet: activeThread.messages.map((m) => `${m.role}: ${m.content.slice(0, 300)}`).join('\n---\n'),
        };
      }

      const targetModel = role === 'fast' ? 'gemini-3.1-flash-lite' : selectedModel;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          role,
          model: targetModel,
          threadContext,
          customSystemInstruction: customSystemPrompt.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Chat request failed');
      }

      const botMessage: ChatMessageItem = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Error**: ${err.message || 'Unable to connect to Gemini API. Please try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (speakingId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: `fresh-${Date.now()}`,
        role: 'assistant',
        content: `Chat history reset. Ready to dive into **${activeThread?.title || 'your queries'}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const roleMeta: Record<BotRole, { name: string; icon: React.ReactNode; desc: string; defaultModel: string }> = {
    copilot: {
      name: 'Continuity Co-pilot',
      icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" />,
      desc: 'Extends architectures, writes code, continues thread logic',
      defaultModel: 'gemini-3.8-flash',
    },
    critic: {
      name: 'Socratic Red-Teamer',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />,
      desc: 'Challenges premises, flags vulnerabilities, stress-tests',
      defaultModel: 'gemini-3.8-flash',
    },
    synthesizer: {
      name: 'Executive Synthesizer',
      icon: <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />,
      desc: 'Condenses into PRDs, roadmaps, stakeholder updates',
      defaultModel: 'gemini-3.8-flash',
    },
    fast: {
      name: 'Rapid Assistant',
      icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
      desc: 'Instant, concise answers with low latency',
      defaultModel: 'gemini-3.1-flash-lite',
    },
  };

  return (
    <div
      ref={windowRef}
      style={{
        transform: position ? `translate(${position.x}px, ${position.y}px)` : undefined,
        top: 0,
        left: 0,
      }}
      className={`fixed z-50 w-full max-w-[460px] h-[640px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden transition-shadow ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-500/50 select-none' : ''
      }`}
    >
      {/* Draggable Top Header */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-b border-slate-800 cursor-grab active:cursor-grabbing select-none"
        title="Click and drag to move window around"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-slate-400 opacity-60" />
          <div className="w-7 h-7 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs tracking-wide">Gemini Assistant</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded border border-blue-400/20">
                {role === 'fast' ? 'gemini-3.1-flash-lite' : selectedModel}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate max-w-[170px]">
              {roleMeta[role].name}
            </p>
          </div>
        </div>

        {/* Action Controls in Header: Analysis Button, Settings, Reset, Close */}
        <div className="flex items-center gap-1.5 text-slate-300">
          {/* Analysis Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenAnalysis) {
                onOpenAnalysis();
              } else {
                handleSend('Generate an executive analysis with key takeaways, decisions, and action items for this thread.');
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/40 hover:bg-blue-600/70 text-blue-100 text-xs font-semibold border border-blue-400/40 transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Open Deep Analysis dashboard"
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-300" />
            <span>Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showConfig ? 'bg-white/20 text-white' : 'hover:bg-white/10'
            }`}
            title="Bot Persona & Model Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role & Settings Configuration Drawer */}
      {showConfig && (
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Select Chatbot Persona & Role:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(roleMeta) as BotRole[]).map((rKey) => (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => {
                    setRole(rKey);
                    if (rKey === 'fast') setSelectedModel('gemini-3.1-flash-lite');
                  }}
                  className={`p-2 rounded-xl border text-left flex items-start gap-1.5 transition-all cursor-pointer ${
                    role === rKey
                      ? 'bg-white border-blue-500 ring-1 ring-blue-500 text-slate-900 shadow-xs'
                      : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <span className="mt-0.5">{roleMeta[rKey].icon}</span>
                  <div>
                    <p className="font-bold text-[11px] leading-tight">{roleMeta[rKey].name}</p>
                    <p className="text-[10px] text-slate-400 leading-snug line-clamp-1">{roleMeta[rKey].desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex-1">
              <label className="font-semibold text-slate-800 block text-[11px] mb-0.5">
                Model Engine:
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (General / Balanced)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
                <option value="gemini-4-argon">gemini-4-argon (Complex Reasoning)</option>
              </select>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 mt-3">
              <input
                type="checkbox"
                id="ground-context-chk"
                checked={groundInThread}
                onChange={(e) => setGroundInThread(e.target.checked)}
                className="rounded text-blue-600 cursor-pointer"
              />
              <label htmlFor="ground-context-chk" className="text-[11px] font-medium text-slate-700 cursor-pointer">
                Ground in active thread
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Grounding Context Indicator Ribbon */}
      {groundInThread && activeThread && (
        <div className="px-3.5 py-1.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-800">
          <span className="truncate max-w-[340px]">
            Context: <strong className="font-semibold">{activeThread.title}</strong>
          </span>
          <span className="font-mono text-[10px] bg-blue-200/60 px-1.5 py-0.2 rounded text-blue-900">
            {activeThread.messages.length} msgs
          </span>
        </div>
      )}

      {/* Messages Scrollable Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;
          const isSpeaking = speakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#0e274c] text-white rounded-br-xs'
                    : `bg-white border text-slate-800 rounded-bl-xs ${
                        isSpeaking ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-200'
                      }`
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-70">
                  <span className="font-semibold">{isUser ? 'You' : 'Gemini'}</span>
                  <div className="flex items-center gap-1.5">
                    {/* Read Out Aloud Speaker Button (Assistant only) */}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => toggleSpeech(msg.id, msg.content)}
                        className={`p-0.5 rounded transition-colors cursor-pointer ${
                          isSpeaking ? 'text-blue-600 font-bold animate-pulse' : 'hover:text-blue-600'
                        }`}
                        title={isSpeaking ? 'Stop reading' : 'Read aloud with Speaker'}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <span>{msg.timestamp}</span>

                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                      title="Copy message"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <MarkdownView content={msg.content} />
                    {isSpeaking && (
                      <div className="mt-2 pt-1.5 border-t border-blue-100 flex items-center gap-1.5 text-[10px] text-blue-600 font-medium">
                        <Volume2 className="w-3 h-3 animate-bounce" />
                        <span>Speaking response aloud...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-lg bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-slate-400 text-xs italic p-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Gemini ({roleMeta[role].name}) is generating...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recording listening indicator */}
      {isRecording && (
        <div className="px-3.5 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-700 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="font-semibold">Listening to voice... speak now</span>
          </div>
          <button
            type="button"
            onClick={toggleMicrophone}
            className="text-[11px] font-bold text-rose-800 hover:underline cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* Quick Prompts Bar (Thread Grounded) */}
      {messages.length <= 2 && activeThread && !isRecording && (
        <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-medium">Suggestions:</span>
          {[
            '📊 Deep Thread Analysis',
            'Slice into Adaptive Portions',
            'Continue technical architecture',
            'What are the key decisions?',
            'Generate implementation code',
          ].map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(promptText)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors cursor-pointer shadow-2xs font-medium"
            >
              {promptText}
            </button>
          ))}
        </div>
      )}

      {/* Input Form with Microphone & Send */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isRecording
                  ? 'Listening to speech...'
                  : `Ask ${roleMeta[role].name} (or click mic to talk)...`
              }
              className="w-full p-2.5 pr-10 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`absolute right-2.5 bottom-2.5 p-1.5 rounded-lg transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white shadow-md animate-pulse'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200/60'
              }`}
              title={isRecording ? 'Stop Voice Input' : 'Voice Input (Microphone)'}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
            title="Send message"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
