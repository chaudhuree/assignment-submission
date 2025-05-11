import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AssignmentDetailPage from './pages/AssignmentDetailPage';
import CreateAssignmentPage from './pages/CreateAssignmentPage';
import BidFormPage from './pages/BidFormPage';
import ChatsPage from './pages/ChatsPage';
import ChatDetailPage from './pages/ChatDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import MyBidsPage from './pages/MyBidsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes - Any authenticated user */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
                <Route path="/chats" element={<ChatsPage />} />
                <Route path="/chats/:id" element={<ChatDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/payments" element={<PaymentsPage />} />
              </Route>
              
              {/* Student Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/assignments/new" element={<CreateAssignmentPage />} />
              </Route>
              
              {/* Teacher Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                <Route path="/assignments/:id/bid" element={<BidFormPage />} />
                <Route path="/my-bids" element={<MyBidsPage />} />
              </Route>
              
              {/* Super Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                <Route path="/users" element={<DashboardPage />} />
              </Route>
            </Routes>
          </Layout>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
