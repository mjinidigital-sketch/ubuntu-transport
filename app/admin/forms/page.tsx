"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Check,
  X,
  Eye,
  MessageSquare,
  Download,
  Trash2,
  Calendar,
  Mail,
  Star,
  Users,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type FormSubmission = {
  _id: Id<"formSubmissions">;
  formId: string;
  userId?: Id<"users"> | null | undefined;
  formData: Record<string, any>;
  status: "pending" | "reviewed" | "approved" | "rejected";
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: Id<"users">;
  notes?: string;
  userInfo?: {
    name?: string;
    email?: string;
  } | null;
};

export default function AdminFormsPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const allSubmissions = useQuery(api.forms.getAllSubmissions);
  const updateStatus = useMutation(api.forms.updateSubmissionStatus);
  const deleteSubmission = useMutation(api.forms.deleteSubmission);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    if (!allSubmissions) return [];

    return allSubmissions.filter((sub) => {
      // Status filter
      if (statusFilter !== "all" && sub.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== "all") {
        const id = (sub.formId || "").toLowerCase();
        if (typeFilter === "contact" && !id.includes("contact")) return false;
        if (typeFilter === "booking" && !id.includes("book")) return false;
        if (typeFilter === "subscribe" && !id.includes("sub") && !id.includes("newsletter")) return false;
        if (typeFilter === "feedback" && !id.includes("feed") && !id.includes("review") && !id.includes("survey")) return false;
        if (typeFilter === "custom" && (id.includes("contact") || id.includes("book") || id.includes("sub") || id.includes("feed"))) return false;
      }

      // Search query filter (matches name, email, formId, or values in formData)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFormId = (sub.formId || "").toLowerCase().includes(q);
        const matchesUserName = (sub.userInfo?.name || "").toLowerCase().includes(q);
        const matchesUserEmail = (sub.userInfo?.email || "").toLowerCase().includes(q);
        const matchesFormData = Object.values(sub.formData || {}).some((v) =>
          String(v).toLowerCase().includes(q)
        );

        if (!matchesFormId && !matchesUserName && !matchesUserEmail && !matchesFormData) {
          return false;
        }
      }

      return true;
    });
  }, [allSubmissions, statusFilter, typeFilter, searchQuery]);

  // Dynamic statistics
  const stats = useMemo(() => {
    if (!allSubmissions) return { total: 0, pending: 0, booking: 0, contact: 0, subscribe: 0, feedback: 0 };
    let pending = 0;
    let booking = 0;
    let contact = 0;
    let subscribe = 0;
    let feedback = 0;

    for (const s of allSubmissions) {
      if (s.status === "pending") pending++;
      const id = (s.formId || "").toLowerCase();
      if (id.includes("book")) booking++;
      else if (id.includes("contact")) contact++;
      else if (id.includes("sub") || id.includes("newsletter")) subscribe++;
      else if (id.includes("feed") || id.includes("review") || id.includes("survey")) feedback++;
    }

    return {
      total: allSubmissions.length,
      pending,
      booking,
      contact,
      subscribe,
      feedback,
    };
  }, [allSubmissions]);

  const handleStatusUpdate = async (
    submissionId: Id<"formSubmissions">,
    newStatus: FormSubmission["status"]
  ) => {
    try {
      await updateStatus({
        submissionId,
        status: newStatus,
        notes: notes || undefined,
      });
      toast.success(`Submission marked as ${newStatus}`);
      setNotes("");
      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (submissionId: Id<"formSubmissions">) => {
    if (!confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(submissionId);
    try {
      await deleteSubmission({ submissionId });
      toast.success("Submission deleted successfully");
      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Failed to delete submission:", error);
      toast.error("Failed to delete submission");
    } finally {
      setIsDeleting(null);
    }
  };

  // Export submissions to CSV
  const handleExportCSV = () => {
    if (!filteredSubmissions || filteredSubmissions.length === 0) {
      toast.error("No submissions to export");
      return;
    }

    const headers = ["Submission ID", "Form Type", "Status", "Submitted At", "Name", "Email", "Phone", "Form Data"];
    const rows = filteredSubmissions.map((s) => {
      const name = s.formData?.name || s.userInfo?.name || "";
      const email = s.formData?.email || s.userInfo?.email || "";
      const phone = s.formData?.phone || "";
      const formDataStr = JSON.stringify(s.formData).replace(/"/g, '""');
      const dateStr = new Date(s.submittedAt).toLocaleString();

      return [
        `"${s._id}"`,
        `"${s.formId}"`,
        `"${s.status}"`,
        `"${dateStr}"`,
        `"${name}"`,
        `"${email}"`,
        `"${phone}"`,
        `"${formDataStr}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `form_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredSubmissions.length} submissions to CSV`);
  };

  // Export submissions to JSON
  const handleExportJSON = () => {
    if (!filteredSubmissions || filteredSubmissions.length === 0) {
      toast.error("No submissions to export");
      return;
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredSubmissions, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `form_submissions_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.success(`Exported ${filteredSubmissions.length} submissions to JSON`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600 hover:bg-green-700 text-white font-medium">Approved</Badge>;
      case "reviewed":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium">Reviewed</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="font-medium">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium">Pending</Badge>;
    }
  };

  const getFormTypeBadge = (formId: string) => {
    const id = (formId || "").toLowerCase();
    if (id.includes("book")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Calendar className="w-3 h-3" /> Booking
        </span>
      );
    }
    if (id.includes("contact")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Mail className="w-3 h-3" /> Contact
        </span>
      );
    }
    if (id.includes("sub") || id.includes("newsletter")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Users className="w-3 h-3" /> Subscribe
        </span>
      );
    }
    if (id.includes("feed") || id.includes("review") || id.includes("survey")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Star className="w-3 h-3" /> Feedback
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
        <Sparkles className="w-3 h-3" /> {formId}
      </span>
    );
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Form Submissions & Data Collection
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Collect, review, and export leads and responses from Contact, Booking, Subscribe, and Feedback forms.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="rounded-xl shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={handleExportJSON}
            variant="outline"
            size="sm"
            className="rounded-xl shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card
          onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}
          className={`cursor-pointer transition hover:shadow-md ${
            statusFilter === "all" && typeFilter === "all" ? "border-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-950" : ""
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-2xl font-black text-foreground mt-1">{stats.total}</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter("pending")}
          className={`cursor-pointer transition hover:shadow-md ${
            statusFilter === "pending" ? "border-amber-500 ring-2 ring-amber-100 dark:ring-amber-950" : ""
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setTypeFilter("booking")}
          className={`cursor-pointer transition hover:shadow-md ${
            typeFilter === "booking" ? "border-purple-600 ring-2 ring-purple-100 dark:ring-purple-950" : ""
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Bookings</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.booking}</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setTypeFilter("contact")}
          className={`cursor-pointer transition hover:shadow-md ${
            typeFilter === "contact" ? "border-blue-600 ring-2 ring-blue-100 dark:ring-blue-950" : ""
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Contacts</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.contact}</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setTypeFilter("subscribe")}
          className={`cursor-pointer transition hover:shadow-md ${
            typeFilter === "subscribe" ? "border-emerald-600 ring-2 ring-emerald-100 dark:ring-emerald-950" : ""
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Subscribers</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.subscribe}</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setTypeFilter("feedback")}
          className={`cursor-pointer transition hover:shadow-md ${
            typeFilter === "feedback" ? "border-amber-600 ring-2 ring-amber-100 dark:ring-amber-950" : ""
          }`}
        >
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Feedback</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.feedback}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, form type, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Form Type Filter */}
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "all")}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Form Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contact">Contact Forms</SelectItem>
                <SelectItem value="booking">Booking Requests</SelectItem>
                <SelectItem value="subscribe">Subscriptions</SelectItem>
                <SelectItem value="feedback">Feedback Reviews</SelectItem>
                <SelectItem value="custom">Custom Forms</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "all" || typeFilter !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="rounded-2xl border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[140px]">Type</TableHead>
                <TableHead>Contact / User</TableHead>
                <TableHead>Key Details</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[120px]">Submitted</TableHead>
                <TableHead className="text-right w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => {
                  const name = sub.formData?.name || sub.userInfo?.name || "Anonymous";
                  const email = sub.formData?.email || sub.userInfo?.email || "";
                  const phone = sub.formData?.phone || "";

                  // Generate summary snippet depending on type
                  let snippet = "";
                  if (sub.formData?.service || sub.formData?.date) {
                    snippet = `Service: ${sub.formData.service || "N/A"} | Date: ${sub.formData.date || "N/A"}`;
                  } else if (sub.formData?.subject || sub.formData?.message) {
                    snippet = sub.formData.subject ? `Subject: ${sub.formData.subject}` : sub.formData.message?.slice(0, 45) + "...";
                  } else if (sub.formData?.rating) {
                    snippet = `Rating: ${sub.formData.rating} ★ | ${sub.formData.comments?.slice(0, 35) || ""}`;
                  } else if (sub.formData?.email) {
                    snippet = `Subscribed: ${sub.formData.email}`;
                  }

                  return (
                    <TableRow key={sub._id} className="hover:bg-muted/30 transition">
                      <TableCell>{getFormTypeBadge(sub.formId)}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-foreground">{name}</div>
                        {email && <div className="text-xs text-muted-foreground">{email}</div>}
                        {phone && <div className="text-xs text-slate-400">{phone}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-foreground font-medium line-clamp-1">
                          {snippet || Object.entries(sub.formData || {}).map(([k, v]) => `${k}: ${v}`).join(" | ").slice(0, 50)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTime(sub.submittedAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSubmission(sub)}
                            className="h-8 px-2.5 text-xs rounded-lg"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(sub._id)}
                            disabled={isDeleting === sub._id}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-medium text-foreground">No form submissions found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submissions from contact, booking, subscribe, and feedback forms will appear here in real-time.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Submission Detail Sheet (Slide-over from right) */}
      <Sheet open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <SheetContent
          side="right"
          className="p-0 flex flex-col h-full bg-background border-l border-border shadow-2xl focus:outline-none"
        >
          <SheetHeader className="px-6 py-4 border-b bg-card shrink-0">
            <div className="flex items-center gap-2 mb-1">
              {selectedSubmission && getFormTypeBadge(selectedSubmission.formId)}
              {selectedSubmission && getStatusBadge(selectedSubmission.status)}
            </div>
            <SheetTitle className="text-xl font-bold">Submission Details</SheetTitle>
            <SheetDescription>
              Submitted on {selectedSubmission ? new Date(selectedSubmission.submittedAt).toLocaleString() : ""}
            </SheetDescription>
          </SheetHeader>

          {selectedSubmission && (
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Sender Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Submitted By</span>
                  <span className="text-sm font-bold text-foreground">
                    {selectedSubmission.formData?.name || selectedSubmission.userInfo?.name || "Anonymous"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Email</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedSubmission.formData?.email || selectedSubmission.userInfo?.email || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">Phone</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedSubmission.formData?.phone || "—"}
                  </span>
                </div>
              </div>

              {/* Form Data Key-Value Table */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Collected Form Payload
                </h4>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                  {Object.entries(selectedSubmission.formData || {}).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 p-3 text-sm bg-card hover:bg-muted/20">
                      <div className="font-semibold text-muted-foreground capitalize text-xs">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="col-span-2 text-foreground font-medium break-words text-xs sm:text-sm">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes Section */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-2">
                <Label htmlFor="admin-notes" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Admin Resolution Notes
                </Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Record internal notes, next actions, or follow-up details..."
                  value={notes || selectedSubmission.notes || ""}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="rounded-xl text-sm resize-none"
                />
              </div>
            </div>
          )}

          {selectedSubmission && (
            <SheetFooter className="px-6 py-4 border-t bg-card/95 backdrop-blur shrink-0 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2 flex-1">
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission._id, "approved")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex-1 text-xs font-semibold h-10"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission._id, "reviewed")}
                  variant="outline"
                  className="rounded-xl flex-1 text-xs font-medium h-10"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Reviewed
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedSubmission._id, "rejected")}
                  variant="destructive"
                  className="rounded-xl flex-1 text-xs font-semibold h-10"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Reject
                </Button>
              </div>
              <Button
                onClick={() => handleDelete(selectedSubmission._id)}
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl h-10 w-10 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
