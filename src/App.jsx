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

// Client portal (separate login + scoped experience).
import PortalLogin from './portal/PortalLogin.jsx'
import PortalLayout from './portal/PortalLayout.jsx'
import PortalDashboard from './portal/pages/PortalDashboard.jsx'
import PortalLeads from './portal/pages/PortalLeads.jsx'
import PortalAppointments from './portal/pages/PortalAppointments.jsx'
import PortalBilling from './portal/pages/PortalBilling.jsx'
import PortalSupport from './portal/pages/PortalSupport.jsx'

// Top-level route table. Two distinct surfaces:
//   /portal/*  → client-facing portal (its own auth + layout)
//   /*         → internal operator console (AppLayout)
export default function App() {
  return (
    <Routes>
      {/* ── Client portal ── */}
      <Route path="/portal/login" element={<PortalLogin />} />
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<PortalDashboard />} />
        <Route path="leads" element={<PortalLeads />} />
        <Route path="appointments" element={<PortalAppointments />} />
        <Route path="billing" element={<PortalBilling />} />
        <Route path="support" element={<PortalSupport />} />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Route>

      {/* ── Operator console ── */}
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
