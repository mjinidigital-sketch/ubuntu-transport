"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { InlineServiceCreator } from "./InlineServiceCreator";

interface LineItem {
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
  itemDate?: string;
}

interface LineItemsInputProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  services?: any[];
  onServiceCreated?: (service: any) => void;
}

export function LineItemsInput({ items, onChange, services, onServiceCreated }: LineItemsInputProps) {
  const [localServices, setLocalServices] = useState(services || []);

  useEffect(() => {
    setLocalServices(services || []);
  }, [services]);

  const addLineItem = () => {
    onChange([
      ...items,
      {
        description: "",
        quantity: 1,
        unitPrice: "0",
        total: "0",
        itemDate: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate total if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity = parseFloat(String(newItems[index].quantity)) || 0;
      const unitPrice = parseFloat(String(newItems[index].unitPrice)) || 0;
      newItems[index].total = (quantity * unitPrice).toFixed(2);
    }

    onChange(newItems);
  };

  const removeLineItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services?.find(s => s._id === serviceId);
    if (service) {
      updateLineItem(index, "serviceId", serviceId);
      updateLineItem(index, "description", service.name);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Line Items</Label>
        <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-9 text-sm">
          <Plus className="size-4 mr-2" />
          Add Item
        </Button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-4 border rounded-lg">
          {localServices && localServices.length > 0 && (
            <div className="md:col-span-12 space-y-2 mb-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Select from Services (Optional)</Label>
                <InlineServiceCreator
                  onServiceCreated={(service) => {
                    setLocalServices([...localServices, service]);
                    if (onServiceCreated) {
                      onServiceCreated(service);
                    }
                  }}
                />
              </div>
              <select
                className="w-full px-3 py-2 border rounded-md text-sm h-9"
                value={item.serviceId || ""}
                onChange={(e) => handleServiceSelect(index, e.target.value)}
              >
                <option value="">-- Select a service --</option>
                {localServices.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-4 space-y-2">
            <Label className="text-xs font-medium">Description</Label>
            <Input
              value={item.description}
              onChange={(e) => updateLineItem(index, "description", e.target.value)}
              placeholder="Item description"
              className="h-9 text-sm"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-medium">Date</Label>
            <Input
              type="date"
              value={item.itemDate || ""}
              onChange={(e) => updateLineItem(index, "itemDate", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-medium">Quantity</Label>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
              min="0"
              className="h-9 text-sm"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-medium">Unit Price</Label>
            <Input
              type="number"
              value={item.unitPrice}
              onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
              min="0"
              step="0.01"
              className="h-9 text-sm"
            />
          </div>
          <div className="md:col-span-1 space-y-2">
            <Label className="text-xs font-medium">Total</Label>
            <Input
              value={item.total}
              readOnly
              className="bg-muted h-9 text-sm"
            />
          </div>
          <div className="md:col-span-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLineItem(index)}
              className="h-9 w-9 mt-6"
            >
              <Trash2 className="size-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg text-sm">
          No line items added. Click "Add Item" to get started.
        </div>
      )}
    </div>
  );
}
