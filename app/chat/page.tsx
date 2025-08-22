"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getEmotionConfig } from "@/lib/emotionColorMap";

const provider = new GoogleAuthProvider();

type ToneType = "therapist" | "supportive" | "cheerful";

type Session = {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
};

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<ToneType>("therapist");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setUser(null);
        setIdToken("");
      }
    });
    return () => unsubscribe();
  }, []);

  // Load sessions from Firestore
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setSessionsLoading(false);
      return;
    }
    setSessionsLoading(true);
    const q = query(collection(db, `users/${user.uid}/sessions`), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const sessionList = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'New Chat',
          messages: data.messages || [],
          createdAt: data.createdAt || 0
        };
      });
      setSessions(sessionList);
      if (sessionList.length > 0 && !activeSessionId) {
        setActiveSessionId(sessionList[0].id);
        setMessages(sessionList[0].messages || []);
      }
      setSessionsLoading(false);
    });
    return () => unsub();
  }, [user, activeSessionId]);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      const token = await result.user.getIdToken();
      setIdToken(token);
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  const handleSignOut = async () => {
    setShowLogoutModal(true);
  };

  const confirmSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setIdToken("");
    setShowLogoutModal(false);
    router.push("/");
  };

  // Start a new chat session
  const startNewChat = async () => {
    if (!user) {
      setMessages([]);
      setActiveSessionId("");
      return;
    }
    const sessionRef = await addDoc(collection(db, `users/${user.uid}/sessions`), {
      title: "New Chat",
      messages: [],
      createdAt: Date.now()
    });
    setActiveSessionId(sessionRef.id);
    setMessages([]);
  };

  // Switch session
  const switchSession = async (id: string) => {
    setActiveSessionId(id);
    const sessionDoc = sessions.find(s => s.id === id);
    setMessages(sessionDoc?.messages || []);
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      role: "user",
      timestamp: new Date().toISOString(),
      emotions: [],
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Call our Next.js API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const botEmotions = data.emotions || [];

      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        role: "bot",
        timestamp: new Date().toISOString(),
        emotions: botEmotions,
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      // Save to Firestore if user is authenticated
      if (user && activeSessionId) {
        const sessionDoc = doc(db, `users/${user.uid}/sessions/${activeSessionId}`);
        await updateDoc(sessionDoc, { messages: updatedMessages });
        
        // Update title if it's a new chat
        const session = sessions.find(s => s.id === activeSessionId);
        if (session && session.title === "New Chat") {
          await updateDoc(sessionDoc, { title: input.trim().slice(0, 30) });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        role: "bot",
        timestamp: new Date().toISOString(),
        emotions: ["neutral"],
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const EmotionBadges = ({ emotions }: { emotions: string[] }) => {
    if (!emotions || emotions.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {emotions.map((emotion, index) => {
          const config = getEmotionConfig(emotion);
          return (
            <span
              key={index}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
              title={emotion}
            >
              <span>{config.icon}</span>
              <span className="capitalize">{emotion}</span>
            </span>
          );
        })}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-32 h-32 mx-auto mb-6">
            <Image
              src="/capybara.png"
              alt="CapyBot"
              width={128}
              height={128}
              className="object-contain rounded-full border-2 border-purple-400"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to CapyBot</h1>
          <p className="text-gray-300 mb-6">Sign in to start your therapy session</p>
          <button
            onClick={handleSignIn}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 btn-glow"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">CapyBot</h1>
            <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm cursor-pointer">
              ← Home
            </Link>
          </div>
          <button
            onClick={startNewChat}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all btn-glow"
          >
            + New Chat
          </button>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Sessions</h3>
          {sessionsLoading ? (
            <div className="text-gray-400 text-sm">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-gray-400 text-sm">No sessions yet</div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => switchSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    activeSessionId === session.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium truncate">{session.title}</div>
                  <div className="text-xs opacity-75">
                    {session.messages.length} messages
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {user.displayName?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">{user.displayName}</div>
              <div className="text-gray-400 text-sm truncate">{user.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Chat Header - Fixed */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Therapy Session</h2>
            <p className="text-gray-400 text-sm">AI-powered mental wellness support</p>
          </div>
          
          {/* Tone Selector */}
          <div className="flex gap-2">
            {(["therapist", "supportive", "cheerful"] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedTone === tone
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <div className="text-4xl mb-4">💭</div>
              <p>Start a conversation with your AI therapist</p>
              <p className="text-sm mt-2">Share what&apos;s on your mind, and I&apos;ll provide support.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-lg ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.role === "bot" && <EmotionBadges emotions={msg.emotions} />}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-purple-300 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="ml-2 text-sm">CapyBot is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form - Fixed */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0">
          <form onSubmit={sendMessage} className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder="Ask anything, share your thoughts, or express how you're feeling..."
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none input-glow"
              rows={3}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-glow"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Sign Out?</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
