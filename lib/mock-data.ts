export type CommissionStatus = "recorded" | "pending" | "approved" | "reversed" | "locked" | "paid";

export type StateTransition = {
  status: CommissionStatus;
  at: string;
  by: string;
  note?: string;
};

export type Commission = {
  id: string;
  programName: string;
  brandName: string;
  publisher: string;
  amount: number;
  currency: string;
  status: CommissionStatus;
  clickTimestamp: string;
  conversionTimestamp: string;
  orderId: string;
  attributionModel: string;
  cookieWindow: string;
  device: string;
  referrerSource: string;
  customerType: string;
  productCategory: string;
  conversionType: string;
  reversalReason?: string;
  reversalCategory?: string;
  reversalNote?: string;
  reversalConfidence?: "low" | "medium" | "high";
  riskFlags?: string[];
  stateHistory: StateTransition[];
  validationWindowDays: number;
};

export type DisputeStatus =
  | "open_awaiting_brand"
  | "brand_responded"
  | "resolved_reinstated"
  | "resolved_upheld"
  | "resolved_upheld_no_explanation"
  | "escalated";

export type DisputeMessage = {
  sender: "publisher" | "brand" | "system";
  senderName: string;
  content: string;
  sentAt: string;
};

export type Dispute = {
  id: string;
  commissionId: string;
  status: DisputeStatus;
  reason: string;
  raisedBy: string;
  raisedAt: string;
  deadlineAt: string;
  subject: string;
  evidence: string;
  brandResponse?: string;
  explanationQuality?: "strong" | "weak" | "none";
  messages: DisputeMessage[];
  publisherAccepted?: boolean;
};

const base = {
  brandName: "Feastables",
  attributionModel: "Last-click",
  validationWindowDays: 21
};

function history(status: CommissionStatus, createdAt: string): StateTransition[] {
  const steps: CommissionStatus[] = ["recorded", "pending"];
  if (status === "approved" || status === "locked" || status === "paid") steps.push("approved");
  if (status === "locked" || status === "paid") steps.push("locked");
  if (status === "paid") steps.push("paid");
  if (status === "reversed") steps.push("reversed");
  return steps.map((s, i) => ({ status: s, at: new Date(new Date(createdAt).getTime() + i * 86400000).toISOString(), by: s === "reversed" ? "Brand Ops" : "System" }));
}

