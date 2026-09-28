import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { StudentsView } from './components/views/StudentsView';
import { StudentProfileView } from './components/views/StudentProfileView';
import { AcademicsView } from './components/views/AcademicsView';
import { AttendanceView } from './components/views/AttendanceView';
import { ConductView } from './components/views/ConductView';
import { CommentsView } from './components/views/CommentsView';
import { ProgressView } from './components/views/ProgressView';
import { ReportsView } from './components/views/ReportsView';
import { CheckCircle2, AlertCircle, Info, Menu, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, toast } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentsView />;
      case 'student-profile':
        return <StudentProfileView />;
      case 'academics':
        return <AcademicsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'conduct':
        return <ConductView />;
      case 'comments':
        return <CommentsView />;
      case 'progress':
        return <ProgressView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Header bar */}
      <Header />

      {/* Mobile nav trigger banner */}
      <div className="md:hidden bg-sky-800 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold print:hidden shadow-xs">
        <span>Menu Điều Hướng Lớp 3A2</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Layout wrapper: Sidebar + Main Content */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block shrink-0`}>
          <Sidebar />
        </div>

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderCurrentView()}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toast.type === 'warning'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-sky-700 text-white border-sky-600'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-200" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-200" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
