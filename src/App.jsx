import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Campaigns from './pages/Campaigns.jsx'
import CampaignDetail from './pages/CampaignDetail.jsx'
import Leads from './pages/Leads.jsx'
import Clients from './pages/Clients.jsx'
import ClientDetail from './pages/ClientDetail.jsx'
import Revenue from './pages/Revenue.jsx'
import Agents from './pages/Agents.jsx'
import Settings from './pages/Settings.jsx'

// Top-level route table. The whole authenticated app lives inside AppLayout
// (sidebar + topbar). Supabase auth gating can wrap AppLayout later; for the
// Phase 1 demo every route is reachable against bundled mock data.
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
