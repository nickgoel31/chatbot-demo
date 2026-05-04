import type { MockTool } from "../types/index";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockTools: MockTool[] = [
  {
    id: "get_leads",
    name: "Get Leads",
    description: "Get a list of recent student leads and applications",
    icon: "👥",
    execute: async () => {
      await delay(800);
      return "Fetching leads..."; // Overridden in Chatbot.tsx for live data
    },
  },
  {
    id: "update_lead_status",
    name: "Update Lead Status",
    description: "Update the admission status of a student lead",
    icon: "🔄",
    execute: async () => {
      await delay(1000);
      return "Updating status..."; // Overridden in Chatbot.tsx for live data
    },
  },
  {
    id: "update_lead_name",
    name: "Update Lead Name",
    description: "Update the name of a student lead",
    icon: "✏️",
    execute: async () => {
      await delay(800);
      return "Updating name..."; // Overridden in Chatbot.tsx for live data
    },
  },
  {
    id: "update_fee_status",
    name: "Update Fee Status",
    description: "Update the fee payment status for a student",
    icon: "💰",
    execute: async () => {
      await delay(800);
      return "Updating fee status..."; // Overridden in Chatbot.tsx for live data
    },
  },
  {
    id: "call_student",
    name: "Call Student",
    description: "Initiate an AI-powered call to a student",
    icon: "📞",
    execute: async (args: Record<string, unknown>) => {
      await delay(1500);
      const { leadId } = args;
      return `📞 **Call Initiated**
- **Lead ID**: ${leadId}
- **Service**: Ringg AI
- **Status**: Connecting to student...
- **Timestamp**: ${new Date().toLocaleString()}

The student will be contacted shortly for follow-up.`;
    },
  },
  {
    id: "add_lead_note",
    name: "Add Lead Note",
    description: "Add an internal note or interaction log for a lead",
    icon: "📝",
    execute: async () => {
      await delay(600);
      return "Adding note..."; // Overridden in Chatbot.tsx for live data
    },
  },
  {
    id: "get_student_info",
    name: "Get Student Info",
    description: "Get detailed academic and contact info about a specific student",
    icon: "👤",
    execute: async () => {
      await delay(700);
      return "Fetching student info..."; // Overridden in Chatbot.tsx for live data
    },
  },
  {
    id: "search_knowledge_base",
    name: "Search Knowledge Base",
    description: "Search the admissions knowledge base for answers",
    icon: "🔍",
    execute: async (args: Record<string, unknown>) => {
      await delay(800);
      const query = (args.query as string) || "";
      return `
# Knowledge Base: Admissions GHZ

## Search Results for: "${query}"

1. **Course Eligibility**: B.Tech requires 60% in PCM. MBA requires 50% in Graduation.
2. **Scholarships**: Merit-based scholarships up to 50% for 90%+ scores.
3. **Fee Structure**: B.Tech is ₹1.5L/year. MBA is ₹1.2L/year.
4. **Hostel**: On-campus hostel available for boys and girls (₹80k/year).
5. **Placement**: 95% placement record for CS branch. Avg package ₹6.5 LPA.
`;
    },
  },
];

export function getToolById(id: string): MockTool | undefined {
  return mockTools.find((tool) => tool.id === id);
}

export function getToolByName(name: string): MockTool | undefined {
  const normalized = name.toLowerCase().replace(/\s+/g, "_");
  return mockTools.find(
    (tool) =>
      tool.id === normalized || tool.name.toLowerCase().includes(name.toLowerCase())
  );
}
