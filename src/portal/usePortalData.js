import { useMemo } from 'react'
import { usePortalAuth } from './PortalAuth.jsx'
import {
  leadsForClient, campaignsForClient, revenueForClient,
} from '../data/mockData.js'

const DAY = 86400000

// Centralizes the client-scoped slices every portal page needs, plus a few
// derived rollups. In live mode the same shape would come from Supabase
// queries guarded by row-level security.
export function usePortalData() {
  const { client } = usePortalAuth()

  return useMemo(() => {
    if (!client) return null
    const leads = leadsForClient(client.id)
    const campaigns = campaignsForClient(client.id)
    const revenue = revenueForClient(client.id)

    const monthAgo = Date.now() - 30 * DAY
    const leadsThisMonth = leads.filter((l) => new Date(l.created_at).getTime() >= monthAgo)
    const appointments = leads
      .filter((l) => l.appointment_booked)
      .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))

    const invoices = revenue
      .filter((r) => r.stripe_invoice_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const amountDue = revenue.filter((r) => !r.paid).reduce((s, r) => s + r.amount, 0)
    const amountPaid = revenue.filter((r) => r.paid).reduce((s, r) => s + r.amount, 0)

    // 30-day leads-per-day series for the dashboard chart.
    const buckets = {}
    for (let d = 29; d >= 0; d--) {
      const key = new Date(Date.now() - d * DAY).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      buckets[key] = { date: key, leads: 0, booked: 0 }
    }
    leadsThisMonth.forEach((l) => {
      const key = new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (buckets[key]) {
        buckets[key].leads += 1
        if (l.appointment_booked) buckets[key].booked += 1
      }
    })

    return {
      client,
      leads,
      campaigns,
      revenue,
      invoices,
      leadsThisMonth,
      appointments,
      amountDue,
      amountPaid,
      activeCampaigns: campaigns.filter((c) => c.status === 'active'),
      bookedCount: leadsThisMonth.filter((l) => l.appointment_booked).length,
      leadSeries: Object.values(buckets),
    }
  }, [client])
}
