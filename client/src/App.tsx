import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import { RoomDetail } from './pages/RoomDetail';
import { Dashboard } from './pages/Dashboard';
import { BookingWizard } from './pages/BookingWizard';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/book" element={<BookingWizard />} />
          <Route path="/book/:bookingReference" element={<BookingWizard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Catch-all route - redirect to home for any unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
