"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [activeFeature, setActiveFeature] = useState(0);
  const provider = new GoogleAuthProvider();
  const router = useRouter();

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
  }, [router]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      const token = await result.user.getIdToken();
      setIdToken(token);

      // Redirect to /chat only if not already on the home page
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        router.push("/chat");
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      alert("Google sign-in failed");
    }
  };

  const features = [
    {
      title: "AI-Powered Therapy",
      description: "Advanced AI that understands your emotions and provides personalized therapeutic responses",
      icon: "🧠",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Emotion Detection",
      description: "Real-time emotion analysis to better understand your mental state and provide targeted support",
      icon: "💭",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Multiple Therapy Styles",
      description: "Choose from therapist, supportive, or cheerful tones to match your current needs",
      icon: "🎭",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Voice Interaction",
      description: "Speak naturally instead of typing - just like talking to a real therapist",
      icon: "🎤",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white bg-opacity-80 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-2xl feature-glow">
          {/* Capybara Image */}
          <div className="w-40 h-40 md:w-52 md:h-52 mb-6">
            <Image
              src="/capybara.png"
              alt="CapyBot mascot"
              width={208}
              height={208}
              className="object-contain rounded-full border-4 border-purple-300 shadow-md"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-purple-800 mb-2 text-center font-sans">
            CapyBot
          </h1>
          
          <h2 className="text-xl md:text-2xl font-semibold text-purple-600 mb-4 text-center">
            Your AI Therapist
          </h2>
          
          <p className="text-gray-700 text-center mb-8 text-lg leading-relaxed max-w-lg">
            Experience advanced AI-powered mental wellness support with real-time emotion detection, 
            personalized therapy, and voice interaction capabilities.
          </p>

          {!user ? (
            <button
              onClick={handleSignIn}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg btn-glow"
              data-testid="sign-in-button"
            >
              🚀 Start Your Therapy Journey
            </button>
          ) : (
            <div className="flex gap-4">
              <Link href="/chat">
                <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg btn-glow">
                  💬 Continue Chatting
                </button>
              </Link>
              <Link href="/analytics">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg btn-glow">
                  📊 View Analytics
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-12 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-12">
          Why Choose CapyBot?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white bg-opacity-90 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 feature-glow ${
                activeFeature === index ? 'ring-2 ring-purple-400' : ''
              }`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto bg-white bg-opacity-80 rounded-3xl p-8 shadow-lg feature-glow">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            Ready to improve your mental wellness?
          </h2>
          <p className="text-gray-700 mb-6">
            Join thousands of users who have found support and clarity with CapyBot.
            Start your personalized therapy journey today.
          </p>
          {!user && (
            <button
              onClick={handleSignIn}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg btn-glow text-lg"
            >
              Get Started - It's Free! 🌟
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-purple-700 opacity-80">
        <p>&copy; 2025 CapyBot. Your AI-powered mental wellness companion.</p>
      </footer>
    </div>
  );
}
