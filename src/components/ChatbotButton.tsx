import { cn } from "../utils/cn";

interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
  type: "admissions" | "support";
}

export default function ChatbotButton({ isOpen, onClick, unreadCount = 0, type }: ChatbotButtonProps) {
  const isAdmissions = type === "admissions";
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
        isAdmissions ? "bottom-6 right-24" : "bottom-6 right-6",
        isOpen
          ? "bg-slate-200 text-slate-600 shadow-md rotate-0"
          : isAdmissions 
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200"
            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-200"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      ) : (
        <span className="text-xl font-bold">{isAdmissions ? "AD" : "SS"}</span>
      )}

      {/* Unread badge */}
      {!isOpen && unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {/* Pulsing ring */}
      {!isOpen && (
        <span className={cn(
          "absolute inset-0 animate-ping rounded-full opacity-20",
          isAdmissions ? "bg-blue-400" : "bg-emerald-400"
        )} />
      )}
    </button>
  );
}
