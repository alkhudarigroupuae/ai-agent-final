/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Code, Activity, 
  Menu, FileCode, Maximize2, Globe, Settings,
  Key, AlertCircle, Search, Folder, Zap,
  CheckSquare, Plus, Trash2, CheckCircle2, X,
  Save, FolderOpen, Download, History
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
  const [activePanel, setActivePanel] = useState<'explorer' | 'tasks' | 'projects'>('explorer');
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [files, setFiles] = useState<string[]>(["main.ts", "App.tsx", "index.css", "server.ts", "package.json", "vite.config.ts"]);
  const [editingTask, setEditingTask] = useState<{ id: string; text: string; description: string; completed: boolean } | null>(null);
  const [projects, setProjects] = useState<{ id: string; name: string; timestamp: number; data: any }[]>([]);
  const [tasks, setTasks] = useState<{ id: string; text: string; description: string; completed: boolean }[]>([
    { id: '1', text: 'Initialize project structure', description: 'Set up the basic React + Vite + Tailwind project structure.', completed: true },
    { id: '2', text: 'Configure Gemini Live API', description: 'Integrate the Gemini Live API for real-time voice and tool calls.', completed: true },
    { id: '3', text: 'Implement voice capture', description: 'Capture user audio and send it to the Gemini Live service.', completed: false },
    { id: '4', text: 'Add PWA support', description: 'Configure vite-plugin-pwa for offline support and installation.', completed: false },
  ]);
  
  const serviceRef = useRef<GeminiLiveService | null>(null);

  useEffect(() => {
    checkApiKey();
    loadSavedProjects();
  }, []);

  const loadSavedProjects = () => {
    const saved = localStorage.getItem('ecommerco_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved projects", e);
      }
    }
  };

  const saveCurrentProject = (name: string) => {
    const newProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || `Project ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      data: {
        tasks,
        files,
        code,
        currentFile
      }
    };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('ecommerco_projects', JSON.stringify(updatedProjects));
    setStatus("Project saved successfully");
    setTimeout(() => setStatus("Connected"), 2000);
  };

  const loadProject = (project: any) => {
    setTasks(project.data.tasks);
    setFiles(project.data.files);
    setCode(project.data.code);
    setCurrentFile(project.data.currentFile);
    setStatus(`Loaded project: ${project.name}`);
    setTimeout(() => setStatus("Connected"), 2000);
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('ecommerco_projects', JSON.stringify(updatedProjects));
  };

  const checkApiKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    } else {
      // If deployed outside AI Studio (e.g. VPS), assume key is provided via env var
      setHasApiKey(true);
    }
  };

  const handleConnect = async () => {
    if (!window.isSecureContext) {
      setStatus("Error: Microphone requires HTTPS (Secure Context)");
      return;
    }

    if (!hasApiKey) {
      if (window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } else {
        setStatus("Error: GEMINI_API_KEY missing");
      }
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

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const saveTask = (updatedTask: { id: string; text: string; description: string; completed: boolean }) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
  };

  const addTask = () => {
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'New Task',
      description: '',
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setEditingTask(newTask);
  };

  return (
    <div className="flex flex-col h-screen text-vscode-text font-sans selection:bg-[#264f78] selection:text-white relative overflow-hidden">
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
        <div className="h-8 bg-vscode-activity/80 backdrop-blur-md flex items-center px-3 text-[13px] border-b border-vscode-border/50">
        <div className="flex gap-4">
          <span className="text-brand-yellow font-bold">ecommerco.ai Agent</span>
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
          {currentFile} - ecommerco.ai Workspace
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-vscode-activity/80 backdrop-blur-md flex flex-col items-center py-4 gap-6 border-r border-vscode-border/50">
          <div 
            className="relative cursor-pointer"
            onClick={() => setActivePanel('explorer')}
          >
            <FileCode className={`w-6 h-6 ${activePanel === 'explorer' ? 'text-white' : 'text-[#858585] hover:text-white'}`} />
            {activePanel === 'explorer' && <div className="absolute -left-3 top-0 bottom-0 w-1 bg-brand-yellow rounded-r-full" />}
          </div>
          <div 
            className="relative cursor-pointer"
            onClick={() => setActivePanel('tasks')}
          >
            <CheckSquare className={`w-6 h-6 ${activePanel === 'tasks' ? 'text-white' : 'text-[#858585] hover:text-white'}`} />
            {activePanel === 'tasks' && <div className="absolute -left-3 top-0 bottom-0 w-1 bg-brand-yellow rounded-r-full" />}
          </div>
          <div 
            className="relative cursor-pointer"
            onClick={() => setActivePanel('projects')}
          >
            <History className={`w-6 h-6 ${activePanel === 'projects' ? 'text-white' : 'text-[#858585] hover:text-white'}`} />
            {activePanel === 'projects' && <div className="absolute -left-3 top-0 bottom-0 w-1 bg-brand-yellow rounded-r-full" />}
          </div>
          <Search className="w-6 h-6 text-[#858585] cursor-pointer hover:text-white" />
          <Activity className="w-6 h-6 text-[#858585] cursor-pointer hover:text-white" />
          <div className="mt-auto flex flex-col gap-6 mb-4">
            <Settings className="w-6 h-6 text-[#858585] cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Sidebar (Explorer, Tasks, or Projects) */}
        <div className="w-64 bg-vscode-sidebar/80 backdrop-blur-md border-r border-vscode-border/50 flex flex-col">
          {activePanel === 'explorer' ? (
            <>
              <div className="px-4 py-2 text-[11px] font-bold tracking-wider uppercase text-vscode-text flex items-center justify-between">
                <span>Explorer</span>
                <Search className="w-3 h-3 opacity-50" />
              </div>
              
              {/* File Search Input */}
              <div className="px-3 py-2">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search files..."
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    className="w-full bg-vscode-bg/50 border border-vscode-border/50 rounded px-2 py-1 text-[12px] text-vscode-text focus:outline-none focus:border-brand-yellow/50 transition-colors"
                  />
                  {fileSearchQuery && (
                    <button 
                      onClick={() => setFileSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-vscode-text/50 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="px-2 py-1 flex items-center gap-1 text-[13px] bg-[#37373d]/80 text-white cursor-pointer">
                <Menu className="w-4 h-4" />
                <Folder className="w-4 h-4 text-brand-yellow" />
                <span className="font-bold">ecommerceco-vps</span>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {files
                  .filter(f => f.toLowerCase().includes(fileSearchQuery.toLowerCase()))
                  .map(fileName => (
                    <div 
                      key={fileName}
                      onClick={() => setCurrentFile(fileName)}
                      className={`pl-8 pr-2 py-1 flex items-center gap-2 text-[13px] cursor-pointer transition-colors ${
                        currentFile === fileName 
                          ? 'text-brand-yellow bg-[#04395e]/80 border border-[#007fd4]/50' 
                          : 'text-vscode-text hover:bg-white/5'
                      }`}
                    >
                      <FileCode className={`w-4 h-4 ${currentFile === fileName ? 'text-brand-yellow' : 'text-[#858585]'}`} />
                      <span>{fileName}</span>
                    </div>
                  ))
                }
                {files.filter(f => f.toLowerCase().includes(fileSearchQuery.toLowerCase())).length === 0 && (
                  <div className="px-8 py-4 text-[12px] text-vscode-text/50 italic">
                    No files found
                  </div>
                )}
              </div>
            </>
          ) : activePanel === 'tasks' ? (
            <>
              <div className="px-4 py-2 text-[11px] font-bold tracking-wider uppercase text-vscode-text flex items-center justify-between">
                <span>Tasks</span>
                <Plus 
                  className="w-4 h-4 cursor-pointer hover:text-white" 
                  onClick={(e) => {
                    e.stopPropagation();
                    addTask();
                  }}
                />
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setEditingTask(task)}
                    className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 border border-[#858585] rounded-sm shrink-0 group-hover:border-white" />
                      )}
                    </div>
                    <span className={`text-[13px] flex-1 truncate ${task.completed ? 'text-[#858585] line-through' : 'text-vscode-text'}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-2 text-[11px] font-bold tracking-wider uppercase text-vscode-text flex items-center justify-between">
                <span>Projects</span>
                <Save 
                  className="w-4 h-4 cursor-pointer hover:text-white" 
                  onClick={() => saveCurrentProject("")}
                />
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
                {projects.length === 0 ? (
                  <div className="px-4 py-8 text-center text-vscode-text/50 text-[12px]">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No saved projects yet.</p>
                    <button 
                      onClick={() => saveCurrentProject("")}
                      className="mt-4 text-brand-yellow hover:underline"
                    >
                      Save current state
                    </button>
                  </div>
                ) : (
                  projects.map(project => (
                    <div 
                      key={project.id}
                      className="group flex flex-col gap-1 px-3 py-2 rounded hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-vscode-border/50"
                      onClick={() => loadProject(project)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-vscode-text truncate">{project.name}</span>
                        <Trash2 
                          className="w-3 h-3 text-vscode-text/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-vscode-text/50">
                        {new Date(project.timestamp).toLocaleDateString()} {new Date(project.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-vscode-bg/60 backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex bg-vscode-sidebar/80 overflow-x-auto no-scrollbar">
            <div className="px-4 py-2 bg-vscode-bg/80 border-t border-brand-yellow text-brand-yellow flex items-center gap-2 text-[13px] min-w-[120px]">
              <FileCode className="w-4 h-4" />
              {currentFile}
              <Maximize2 className="w-3 h-3 ml-auto opacity-50 hover:opacity-100 cursor-pointer" />
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-4 py-1 text-[13px] flex items-center gap-1 text-vscode-text opacity-80 border-b border-vscode-border shadow-sm">
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
        <div className="w-[350px] bg-vscode-sidebar/80 backdrop-blur-md border-l border-vscode-border/50 flex flex-col">
          <div className="px-4 py-3 border-b border-vscode-border/50 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-vscode-text flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-yellow" />
              AI Voice Agent
            </span>
            {!hasApiKey && window.aistudio?.openSelectKey && (
              <button onClick={() => window.aistudio.openSelectKey()} className="text-[11px] text-brand-yellow hover:underline flex items-center gap-1">
                <Key className="w-3 h-3" /> Setup Key
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Transcript Area */}
            <div className="flex-1 bg-vscode-bg/80 rounded border border-vscode-border/50 p-3 overflow-y-auto text-[13px] font-mono">
              {transcript ? (
                <div className="whitespace-pre-wrap text-vscode-text">{transcript}</div>
              ) : (
                <div className="text-[#858585] italic text-center mt-10">
                  Transcript will appear here...
                </div>
              )}
            </div>

            {/* Voice Control */}
            <div className="bg-vscode-activity/80 rounded-lg p-4 flex flex-col items-center gap-4 border border-vscode-border/50">
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
              
              <div className="text-[12px] text-center text-vscode-text">
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
            ecommerco.ai AI
          </span>
        </div>
      </div>
      </div>

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-vscode-sidebar border border-vscode-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-vscode-border flex items-center justify-between bg-vscode-activity/50">
              <span className="text-xs font-bold uppercase tracking-wider text-vscode-text">Edit Task</span>
              <button onClick={() => setEditingTask(null)} className="text-vscode-text hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-vscode-text/60">Title</label>
                <input 
                  type="text" 
                  value={editingTask.text}
                  onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                  className="w-full bg-vscode-bg border border-vscode-border rounded px-3 py-2 text-sm text-vscode-text focus:outline-none focus:border-brand-yellow transition-colors"
                  placeholder="Task title..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-vscode-text/60">Description</label>
                <textarea 
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={4}
                  className="w-full bg-vscode-bg border border-vscode-border rounded px-3 py-2 text-sm text-vscode-text focus:outline-none focus:border-brand-yellow transition-colors resize-none"
                  placeholder="Add more details about this task..."
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => saveTask(editingTask)}
                  className="flex-1 bg-brand-yellow text-brand-black font-bold py-2 rounded text-sm hover:bg-brand-yellow/90 transition-colors"
                >
                  Save Task
                </button>
                <button 
                  onClick={() => setEditingTask(null)}
                  className="flex-1 bg-vscode-activity text-vscode-text font-bold py-2 rounded text-sm hover:bg-vscode-activity/80 transition-colors border border-vscode-border"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
