import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CarDetail from './pages/CarDetail';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/car/:name" element={<CarDetail />} />
        {/* More routes will be added here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
