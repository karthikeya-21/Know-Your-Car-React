import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home           from './pages/Home';
import CarDetail      from './pages/CarDetail';
import About          from './pages/About';
import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile        from './pages/Profile';
import EditProfile    from './pages/EditProfile';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/car/:name"       element={<CarDetail />} />
            <Route path="/about"           element={<About />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit"    element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
