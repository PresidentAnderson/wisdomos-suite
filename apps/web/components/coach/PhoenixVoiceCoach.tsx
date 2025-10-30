"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Upload,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Heart,
  Zap,
  Brain,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface SessionResult {
  id: string;
  transcript: string;
  tags: string[];
  sentiment: {
    overall_sentiment: string;
    primary_emotion: string;
    secondary_emotions: string[];
    intensity: number;
    themes: string[];
  };
  insights: string;
  duration: number;
  createdAt: string;
}

export default function PhoenixVoiceCoach() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sessionType, setSessionType] = useState("reflection");
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState(5);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      const audioFile = new File([audioBlob], "recording.webm", {
        type: "audio/webm",
      });

      formData.append("file", audioFile);
      formData.append("sessionType", sessionType);
      if (mood) formData.append("mood", mood);
      formData.append("energy", energy.toString());

      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/coach/transcribe", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process recording");
      }

      const data = await response.json();
      setSessionResult(data.session);
    } catch (err: any) {
      console.error("Error uploading audio:", err);
      setError(err.message || "Failed to process your reflection. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return <TrendingUp className="w-5 h-5" />;
      case "negative":
        return <Heart className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 text-orange-600"
        >
          <Sparkles className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Phoenix Wisdom Coach</h1>
        </motion.div>
        <p className="text-gray-600">
          Speak your truth. AI-powered insights to guide your transformation.
        </p>
      </div>

      {/* Recording Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Session Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              disabled={isRecording || isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="reflection">Reflection</option>
              <option value="breakthrough">Breakthrough</option>
              <option value="integration">Integration</option>
              <option value="gratitude">Gratitude</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Mood
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              disabled={isRecording || isProcessing}
              placeholder="e.g., hopeful, stuck, energized"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energy Level: {energy}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              disabled={isRecording || isProcessing}
              className="w-full"
            />
          </div>
        </div>

        {/* Recording Button */}
        <div className="flex flex-col items-center gap-4">
          {!isRecording && !isProcessing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center"
            >
              <Mic className="w-16 h-16" />
            </motion.button>
          )}

          {isRecording && (
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="w-32 h-32 rounded-full bg-red-600 text-white shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center animate-pulse"
            >
              <Square className="w-16 h-16" />
            </motion.button>
          )}

          {isProcessing && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-xl flex items-center justify-center"
            >
              <Loader2 className="w-16 h-16 animate-spin" />
            </motion.div>
          )}

          {isRecording && (
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-orange-600">
                {formatTime(recordingTime)}
              </p>
              <p className="text-sm text-gray-500">Recording...</p>
            </div>
          )}

          {isProcessing && (
            <div className="text-center">
              <p className="text-lg font-medium text-purple-600">
                Processing your reflection...
              </p>
              <p className="text-sm text-gray-500">
                Transcribing, analyzing sentiment, generating insights
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </div>

      {/* Results Display */}
      <AnimatePresence>
        {sessionResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Success Message */}
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Session saved! Your reflection has been processed and stored.
              </p>
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-800">Your Reflection</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{sessionResult.transcript}</p>
            </div>

            {/* Sentiment Analysis */}
            {sessionResult.sentiment && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Emotional Analysis</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${getSentimentColor(sessionResult.sentiment.overall_sentiment)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getSentimentIcon(sessionResult.sentiment.overall_sentiment)}
                      <p className="text-sm font-medium">Overall Sentiment</p>
                    </div>
                    <p className="text-lg font-bold capitalize">
                      {sessionResult.sentiment.overall_sentiment}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-600">Primary Emotion</p>
                    </div>
                    <p className="text-lg font-bold text-blue-700 capitalize">
                      {sessionResult.sentiment.primary_emotion}
                    </p>
                  </div>
                </div>

                {sessionResult.sentiment.secondary_emotions?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Other Emotions Detected:</p>
                    <div className="flex flex-wrap gap-2">
                      {sessionResult.sentiment.secondary_emotions.map((emotion, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize"
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {sessionResult.sentiment.intensity && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Intensity: {sessionResult.sentiment.intensity}/10
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${sessionResult.sentiment.intensity * 10}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Insights */}
            {sessionResult.insights && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-semibold text-orange-900">Phoenix Insights</h3>
                </div>
                <div className="prose prose-orange max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {sessionResult.insights}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {sessionResult.tags?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Key Themes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sessionResult.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full text-sm font-medium capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSessionResult(null)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
              >
                Record Another Reflection
              </button>
              <button
                onClick={() => window.location.href = '/coach/analytics'}
                className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-colors"
              >
                View Analytics
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
