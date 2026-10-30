import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Database,
  BarChart3,
  Bot,
  Shield,
  FileSpreadsheet,
  Cpu,
  CheckCircle2,
  ChevronDown,
  Layers,
  Terminal,
  Zap,
  Play,
  FileText,
  Sliders,
  Lock,
  FileCode
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What file formats can I analyze with InsightForge AI?',
      a: 'InsightForge AI accepts standard CSV (.csv) and Excel spreadsheet files (.xlsx, .xls). It automatically parses columns, detects numerical vs categorical datatypes, flags missing cells, and calculates data health scores.'
    },
    {
      q: 'Do I need to know Python, SQL, or programming to use it?',
      a: 'Not at all. You can explore interactive charts, filter variables, clean messy columns, and ask natural language questions without writing a single line of code.'
    },
    {
      q: 'How does the AI Assistant calculate numerical answers?',
      a: 'InsightForge AI uses strict tool calling and data grounding. When you ask a question like "What is the average sales in the North region?", the model invokes approved Python/pandas tools to compute the actual mathematical value. It never invents numbers.'
    },
    {
      q: 'Can I use InsightForge AI for free without paying for an API key?',
      a: 'Yes! The project includes a fully functional Built-in Demo Copilot that executes genuine dataset calculations on your data without requiring any external API key. You can also connect free-tier keys from Google Gemini or Groq at any time.'
    },
    {
      q: 'How are my uploaded datasets stored and handled?',
      a: 'Uploaded files are securely isolated outside public web directories in private server storage. No raw datasets are sent to public model training queues, and data retention can be managed in settings.'
    }
  ];

  return (
    <div className="min-h-screen bg-page flex flex-col selection:bg-primary selection:text-white">
      {/* Navigation Bar (Screen 1) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-text-main font-bold text-base tracking-tight flex items-center gap-1.5">
              InsightForge <span className="text-primary font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-text-muted">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-primary transition-colors">Docs</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-semibold text-text-muted hover:text-text-main px-3 py-2">
              Sign In
            </Link>
            <Link to="/app/dashboard">
              <Button size="sm" className="brand-gradient text-white shadow-sm font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Matching Montage Screen 1) */}
      <section className="pt-16 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column Text & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI-Powered Data Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-main tracking-tight leading-[1.12]">
            Turn Your Data Into <br />
            <span className="text-primary">Real Insights with AI</span>
          </h1>

          <p className="text-sm sm:text-base text-text-muted max-w-xl leading-relaxed">
            Upload your data, clean it, visualize it, and ask questions in natural language.
            Your personal data analytics copilot.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/app/dashboard">
              <Button size="lg" className="brand-gradient text-white shadow-md font-semibold px-6">
                Get Started Free
              </Button>
            </Link>
            <a href="#demo">
              <Button variant="outline" size="lg" icon={<Play className="w-4 h-4 text-primary fill-primary/20" />} className="px-5">
                Watch Demo
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-text-muted">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Powered by Gemini</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Works with CSV, Excel</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Dashboard Preview Card */}
        <div className="lg:col-span-5" id="demo">
          <div className="bg-white border border-border rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs font-bold text-text-main ml-2 font-mono">InsightForge Dashboard</span>
              </div>
              <Badge variant="primary" size="sm">Live Model</Badge>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs flex items-center justify-between">
              <span className="text-text-main font-semibold">User: &quot;Show me monthly sales trend and key insights&quot;</span>
              <Bot className="w-4 h-4 text-primary shrink-0" />
            </div>

            {/* Simulated mini chart */}
            <div className="p-3 bg-slate-50 border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="font-semibold text-text-main">Monthly Revenue Trend</span>
                <span className="text-emerald-600 font-bold">+32% Nov Peak</span>
              </div>
              <div className="h-28 flex items-end justify-between gap-1.5 pt-4 px-2">
                {[35, 42, 38, 55, 62, 58, 70, 75, 82, 90, 100, 88].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-text-muted font-mono px-1">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Total revenue: $14.8M across 12 months
              </p>
              <p className="text-[11px] text-emerald-700">Verified by server-side deterministic tool calls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Feature Cards Row (Matching Montage Screen 1 bottom) */}
      <section id="features" className="py-12 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                title: 'Data Analysis',
                subtitle: 'Instant insights',
                icon: Database,
                desc: 'Automated type inference, shape inspection, and descriptive statistics.'
              },
              {
                title: 'AI Assistant',
                subtitle: 'Ask questions',
                icon: Bot,
                desc: 'Chat with your datasets using Google Gemini with strict mathematical grounding.'
              },
              {
                title: 'Data Cleaning',
                subtitle: 'Fix issues easily',
                icon: Sliders,
                desc: 'Non-destructive duplicate dropping, missing imputation, and date standardization.'
              },
              {
                title: 'Beautiful Charts',
                subtitle: 'Interactive visualizations',
                icon: BarChart3,
                desc: 'Scatter plots, time series lines, category bars, and donut distributions.'
              },
              {
                title: 'Export Reports',
                subtitle: 'PDF, CSV and more',
                icon: FileText,
                desc: 'Generate executive summary reports with printable layouts and clean CSV data.'
              }
            ].map(f => (
              <div key={f.title} className="p-4 rounded-xl border border-border/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center border border-blue-100">
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-text-main text-xs">{f.title}</h3>
                  <p className="text-[11px] font-semibold text-primary">{f.subtitle}</p>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-text-main">Frequently Asked Questions</h2>
          <p className="text-xs text-text-muted mt-1">Everything you need to know about InsightForge AI</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-xl bg-white overflow-hidden transition-all text-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between font-semibold text-text-main hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="p-4 pt-0 text-text-muted leading-relaxed border-t border-slate-100/80">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-border text-center text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 InsightForge AI. Built with production-minded engineering.</p>
          <div className="flex items-center gap-6">
            <Link to="/app/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link to="/app/settings" className="hover:text-primary">Settings</Link>
            <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="hover:text-primary">Gemini API</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
