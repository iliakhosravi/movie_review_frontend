// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import MovieDetail from './pages/MovieDetail'
const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/movies/:id" element={<MovieDetail />} />
  </Routes>
)

export default App
