import { useState } from 'react';
import { LayoutDashboard, ChevronRight, Rocket, CheckCircle, ExternalLink, Globe, Lock, Zap, Activity, Copy, Check, Cloud, Server, Terminal } from 'lucide-react';

export default function DeployPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deployStep, setDeployStep] = useState(0);

  const renderURL = 'https://heal-the-world-foundation.onrender.com';
  const repoURL = 'https://github.com/yourusername/heal-the-world-foundation';

  const deploySteps = [
    {
      title: 'Push Your Code to GitHub',
      description: 'Create a GitHub repository and push your project code.',
      cmd: `git init
git add .
git commit -m "Initial commit - Heal The World Foundation"
git branch -M main
git remote add origin ${repoURL}
git push -u origin main`,
      icon: <Globe className="w-5 h-5" />,
    },
    {
      title: 'Create Render Account',
      description: 'Sign up for a free Render account at render.com.',
      cmd: 'Visit: https://render.com/register',
      icon: <Cloud className="w-5 h-5" />,
    },
    {
      title: 'Connect GitHub Repository',
      description: 'In Render dashboard, click "New +" → "Web Service" → Select your GitHub repo.',
      cmd: 'Render will auto-detect your repository and build settings.',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      title: 'Configure Build Settings',
      description: 'Render reads the render.yaml blueprint automatically.',
      cmd: `Frontend (Static Site):
  Build:  npm install && npm run build
  Serve:  dist/

Backend (Python/Flask):
  Build:  pip install -r backend/requirements.txt
  Start:  cd backend && gunicorn --bind 0.0.0.0:$PORT --workers 4 app:app`,
      icon: <Terminal className="w-5 h-5" />,
    },
    {
      title: 'Deploy & Get Your URL',
      description: 'Render automatically builds and deploys your application.',
      cmd: `Your site will be live at:
${renderURL}

HTTPS is included automatically! 🎉`,
      icon: <Rocket className="w-5 h-5" />,
    },
  ];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-5xl fade-in animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 transition-colors">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Deploy to Render</span>
      </div>

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-8 transition-colors duration-300 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Deploy to Render</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 transition-colors">Your live site will be available at:</p>
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
              <code className="text-sm font-bold text-green-700 dark:text-green-300 font-mono">{renderURL}</code>
              <button onClick={() => copyToClipboard(renderURL, 'url')} className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Why Render Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-6 mb-8 transition-colors duration-300 animate-fade-in-up delay-1">
        <h3 className="font-bold text-blue-900 dark:text-blue-200 text-lg mb-4 transition-colors">Why Render?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Free Tier', desc: 'Free web services & PostgreSQL', icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
            { label: 'Trusted', desc: 'Used by 1M+ developers', icon: <Globe className="w-5 h-5 text-blue-600" /> },
            { label: 'Flask Support', desc: 'Native Python & Gunicorn', icon: <Server className="w-5 h-5 text-purple-600" /> },
            { label: 'Auto HTTPS', desc: 'SSL included by default', icon: <Lock className="w-5 h-5 text-emerald-600" /> },
          ].map((feat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900/60 rounded-xl p-4 shadow-sm">
              <div className="mb-2">{feat.icon}</div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white transition-colors">{feat.label}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors mt-0.5">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Deployment Guide */}
      <div className="space-y-6 mb-8">
        {deploySteps.map((step, idx) => {
          const isCompleted = idx < deployStep;
          const isCurrent = idx === deployStep;

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-6 transition-all duration-300 ${
                isCurrent ? 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/20 dark:ring-blue-500/20' : 'border-gray-100 dark:border-gray-800'
              } ${isCompleted ? 'opacity-70' : 'animate-scale-in'}`}
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 transition-colors flex items-center gap-2">
                    {step.icon}
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">{step.description}</p>

                  <div className="flex items-center justify-between p-4 bg-gray-950 dark:bg-gray-950 rounded-xl border border-gray-800">
                    <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap break-all">{step.cmd}</pre>
                    <button
                      onClick={() => copyToClipboard(step.cmd, `step-${idx}`)}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors flex-shrink-0 ml-2 self-start"
                    >
                      {copiedField === `step-${idx}` ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {isCurrent && (
                    <button
                      onClick={() => setDeployStep(prev => prev + 1)}
                      className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                    >
                      {idx === deploySteps.length - 1 ? '🚀 Deploy Now on Render' : `Next Step →`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* render.yaml Configuration Reference */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in delay-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
          <Terminal className="w-5 h-5 text-orange-500" />
          render.yaml Blueprint Configuration
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">
          This blueprint file configures Render to automatically deploy your full-stack application with PostgreSQL database.
        </p>
        <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 overflow-x-auto">
          <pre className="text-green-300/90 font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
{`services:
  # Frontend - React SPA served as static site
  - type: web
    name: heal-the-world-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: dist

  # Backend - Python Flask API
  - type: web
    name: heal-the-world-api
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && gunicorn --bind 0.0.0.0:$PORT --workers 4 app:app

databases:
  - name: heal-the-world-db
    databaseName: healtheworld
    plan: free`}
          </pre>
        </div>
      </div>

      {/* Security Checklist */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in delay-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
          <Lock className="w-5 h-5 text-red-500" />
          Pre-Deployment Security Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Environment Variables Set in Render Dashboard', done: true },
            { label: 'SECRET_KEY Generated (not default)', done: true },
            { label: 'PostgreSQL Database Created (Free)', done: true },
            { label: 'Werkzeug Password Hashing Active', done: true },
            { label: 'Flask-Login Session Cookies Secure', done: true },
            { label: 'HTTPS/SSL Certificate (Auto-enabled)', done: true },
            { label: 'CORS Configured for Render Domain', done: true },
            { label: 'SendGrid API Key (Email Notifications)', done: false },
            { label: 'Cloudinary URL (Cloud Image Storage)', done: false },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl transition-colors">
              <Activity className={`w-4 h-4 flex-shrink-0 ${item.done ? 'text-green-500' : 'text-amber-500'}`} />
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-white transition-colors">{item.label}</p>
                <span className={`text-[9px] font-bold ${item.done ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {item.done ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-scale-in delay-7">
        {[
          { name: 'Render Dashboard', url: 'https://dashboard.render.com', desc: 'Manage your services', color: 'hover:bg-blue-50 dark:hover:bg-blue-950/30' },
          { name: 'Render Docs', url: 'https://render.com/docs', desc: 'Deployment documentation', color: 'hover:bg-gray-50 dark:hover:bg-gray-800' },
          { name: 'Live Site', url: renderURL, desc: 'Your live application', color: 'hover:bg-green-50 dark:hover:bg-green-950/30' },
        ].map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 card-hover-lift ${link.color}`}
          >
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
              {link.name}
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">{link.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
