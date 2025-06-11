
// client/src/components/routing/PrivateRoute.js - 改良版
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const PrivateRoute = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();
  
  // 認証コンテキストが利用可能か確認
  if (!auth) {
    console.error('PrivateRoute: Auth context is not available');
    return <div>Error: Auth context is not available</div>;
  }
  
  const { isAuthenticated, loading } = auth;

  console.log('PrivateRoute: Checking access to', location.pathname);
  console.log('PrivateRoute: Auth state:', { isAuthenticated, loading });

  // ローディング中はスピナーを表示
  if (loading) {
    console.log('PrivateRoute: Authentication is loading, showing spinner');
    return <Spinner text="認証情報を確認中..." />;
  }

  // 認証されていない場合はログインページにリダイレクト
  if (!isAuthenticated) {
    console.log('PrivateRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 認証されている場合はコンポーネントを表示
  console.log('PrivateRoute: User authenticated, rendering protected component');
  return children;
};

export default PrivateRoute;
