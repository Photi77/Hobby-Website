
// client/src/App.js - 修正版
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Spinner from './components/common/Spinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import HobbyList from './pages/HobbyList';
import HobbyDetail from './pages/HobbyDetail';
import AddHobby from './pages/AddHobby';
import EditHobby from './pages/EditHobby';
import ToolList from './pages/ToolList';
import ToolDetail from './pages/ToolDetail';
import AddTool from './pages/AddTool';
import EditTool from './pages/EditTool';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

// Private Route
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  const auth = useAuth();
  
  // 認証コンテキストが利用可能か確認
  if (!auth) {
    console.error('Auth context is not available');
    return (
      <div className="error-container">
        <h1>アプリケーションエラー</h1>
        <p>認証システムの初期化に失敗しました。ページを再読み込みしてください。</p>
      </div>
    );
  }
  
  const { loading, error } = auth;

  if (loading) {
    return (
      <div className="App">
        <Spinner text="アプリケーションを読み込み中..." overlay={true} />
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <main className="container">
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          
          <Route path="/hobbies" element={<PrivateRoute><HobbyList /></PrivateRoute>} />
          <Route path="/hobbies/:id" element={<PrivateRoute><HobbyDetail /></PrivateRoute>} />
          <Route path="/hobbies/add" element={<PrivateRoute><AddHobby /></PrivateRoute>} />
          <Route path="/hobbies/edit/:id" element={<PrivateRoute><EditHobby /></PrivateRoute>} />
          
          <Route path="/tools" element={<PrivateRoute><ToolList /></PrivateRoute>} />
          <Route path="/tools/:id" element={<PrivateRoute><ToolDetail /></PrivateRoute>} />
          <Route path="/tools/add" element={<PrivateRoute><AddTool /></PrivateRoute>} />
          <Route path="/tools/edit/:id" element={<PrivateRoute><EditTool /></PrivateRoute>} />
          
          <Route path="/users/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;