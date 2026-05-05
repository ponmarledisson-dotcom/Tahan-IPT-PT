"use client";
import { useState } from "react";
import Link from "next/link";

const MOCK_MESSAGES = [
  {
    id: 1,
    sender: "Admin",
    text: "Hi! Welcome to TAHAN Boarding House. Let me know if you need anything.",
    time: "9:00 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Me",
    text: "Hi! Thank you. I just moved in and I was wondering about the WiFi password?",
    time: "9:05 AM",
    isMe: true,
  },
  {
    id: 3,
    sender: "Admin",
    text: "Of course! The WiFi name is TAHAN_House and the password is tahan2024. Let me know if it works.",
    time: "9:07 AM",
    isMe: false,
  },
  {
    id: 4,
    sender: "Me",
    text: "It works, thank you so much!",
    time: "9:10 AM",
    isMe: true,
  },
  {
    id: 5,
    sender: "Admin",
    text: "Great! Also just a reminder, rent is due on the 1st of every month. You can pay via GCash or cash directly.",
    time: "9:12 AM",
    isMe: false,
  },
  {
    id: 6,
    sender: "Me",
    text: "Got it. I already submitted a maintenance request for the leaking faucet by the way.",
    time: "9:15 AM",
    isMe: true,
  },
  {
    id: 7,
    sender: "Admin",
    text: "Yes I saw that! We already have someone coming to fix it this Thursday. Sorry for the inconvenience.",
    time: "9:17 AM",
    isMe: false,
  },
  {
    id: 8,
    sender: "Me",
    text: "No worries, thank you for the quick response!",
    time: "9:20 AM",
    isMe: true,
  },
  {
    id: 9,
    sender: "Admin",
    text: "Anytime! Feel free to message me here if you have any concerns. 😊",
    time: "9:21 AM",
    isMe: false,
  },
];

export default function MessagesPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "Me",
        text: input.trim(),
        time: new Date().toLocaleTimeString("en-PH", {
          hour: "numeric",
          minute: "2-digit",
        }),
        isMe: true,
      },
    ]);
    setInput("");
  };

  return (
    <main className="min-h-screen bg-[#fdf6ec] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#ede0d0] px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link
          href="/dashboard"
          className="text-[#9c8878] hover:text-[#5c3d2e] transition text-lg"
        >
          ←
        </Link>
        <div className="w-10 h-10 rounded-full bg-[#3b2314] text-white flex items-center justify-center font-bold text-sm shrink-0">
          A
        </div>
        <div>
          <p className="font-bold text-[#3b2314] text-sm">Admin</p>
          <p className="text-xs text-green-500 font-semibold">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3 max-w-2xl w-full mx-auto">
        {/* Date divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#e8ddd0]" />
          <span className="text-xs text-[#b5a598] font-semibold">Today</span>
          <div className="flex-1 h-px bg-[#e8ddd0]" />
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-end gap-2 max-w-xs lg:max-w-md ${msg.isMe ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              {!msg.isMe && (
                <div className="w-7 h-7 rounded-full bg-[#3b2314] text-white flex items-center justify-center text-xs font-bold shrink-0 mb-1">
                  A
                </div>
              )}
              <div>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.isMe
                      ? "bg-[#5c3d2e] text-white rounded-br-sm"
                      : "bg-white border border-[#ede0d0] text-[#3b2314] rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <p
                  className={`text-xs text-[#b5a598] mt-1 ${msg.isMe ? "text-right" : "text-left"}`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#ede0d0] px-4 py-3 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 rounded-full border border-[#d6c4b0] bg-[#fff8f0] text-sm text-[#3b2314] outline-none focus:ring-2 focus:ring-[#5c3d2e]/30"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-[#5c3d2e] text-white flex items-center justify-center hover:bg-[#7a5240] transition shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </main>
  );
}
