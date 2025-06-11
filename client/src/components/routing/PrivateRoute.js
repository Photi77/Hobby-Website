// client/src/components/routing/PrivateRoute.js の修正版
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const PrivateRoute = ({ children }) => {
  const auth = useAuth();
  
  // 認証コンテキストが利用可能か確認
  if (!auth) {
    console.error('Auth context is not available in PrivateRoute');
    return <div>Error: Auth context is not available</div>;
  }
  
  const { isAuthenticated, loading } = auth;

  if (loading) {
    return <Spinner text="認証情報を確認中..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;