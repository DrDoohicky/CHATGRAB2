export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  model?: string;
}

export interface ThreadInsights {
  summary: string;
  keyTakeaways: string[];
  actionItems: { task: string; done?: boolean; context?: string }[];
  concepts: { name: string; description: string; category?: string }[];
  qaIndex: { question: string; answer: string }[];
  reintegrationPrompts: { label: string; prompt: string; targetTool: string }[];
  tags: string[];
}

export interface ConversationThread {
  id: string;
  title: string;
  sourceUrl?: string;
  capturedAt: string;
  originalCreatedAt?: string;
  model: string;
  messages: ChatMessage[];
  insights?: ThreadInsights;
  isFavorite?: boolean;
}

export interface CorpusQueryResponse {
  answer: string;
  relevantThreadIds: string[];
  keyQuotes: { threadTitle: string; quote: string }[];
}

export interface AdaptivePortion {
  id: string;
  title: string;
  summary: string;
  startIndex: number;
  endIndex: number;
  messageCount: number;
  keyTopics: string[];
  tone?: string;
  decisions: string[];
}

export interface DeepAnalysisResult {
  keyInsightsCount: number;
  keyInsightsList: string[];
  contradictions: {
    claimA: string;
    claimB: string;
    explanation: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  conceptDrift: {
    concept: string;
    initialMeaning: string;
    evolvedMeaning: string;
    shiftContext: string;
  }[];
  sourcesReferenced: {
    name: string;
    type: string;
    context: string;
  }[];
  themes: {
    name: string;
    percentage: number;
    color: string;
  }[];
}

