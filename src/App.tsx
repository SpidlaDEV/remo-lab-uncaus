import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { LaboratoryList } from './components/LaboratoryList';
import { RemoteLab } from './components/RemoteLab';
import { ExperimentHistory } from './components/ExperimentHistory';
import {RemoteLabOld} from "./components/RemoteLabOld";

type PageType = 'home' | 'login' | 'labs' | 'remote-lab' | 'history' | 'claude';

export default function App() {
  // TODO cambiar
  const [currentPage, setCurrentPage] = useState<PageType>('remote-lab');
  const [selectedLab, setSelectedLab] = useState<string | null>('cip-001');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const navigateTo = (page: PageType, labId?: string) => {
    if (labId) {
      setSelectedLab(labId);
    }
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigateTo('labs');
  };

  const handleHome = () => {
    setIsLoggedIn(false);
    navigateTo('home');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {currentPage === 'home' && (
        <HomePage 
          onLogin={() => navigateTo('login')} 
          onExplore={() => navigateTo('login')}
        />
      )}
      
      {currentPage === 'login' && (
        <LoginPage
            onLogin={handleLogin}
            onHome={handleHome}
        />
      )}
      
      {currentPage === 'labs' && isLoggedIn && (
        <LaboratoryList 
          onSelectLab={(labId) => navigateTo('remote-lab', labId)}
          onViewHistory={() => navigateTo('history')}
          onLogout={handleHome}
        />
      )}
      
      {currentPage === 'remote-lab' && isLoggedIn && selectedLab && (
        <RemoteLab 
          labId={selectedLab}
          onBack={() => navigateTo('labs')}
          onViewHistory={() => navigateTo('history')}
        />
      )}
      
      {currentPage === 'history' && isLoggedIn && (
        <ExperimentHistory 
          onBack={() => navigateTo('labs')}
        />
      )}

      {currentPage === 'claude' && (
        <RemoteLabOld
            labId={selectedLab}
            onBack={() => navigateTo('labs')}
            onViewHistory={() => navigateTo('history')}
            />
      )}
    </div>
  );
}
