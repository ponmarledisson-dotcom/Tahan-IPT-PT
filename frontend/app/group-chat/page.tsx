"use client";
import { useState } from "react";
import Link from "next/link";

const MEMBERS = [
  { name: "Admin", avatar: "A", color: "bg-[#3b2314]" },
  { name: "Marcus", avatar: "M", color: "bg-blue-600" },
  { name: "Sofia", avatar: "S", color: "bg-pink-500" },
  { name: "James", avatar: "J", color: "bg-green-600" },
  { name: "Lea", avatar: "L", color: "bg-purple-500" },
];

const MOCK_MESSAGES = [
  {
    id: 1,
    sender: "Admin",
    text: "Good morning everyone! 🌅 Just a reminder that water will be off from 10AM-12PM today for maintenance.",
    time: "8:00 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Sofia",
    text: "Thanks for the heads up Admin! I'll make sure to fill up some water before then.",
    time: "8:05 AM",
    isMe: false,
  },
  {
    id: 3,
    sender: "James",
    text: "Got it! Will there also be power interruption?",
    time: "8:07 AM",
    isMe: false,
  },
  {
    id: 4,
    sender: "Admin",
    text: "No power interruption, just water. Should be back by 12PM.",
    time: "8:10 AM",
    isMe: false,
  },
  {
    id: 5,
    sender: "Me",
    text: "Thank you for letting us know!",
    time: "8:12 AM",
    isMe: true,
  },
  {
    id: 6,
    sender: "Lea",
    text: "Also just wanted to ask, is the laundry area open on Sundays?",
    time: "8:15 AM",
    isMe: false,
  },
  {
    id: 7,
    sender: "Admin",
    text: "Yes Lea, the laundry area is open 7 days a week from 6AM to 9PM.",
    time: "8:17 AM",
    isMe: false,
  },
  {
    id: 8,
    sender: "Marcus",
    text: "Admin, the hallway light on the 2nd floor is out. Can someone fix it?",
    time: "9:00 AM",
    isMe: false,
  },
  {
    id: 9,
    sender: "Admin",
    text: "Thanks for letting me know Marcus! I'll have it replaced today.",
    time: "9:05 AM",
    isMe: false,
  },
  {
    id: 10,
    sender: "Sofia",
    text: "Also the hallway smells like something is burning near Room 202 😅",
    time: "9:10 AM",
    isMe: false,
  },
  {
    id: 11,
    sender: "Admin",
    text: "I'll check that right away. Thanks Sofia! Everyone please stay alert and message here if you notice anything unusual.",
    time: "9:12 AM",
    isMe: false,
  },
  {
    id: 12,
    sender: "James",
    text: "Will do! Thanks Admin 👍",
    time: "9:13 AM",
    isMe: false,
  },
  {
    id: 13,
    sender: "Me",
    text: "Same here, will keep an eye out!",
    time: "9:15 AM",
    isMe: true,
  },
  {
    id: 14,
    sender: "Lea",
    text: "Btw Admin, when is the next payment due?",
    time: "10:00 AM",
    isMe: false,
  },
  {
    id: 15,
    sender: "Admin",
    text: "Rent is due on June 1. I'll be sending individual payment reminders soon.",
    time: "10:02 AM",
    isMe: false,
  },
];

const memberMap = Object.fromEntries(MEMBERS.map((m) => [m.name, m]));

export default function GroupChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [showMembers, setShowMembers] = useState(false);

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

        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          {MEMBERS.slice(0, 4).map((m) => (
            <div
              key={m.name}
              className={`w-8 h-8 rounded-full ${m.color} text-white flex items-center justify-center text-xs font-bold border-2 border-white`}
            >
              {m.avatar}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-[#9c8878] text-white flex items-center justify-center text-xs font-bold border-2 border-white">
            +{MEMBERS.length - 4}
          </div>
        </div>

        <div className="flex-1">
          <p className="font-bold text-[#3b2314] text-sm">TAHAN Boarders</p>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="text-xs text-[#9c8878] hover:text-[#5c3d2e] transition"
          >
            {MEMBERS.length} members ▾
          </button>
        </div>
      </div>

      {/* Members dropdown */}
      {showMembers && (
        <div className="bg-white border-b border-[#ede0d0] px-6 py-3 max-w-2xl w-full mx-auto">
          <p className="text-xs font-bold text-[#9c8878] uppercase tracking-wide mb-2">
            Members
          </p>
          <div className="flex flex-wrap gap-2">
            {MEMBERS.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-1.5 bg-[#f5ede0] px-3 py-1 rounded-full"
              >
                <div
                  className={`w-5 h-5 rounded-full ${m.color} text-white flex items-center justify-center text-xs font-bold`}
                >
                  {m.avatar}
                </div>
                <span className="text-xs font-semibold text-[#3b2314]">
                  {m.name}
                </span>
                {m.name === "Admin" && (
                  <span className="text-xs text-[#9c8878]">· Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#e8ddd0]" />
          <span className="text-xs text-[#b5a598] font-semibold">Today</span>
          <div className="flex-1 h-px bg-[#e8ddd0]" />
        </div>

        {messages.map((msg) => {
          const member = memberMap[msg.sender];
          return (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-end gap-2 max-w-xs lg:max-w-md ${msg.isMe ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                {!msg.isMe && member && (
                  <div
                    className={`w-7 h-7 rounded-full ${member.color} text-white flex items-center justify-center text-xs font-bold shrink-0 mb-1`}
                  >
                    {member.avatar}
                  </div>
                )}
                <div>
                  {/* Sender name for others */}
                  {!msg.isMe && (
                    <p className="text-xs font-bold text-[#9c8878] mb-1 ml-1">
                      {msg.sender}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.isMe
                        ? "bg-[#5c3d2e] text-white rounded-br-sm"
                        : msg.sender === "Admin"
                          ? "bg-[#f5ede0] border border-[#d6c4b0] text-[#3b2314] rounded-bl-sm"
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
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#ede0d0] px-4 py-3 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message TAHAN Boarders…"
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
