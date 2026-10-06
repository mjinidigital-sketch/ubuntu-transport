"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ContactDetailsProps {
  fromName: string;
  onFromNameChange: (val: string) => void;
  fromEmail: string;
  onFromEmailChange: (val: string) => void;
  toName: string;
  onToNameChange: (val: string) => void;
  toEmail: string;
  onToEmailChange: (val: string) => void;
}

export default function ContactDetails({
  fromName,
  onFromNameChange,
  fromEmail,
  onFromEmailChange,
  toName,
  onToNameChange,
  toEmail,
  onToEmailChange,
}: ContactDetailsProps) {
  const clients = useQuery(api.clients.getClients) || [];
  const createClient = useMutation(api.clients.createClient);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);

  // New Client Form State
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Kenya",
    notes: "",
  });

  const handleSelectClient = (clientId: string | null) => {
    if (!clientId || clientId === "custom") {
      return;
    }
    const found = clients.find((c: any) => c._id === clientId);
    if (found) {
      onToNameChange(found.name);
      onToEmailChange(found.email || "");
      toast.success(`Selected client: ${found.name}`);
    }
  };

  const handleSaveNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name.trim() || !newClient.email.trim()) {
      toast.warning("Please provide client name and email.");
      return;
    }

    try {
      setIsSavingClient(true);
      const saved = await createClient(newClient);
      toast.success(`Client ${newClient.name} created successfully!`);

      // Auto-select into the form
      onToNameChange(newClient.name);
      onToEmailChange(newClient.email);

      // Reset modal
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "Kenya",
        notes: "",
      });
      setIsAddClientOpen(false);
    } catch (err: any) {
      console.error("Error creating client:", err);
      toast.error(err.message || "Failed to create client.");
    } finally {
      setIsSavingClient(false);
    }
  };

  // Find if current toEmail matches an existing client
  const matchedClient = clients.find(
    (c: any) => c.email && c.email.toLowerCase() === (toEmail || "").toLowerCase()
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>From & To Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Section */}
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">From (Your Details)</h3>
              <span className="text-xs text-muted-foreground">Sender</span>
            </div>
            <div>
              <Label htmlFor="fromName">Business Name</Label>
              <Input
                id="fromName"
                value={fromName}
                onChange={(e) => onFromNameChange(e.target.value)}
                placeholder="Your name or company"
              />
            </div>
            <div>
              <Label htmlFor="fromEmail">Business Email</Label>
              <Input
                id="fromEmail"
                value={fromEmail}
                onChange={(e) => onFromEmailChange(e.target.value)}
                placeholder="your@email.com"
                type="email"
              />
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">To (Client Details)</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setIsAddClientOpen(true)}
              >
                <UserPlus className="size-3.5" />
                <span>Add Client</span>
              </Button>
            </div>

            {/* Quick Select Saved Client */}
            <div>
              <Label htmlFor="clientPicker">Pick Saved Client</Label>
              <Select
                value={matchedClient ? matchedClient._id : "custom"}
                onValueChange={handleSelectClient}
              >
                <SelectTrigger id="clientPicker" className="bg-background">
                  <SelectValue placeholder="Choose existing client or type below..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">-- Choose or Enter Manually --</SelectItem>
                  {clients && clients.map((c: any) => (
                    <SelectItem key={c._id} value={c._id!}>
                      {c.name} ({c.email || "No email"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="toName">Client / Company Name</Label>
              <Input
                id="toName"
                value={toName}
                onChange={(e) => onToNameChange(e.target.value)}
                placeholder="Client name or company"
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="toEmail">Client Email</Label>
              <Input
                value={toEmail}
                onChange={(e) => onToEmailChange(e.target.value)}
                id="toEmail"
                placeholder="client@email.com"
                type="email"
                className="bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Client Modal Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveNewClient}>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Save client details to quickly pick them for invoices and quotations.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              <div>
                <Label htmlFor="modalClientName">Client Name *</Label>
                <Input
                  id="modalClientName"
                  placeholder="e.g. Acme Corp / Jane Doe"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="modalClientEmail">Client Email *</Label>
                <Input
                  id="modalClientEmail"
                  type="email"
                  placeholder="e.g. billing@acme.com"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="modalClientPhone">Phone</Label>
                  <Input
                    id="modalClientPhone"
                    placeholder="+254 700 000 000"
                    value={newClient.phone}
                    onChange={(e) =>
                      setNewClient((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="modalClientCity">City</Label>
                  <Input
                    id="modalClientCity"
                    placeholder="Nairobi"
                    value={newClient.city}
                    onChange={(e) =>
                      setNewClient((prev) => ({ ...prev, city: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="modalClientAddress">Physical Address</Label>
                <Input
                  id="modalClientAddress"
                  placeholder="Street / Building / Suite"
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddClientOpen(false)}
                disabled={isSavingClient}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingClient}>
                {isSavingClient ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Select Client"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
