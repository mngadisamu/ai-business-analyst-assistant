import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  FileText,
  Settings,
  Moon,
  Sun,
  Download,
  Send,
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  Copy,
  Check,
  Menu,
  X,
  Key,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: number;
}

interface ChatSession {
  id: string;
  title: string;
  mode: 'Prompt Library Enforced' | 'Prompt Engineering Mode';
  messages: ChatMessage[];
  createdAt: number;
}

interface PromptTask {
  id: string;
  title: string;
  badge: string;
  description: string;
  prompt: string;
}

const PROMPT_LIBRARY_TASKS: PromptTask[] = [
  {
    id: 'req_analysis',
    title: '1. Requirement Analysis',
    badge: 'Core BA',
    description: 'Deconstruct raw requirements into need, stakeholders, scope, objectives, gaps, ambiguities, assumptions, and risks.',
    prompt: 'Using only the requirement below, pull out the main business need, stakeholder, requested functionality, objectives, gaps, ambiguities, assumptions, and risks. Separate provided information from AI assumptions.\n\nRequirement: Employees should be able to apply for leave online.'
  },
  {
    id: 'user_story',
    title: '2. User Story Creation',
    badge: 'Agile',
    description: 'Transform requirement into a single standard User Story (As a... I want... So that...) without inventing functionality.',
    prompt: 'Using only the requirement below, write a single User Story in the format: As a [user], I want [function], so that [benefit]. Do not add unsupported functionality.\n\nRequirement: Customer support agents need to search order history by phone number.'
  },
  {
    id: 'acceptance_criteria',
    title: '3. Acceptance Criteria (Given/When/Then)',
    badge: 'BDD',
    description: 'Generate positive and negative scenarios in Given/When/Then format, highlighting unknown rules.',
    prompt: "Using only the requirement below, write acceptance criteria in Given/When/Then format for both positive and negative scenarios. Mark unknown business rules as 'Requires clarification'.\n\nRequirement: Users can reset password via email link within 15 minutes."
  },
  {
    id: 'test_cases',
    title: '4. Structured Test Cases Table',
    badge: 'QA / Verification',
    description: 'Produce an end-to-end test case table with ID, Scenario, Preconditions, Steps, Expected Result, and Type.',
    prompt: 'Using only the requirement and acceptance criteria below, generate a structured test case table with: Test Case ID, Test Scenario, Preconditions, Test Steps, Expected Result, and Type (Positive/Negative).\n\nRequirement: Users must be locked out after 3 consecutive failed login attempts.'
  },
  {
    id: 'clarifications',
    title: '5. Stakeholder Clarification Questions',
    badge: 'Discovery',
    description: 'Formulate high-impact discovery questions on rules, security, validation, and permissions.',
    prompt: 'Using only the requirement below, list practical stakeholder clarification questions prioritizing users, business rules, validation, permissions, security, and data.\n\nRequirement: System must generate weekly financial summary reports.'
  },
  {
    id: 'prompt_eng',
    title: '6. Prompt Engineering Mode',
    badge: 'Meta Optimization',
    description: 'Analyze user prompt weaknesses, explain improvements, and output an engineered prompt with expected outcomes.',
    prompt: "Switch to Prompt Engineering Mode. Analyse this prompt for weaknesses, explain improvements, produce an improved prompt, and explain expected output improvements:\n\n'Write requirements for a shopping cart checkout'."
  }
];

