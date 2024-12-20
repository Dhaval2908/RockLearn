import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import UploadLab from './pages/UploadLab';
import LabDetails from './pages/LabDetails';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="home" element={<HomePage />} />
          <Route path="upload" element={<UploadLab />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/lab/:repoName" element={<LabDetails />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
