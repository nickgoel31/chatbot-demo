import { useState, useRef, useEffect, useMemo } from "react";
import Anthropic from "@anthropic-ai/sdk";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../utils/cn";
import { mockTools } from "../data/mockTools";
import { Lead, Message } from "../types/index";

export type ChatbotType = "admissions" | "support";

interface ChatbotProps {
  type: ChatbotType;
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onUpdateLeadStatus?: (id: string, status: string) => void;
  onUpdateLeadName?: (id: string, name: string) => void;
  onUpdateFeeStatus?: (id: string, feePaid: boolean) => void;
  onAddLead?: (lead: any) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const SYSTEM_PROMPTS = {
  admissions: `You are a helpful Education Admissions Assistant for I.T.S Ghaziabad.
You help admissions officers manage student leads and answer applicant queries.

You have access to CRM tools:
- get_leads: Get recent student applications.
- update_lead_status: Update student admission status.
- update_lead_name: Change or fix a student's name.
- update_fee_status: Mark fees as paid or unpaid.
- call_student: Initiate an AI call to a student.
- get_student_info: View detailed student profile.
- search_knowledge_base: Answer questions about courses.

IMPORTANT: Use Markdown tables for lead lists. Use resolveLeadId logic for names.`,

  support: `You are a Student Support Agent for I.T.S Ghaziabad.
Your goal is to help prospective and current students with information about the college.

You should:
1. Answer questions about Courses, Fees, Eligibility, and Campus life.
2. Use the search_knowledge_base tool to find accurate information.
3. If a student is interested, encourage them to apply.
4. Be warm, welcoming, and informative.

Note: You do NOT have tools to modify student records, but you can search for info.`
};

export default function Chatbot({ type, isOpen, onClose, leads, onUpdateLeadStatus, onUpdateLeadName, onUpdateFeeStatus, onAddLead }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content: type === "admissions" 
        ? "👋 I'm your Admissions Assistant. How can I help you manage your students today?" 
        : "👋 Hi! I'm the Student Support Agent. Do you have questions about courses, fees, or campus life at I.T.S?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resolveLeadId = (idOrName: string): string => {
    const lead = (leads || []).find(l => 
      l.id.toLowerCase() === idOrName.toLowerCase() || 
      l.name.toLowerCase().includes(idOrName.toLowerCase())
    );
    return lead ? lead.id : idOrName;
  };

