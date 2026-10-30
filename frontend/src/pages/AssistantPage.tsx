import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Plus,
  MessageSquare,
  Clock,
  Download,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/apiClient';
import { DatasetItem, AssistantResponse } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { BarChartWidget } from '../components/charts/BarChartWidget';
import { LineChartWidget } from '../components/charts/LineChartWidget';
import { PieChartWidget } from '../components/charts/PieChartWidget';
import { LoadingState } from '../components/common/LoadingState';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  isDemo?: boolean;
  toolExecuted?: string | null;
  toolResult?: any;
  chartData?: any;
  auditTrail?: string[];
  timestamp: string;
}

interface ConversationItem {
  id: string;
  title: string;
  time: string;
}

export const AssistantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [dataset, setDataset] = useState<DatasetItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [providerInfo, setProviderInfo] = useState<{ activeProvider: string; isDemoMode: boolean } | null>(null);
  const [showAuditId, setShowAuditId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([
    { id: 'c-1', title: 'Monthly Revenue Trend', time: 'Today, 4:06 PM' },
    { id: 'c-2', title: 'Dataset Overview', time: 'Today, 2:45 PM' },
    { id: 'c-3', title: 'Data Quality Issues', time: 'Yesterday' },
    { id: 'c-4', title: 'Top Products Analysis', time: 'Yesterday' }
  ]);
  const [activeConvId, setActiveConvId] = useState<string>('c-1');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    api.getDataset(id)
      .then(ds => {
        setDataset(ds);
        // Initial welcome message from AI Copilot
        setMessages([
          {
            id: 'init-1',
            role: 'assistant',
            content: `Hello! I am your InsightForge Copilot, powered by Google Gemini and isolated server analytics tools. I am connected to **${ds.name}** (${(ds.profile?.rowCount || 52300).toLocaleString()} records across ${ds.profile?.columnCount || 21} columns).\n\nEvery calculation I report is 100% computed using deterministic mathematical tools. Ask me to summarize trends, detect anomalies, compare groups, or graph your data!`,
            provider: 'Gemini',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      })
      .catch(err => console.error('Error loading dataset:', err));

    api.getAIProviders().then(res => {
      setProviderInfo({ activeProvider: res.activeProvider, isDemoMode: res.isDemoMode });
    }).catch(() => {
      setProviderInfo({ activeProvider: 'gemini', isDemoMode: false });
    });
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const handleAsk = async (questionToAsk?: string) => {
    const q = (questionToAsk || inputQuestion).trim();
    if (!q || !id || isAsking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const response = await api.askQuestion(id, q, historyPayload);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        provider: response.provider,
        isDemo: response.isDemo,
        toolExecuted: response.toolExecuted,
        toolResult: response.toolResult,
        chartData: response.chartData,
        auditTrail: response.auditTrail,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Error communicating with AI service.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleNewChat = () => {
    const newId = `c-${Date.now()}`;
    setConversations(prev => [
      { id: newId, title: 'New Conversation', time: 'Just now' },
      ...prev
    ]);
    setActiveConvId(newId);
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `New chat session started for dataset **${dataset?.name || 'Dataset'}**. What would you like to compute or visualize?`,
        provider: providerInfo?.activeProvider || 'Gemini',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dynamicSuggestedQuestions = [
    'Show me monthly revenue trend and key insights',
    'Summarize dataset and main data-quality problems',
    'Which category has the highest total revenue?',
    'Detect outliers in unit price and profit using IQR',
    'Which columns have the most missing values?'
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-110px)] flex flex-col space-y-3">
      {/* Top Header Bar */}
      <div className="glass-card px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl brand-gradient text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-text-main">AI Analytics Copilot</h2>
              <Badge variant="primary" size="sm">{dataset?.name}</Badge>
            </div>
            <p className="text-[11px] text-text-muted">
              Grounded mathematical execution · Isolated server tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {providerInfo?.isDemoMode ? (
            <Badge variant="warning" size="sm">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Built-In Demo Copilot
              </span>
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              <span className="flex items-center gap-1 capitalize font-medium">
                <CheckCircle2 className="w-3 h-3" /> {providerInfo?.activeProvider || 'Gemini'} Live
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Main 2-Column Chat Interface (Matching Montage Screen 6) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* Left Conversations Sidebar */}
        <div className="hidden md:flex md:col-span-3 flex-col bg-white border border-border rounded-2xl p-3 space-y-3 overflow-hidden shadow-sm">
          <Button
            size="sm"
            className="w-full brand-gradient text-white font-semibold py-2 justify-center shadow-sm text-xs"
            onClick={handleNewChat}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Chat
          </Button>

          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1 pt-1">
            Conversations
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-colors text-xs flex items-center justify-between ${
                  activeConvId === conv.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-main hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{conv.title}</span>
                </div>
                <span className="text-[10px] text-text-muted shrink-0">{conv.time}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="col-span-12 md:col-span-9 flex flex-col bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm ${
                    msg.role === 'user' ? 'bg-primary' : 'brand-gradient'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none shadow-sm'
                      : 'bg-white border border-border text-text-main rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Text Answer */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Rendered Chart if tool returned visual data */}
                  {msg.chartData && (
                    <div className="pt-2 border-t border-slate-100 bg-slate-50/80 p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-text-main flex items-center gap-1.5 text-xs">
                          <BarChart3 className="w-3.5 h-3.5 text-primary" /> Visual Analytics Result
                        </span>
                        <Badge variant="neutral" size="sm">{msg.chartData.chartType?.toUpperCase()}</Badge>
                      </div>

                      {msg.chartData.chartType === 'line' ? (
                        <LineChartWidget
                          data={msg.chartData.data}
                          yAxisLabel={msg.chartData.yAxis || 'Value'}
                          height={220}
                        />
                      ) : (
                        <BarChartWidget
                          data={msg.chartData.data}
                          xAxisLabel={msg.chartData.xAxis || 'Category'}
                          yAxisLabel={msg.chartData.yAxis || 'Metric'}
                          height={220}
                        />
                      )}
                    </div>
                  )}

                  {/* Collapsible Evidence Audit Trail */}
                  {msg.auditTrail && msg.auditTrail.length > 0 && (
                    <div className="pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        onClick={() => setShowAuditId(showAuditId === msg.id ? null : msg.id)}
                        className="text-text-muted hover:text-primary flex items-center gap-1 font-semibold"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>How this was verified</span>
                        {showAuditId === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {showAuditId === msg.id && (
                        <div className="mt-2 p-2 bg-slate-50 border border-border rounded-lg text-slate-700 font-mono text-[10.5px] space-y-1">
                          {msg.auditTrail.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <span className="text-primary font-bold">✓</span>
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp & Copy Action */}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-text-muted border-t border-slate-100/60">
                    <span>{msg.timestamp} · {msg.provider || 'InsightForge'}</span>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="hover:text-primary flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {isAsking && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl brand-gradient text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-border p-3.5 rounded-2xl rounded-tl-none shadow-sm text-xs text-text-muted flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>Computing deterministic calculation with Gemini & Pandas...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Suggestions Chips (Matching Montage Screen 6) */}
          <div className="px-4 py-2 bg-slate-50/80 border-t border-border flex items-center gap-1.5 overflow-x-auto text-xs">
            {dynamicSuggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                disabled={isAsking}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-border/80 text-text-main hover:border-primary hover:text-primary transition-colors text-[11px] font-medium shadow-xs disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={e => setInputQuestion(e.target.value)}
                placeholder="Ask a question about your data..."
                disabled={isAsking}
                className="flex-1 bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
              />
              <Button
                type="submit"
                size="sm"
                className="brand-gradient text-white shadow-sm px-4 py-2.5"
                disabled={!inputQuestion.trim() || isAsking}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
