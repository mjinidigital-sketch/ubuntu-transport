import { InvoiceData } from "@/types/invoice";
import { QuotationData } from "@/types/quotation";

const HISTORY_KEY = "ubuntu-documents-history";

interface HistoryItem {
  id: string;
  type: "invoice" | "quotation";
  number: string;
  date: string;
  data: InvoiceData | QuotationData;
  timestamp: number;
}

export function saveInvoiceToHistory(invoice: InvoiceData): void {
  const history = getHistory();
  const newItem: HistoryItem = {
    id: crypto.randomUUID(),
    type: "invoice",
    number: invoice.invoiceNumber,
    date: invoice.date,
    data: invoice,
    timestamp: Date.now(),
  };
  history.unshift(newItem);
  // Keep only last 50 items
  if (history.length > 50) {
    history.pop();
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function saveQuotationToHistory(quotation: QuotationData): void {
  const history = getHistory();
  const newItem: HistoryItem = {
    id: crypto.randomUUID(),
    type: "quotation",
    number: quotation.quotationNumber,
    date: quotation.date,
    data: quotation,
    timestamp: Date.now(),
  };
  history.unshift(newItem);
  // Keep only last 50 items
  if (history.length > 50) {
    history.pop();
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