  const anthropicTools: any[] = useMemo(() => {
    // Support only needs search and basic info
    const allowedTools = type === "support" 
      ? ["search_knowledge_base", "get_student_info"]
      : mockTools.map(t => t.id);

    return mockTools
      .filter(t => allowedTools.includes(t.id))
      .map((tool) => {
        let properties: Record<string, any> = {};
        let required: string[] = [];

        if (tool.id === "get_leads") {
          properties = {};
        } else if (tool.id === "update_lead_status") {
          properties = { 
            leadId: { type: "string", description: "The ID of the lead, e.g. L001" },
            status: { type: "string", description: "New status: New, Contacted, Interested, Enrolled, Waitlisted" }
          };
          required = ["leadId", "status"];
        } else if (tool.id === "update_lead_name") {
          properties = { 
            leadId: { type: "string", description: "The ID of the lead" },
            name: { type: "string", description: "The new name of the student" }
          };
          required = ["leadId", "name"];
        } else if (tool.id === "update_fee_status") {
          properties = { 
            leadId: { type: "string", description: "The ID of the lead" },
            feePaid: { type: "boolean", description: "Whether the fee is paid" }
          };
          required = ["leadId", "feePaid"];
        } else if (tool.id === "call_student") {
          properties = { leadId: { type: "string", description: "The ID of the student to call" } };
          required = ["leadId"];
        } else if (tool.id === "add_lead_note") {
          properties = { 
            leadId: { type: "string", description: "The ID of the lead" },
            note: { type: "string", description: "The interaction note to add" }
          };
          required = ["leadId", "note"];
        } else if (tool.id === "get_student_info") {
          properties = { studentId: { type: "string", description: "The ID of the student" } };
          required = ["studentId"];
        } else if (tool.id === "search_knowledge_base") {
          properties = { query: { type: "string", description: "The search query" } };
          required = ["query"];
        }

        return {
          name: tool.id,
          description: tool.description,
          input_schema: {
            type: "object",
            properties,
            required,
          },
        };
      });
  }, [type]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newUserMsg: Message = {
      id: generateId(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("API key missing.");

      const client = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPTS[type],
        messages: [
          ...messages
            .filter(m => m.role !== "tool" && m.id !== (messages[0]?.id || ""))
            .map(m => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          { role: "user", content: userMessage }
        ],
        tools: anthropicTools,
      });

      let assistantContent = "";
      let toolCalls: any[] = [];

      for (const content of response.content) {
        if (content.type === "text") assistantContent += content.text;
        else if (content.type === "tool_use") toolCalls.push(content);
      }

      if (toolCalls.length > 0) {
        const assistantMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: assistantContent || "Processing request...",
          timestamp: new Date(),
          toolCalls,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        for (const toolUse of toolCalls) {
          let result = "";
          
          if (toolUse.name === "get_leads" && type === "admissions") {
            result = `| ID | Name | Course | Status | Fee Paid |
|---|---|---|---|---|
${(leads || []).map(l => `| ${l.id} | ${l.name} | ${l.course} | ${l.status} | ${l.feePaid ? "✅ Paid" : "❌ Pending"} |`).join("\n")}`;
          } else if (toolUse.name === "update_lead_status" && onUpdateLeadStatus) {
            const actualId = resolveLeadId(toolUse.input.leadId);
            onUpdateLeadStatus(actualId, toolUse.input.status);
            result = `✅ Status updated for ${actualId}.`;
          } else if (toolUse.name === "update_lead_name" && onUpdateLeadName) {
            const actualId = resolveLeadId(toolUse.input.leadId);
            onUpdateLeadName(actualId, toolUse.input.name);
            result = `✅ Name updated for ${actualId}.`;
          } else if (toolUse.name === "update_fee_status" && onUpdateFeeStatus) {
            const actualId = resolveLeadId(toolUse.input.leadId);
            onUpdateFeeStatus(actualId, toolUse.input.feePaid);
            result = `✅ Fee status updated for ${actualId}.`;
          } else {
            const tool = mockTools.find(t => t.id === toolUse.name);
            if (tool) result = await tool.execute(toolUse.input);
          }

          const finalResponse = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: SYSTEM_PROMPTS[type],
            messages: [
              ...messages
                .filter(m => m.role !== "tool" && m.id !== (messages[0]?.id || ""))
                .map(m => ({
                  role: m.role as "user" | "assistant",
                  content: m.content,
                })),
              { role: "user", content: userMessage },
              { role: "assistant", content: response.content },
              { role: "user", content: [{ type: "tool_result", tool_use_id: toolUse.id, content: result }] },
            ] as any,
          });

          const finalContent = finalResponse.content.find(c => c.type === 'text')?.text || "Done.";
          setMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: finalContent, timestamp: new Date() }]);
        }
      } else {
        setMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: assistantContent, timestamp: new Date() }]);
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: `❌ Error: ${error.message}`, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed z-50 flex h-[750px] w-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 sm:right-6",
      type === "admissions" ? "bottom-24 right-[540px]" : "bottom-24 right-6"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-6 py-4 text-white",
        type === "admissions" ? "bg-gradient-to-r from-blue-600 to-indigo-700" : "bg-gradient-to-r from-emerald-600 to-teal-700"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold backdrop-blur-sm">
            {type === "admissions" ? "AD" : "SS"}
          </div>
          <div>
            <h3 className="font-semibold text-base">{type === "admissions" ? "Admissions Assistant" : "Student Support"}</h3>
            <p className="text-[10px] opacity-80 uppercase tracking-wider">I.T.S Ghaziabad</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex flex-col", message.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                  "max-w-[90%] rounded-2xl px-5 py-3 text-sm shadow-sm",
                  message.role === "user"
                    ? (type === "admissions" ? "bg-blue-600 text-white rounded-tr-none" : "bg-emerald-600 text-white rounded-tr-none")
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                )}>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{typeof message.content === 'string' ? message.content : "Thinking..."}</ReactMarkdown>
                </div>
                {message.toolCalls && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    {message.toolCalls.map((call: any) => (
                      <div key={call.id} className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                        Processing: {call.name.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="mt-1.5 text-[10px] text-slate-400 px-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {isLoading && !messages[messages.length - 1]?.toolCalls && (
            <div className="flex items-start gap-2">
              <div className="flex gap-1.5 rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-slate-100 bg-white px-5 py-4">
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {(type === "admissions" ? [
            { label: "Show Leads", icon: "👥" },
            { label: "Call Student", icon: "📞" },
            { label: "Fee Status", icon: "💰" },
          ] : [
            { label: "Courses Info", icon: "🎓" },
            { label: "Fee Structure", icon: "💰" },
            { label: "Scholarships", icon: "🌟" },
          ]).map((action) => (
            <button
              key={action.label}
              onClick={() => setInput(action.label)}
              className="flex whitespace-nowrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 bg-white p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={type === "admissions" ? "Manage admissions..." : "Ask support..."}
            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all shadow-md hover:shadow-lg active:scale-95",
              type === "admissions" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
