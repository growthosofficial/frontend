'use client';

import { useState } from 'react';
import { Zap, ExternalLink, X } from 'lucide-react';

export default function BoltBadge({ variant = 'floating', showDetails = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleBadgeClick = () => {
    if (showDetails) {
      setIsExpanded(!isExpanded);
    } else {
      window.open('https://bolt.new', '_blank');
    }
  };

  const FloatingBadge = () => (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main Badge */}
      <div
        onClick={handleBadgeClick}
        className="group relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Zap size={16} className="text-yellow-300 animate-pulse" />
            <div className="absolute inset-0 bg-yellow-300 rounded-full blur-sm opacity-30 animate-ping"></div>
          </div>
          <span className="text-sm font-semibold tracking-wide">Built with Bolt</span>
        </div>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
      </div>

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-80 transform transition-all duration-300 animate-in slide-in-from-bottom-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-lg blur-md opacity-30"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Built with Bolt</h3>
                <p className="text-sm text-gray-600">AI-powered development</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-700">
              <p>This application was created using <strong>Bolt</strong>, an AI-powered development platform that enables rapid prototyping and full-stack development.</p>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-700 font-medium">
                  ⚡ Features built with Bolt:
                </p>
                <ul className="text-xs text-purple-600 mt-1 space-y-1">
                  <li>• AI-powered knowledge curation</li>
                  <li>• Intelligent self-testing system</li>
                  <li>• Real-time data processing</li>
                  <li>• Modern React/Next.js architecture</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => window.open('https://bolt.new', '_blank')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Try Bolt
                <ExternalLink size={14} />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const InlineBadge = () => (
    <div
      onClick={handleBadgeClick}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
    >
      <Zap size={14} className="text-yellow-300" />
      <span>Built with Bolt</span>
    </div>
  );

  const FooterBadge = () => (
    <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
      <span className="text-sm">Powered by</span>
      <div
        onClick={handleBadgeClick}
        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:shadow-md transition-all duration-300"
      >
        <Zap size={12} className="text-yellow-300" />
        <span>Bolt</span>
      </div>
    </div>
  );

  switch (variant) {
    case 'floating':
      return <FloatingBadge />;
    case 'inline':
      return <InlineBadge />;
    case 'footer':
      return <FooterBadge />;
    default:
      return <FloatingBadge />;
  }
}