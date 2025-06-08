// App.tsx - React Router対応版（v7フューチャーフラグ対応）
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { AdminPage } from './pages/AdminPage';
import { DebugPage } from './pages/DebugPage';
import { useDarkMode } from './hooks/useDarkMode';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  // ダークモードの初期化（全ページで共通）
  useDarkMode();

  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
