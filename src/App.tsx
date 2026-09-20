import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { BottomNavigation } from './components/BottomNavigation';
import { AdminRoute, AlunoRoute } from './components/ProtectedRoute';
import { SplashScreen } from './components/SplashScreen';
import { useAuth } from './hooks/useAuth';

// Pages
import { Login } from './pages/Login';
import { PrimeiroAcesso } from './pages/PrimeiroAcesso';
import { RecuperarSenha } from './pages/RecuperarSenha';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAlunosList } from './pages/AdminAlunosList';
import { AdminAlunoNovo } from './pages/AdminAlunoNovo';
import { AdminAlunoDetalhes } from './pages/AdminAlunoDetalhes';
import { AdminPagamentos } from './pages/AdminPagamentos';
import { AdminAvisos } from './pages/AdminAvisos';
import { AdminConfiguracoes } from './pages/AdminConfiguracoes';
import { AlunoDashboard } from './pages/AlunoDashboard';
import { AlunoPerfil } from './pages/AlunoPerfil';

const RootRedirect: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isAdmin ? '/admin' : '/aluno'} replace />;
};

const AppContent: React.FC = () => {
  const { user, profile, alunoData, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100/70 text-neutral-900 selection:bg-red-600 selection:text-white font-sans">
      {user && (
        <AppHeader
          userName={profile?.nome_completo || user.nome_completo}
          userFaixa={alunoData?.faixa_atual}
          isAdmin={isAdmin}
        />
      )}

      <main className="flex-1">
        <Routes>
          {/* Redirecionamento Inicial */}
          <Route path="/" element={<RootRedirect />} />

          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />

          {/* Rotas Protegidas do Prof. Rogério (Admin) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/alunos" element={<AdminAlunosList />} />
            <Route path="/admin/alunos/novo" element={<AdminAlunoNovo />} />
            <Route path="/admin/alunos/:id" element={<AdminAlunoDetalhes />} />
            <Route path="/admin/pagamentos" element={<AdminPagamentos />} />
            <Route path="/admin/avisos" element={<AdminAvisos />} />
            <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />
          </Route>

          {/* Rotas Protegidas do Aluno */}
          <Route element={<AlunoRoute />}>
            <Route path="/aluno" element={<AlunoDashboard />} />
            <Route path="/aluno/perfil" element={<AlunoPerfil />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {user && <BottomNavigation />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
