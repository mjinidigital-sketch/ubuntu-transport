"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FileText, TrendingUp, Package, Activity, Receipt } from "lucide-react";

export default function AdminPage() {
  const quotations = useQuery(api.quotations.listQuotations) || [];
  const invoices = useQuery(api.invoices.listInvoices) || [];
  const clients = useQuery(api.clients.listClients) || [];
  const services = useQuery(api.services.listServices) || [];

  // Calculate analytics
  const totalQuotations = quotations.length;
  const totalInvoices = invoices.length;
  const totalClients = clients.length;
  const totalServices = services.length;

  const totalRevenue = invoices.reduce((sum, inv) => {
    const amount = parseFloat(String(inv.total)) || 0;
    return sum + amount;
  }, 0);

  const pendingQuotations = quotations.filter(q => q.status === "draft" || q.status === "sent").length;
  const paidInvoices = invoices.filter(i => i.status === "paid").length;

  // Combine quotations and invoices for recent activity
  const recentActivity = [
    ...quotations.map(q => ({
      type: 'quotation' as const,
      id: q._id,
      number: q.quotationNumber,
      client: q.toName || "Unknown",
      status: q.status,
      date: q.createdAt || 0,
      amount: q.total,
    })),
    ...invoices.map(i => ({
      type: 'invoice' as const,
      id: i._id,
      number: i.invoiceNumber,
      client: i.toName || "Unknown",
      status: i.status,
      date: i.createdAt || 0,
      amount: i.total,
    }))
  ].sort((a, b) => b.date - a.date);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance and activities</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <a href="/admin/quotations" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          View Quotations
        </a>
        <a href="/admin/invoices" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          View Invoices
        </a>
        <a href="/admin/clients" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          View Clients
        </a>
        <a href="/admin/services" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
          View Services
        </a>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">From all invoices</p>
          </CardContent>
        </Card>

        {/* Total Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotations}</div>
            <p className="text-xs text-muted-foreground">{pendingQuotations} pending</p>
          </CardContent>
        </Card>

        {/* Total Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">{paidInvoices} paid</p>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        {/* Total Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">Available services</p>
          </CardContent>
        </Card>

        {/* Active Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.filter(q => q.status === "sent").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between text-sm border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {activity.type === 'quotation' ? (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {activity.type === 'quotation' ? 'Quotation' : 'Invoice'} #{activity.number}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Client: {activity.client}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{activity.status}</p>
                  <p className="text-muted-foreground text-xs">
                    {activity.date ? new Date(activity.date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-muted-foreground text-sm">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
