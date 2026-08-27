import React, { useState } from "react";
import { useVyapar } from "../context/VyaparContext";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import { aiAdvisorService } from "../services/aiAdvisorService";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function AiAdvisor() {
  const { input, financials } = useVyapar();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Namaste! I am your VyaparMitra AI Advisor. I have evaluated your proposed ${input.category} business in ${input.village}, ${input.block} (${input.district}). Based on your margin capital of ₹${input.marginCapital.toLocaleString("en-IN")}, you are auto-routed to the ${financials.scheme.name} with maximum financing of ₹${financials.maxLoanAmount.toLocaleString("en-IN")}. How can I assist your feasibility strategy today?`,
      time: "Just now",
    },
  ]);

  const [userInputText, setUserInputText] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputText.trim()) return;

    const userText = userInputText;
    const userMsg: ChatMessage = {
      sender: "user",
      text: userText,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInputText("");

    try {
      // Build brief chat history
      const historyStr = messages.slice(-4).map(m => `${m.sender}: ${m.text}`).join("\n");
      const responseText = await aiAdvisorService.generateChatResponse(input, userText, historyStr);
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: responseText,
          time: "Just now",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I am currently experiencing connection issues. Please try again later.",
          time: "Just now",
        },
      ]);
    }
  };

  return (
    <>
      <PageMeta
        title="AI Business Advisor | VyaparMitra"
        description="NLP-powered multilingual AI business assistant providing contextual guidance and business consultation."
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Business Advisor
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Multilingual AI interactive assistant tailored to your hyper-local economic setup and business parameters.
            </p>
          </div>
        </div>

        {/* Business Summary Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">
                Active Business Context
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {input.category} • {input.village}, {input.block}, {input.district}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                Scheme: {financials.scheme.name}
              </span>
              <span className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">
                Max Loan: ₹{financials.maxLoanAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* NLP Multilingual AI Assistant Chat Window */}
        <ComponentCard title="🤖 Interactive AI Business Advisory Assistant">
          <div className="flex flex-col h-[480px]">
            {/* Message History */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-brand-500 text-white rounded-br-none"
                        : "bg-white text-gray-900 shadow-sm border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 rounded-bl-none"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-4 mb-1">
                      <span className="font-bold opacity-80">
                        {msg.sender === "user" ? "You (Entrepreneur)" : "VyaparMitra AI"}
                      </span>
                      <span className="text-[10px] opacity-60">{msg.time}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Prompts */}
            <div className="flex flex-wrap gap-2 py-3">
              <button
                type="button"
                onClick={() => setUserInputText("What are the biggest supply chain risks in my area?")}
                className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                ❓ Ask about supply chain risks
              </button>
              <button
                type="button"
                onClick={() => setUserInputText("How does the 6-month moratorium work?")}
                className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                ❓ How does moratorium work?
              </button>
              <button
                type="button"
                onClick={() => setUserInputText("What pricing per unit gives best profitability?")}
                className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                ❓ Recommended pricing guidance
              </button>
              <button
                type="button"
                onClick={() => setUserInputText("What subsidies or government schemes can I leverage in Gujarat?")}
                className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                ❓ Gujarat specific schemes & subsidies
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={userInputText}
                onChange={(e) => setUserInputText(e.target.value)}
                placeholder="Ask VyaparMitra AI a question about your business plan in Gujarati, Hindi, English, etc..."
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition"
              >
                Send →
              </button>
            </form>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