export const COMMISSIONS: Commission[] = [
  { id: "COM-1001", programName: "Chocolate Bar Drop Vol. 3", publisher: "SnackScope", amount: 42.3, currency: "USD", status: "paid", clickTimestamp: "2026-01-03T11:00:00Z", conversionTimestamp: "2026-01-03T11:11:00Z", orderId: "ORD-9011", cookieWindow: "14 days", device: "iOS", referrerSource: "YouTube", customerType: "New", productCategory: "Chocolate", conversionType: "Purchase", stateHistory: history("paid", "2026-01-03T11:11:00Z"), ...base },
  { id: "COM-1002", programName: "Chocolate Bar Drop Vol. 3", publisher: "MiloEats", amount: 12.4, currency: "USD", status: "approved", clickTimestamp: "2026-01-12T10:20:00Z", conversionTimestamp: "2026-01-12T10:32:00Z", orderId: "ORD-9012", cookieWindow: "14 days", device: "Android", referrerSource: "Instagram", customerType: "Returning", productCategory: "Bars", conversionType: "Purchase", stateHistory: history("approved", "2026-01-12T10:32:00Z"), ...base },
  { id: "COM-1003", programName: "Creator Collab Series", publisher: "FitFoodDaily", amount: 78.1, currency: "USD", status: "pending", clickTimestamp: "2026-02-11T12:11:00Z", conversionTimestamp: "2026-02-11T12:20:00Z", orderId: "ORD-9013", cookieWindow: "30 days", device: "Desktop", referrerSource: "TikTok", customerType: "New", productCategory: "Bundle", conversionType: "Purchase", riskFlags: ["High AOV"], stateHistory: history("pending", "2026-02-11T12:20:00Z"), ...base },
  { id: "COM-1004", programName: "Back to School Bundle", publisher: "CampusCravings", amount: 196, currency: "USD", status: "reversed", clickTimestamp: "2025-12-22T15:00:00Z", conversionTimestamp: "2025-12-22T15:15:00Z", orderId: "ORD-9014", cookieWindow: "7 days", device: "Desktop", referrerSource: "Blog", customerType: "New", productCategory: "Bundle", conversionType: "Purchase", reversalReason: "Duplicate order", reversalCategory: "Quality", reversalNote: "Duplicate checkout detected.", reversalConfidence: "high", stateHistory: history("reversed", "2025-12-22T15:15:00Z"), ...base },
  { id: "COM-1005", programName: "Back to School Bundle", publisher: "SnackScope", amount: 37.6, currency: "USD", status: "recorded", clickTimestamp: "2026-03-01T09:10:00Z", conversionTimestamp: "2026-03-01T09:14:00Z", orderId: "ORD-9015", cookieWindow: "7 days", device: "iOS", referrerSource: "YouTube", customerType: "Returning", productCategory: "Bundle", conversionType: "Subscription", stateHistory: history("recorded", "2026-03-01T09:14:00Z"), ...base },
  { id: "COM-1006", programName: "Creator Collab Series", publisher: "SweetSignals", amount: 64.8, currency: "USD", status: "locked", clickTimestamp: "2026-01-24T16:13:00Z", conversionTimestamp: "2026-01-24T16:41:00Z", orderId: "ORD-9016", cookieWindow: "30 days", device: "Android", referrerSource: "Instagram", customerType: "New", productCategory: "Chocolate", conversionType: "Purchase", stateHistory: history("locked", "2026-01-24T16:41:00Z"), ...base },
  { id: "COM-1007", programName: "Chocolate Bar Drop Vol. 3", publisher: "SnackScope", amount: 55.9, currency: "USD", status: "pending", clickTimestamp: "2025-12-30T14:23:00Z", conversionTimestamp: "2025-12-30T14:34:00Z", orderId: "ORD-9017", cookieWindow: "14 days", device: "Desktop", referrerSource: "Newsletter", customerType: "Returning", productCategory: "Bars", conversionType: "Purchase", riskFlags: ["Past due validation"], stateHistory: history("pending", "2025-12-30T14:34:00Z"), ...base },
  { id: "COM-1008", programName: "Creator Collab Series", publisher: "CrateReview", amount: 83.2, currency: "USD", status: "paid", clickTimestamp: "2026-01-08T18:40:00Z", conversionTimestamp: "2026-01-08T18:54:00Z", orderId: "ORD-9018", cookieWindow: "30 days", device: "iOS", referrerSource: "YouTube", customerType: "New", productCategory: "Bundle", conversionType: "Purchase", stateHistory: history("paid", "2026-01-08T18:54:00Z"), ...base },
  { id: "COM-1009", programName: "Chocolate Bar Drop Vol. 3", publisher: "MiloEats", amount: 24.5, currency: "USD", status: "approved", clickTimestamp: "2026-02-01T08:15:00Z", conversionTimestamp: "2026-02-01T08:44:00Z", orderId: "ORD-9019", cookieWindow: "14 days", device: "Desktop", referrerSource: "Search", customerType: "New", productCategory: "Bars", conversionType: "Purchase", stateHistory: history("approved", "2026-02-01T08:44:00Z"), ...base },
  { id: "COM-1010", programName: "Back to School Bundle", publisher: "FitFoodDaily", amount: 29.9, currency: "USD", status: "reversed", clickTimestamp: "2026-02-04T10:30:00Z", conversionTimestamp: "2026-02-04T10:50:00Z", orderId: "ORD-9020", cookieWindow: "7 days", device: "Android", referrerSource: "TikTok", customerType: "New", productCategory: "Bundle", conversionType: "Purchase", reversalReason: "Cancelled order", reversalCategory: "Customer", reversalNote: "Customer cancelled before fulfillment.", reversalConfidence: "medium", stateHistory: history("reversed", "2026-02-04T10:50:00Z"), ...base },
  { id: "COM-1011", programName: "Creator Collab Series", publisher: "CampusCravings", amount: 90.25, currency: "USD", status: "locked", clickTimestamp: "2026-01-14T19:00:00Z", conversionTimestamp: "2026-01-14T19:24:00Z", orderId: "ORD-9021", cookieWindow: "30 days", device: "Desktop", referrerSource: "Blog", customerType: "Returning", productCategory: "Collab Box", conversionType: "Purchase", stateHistory: history("locked", "2026-01-14T19:24:00Z"), ...base },
  { id: "COM-1012", programName: "Back to School Bundle", publisher: "CrateReview", amount: 41.75, currency: "USD", status: "recorded", clickTimestamp: "2026-03-02T13:11:00Z", conversionTimestamp: "2026-03-02T13:20:00Z", orderId: "ORD-9022", cookieWindow: "7 days", device: "iOS", referrerSource: "Instagram", customerType: "New", productCategory: "Bundle", conversionType: "Purchase", stateHistory: history("recorded", "2026-03-02T13:20:00Z"), ...base },
  { id: "COM-1013", programName: "Chocolate Bar Drop Vol. 3", publisher: "SweetSignals", amount: 142.5, currency: "USD", status: "pending", clickTimestamp: "2026-02-19T07:20:00Z", conversionTimestamp: "2026-02-19T07:27:00Z", orderId: "ORD-9023", cookieWindow: "14 days", device: "Desktop", referrerSource: "YouTube", customerType: "New", productCategory: "Collector Pack", conversionType: "Purchase", riskFlags: ["Bulk checkout"], stateHistory: history("pending", "2026-02-19T07:27:00Z"), ...base }
];

