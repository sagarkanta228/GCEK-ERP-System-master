import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ModalProvider } from './context/ModalContext';
import { UserProvider } from './context/UserContext';
import Home from './pages/Home';
import Login from './pages/Login';
import HODDashboard from './pages/HODDashboard';
import SignIn from './pages/SignIn';
import OAuthSuccess from './pages/OAuthSuccess';

import StudentDashboard from './pages/StudentDashboard';

import PrincipalDashboard from './pages/PrincipalDashboard';
import DeanDashboard from './pages/DeanDashboard';
import MessagingHub from './pages/MessagingHub';
import FacultyDashboard from './pages/FacultyDashboard';
import RegistrarDashboard from './pages/RegistrarDashboard';
import TermsAndConditions from './pages/TermsAndConditions';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ModalProvider>
          <UserProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/hod" element={<ProtectedRoute allowedRoles={['HOD']}><HODDashboard /></ProtectedRoute>} />
              <Route path="/student" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/faculty" element={<ProtectedRoute allowedRoles={['Faculty']}><FacultyDashboard /></ProtectedRoute>} />
              <Route path="/principal" element={<ProtectedRoute allowedRoles={['Principal']}><PrincipalDashboard /></ProtectedRoute>} />
              <Route path="/dean" element={<ProtectedRoute allowedRoles={['Dean']}><DeanDashboard /></ProtectedRoute>} />
              <Route path="/registrar" element={<ProtectedRoute allowedRoles={['Registrar']}><RegistrarDashboard /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute allowedRoles={['Student', 'Faculty', 'HOD', 'Principal', 'Dean', 'Registrar']}><MessagingHub /></ProtectedRoute>} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
            </Routes>
          </UserProvider>
        </ModalProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
