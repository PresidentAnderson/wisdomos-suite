"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Mic,
  X,
  MessageSquare,
  PenTool,
  Brain,
  Heart,
  Zap,
  Globe,
  BarChart,
  Lightbulb,
  Target,
} from "lucide-react";

interface DimensionData {
  name: string;
  focus: string;
  inquiry: string;
  practices: string[];
  reflection: string;
  icon: React.ReactNode;
  tone: string;
}

interface SectionData {
  title: string;
  description: string;
  dimensions: DimensionData[];
}

interface FeedbackData {
  dimensionName: string;
  feedbackText: string;
  vote: "yes" | "no" | "maybe" | null;
  noFeedbackReason?: string;
  timestamp: string;
}

export default function ReflectiveFeedbackDisplay() {
  const [feedbackByDimension, setFeedbackByDimension] = useState<Record<string, FeedbackData>>({});
  const [isRecording, setIsRecording] = useState<string | null>(null); // tracks which dimension is recording
  const [showNoModal, setShowNoModal] = useState<string | null>(null); // tracks which dimension's modal is open
  const [noFeedback, setNoFeedback] = useState("");
  const [yesFeedbackScore, setYesFeedbackScore] = useState(0);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
      const SR = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onerror = () => {
        setIsRecording(null);
      };
    }
  }, []);

  const startRecording = (dimensionName: string) => {
    if (recognitionRef.current) {
      setIsRecording(dimensionName);

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        updateFeedbackText(dimensionName, text);
        setIsRecording(null);
        console.log("[Voice → Journal]", dimensionName, text);
      };

      recognitionRef.current.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const updateFeedbackText = (dimensionName: string, text: string) => {
    setFeedbackByDimension(prev => ({
      ...prev,
      [dimensionName]: {
        ...(prev[dimensionName] || {}),
        dimensionName,
        feedbackText: text,
        vote: prev[dimensionName]?.vote || null,
        timestamp: new Date().toISOString(),
      }
    }));
  };

  const handleFeedbackChange = (dimensionName: string, value: string) => {
    updateFeedbackText(dimensionName, value);
    if (value.trim()) console.log("[Written → Journal]", dimensionName, value);
  };

  const handleVote = (dimensionName: string, choice: "yes" | "no" | "maybe") => {
    setFeedbackByDimension(prev => ({
      ...prev,
      [dimensionName]: {
        ...(prev[dimensionName] || { dimensionName, feedbackText: "", timestamp: new Date().toISOString() }),
        vote: choice,
      }
    }));

    if (choice === "yes") {
      setYesFeedbackScore(prev => prev + 1);
      console.log(`[Vote: YES] Dimension: ${dimensionName}, Total = ${yesFeedbackScore + 1}`);
      // Submit feedback to API
      submitFeedbackToAPI(dimensionName, choice);
    } else if (choice === "no") {
      setShowNoModal(dimensionName);
    } else {
      submitFeedbackToAPI(dimensionName, choice);
    }
  };

  const submitNoFeedback = (dimensionName: string) => {
    setFeedbackByDimension(prev => ({
      ...prev,
      [dimensionName]: {
        ...prev[dimensionName],
        noFeedbackReason: noFeedback,
      }
    }));

    console.log("[Vote: NO] Dimension:", dimensionName, "Feedback:", noFeedback);
    submitFeedbackToAPI(dimensionName, "no", noFeedback);

    setShowNoModal(null);
    setNoFeedback("");
  };

  const submitFeedbackToAPI = async (dimensionName: string, vote: string, reason?: string) => {
    try {
      const feedback = feedbackByDimension[dimensionName];

      // Get auth token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/reflective-feedback", {
        method: "POST",
        headers,
        body: JSON.stringify({
          dimensionName,
          feedbackText: feedback?.feedbackText || "",
          vote,
          noFeedbackReason: reason,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const sections: SectionData[] = [
    {
      title: "Creative — Innovation and Problem-Solving",
      description: "Express your curiosity and creativity with intention.",
      dimensions: [
        {
          name: "Being",
          focus: "Curiosity & openness",
          inquiry: "What state of mind supports my best creative work?",
          practices: [
            "Morning pages journaling",
            "15 min daily ideation",
            "Weekly creative walks",
          ],
          reflection: "What idea or insight surprised you this week?",
          icon: <PenTool className="text-pink-600" size={24} />,
          tone: "from-pink-100 to-pink-50",
        },
        {
          name: "Thinking",
          focus: "Critical analysis & synthesis",
          inquiry: "How do I connect disparate ideas into novel solutions?",
          practices: [
            "Mind mapping sessions",
            "Cross-domain reading",
            "Problem reframing exercises",
          ],
          reflection: "What connections did you discover between unrelated concepts?",
          icon: <Brain className="text-purple-600" size={24} />,
          tone: "from-purple-100 to-purple-50",
        },
      ],
    },
    {
      title: "Emotional — Self-Awareness and Regulation",
      description: "Cultivate emotional intelligence and resilience.",
      dimensions: [
        {
          name: "Feeling",
          focus: "Emotional awareness",
          inquiry: "What emotions am I experiencing, and what are they telling me?",
          practices: [
            "Daily emotion check-ins",
            "Somatic awareness exercises",
            "Emotion labeling practice",
          ],
          reflection: "What emotion caught you off guard this week?",
          icon: <Heart className="text-red-600" size={24} />,
          tone: "from-red-100 to-red-50",
        },
      ],
    },
    {
      title: "Physical — Energy and Vitality",
      description: "Optimize your physical well-being for peak performance.",
      dimensions: [
        {
          name: "Doing",
          focus: "Movement & energy",
          inquiry: "How does my body feel, and what does it need?",
          practices: [
            "Morning movement ritual",
            "Energy level tracking",
            "Sleep quality monitoring",
          ],
          reflection: "When did you feel most energized this week?",
          icon: <Zap className="text-yellow-600" size={24} />,
          tone: "from-yellow-100 to-yellow-50",
        },
      ],
    },
    {
      title: "Social — Connection and Impact",
      description: "Build meaningful relationships and contribute to your community.",
      dimensions: [
        {
          name: "Relating",
          focus: "Connection & empathy",
          inquiry: "How am I showing up in my relationships?",
          practices: [
            "Active listening practice",
            "Weekly connection ritual",
            "Gratitude expression",
          ],
          reflection: "What meaningful connection did you make this week?",
          icon: <Globe className="text-blue-600" size={24} />,
          tone: "from-blue-100 to-blue-50",
        },
      ],
    },
    {
      title: "Performance — Growth and Achievement",
      description: "Track progress and optimize for continuous improvement.",
      dimensions: [
        {
          name: "Measuring",
          focus: "Metrics & progress",
          inquiry: "What progress am I making toward my goals?",
          practices: [
            "Weekly progress reviews",
            "Goal tracking system",
            "Performance analytics",
          ],
          reflection: "What metric showed the most improvement this week?",
          icon: <BarChart className="text-green-600" size={24} />,
          tone: "from-green-100 to-green-50",
        },
      ],
    },
    {
      title: "Strategic — Vision and Planning",
      description: "Align your actions with your long-term vision.",
      dimensions: [
        {
          name: "Planning",
          focus: "Strategy & vision",
          inquiry: "Am I working on what matters most?",
          practices: [
            "Weekly planning ritual",
            "Priority alignment check",
            "Vision board review",
          ],
          reflection: "What brought you closer to your vision this week?",
          icon: <Target className="text-indigo-600" size={24} />,
          tone: "from-indigo-100 to-indigo-50",
        },
        {
          name: "Ideating",
          focus: "Innovation & possibility",
          inquiry: "What new possibilities can I explore?",
          practices: [
            "Brainstorming sessions",
            "Scenario planning",
            "Future visioning",
          ],
          reflection: "What possibility excited you most this week?",
          icon: <Lightbulb className="text-orange-600" size={24} />,
          tone: "from-orange-100 to-orange-50",
        },
      ],
    },
  ];

  return (
    <div className="space-y-10 p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <MessageSquare className="text-orange-500" />
          Reflective Feedback
        </h1>
        <p className="text-gray-600 mb-6">
          Engaged Awareness Loop — Track your journey across multiple dimensions of growth
        </p>

        {sections.map((section, idx) => (
          <section key={idx} className="space-y-5 mb-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{section.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.dimensions.map((d, i) => {
                const feedback = feedbackByDimension[d.name] || { feedbackText: "", vote: null };

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${d.tone} p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {d.icon}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{d.name}</h3>
                        <p className="text-sm italic text-gray-600">{d.focus}</p>
                      </div>
                    </div>

                    <p className="font-medium text-gray-700 mb-2">{d.inquiry}</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mb-3 space-y-1">
                      {d.practices.map((p, j) => (
                        <li key={j}>{p}</li>
                      ))}
                    </ul>
                    <p className="text-sm italic text-gray-600 mb-4 bg-white/50 p-2 rounded-lg">
                      {d.reflection}
                    </p>

                    <div className="relative mb-3">
                      <textarea
                        value={feedback.feedbackText}
                        onChange={(e) => handleFeedbackChange(d.name, e.target.value)}
                        placeholder="Your reflections and insights..."
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 pr-10 min-h-[80px] resize-none"
                      />
                      <button
                        onClick={() => startRecording(d.name)}
                        className="absolute right-3 top-3 p-1 hover:bg-white/50 rounded-full transition-colors"
                        title="Record feedback"
                      >
                        <Mic
                          size={18}
                          className={`${
                            isRecording === d.name
                              ? "text-red-500 animate-pulse"
                              : "text-gray-500 hover:text-orange-500"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Is this dimension helpful for your growth?</span>
                      {feedback.vote && (
                        <span className="italic font-medium text-gray-700">
                          Vote: {feedback.vote.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        className={`p-2 rounded-full transition-colors ${
                          feedback.vote === "yes"
                            ? "bg-green-200"
                            : "hover:bg-green-100"
                        }`}
                        title="Yes - Very helpful"
                        onClick={() => handleVote(d.name, "yes")}
                      >
                        <ThumbsUp className="text-green-600" size={20} />
                      </button>
                      <button
                        className={`p-2 rounded-full transition-colors ${
                          feedback.vote === "maybe"
                            ? "bg-gray-200"
                            : "hover:bg-gray-100"
                        }`}
                        title="Maybe - Somewhat helpful"
                        onClick={() => handleVote(d.name, "maybe")}
                      >
                        <MinusCircle className="text-gray-600" size={20} />
                      </button>
                      <button
                        className={`p-2 rounded-full transition-colors ${
                          feedback.vote === "no"
                            ? "bg-red-200"
                            : "hover:bg-red-100"
                        }`}
                        title="No - Not helpful"
                        onClick={() => handleVote(d.name, "no")}
                      >
                        <ThumbsDown className="text-red-600" size={20} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* No Feedback Modal */}
      {showNoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Help us improve: {showNoModal}
              </h3>
              <button
                onClick={() => setShowNoModal(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              What's not working for you? How can we make this dimension more valuable?
            </p>
            <textarea
              value={noFeedback}
              onChange={(e) => setNoFeedback(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-300 min-h-[120px] resize-none"
              placeholder="Be honest and specific — what's missing, confusing, or not helpful?"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNoModal(null)}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => submitNoFeedback(showNoModal)}
                className="px-4 py-2 rounded-xl text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
                disabled={!noFeedback.trim()}
              >
                Submit Feedback
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