export const DETAIL_COMMISSIONS: Commission[] = [
  COMMISSIONS.find((c) => c.id === "COM-1003")!,
  COMMISSIONS.find((c) => c.id === "COM-1004")!,
  {
    ...COMMISSIONS.find((c) => c.id === "COM-1010")!,
    id: "COM-2003",
    reversalNote: "",
    reversalReason: "Fraud signal",
    riskFlags: ["Velocity anomaly", "Device mismatch"]
  }
];

export const DISPUTES: Dispute[] = [
  {
    id: "DSP-301",
    commissionId: "COM-1004",
    status: "resolved_reinstated",
    reason: "Duplicate order appears incorrect",
    raisedBy: "SnackScope",
    raisedAt: "2026-02-02T10:00:00Z",
    deadlineAt: "2026-02-09T10:00:00Z",
    subject: "Order appears valid",
    evidence: "Order receipt + delivery scan",
    brandResponse: "Reinstated after manual check.",
    explanationQuality: "strong",
    publisherAccepted: true,
    messages: [
      { sender: "publisher", senderName: "SnackScope", content: "Please review this reversal, product shipped.", sentAt: "2026-02-02T10:00:00Z" },
      { sender: "brand", senderName: "Feastables Ops", content: "Confirmed valid. Reinstating now.", sentAt: "2026-02-04T11:20:00Z" }
    ]
  },
  {
    id: "DSP-302",
    commissionId: "COM-1010",
    status: "resolved_upheld",
    reason: "Cancellation disputed",
    raisedBy: "FitFoodDaily",
    raisedAt: "2026-02-08T12:30:00Z",
    deadlineAt: "2026-02-15T12:30:00Z",
    subject: "Customer cancellation unclear",
    evidence: "Checkout confirmation screenshot",
    brandResponse: "Cancellation logged pre-ship.",
    explanationQuality: "strong",
    publisherAccepted: true,
    messages: [
      { sender: "publisher", senderName: "FitFoodDaily", content: "Can you share cancellation timestamp?", sentAt: "2026-02-08T12:30:00Z" },
      { sender: "brand", senderName: "Feastables Support", content: "Cancelled 13 mins after order. Upholding reversal.", sentAt: "2026-02-10T09:10:00Z" }
    ]
  },
  {
    id: "DSP-303",
    commissionId: "COM-2003",
    status: "resolved_upheld_no_explanation",
    reason: "No clear rationale",
    raisedBy: "CrateReview",
    raisedAt: "2026-02-10T17:00:00Z",
    deadlineAt: "2026-02-17T17:00:00Z",
    subject: "Fraud reversal with no details",
    evidence: "Order match + audience logs",
    explanationQuality: "none",
    messages: [
      { sender: "publisher", senderName: "CrateReview", content: "Need explanation for reversal.", sentAt: "2026-02-10T17:00:00Z" },
      { sender: "system", senderName: "System", content: "Brand upheld without explanation.", sentAt: "2026-02-12T16:10:00Z" }
    ]
  },
  {
    id: "DSP-304",
    commissionId: "COM-1007",
    status: "escalated",
    reason: "Past due pending",
    raisedBy: "SnackScope",
    raisedAt: "2026-03-01T09:00:00Z",
    deadlineAt: "2026-03-05T09:00:00Z",
    subject: "Pending beyond validation window",
    evidence: "Lifecycle timestamps",
    brandResponse: "Escalated to compliance.",
    explanationQuality: "weak",
    messages: [
      { sender: "publisher", senderName: "SnackScope", content: "This is 50+ days pending.", sentAt: "2026-03-01T09:00:00Z" },
      { sender: "brand", senderName: "Feastables Ops", content: "Escalating this case.", sentAt: "2026-03-01T15:40:00Z" }
    ]
  },
  {
    id: "DSP-305",
    commissionId: "COM-1013",
    status: "open_awaiting_brand",
    reason: "Risk flag challenge",
    raisedBy: "SweetSignals",
    raisedAt: "2026-03-02T12:00:00Z",
    deadlineAt: "2026-03-09T12:00:00Z",
    subject: "Bulk checkout seems legitimate",
    evidence: "Audience campaign logs",
    messages: [{ sender: "publisher", senderName: "SweetSignals", content: "Please review context.", sentAt: "2026-03-02T12:00:00Z" }]
  },
  {
    id: "DSP-306",
    commissionId: "COM-1003",
    status: "brand_responded",
    reason: "Attribution mismatch",
    raisedBy: "FitFoodDaily",
    raisedAt: "2026-02-28T08:10:00Z",
    deadlineAt: "2026-03-06T08:10:00Z",
    subject: "Conversion attributed to wrong source",
    evidence: "UTM logs and click IDs",
    brandResponse: "Reviewing click chain, awaiting final.",
    explanationQuality: "weak",
    messages: [
      { sender: "publisher", senderName: "FitFoodDaily", content: "Attribution should map to our UTM.", sentAt: "2026-02-28T08:10:00Z" },
      { sender: "brand", senderName: "Feastables Support", content: "Acknowledged, auditing logs.", sentAt: "2026-03-01T10:00:00Z" }
    ]
  }
];

