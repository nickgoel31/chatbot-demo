import { useState, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import Chatbot from "./components/Chatbot";
import ChatbotButton from "./components/ChatbotButton";
import { Lead } from "./types/index";

const initialLeads: Lead[] = [
  { id: "L001", name: "Rahul Sharma", course: "Computer Science", source: "Facebook Ads", status: "New", date: "2026-05-01", phone: "+91 98765 43210", feePaid: false },
  { id: "L002", name: "Priya Patel", course: "Business Admin", source: "Google Search", status: "Interested", date: "2026-05-02", phone: "+91 87654 32109", feePaid: false },
  { id: "L003", name: "Amit Kumar", course: "Mechanical Eng", source: "Referral", status: "Contacted", date: "2026-05-03", phone: "+91 76543 21098", feePaid: false },
  { id: "L004", name: "Sneha Reddy", course: "Data Science", source: "LinkedIn", status: "Enrolled", date: "2026-05-01", phone: "+91 65432 10987", feePaid: true },
  { id: "L005", name: "Vikram Singh", course: "Civil Eng", source: "College Fair", status: "Waitlisted", date: "2026-04-28", phone: "+91 54321 09876", feePaid: false },
];

export default function App() {
  const [admissionsOpen, setAdmissionsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const toggleAdmissions = useCallback(() => {
    setAdmissionsOpen((prev) => !prev);
    if (!admissionsOpen) setSupportOpen(false); // Close other if opening
  }, [admissionsOpen]);

  const toggleSupport = useCallback(() => {
    setSupportOpen((prev) => !prev);
    if (!supportOpen) setAdmissionsOpen(false); // Close other if opening
  }, [supportOpen]);

  const handleUpdateLeadStatus = useCallback((leadId: string, status: string) => {
    setLeads((prev) => 
      prev.map((l) => l.id === leadId ? { ...l, status: status as any } : l)
    );
  }, []);

  const handleUpdateLeadName = useCallback((leadId: string, name: string) => {
    setLeads((prev) => 
      prev.map((l) => l.id === leadId ? { ...l, name } : l)
    );
  }, []);

  const handleUpdateFeeStatus = useCallback((leadId: string, feePaid: boolean) => {
    setLeads((prev) => 
      prev.map((l) => l.id === leadId ? { ...l, feePaid } : l)
    );
  }, []);

  const handleAddLead = useCallback((lead: Omit<Lead, "id" | "date">) => {
    const newLead: Lead = {
      ...lead,
      id: `L00${leads.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: "New"
    } as any;
    setLeads((prev) => [newLead, ...prev]);
  }, [leads.length]);

  return (
    <div className="relative">
      <Dashboard leads={leads} />
      
      {/* Admissions Agent */}
      <Chatbot 
        type="admissions"
        isOpen={admissionsOpen} 
        onClose={() => setAdmissionsOpen(false)} 
        leads={leads}
        onUpdateLeadStatus={handleUpdateLeadStatus}
        onUpdateLeadName={handleUpdateLeadName}
        onUpdateFeeStatus={handleUpdateFeeStatus}
        onAddLead={handleAddLead}
      />
      
      {/* Student Support Agent */}
      <Chatbot 
        type="support"
        isOpen={supportOpen} 
        onClose={() => setSupportOpen(false)} 
        leads={leads}
      />

      <ChatbotButton 
        type="admissions" 
        isOpen={admissionsOpen} 
        onClick={toggleAdmissions} 
        unreadCount={admissionsOpen ? 0 : 1} 
      />

      <ChatbotButton 
        type="support" 
        isOpen={supportOpen} 
        onClick={toggleSupport} 
        unreadCount={supportOpen ? 0 : 1} 
      />
    </div>
  );
}
