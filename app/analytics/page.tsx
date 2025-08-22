"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getEmotionConfig } from "@/lib/emotionColorMap";

const provider = new GoogleAuthProvider();

type Message = {
  id: number;
  text: string;
  role: "user" | "bot";
  timestamp: string;
  emotions: string[];
};

type Session = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load sessions from Firestore
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }
    
    const q = query(
      collection(db, `users/${user.uid}/sessions`), 
      orderBy("createdAt", "desc")
    );
    
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
    });
    
    return () => unsub();
  }, [user]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Calculate analytics data
  const getAnalytics = () => {
    if (!sessions.length) return null;

    const allMessages = sessions.flatMap(session => session.messages);
    const userMessages = allMessages.filter(msg => msg.role === "user");
    const botMessages = allMessages.filter(msg => msg.role === "bot");
    
    // Emotion frequency
    const emotionCounts: Record<string, number> = {};
    botMessages.forEach(msg => {
      msg.emotions?.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Session statistics
    const totalSessions = sessions.length;
    const totalMessages = allMessages.length;
    const avgMessagesPerSession = Math.round(totalMessages / totalSessions);
    
    // Recent activity (last 7 days)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(s => s.createdAt > weekAgo);
    
    return {
      totalSessions,
      totalMessages,
      avgMessagesPerSession,
      recentSessions: recentSessions.length,
      emotions: sortedEmotions,
      userMessageCount: userMessages.length,
      botMessageCount: botMessages.length
    };
  };

  const analytics = getAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h1>
          <p className="text-gray-300 mb-6">Sign in to view your therapy session insights</p>
          <button
            onClick={handleSignIn}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 btn-glow"
          >
            Sign in with Google
          </button>
          <Link href="/" className="block mt-4 text-purple-400 hover:text-purple-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!analytics || sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-400">Track your mental wellness journey</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/chat" className="text-purple-400 hover:text-purple-300">
                Start Chat →
              </Link>
              <Link href="/" className="text-purple-400 hover:text-purple-300">
                ← Home
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* No Data State */}
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Data Yet</h2>
            <p className="text-gray-400 mb-6">Start a therapy session to see your analytics</p>
            <Link href="/chat">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all btn-glow">
                Start Your First Session
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Track your mental wellness journey</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="text-purple-400 hover:text-purple-300">
              Continue Chat →
            </Link>
            <Link href="/" className="text-purple-400 hover:text-purple-300">
              ← Home
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{analytics.totalSessions}</p>
              </div>
              <div className="text-purple-400 text-2xl">💬</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Messages</p>
                <p className="text-2xl font-bold text-white">{analytics.totalMessages}</p>
              </div>
              <div className="text-blue-400 text-2xl">✉️</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Messages/Session</p>
                <p className="text-2xl font-bold text-white">{analytics.avgMessagesPerSession}</p>
              </div>
              <div className="text-green-400 text-2xl">📈</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">This Week</p>
                <p className="text-2xl font-bold text-white">{analytics.recentSessions}</p>
              </div>
              <div className="text-yellow-400 text-2xl">🗓️</div>
            </div>
          </div>
        </div>

        {/* Emotions Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Detected Emotions</h2>
            <div className="space-y-3">
              {analytics.emotions.map(([emotion, count], index) => {
                const config = getEmotionConfig(emotion);
                const percentage = Math.round((count / analytics.botMessageCount) * 100);
                
                return (
                  <div key={emotion} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="capitalize text-white font-medium">{emotion}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${config.bgColor} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Session History</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium truncate max-w-48">{session.title}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {session.messages.length} messages
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Your Progress</h3>
              <p className="text-gray-300">
                You've had {analytics.totalSessions} therapy sessions with a total of {analytics.totalMessages} messages exchanged.
                {analytics.recentSessions > 0 && ` You've been active this week with ${analytics.recentSessions} sessions.`}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Emotional Patterns</h3>
              <p className="text-gray-300">
                {analytics.emotions.length > 0 ? (
                  `Your most frequently detected emotion is "${analytics.emotions[0][0]}" appearing ${analytics.emotions[0][1]} times.`
                ) : (
                  "Continue chatting to build your emotional pattern analysis."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
