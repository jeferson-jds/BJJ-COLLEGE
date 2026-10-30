import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SkeletonList } from './SkeletonLoader';

export const AdminRoute: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <SkeletonList count={3} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Se for aluno tentando acessar área do professor, redireciona para sua área de aluno
    return <Navigate to="/aluno" replace />;
  }

  return <Outlet />;
};

export const AlunoRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <SkeletonList count={3} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o professor entrar na rota de aluno, ele pode visualizar o modo aluno ou voltar pro admin
  return <Outlet />;
};

export const AuthenticatedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <SkeletonList count={3} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
