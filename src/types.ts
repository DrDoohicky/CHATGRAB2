export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  model?: string;
  sourceThreadId?: string;
  sourceMessageId?: string;
}

export interface RetrospectiveFinding {
  type: 'correction' | 'contradiction' | 'drift' | 'completion_claim' | 'unsupported_claim' | 'decision' | 'accomplishment' | 'attribution' | 'unresolved';
  title: string;
  context: string;
  earlierPosition?: string;
  laterPosition?: string;
  humanPrompt?: string;
  evidenceMessageIds?: string[];
  confidence?: 'low' | 'medium' | 'high';
}

export interface ThreadInsights {
  summary: string;
  keyTakeaways: string[];
  actionItems: { task: string; done?: boolean; context?: string }[];
  concepts: { name: string; description: string; category?: string }[];
  qaIndex: { question: string; answer: string }[];
  reintegrationPrompts: { label: string; prompt: string; targetTool: string }[];
  tags: string[];
  retrospective?: RetrospectiveFinding[];
}

export interface MergeSource {
  id: string;
  title: string;
  capturedAt: string;
  label: string;
  messageCount: number;
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
  renamedAt?: string;
  supportAssetIds?: string[];
  reintegrationMeta?: {purpose: string; conflictReview: string; destinationId?: string; status: 'active' | 'withdrawn'; sources: {threadId: string; messageId: string}[]};
  mergeMeta?: {
    kind: 'derived_context_merge';
    preservesSources: true;
    sources: MergeSource[];
  };
}

export interface SupportAsset {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  originalModifiedAt?: string;
  kind: 'supplementary' | 'chat_artifact' | 'generated_media' | 'evidence' | 'other';
  notes?: string;
  linkedThreadId?: string;
  linkedThreadTitle?: string;
  textPreview?: string;
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
