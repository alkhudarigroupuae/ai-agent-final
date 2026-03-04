/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Code, Activity, 
  Menu, FileCode, Maximize2, Globe, Settings,
  Key, AlertCircle, Search, Folder, Zap
} from "lucide-react";
import { GeminiLiveService } from "./services/geminiLive";
import ReactMarkdown from "react-markdown";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [transcript, setTranscript] = useState("");
  const [code, setCode] = useState("");
  const [currentFile, setCurrentFile] = useState("main.ts");
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const serviceRef = useRef<GeminiLiveService | null>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    setHasApiKey(hasKey);
  };

  const handleConnect = async () => {
    if (!hasApiKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      return;
    }

    if (isConnected) {
      serviceRef.current?.disconnect();
      setIsConnected(false);
      setStatus("Disconnected");
    } else {
      try {
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
          (status) => setStatus(status)
        );
        await serviceRef.current.connect();
        setIsConnected(true);
      } catch (err: any) {
        setStatus("Error: " + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen text-[#cccccc] font-sans selection:bg-[#264f78] selection:text-white relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/background.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/preview/mixkit-black-and-white-abstract-particles-moving-in-space-26633-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
      </div>

      {/* App Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top Menu Bar */}
        <div className="h-8 bg-[#333333]/80 backdrop-blur-md flex items-center px-3 text-[13px] border-b border-[#3c3c3c]/50">
        <div className="flex gap-4">
          <span className="text-brand-yellow font-bold">EcommerceCo Agent</span>
          <span className="cursor-pointer hover:text-white">File</span>
          <span className="cursor-pointer hover:text-white">Edit</span>
          <span className="cursor-pointer hover:text-white">Selection</span>
          <span className="cursor-pointer hover:text-white">View</span>
          <span className="cursor-pointer hover:text-white">Go</span>
          <span className="cursor-pointer hover:text-white">Run</span>
          <span className="cursor-pointer hover:text-white">Terminal</span>
          <span className="cursor-pointer hover:text-white">Help</span>
        </div>
        <div className="mx-auto text-center opacity-70 flex-1">
          {currentFile} - EcommerceCo Workspace
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-[#333333]/80 backdrop-blur-md flex flex-col items-center py-4 gap-6 border-r border-[#3c3c3c]/50">
          <div className="relative cursor-pointer">
            <FileCode className="w-6 h-6 text-white" />
            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-brand-yellow rounded-r-full" />
          </div>
          <Search className="w-6 h-6 text-[#858585] cursor-pointer hover:text-white" />
          <Activity className="w-6 h-6 text-[#858585] cursor-pointer hover:text-white" />
          <div className="mt-auto flex flex-col gap-6 mb-4">
            <Settings className="w-6 h-6 text-[#858585] cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Sidebar (Explorer) */}
        <div className="w-64 bg-[#252526]/80 backdrop-blur-md border-r border-[#3c3c3c]/50 flex flex-col">
          <div className="px-4 py-2 text-[11px] font-bold tracking-wider uppercase text-[#cccccc]">
            Explorer
          </div>
          <div className="px-2 py-1 flex items-center gap-1 text-[13px] bg-[#37373d]/80 text-white cursor-pointer">
            <Menu className="w-4 h-4" />
            <Folder className="w-4 h-4 text-brand-yellow" />
            <span className="font-bold">ecommerceco-vps</span>
          </div>
          <div className="pl-8 pr-2 py-1 flex items-center gap-2 text-[13px] text-brand-yellow bg-[#04395e]/80 cursor-pointer border border-[#007fd4]/50">
            <FileCode className="w-4 h-4" />
            <span>{currentFile}</span>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]/60 backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex bg-[#252526]/80 overflow-x-auto no-scrollbar">
            <div className="px-4 py-2 bg-[#1e1e1e]/80 border-t border-brand-yellow text-brand-yellow flex items-center gap-2 text-[13px] min-w-[120px]">
              <FileCode className="w-4 h-4" />
              {currentFile}
              <Maximize2 className="w-3 h-3 ml-auto opacity-50 hover:opacity-100 cursor-pointer" />
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-4 py-1 text-[13px] flex items-center gap-1 text-[#cccccc] opacity-80 border-b border-[#3c3c3c] shadow-sm">
            <span>ecommerceco-vps</span>
            <span className="opacity-50">/</span>
            <span>src</span>
            <span className="opacity-50">/</span>
            <span className="text-white">{currentFile}</span>
          </div>

          {/* Code Content */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[14px] leading-relaxed">
            {code ? (
              <div className="markdown-body">
                <ReactMarkdown>{`\`\`\`${currentFile.split('.').pop() || 'tsx'}\n${code}\n\`\`\``}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-[#858585] h-full flex items-center justify-center flex-col">
                <Code className="w-16 h-16 mb-4 opacity-20" />
                <p>No code generated yet.</p>
                <p className="text-xs mt-2">Use the AI Voice Agent to generate code.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Voice Panel (Right Sidebar) */}
        <div className="w-[350px] bg-[#252526]/80 backdrop-blur-md border-l border-[#3c3c3c]/50 flex flex-col">
          <div className="px-4 py-3 border-b border-[#3c3c3c]/50 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#cccccc] flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-yellow" />
              AI Voice Agent
            </span>
            {!hasApiKey && (
              <button onClick={() => window.aistudio.openSelectKey()} className="text-[11px] text-brand-yellow hover:underline flex items-center gap-1">
                <Key className="w-3 h-3" /> Setup Key
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Transcript Area */}
            <div className="flex-1 bg-[#1e1e1e]/80 rounded border border-[#3c3c3c]/50 p-3 overflow-y-auto text-[13px] font-mono">
              {transcript ? (
                <div className="whitespace-pre-wrap text-[#cccccc]">{transcript}</div>
              ) : (
                <div className="text-[#858585] italic text-center mt-10">
                  Transcript will appear here...
                </div>
              )}
            </div>

            {/* Voice Control */}
            <div className="bg-[#333333]/80 rounded-lg p-4 flex flex-col items-center gap-4 border border-[#3c3c3c]/50">
              <div className="text-[11px] text-[#858585] uppercase tracking-wider font-bold">
                {status}
              </div>
              
              <button
                onClick={handleConnect}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isConnected 
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                    : 'bg-brand-yellow text-black hover:bg-brand-yellow/90 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                }`}
              >
                {isConnected ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              
              <div className="text-[12px] text-center text-[#cccccc]">
                {isConnected ? "Listening... Click to stop" : "Click to start voice agent"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc]/90 backdrop-blur-md text-white flex items-center px-3 text-[12px] justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded">
            <Globe className="w-3 h-3" />
            <span>VPS: Connected</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded">
            <AlertCircle className="w-3 h-3" />
            <span>0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded">Ln 1, Col 1</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded">UTF-8</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded">TypeScript React</span>
          <span className="cursor-pointer hover:bg-white/20 px-1 rounded flex items-center gap-1">
            <Zap className="w-3 h-3" />
            EcommerceCo AI
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
