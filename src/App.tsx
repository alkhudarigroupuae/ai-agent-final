/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, MicOff, Code, Terminal, Zap, Activity, 
  Menu, FileCode, Copy, Maximize2, Globe, Settings,
  Key, AlertCircle
} from "lucide-react";
import { GeminiLiveService } from "./services/geminiLive";
import { VoiceVisualizer } from "./components/VoiceVisualizer";
import ReactMarkdown from "react-markdown";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const isAiStudio = () => typeof window !== "undefined" && !!window.aistudio;

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [transcript, setTranscript] = useState("");
  const [code, setCode] = useState("");
  const [currentFile, setCurrentFile] = useState("main.ts");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const serviceRef = useRef<GeminiLiveService | null>(null);
  const resolvedApiKey = useRef<string>("");

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (isAiStudio()) {
      const hasKey = await window.aistudio!.hasSelectedApiKey();
      setHasApiKey(hasKey);
    } else if (process.env.GEMINI_API_KEY) {
      resolvedApiKey.current = process.env.GEMINI_API_KEY;
      setHasApiKey(true);
    } else {
      setShowApiKeyInput(true);
    }
  };

  const handleApiKeySubmit = () => {
    const key = apiKeyInput.trim();
    if (key && key.startsWith("AIza") && key.length > 20) {
      resolvedApiKey.current = key;
      setHasApiKey(true);
      setShowApiKeyInput(false);
    }
  };

  const handleConnect = async () => {
    if (!hasApiKey) {
      if (isAiStudio()) {
        await window.aistudio!.openSelectKey();
        setHasApiKey(true);
      } else {
        setShowApiKeyInput(true);
      }
      return;
    }

    if (isConnected) {
      serviceRef.current?.disconnect();
      setIsConnected(false);
      setStatus("Disconnected");
    } else {
      try {
        const apiKey = isAiStudio() ? undefined : resolvedApiKey.current;
        serviceRef.current = new GeminiLiveService(
          (msg) => {
            if (msg.type === "text") {
              setTranscript((prev) => prev + " " + msg.data);
            } else if (msg.type === "code") {
              setCode(msg.data.content);
              setCurrentFile(msg.data.filename);
              setStatus(`Updating ${msg.data.filename}...`);
              setTimeout(() => setStatus("Connected"), 2000);
            }
          },
          (status) => setStatus(status),
          apiKey
        );
        await serviceRef.current.connect();
        setIsConnected(true);
      } catch (err: any) {
        setStatus("Error: " + err.message);
      }
    }
  };

  return (
    <div className="flex h-screen bg-brand-black text-white selection:bg-brand-yellow selection:text-brand-black">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#FBBF24_0%,transparent_50%)] blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 glass border-r border-white/10 z-20 flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-yellow rounded flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-black fill-brand-black" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-brand-yellow">EcommerceCo.ai</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-2">Workspace</p>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 text-brand-yellow">
                  <FileCode className="w-4 h-4" />
                  <span className="text-sm font-mono">{currentFile}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-2">Transcript</p>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 min-h-[200px] max-h-[400px] overflow-y-auto">
                  <p className="text-sm text-white/70 leading-relaxed italic">
                    {transcript || "Waiting for voice input..."}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs font-mono uppercase tracking-tighter opacity-60">{status}</span>
                </div>
                {!hasApiKey && (
                  <button 
                    onClick={() => isAiStudio() ? window.aistudio!.openSelectKey() : setShowApiKeyInput(true)}
                    className="text-[10px] text-brand-yellow hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" /> Setup Key
                  </button>
                )}
              </div>
              <button
                onClick={handleConnect}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isConnected 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                    : 'bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 glow-yellow'
                }`}
              >
                {isConnected ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isConnected ? "Disconnect Agent" : "Start Voice Agent"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 z-10 glass">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 opacity-60" />
            </button>
            <div className="flex items-center gap-2 text-sm opacity-60">
              <Terminal className="w-4 h-4" />
              <span className="font-mono">agent@ecommerceco:~/workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-xs font-bold">
              <Activity className="w-3 h-3" />
              LIVE
            </div>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Settings className="w-5 h-5 opacity-60" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Interaction Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-12 relative">
            <div className="absolute top-12 left-12 max-w-md">
              <h2 className="text-4xl font-bold tracking-tighter mb-4 text-brand-yellow">
                Talk to your <br />
                <span className="text-white">AI Developer.</span>
              </h2>
              <p className="text-white/40 leading-relaxed">
                EcommerceCo Agent is listening. Ask it to build components, 
                fix bugs, or deploy your application using natural voice commands.
              </p>
            </div>

            <VoiceVisualizer isRecording={isConnected} isActive={isConnected} />

            <div className="mt-12 flex gap-4">
              <div className="px-6 py-3 rounded-2xl glass border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-yellow" />
                <span className="text-sm font-medium opacity-80">"Build a checkout page"</span>
              </div>
              <div className="px-6 py-3 rounded-2xl glass border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-yellow" />
                <span className="text-sm font-medium opacity-80">"Fix the API route"</span>
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div className="w-[40%] glass border-l border-white/10 flex flex-col">
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-black/20">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-brand-yellow" />
                <span className="text-xs font-mono opacity-60">{currentFile}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                  <Copy className="w-3.5 h-3.5 opacity-40" />
                </button>
                <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
                  <Maximize2 className="w-3.5 h-3.5 opacity-40" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed">
              {code ? (
                <div className="markdown-body">
                  <ReactMarkdown>
                    {`\`\`\`${currentFile.split('.').pop()}\n${code}\n\`\`\``}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <Code className="w-12 h-12 mb-4" />
                  <p>No code generated yet.<br />Start speaking to create files.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-10 border-t border-white/10 flex items-center justify-between px-6 text-[10px] font-mono opacity-40 glass">
          <div className="flex items-center gap-4">
            <span>UTF-8</span>
            <span>TypeScript</span>
            <span>Prettier</span>
          </div>
          <div className="flex items-center gap-4">
            <span>v1.0.4-stable</span>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>EU-WEST-1</span>
            </div>
          </div>
        </footer>
      </div>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass border border-white/10 rounded-2xl p-8 w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-brand-yellow rounded flex items-center justify-center">
                  <Key className="w-5 h-5 text-brand-black" />
                </div>
                <h2 className="text-xl font-bold text-brand-yellow">Enter API Key</h2>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Enter your Gemini API key to use the voice agent. You can get one from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-yellow underline"
                >
                  Google AI Studio
                </a>.
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApiKeySubmit()}
                placeholder="AIza..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-brand-yellow/50 mb-4"
              />
              <button
                onClick={handleApiKeySubmit}
                disabled={!apiKeyInput.trim().startsWith("AIza") || apiKeyInput.trim().length <= 20}
                className="w-full py-3 rounded-xl font-bold bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 glow-yellow disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Save & Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
