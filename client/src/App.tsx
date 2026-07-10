import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopList from './pages/ShopList';
import ShopDetail from './pages/ShopDetail';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import MyShop from './pages/MyShop';
import MyOrders from './pages/MyOrders';
import Messages from './pages/Messages';
import CreateShop from './pages/CreateShop';
import Chats from './pages/Chats';
import ChatDetail from './pages/ChatDetail';
import AdminPanel from './pages/AdminPanel';
import MyShops from './pages/MyShops';
import TestRegister from './pages/TestRegister';
import ProtectedRoute from './components/ProtectedRoute';

// Настройка axios: в монолите фронт и API на одном домене → относительный путь.
// Для раздельного деплоя задайте REACT_APP_API_URL (напр. https://api.example.com).
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Стартовая страница: гость → регистрация, авторизованный → каталог
const HomeRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }
  return user ? <ProductList /> : <Navigate to="/register" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Гость видит регистрацию, авторизованный — каталог */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-register" element={<TestRegister />} />
          <Route path="/shops" element={<ShopList />} />
          <Route path="/shops/:id" element={<ShopDetail />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* Защищенные маршруты */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/my-shops" element={
            <ProtectedRoute>
              <MyShops />
            </ProtectedRoute>
          } />
          <Route path="/my-shops/:shopId" element={
            <ProtectedRoute>
              <MyShop />
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/create-shop" element={
            <ProtectedRoute>
              <CreateShop />
            </ProtectedRoute>
          } />
          <Route path="/chats" element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          } />
          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <ChatDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
