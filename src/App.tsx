import { HashRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Faecher } from './pages/Faecher'
import { Kalender } from './pages/Kalender'
import { Lernzeit } from './pages/Lernzeit'
import { Noten } from './pages/Noten'
import { Erfolge } from './pages/Erfolge'
import { Einstellungen } from './pages/Einstellungen'

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="faecher" element={<Faecher />} />
            <Route path="kalender" element={<Kalender />} />
            <Route path="lernzeit" element={<Lernzeit />} />
            <Route path="noten" element={<Noten />} />
            <Route path="erfolge" element={<Erfolge />} />
            <Route path="einstellungen" element={<Einstellungen />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