const MASTER_SYSTEM_PROMPT = `You are an AI Business Analyst Assistant designed to support Business Analysts with requirements analysis and business documentation.
Your role is to transform raw, incomplete, or unstructured business requirements into clear, structured Business Analysis outputs.
You must act as an assistant, not a replacement for the Business Analyst. Do not invent business rules, requirements, processes, users, or system behaviour that have not been provided. When information is missing or ambiguous, clearly identify it and generate relevant clarification questions.

When evaluating or executing tasks from the prompt library, follow these exact guidelines:
1. Requirement Analysis: Pull out the main business need, stakeholder, requested functionality, objectives, gaps, ambiguities, assumptions, and risks. Separate provided information from AI assumptions.
2. User Story: Write in the format: As a [user], I want [function], so that [benefit]. Do not add unsupported functionality.
3. Acceptance Criteria: Write in Given/When/Then format including positive and negative scenarios. Mark unknown rules as "Requires clarification."
4. Test Cases: Generate a structured markdown table with columns: Test Case ID, Test Scenario, Preconditions, Test Steps, Expected Result, Type (Positive/Negative).
5. Clarification Questions: List practical stakeholder clarification questions prioritizing users, business rules, validation, permissions, security, and data.
6. Prompt Engineering Mode: When asked, analyse prompt weaknesses, explain improvements, produce an improved prompt, and explain expected output improvements.`;

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('ba_chats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    return localStorage.getItem('ba_current_chat') || null;
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('ba_gemini_api_key') || '';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ba_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [masterModalOpen, setMasterModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ba_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Sync chats to localStorage
  useEffect(() => {
    localStorage.setItem('ba_chats', JSON.stringify(chats));
  }, [chats]);

  // Sync current chat ID
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('ba_current_chat', currentChatId);
    }
  }, [currentChatId]);

  // Initialize first chat if empty
  useEffect(() => {
    if (chats.length === 0) {
      const initial: ChatSession = {
        id: 'ba_chat_' + Date.now(),
        title: 'New Requirement Session',
        mode: 'Prompt Library Enforced',
        messages: [],
        createdAt: Date.now()
      };
      setChats([initial]);
      setCurrentChatId(initial.id);
    } else if (!currentChatId || !chats.some(c => c.id === currentChatId)) {
      setCurrentChatId(chats[0].id);
    }
  }, []);

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isLoading]);

  const handleCreateNewChat = () => {
    const newChat: ChatSession = {
      id: 'ba_chat_' + Date.now(),
      title: 'New Requirement Session',
      mode: 'Prompt Library Enforced',
      messages: [],
      createdAt: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setSidebarOpen(false);
    setUserInput('');
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = chats.filter(c => c.id !== id);
    setChats(filtered);
    if (currentChatId === id) {
      setCurrentChatId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all requirement sessions?')) {
      const freshChat: ChatSession = {
        id: 'ba_chat_' + Date.now(),
        title: 'New Requirement Session',
        mode: 'Prompt Library Enforced',
        messages: [],
        createdAt: Date.now()
      };
      setChats([freshChat]);
      setCurrentChatId(freshChat.id);
      setSidebarOpen(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!currentChat || currentChat.messages.length === 0) {
      alert('No documentation available to export.');
      return;
    }
    const content =
      `# Business Analyst Documentation: ${currentChat.title}\n\n` +
      `*Mode: ${currentChat.mode}*\n` +
      `*Generated on: ${new Date().toLocaleString()}*\n\n---\n\n` +
      currentChat.messages
        .map(
          m =>
            `### ${m.role === 'user' ? 'Prompt / Business Requirement' : 'AI Business Analyst Output'}\n\n${m.text}\n`
        )
        .join('\n---\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ba_docs.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelectPrompt = (promptText: string) => {
    setUserInput(promptText);
    setLibraryModalOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = userInput.trim();
    if (!text || isLoading || !currentChat) return;

    const detectedMode = text.toLowerCase().includes('prompt engineering mode')
      ? 'Prompt Engineering Mode'
      : 'Prompt Library Enforced';

    const newTitle =
      currentChat.messages.length === 0
        ? text.length > 34
          ? text.slice(0, 34) + '...'
          : text
        : currentChat.title;

    const updatedMessages: ChatMessage[] = [
      ...currentChat.messages,
      { role: 'user', text, timestamp: Date.now() }
    ];

    setChats(prev =>
      prev.map(c =>
        c.id === currentChat.id
          ? {
              ...c,
              title: newTitle,
              mode: detectedMode,
              messages: updatedMessages
            }
          : c
      )
    );

    setUserInput('');
    setIsLoading(true);

    try {
      // 1. First attempt calling server endpoint /api/chat
      let aiText = '';
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          apiKey: apiKey || undefined,
          mode: detectedMode
        })
      });

      if (response.ok) {
        const data = await response.json();
        aiText = data.text;
      } else {
        // Fallback: direct Gemini call if user configured custom key
        const errJson = await response.json().catch(() => ({}));
        if (apiKey) {
          const directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: updatedMessages.map(m => ({
                  role: m.role === 'user' ? 'user' : 'model',
                  parts: [{ text: m.text }]
                })),
                systemInstruction: {
                  parts: [{ text: MASTER_SYSTEM_PROMPT }]
                }
              })
            }
          );
          if (!directRes.ok) {
            const directErr = await directRes.json().catch(() => ({}));
            throw new Error(directErr.error?.message || 'Failed to call Gemini API directly');
          }
          const directData = await directRes.json();
          aiText = directData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          throw new Error(errJson.error?.message || 'Server error communicating with Gemini API');
        }
      }

      setChats(prev =>
        prev.map(c =>
          c.id === currentChat.id
            ? {
                ...c,
                messages: [
                  ...updatedMessages,
                  { role: 'model', text: aiText, timestamp: Date.now() }
                ]
              }
            : c
        )
      );
    } catch (err: any) {
      console.error(err);
      const errMsg = `⚠️ **Error communicating with Gemini API**: ${err.message || 'Unknown error'}\n\nPlease verify your API key in Settings or check network connectivity.`;
      setChats(prev =>
        prev.map(c =>
          c.id === currentChat.id
            ? {
                ...c,
                messages: [
                  ...updatedMessages,
                  { role: 'model', text: errMsg, timestamp: Date.now() }
                ]
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format markdown text simply & cleanly
  const renderFormattedMarkdown = (text: string) => {
    // If text has markdown tables
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let tableRows: string[] = [];
    let inTable = false;
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockLines: string[] = [];

    const flushTable = () => {
      if (tableRows.length === 0) return;
      const headers = tableRows[0]
        .split('|')
        .map(c => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const dataRows = tableRows
        .slice(1)
        .filter(r => !r.includes('---'))
        .map(r =>
          r
            .split('|')
            .map(c => c.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        );

      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3 border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                {headers.map((h, i) => (
                  <th key={i} className="p-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-slate-700 dark:text-slate-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    };

    const flushCode = () => {
      const codeStr = codeBlockLines.join('\n');
      elements.push(
        <div key={`code-${elements.length}`} className="my-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-slate-100">
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
            <span>{codeBlockLang || 'code'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(codeStr)}
              className="hover:text-white flex items-center space-x-1"
            >
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </button>
          </div>
          <pre className="p-3 text-xs overflow-x-auto font-mono">
            <code>{codeStr}</code>
          </pre>
        </div>
      );
      codeBlockLines = [];
      inCodeBlock = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code fence
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          if (inTable) flushTable();
          inCodeBlock = true;
          codeBlockLang = line.trim().replace('```', '');
          continue;
        } else {
          flushCode();
          continue;
        }
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      // Table line
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableRows.push(line.trim());
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-sm font-bold text-sky-700 dark:text-sky-400 mt-4 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-4 list-disc text-sm text-slate-700 dark:text-slate-300 my-0.5">
            {line.substring(2)}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 my-1">
            {line}
          </p>
        );
      }
    }

    if (inTable) flushTable();
    if (inCodeBlock) flushCode();

    return elements;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 shadow-xl md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/25">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">BA Assistant Studio</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Prompt Library Enforced
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Session Button */}
        <div className="p-4">
          <button
            onClick={handleCreateNewChat}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition flex items-center justify-center space-x-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Requirement Session</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chats.map(chat => {
            const isActive = chat.id === currentChatId;
            return (
              <div
                key={chat.id}
                onClick={() => {
                  setCurrentChatId(chat.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate flex-1">
                  <FileText className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{chat.title}</span>
                </div>
                {chats.length > 1 && (
                  <button
                    onClick={e => handleDeleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition"
                    title="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <button
            onClick={() => setLibraryModalOpen(true)}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <span>Prompt Library (6 Tasks)</span>
          </button>
          <button
            onClick={() => setMasterModalOpen(true)}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ShieldAlert className="h-4 w-4 text-sky-500" />
            <span>Master BA Rules</span>
          </button>
          <button
            onClick={() => setVerifyModalOpen(true)}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            <span>Compliance Checklist</span>
          </button>
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Settings className="h-4 w-4 text-amber-500" />
            <span>API Settings</span>
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-400" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleClearAll}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset All Sessions</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 dark:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold text-sm truncate max-w-[200px] sm:max-w-md">
              {currentChat?.title || 'Requirements Session'}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hidden sm:inline-block">
              {currentChat?.mode || 'Prompt Library Enforced'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setLibraryModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden sm:flex items-center space-x-1.5"
              title="Open Prompt Library"
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
              <span>Library</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center space-x-1.5"
              title="Export Documentation to Markdown"
            >
              <Download className="h-3.5 w-3.5 text-sky-600" />
              <span className="hidden sm:inline">Export .md</span>
            </button>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="API Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {(!currentChat || currentChat.messages.length === 0) ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-4 max-w-xl mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 shadow-inner">
                <Briefcase className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">AI Business Analyst Assistant</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Powered by your exact prompt library. Enter requirements or choose a prompt library task below.
              </p>

              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 w-full text-left">
                Quick Library Task Prompts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                {PROMPT_LIBRARY_TASKS.slice(0, 4).map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleSelectPrompt(task.prompt)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-start space-x-2.5"
                  >
                    <Sparkles className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 dark:text-white">{task.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{task.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message turns */
            currentChat.messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-slate-800 dark:bg-slate-700 text-white'
                        : 'bg-sky-600 text-white'
                    }`}
                  >
                    {isUser ? <FileText className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                  </div>

                  <div
                    className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-5 py-4 text-sm shadow-sm relative group ${
                      isUser
                        ? 'bg-sky-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCopyMessage(msg.text, index)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 px-2.5 py-1 rounded-lg text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
                          title="Copy response"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        {renderFormattedMarkdown(msg.text)}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs shrink-0 shadow-sm">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-bounce"></span>
                <span className="text-xs text-slate-400 ml-1.5">Analyzing requirements...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          {/* Quick pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {PROMPT_LIBRARY_TASKS.map(task => (
              <button
                key={task.id}
                onClick={() => handleSelectPrompt(task.prompt)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-400 text-slate-600 dark:text-slate-300 transition shrink-0 border border-slate-200 dark:border-slate-700/60"
              >
                {task.title}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Paste raw requirements or enter a BA task (Shift+Enter for newline)..."
              className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none max-h-36 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className="absolute right-2.5 h-8 w-8 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 px-1">
            <span>Enforcing Anti-Fabrication: Missing rules marked as 'Requires clarification'</span>
            <span>Enterprise BA Assistant</span>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Key className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-base">Gemini API Key Settings</h3>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                AI Studio automatically injects your workspace runtime key. You can also specify an optional custom Gemini API Key below:
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIzaSy... (leave blank to use runtime default)"
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Keys are stored in your browser's secure localStorage.</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('ba_gemini_api_key', apiKey.trim());
                  setSettingsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white transition shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Rules Modal */}
      {masterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="h-5 w-5 text-sky-600" />
                <h3 className="font-bold text-base">AI Business Analyst Assistant — Master Rules</h3>
              </div>
              <button
                onClick={() => setMasterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto text-sm text-slate-600 dark:text-slate-300">
              <p>
                You are an AI Business Analyst Assistant designed to support Business Analysts with requirements analysis and business documentation. Your role is to transform raw, incomplete, or unstructured business requirements into clear, structured Business Analysis outputs.
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white mt-3">Anti-Fabrication & Strict Rules:</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Act as an assistant, not a replacement for the Business Analyst.</li>
                <li>Do NOT invent business rules, requirements, processes, users, or system behaviour that have not been provided.</li>
                <li>When information is missing or ambiguous, clearly identify it and generate relevant clarification questions.</li>
                <li>Separate provided facts from AI assumptions at all times.</li>
                <li>Unknown rules in Acceptance Criteria MUST be labeled explicitly as <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">Requires clarification</code>.</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setMasterModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {libraryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-base">Prompt Library & Task Prompts</h3>
              </div>
              <button
                onClick={() => setLibraryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto text-sm text-slate-600 dark:text-slate-300">
              <p className="text-xs text-slate-500">
                Click any task prompt below to insert it directly into your chat session.
              </p>
              <div className="space-y-3">
                {PROMPT_LIBRARY_TASKS.map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleSelectPrompt(task.prompt)}
                    className="w-full p-4 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {task.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {task.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{task.description}</p>
                    <div className="text-[11px] font-mono p-2 bg-slate-200/60 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 line-clamp-2">
                      {task.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setLibraryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Compliance Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="h-5 w-5 text-sky-600" />
                <h3 className="font-bold text-base">Prompt Library Compliance Status</h3>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto text-sm text-slate-600 dark:text-slate-300">
              <p className="text-xs text-slate-500">
                The assistant system instructions are rigorously verified and enforced:
              </p>
              <div className="space-y-3">
                {[
                  { title: 'Task 1: Requirement Analysis', desc: 'Separates provided facts from assumptions, pulls business needs, stakeholders, gaps, and risks.' },
                  { title: 'Task 2: User Story Format', desc: 'Strict "As a [user], I want [function], so that [benefit]" template with zero unauthorized extras.' },
                  { title: 'Task 3: Acceptance Criteria', desc: 'Enforces Given/When/Then scenarios with "Requires clarification" labels on unknown rules.' },
                  { title: 'Task 4: Test Cases Table', desc: 'Outputs standardized 6-column Markdown tables (ID, Scenario, Preconditions, Steps, Expected Result, Type).' },
                  { title: 'Task 5: Clarification Questions', desc: 'Targeted stakeholder discovery on business rules, validation, security, and data handling.' },
                  { title: 'Task 6: Prompt Engineering Mode', desc: 'Analyzes prompt weaknesses, provides actionable improvements, and produces enhanced prompts.' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start space-x-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">{item.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
