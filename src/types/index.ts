export interface Lead {
  id: string;
  name: string;
  course: string;
  source: string;
  status: "New" | "Contacted" | "Interested" | "Enrolled" | "Waitlisted";
  date: string;
  phone?: string;
  feePaid?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "tool";
  content: any;
  timestamp: Date;
  toolCalls?: any[];
}

export interface MockTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  execute: (args: any) => Promise<string>;
}

export interface KnowledgeEntry {
  title: string;
  content: string;
  category: string;
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isProcessing: boolean;
  apiKey: string;
}