export const REVERSAL_REASONS = [
  { code: "duplicate_order", label: "Duplicate order" },
  { code: "cancelled_order", label: "Cancelled order" },
  { code: "fraud_signal", label: "Fraud signal" },
  { code: "out_of_policy", label: "Out of policy" }
];

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export function getAgeDays(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(d / 86400000));
}

export function getClickToConversionMinutes(click: string, conv: string) {
  return Math.max(1, Math.round((new Date(conv).getTime() - new Date(click).getTime()) / 60000));
}

export function getPendingCommissions() {
  return COMMISSIONS.filter((c) => c.status === "pending" || c.status === "recorded");
}

export function getPublisherCommissions() {
  return COMMISSIONS;
}

export function getDisputeDaysRemaining(dispute: Dispute) {
  return Math.ceil((new Date(dispute.deadlineAt).getTime() - Date.now()) / 86400000);
}

export function getDisputeUrgency(dispute: Dispute): "low" | "medium" | "high" {
  const days = getDisputeDaysRemaining(dispute);
  if (days <= 2) return "high";
  if (days <= 5) return "medium";
  return "low";
}

export type BrandProgramData = {
  programName: string;
  brandName: string;
  status: "active" | "draft";
  commissionRate: string;
  commissionType: string;
  cookieWindow: string;
  attributionModel: string;
  validationWindow: string;
  reversalReasons: string[];
  explanationCommitment: string;
  explanationNote: string;
  disputeWindow: string;
  trustSummary: {
    approvalRate: string;
    avgPayout: string;
    reversalsExplained: string;
    activePublishers: string;
  };
};

export const BRAND_PROGRAMS_DATA: Record<string, BrandProgramData> = {
  "Chocolate Bar Drop Vol. 3": {
    programName: "Chocolate Bar Drop Vol. 3",
    brandName: "Feastables",
    status: "active",
    commissionRate: "14%",
    commissionType: "Revenue share",
    cookieWindow: "14 days",
    attributionModel: "Last-click",
    validationWindow: "21 days",
    reversalReasons: ["Duplicate order", "Cancelled order", "Fraud signal"],
    explanationCommitment: "Required for all reversals",
    explanationNote: "Clear reason codes + short written note required.",
    disputeWindow: "7 days",
    trustSummary: { approvalRate: "91%", avgPayout: "$48", reversalsExplained: "98%", activePublishers: "42" }
  },
  "Creator Collab Series": {
    programName: "Creator Collab Series",
    brandName: "Feastables",
    status: "active",
    commissionRate: "18%",
    commissionType: "Revenue share",
    cookieWindow: "30 days",
    attributionModel: "Last-click",
    validationWindow: "21 days",
    reversalReasons: ["Cancelled order", "Fraud signal"],
    explanationCommitment: "Required for all reversals",
    explanationNote: "Structured response required in dispute center.",
    disputeWindow: "7 days",
    trustSummary: { approvalRate: "88%", avgPayout: "$64", reversalsExplained: "95%", activePublishers: "35" }
  },
  "Back to School Bundle": {
    programName: "Back to School Bundle",
    brandName: "Feastables",
    status: "active",
    commissionRate: "11%",
    commissionType: "Revenue share",
    cookieWindow: "7 days",
    attributionModel: "Last-click",
    validationWindow: "21 days",
    reversalReasons: ["Duplicate order", "Out of policy"],
    explanationCommitment: "Required for all reversals",
    explanationNote: "Brand must provide trace-level reason summary.",
    disputeWindow: "7 days",
    trustSummary: { approvalRate: "86%", avgPayout: "$39", reversalsExplained: "93%", activePublishers: "26" }
  }
};

export type EnrolledProgram = BrandProgramData & {
  enrolledDate: string;
  affiliateLink: string;
};

export const ENROLLED_PROGRAMS: Record<string, EnrolledProgram> = Object.fromEntries(
  Object.values(BRAND_PROGRAMS_DATA).map((p, idx) => [
    p.programName,
    { ...p, enrolledDate: ["2025-09-12", "2025-10-04", "2026-01-08"][idx], affiliateLink: `https://freeq.app/r/${idx + 401}` }
  ])
);
