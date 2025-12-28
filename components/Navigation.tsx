
import React from 'react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const tabs = [
    { 
      id: AppView.STUDENT, 
      label: 'ส่งงาน 🚀', 
      activeClass: 'from-orange-400 to-red-500 border-red-600 shadow-orange-200',
      inactiveClass: 'hover:from-orange-50 hover:to-orange-100'
    },
    { 
      id: AppView.RESULT, 
      label: 'เช็คคะแนน 🏆', 
      activeClass: 'from-yellow-400 to-amber-500 border-amber-600 shadow-yellow-200',
      inactiveClass: 'hover:from-yellow-50 hover:to-yellow-100'
    },
    { 
      id: AppView.GALLERY, 
      label: 'โรงหนังเพื่อน 🎬', 
      activeClass: 'from-pink-400 to-rose-500 border-rose-600 shadow-pink-200',
      inactiveClass: 'hover:from-pink-50 hover:to-pink-100'
    },
    { 
      id: AppView.TEACHER, 
      label: "ห้องคุณครู 📚", 
      activeClass: 'from-indigo-500 to-purple-600 border-indigo-700 shadow-indigo-200',
      inactiveClass: 'hover:from-indigo-50 hover:to-indigo-100'
    },
    { 
      id: AppView.DASHBOARD, 
      label: 'สรุปภาพรวม 📊', 
      activeClass: 'from-emerald-400 to-teal-500 border-teal-600 shadow-emerald-200',
      inactiveClass: 'hover:from-emerald-50 hover:to-emerald-100'
    },
  ];

  return (
    <nav className="flex flex-wrap justify-center gap-4 mb-10 w-full max-w-5xl px-4">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id || (currentView === AppView.TEACHER_LOGIN && tab.id === AppView.TEACHER);
        
        return (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`
              relative px-6 py-4 rounded-3xl font-bold transition-all transform 
              active:translate-y-1 active:border-b-0
              shadow-lg border-b-8 flex items-center justify-center gap-2
              ${isActive 
                ? `bg-gradient-to-br ${tab.activeClass} text-white scale-110 ring-4 ring-white/50 z-10` 
                : `bg-white/60 text-gray-600 border-gray-200 backdrop-blur-sm ${tab.inactiveClass} hover:-translate-y-1`
              }
            `}
          >
            <span className="text-xl">{tab.label.split(' ')[1]}</span>
            <span className="text-lg">{tab.label.split(' ')[0]}</span>
            
            {/* Spotlight effect for active tab */}
            {isActive && (
              <div className="absolute inset-0 bg-white/20 rounded-3xl pointer-events-none opacity-50 blur-sm"></div>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
