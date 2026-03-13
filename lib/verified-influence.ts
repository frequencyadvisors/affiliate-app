import {
  Commission,
  CommissionJourneyStage,
  CUSTOMER_PROFILES,
  DISPUTES,
  deriveBuyerSegment,
  formatCurrency,
  formatDateTime,
  getAgeDays,
  getProgramCommissionRatePercent,
  getClickToConversionMinutes
} from "@/lib/mock-data";

export type AttributionState = "verified" | "disputed" | "unestablished";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export type EvidenceSignal = {
  label: string;
  status: "positive" | "warning" | "negative";
};

export type AuditLogEntry = {
  id: string;
  label: string;
  value: string;
};

export type AttributionRecord = {
  commissionId: string;
  creator: string;
  source: string;
  product: string;
  orderValue: string;
  commission: string;
  state: AttributionState;
  confidence: ConfidenceLevel;
  buyerBehaviour: string;
  creatorInteraction: string;
  clickTimestamp?: string;
  purchaseTimestamp: string;
  timeToPurchase?: string;
  sessionContinuity: string;
  creatorCode: string;
  conflictingSignal?: string;
  systemNote?: string;
  systemConfidence: string;
  actions?: string[];
  signals: EvidenceSignal[];
  integritySummary: string;
  integrityDescription: string;
  activeRule: string;
};

export type AttributionTimelineEvent = {
  id: string;
  title: string;
  subtitle: string;
  metadataLabel?: string;
  timestamp: string;
  progression: "completed" | "current" | "expected";
  icon:
    | "link"
    | "monitor"
    | "spark"
    | "eye"
    | "cart"
    | "card"
    | "alert"
    | "success"
    | "review"
    | "payout"
    | "reverse";
  tone: "default" | "alert" | "success" | "review";
  auditEntries?: AuditLogEntry[];
};

function toBuyerBehaviour(segment: string) {
  if (segment.includes("Repeat")) return "Repeat buyer";
  if (segment.includes("Deal")) return "Deal-driven purchase";
  if (segment.includes("Subscription")) return "Subscription buyer";
  if (segment.includes("Gift")) return "Gift buyer";
  return "First-time buyer";
}

function toSourceLabel(source: string) {
  if (source === "TikTok") return "TikTok video link";
  if (source === "Instagram") return "Instagram story link";
  if (source === "YouTube") return "YouTube description link";
  if (source === "Blog") return "Creator blog link";
  if (source === "Newsletter") return "Creator newsletter link";
  if (source === "Search") return "Organic search handoff";
  if (source === "Direct link") return "Direct creator link";
  return `${source} referral link`;
}

function getTrackingMethod(source: string) {
  if (source === "Instagram" || source === "TikTok") return "Server-to-Server";
  if (source === "YouTube" || source === "Blog") return "1st-Party Pixel";
  if (source === "Newsletter") return "Authenticated Link Redirect";
  return "Referral Link Capture";
}

function getSourceMetadata(source: string) {
  if (source === "Instagram") return "Instagram Story Link";
  if (source === "TikTok") return "TikTok Bio Link";
  if (source === "YouTube") return "YouTube Description Link";
  if (source === "Blog") return "Creator Blog CTA";
  if (source === "Newsletter") return "Newsletter Primary CTA";
  if (source === "Search") return "Organic Search Assist";
  if (source === "Direct link") return "Direct Creator Link";
  return `${source} Referral`;
}

function getSessionId(commission: Commission) {
  return `SID-${commission.id.slice(-4)}-${commission.orderId.slice(-3)}`;
}

function getIdMatchLabel(commission: Commission, state: AttributionState) {
  if (state === "verified") return commission.device === "Desktop" ? "ID Match: Confirmed" : "ID Match: High";
  if (state === "disputed") return "ID Match: Medium";
  return "ID Match: Low";
}

function getCommercePlatformRef(commission: Commission) {
  return `Shopify ${commission.orderId}`;
}

function hasRecordedTransaction(journeyStage: CommissionJourneyStage) {
  return !["link_clicked", "product_viewed", "added_to_cart", "checkout_started"].includes(journeyStage);
}

function getCheckoutSignalLabel(state: AttributionState, creatorCode: string, journeyStage: CommissionJourneyStage) {
  if (journeyStage === "link_clicked" || journeyStage === "product_viewed") return "No checkout activity yet";
  if (journeyStage === "added_to_cart") return "Cart started without checkout";
  if (journeyStage === "checkout_started") return "Checkout started without transaction";
  if (creatorCode !== "None used at checkout") return "Checkout code verified";
  if (state === "verified") return "Checkout completion verified";
  if (!hasRecordedTransaction(journeyStage)) return "Transaction not recorded";
  return "Checkout code missing";
}

function getCheckoutSignalStatus(state: AttributionState, creatorCode: string, journeyStage: CommissionJourneyStage): EvidenceSignal["status"] {
  if (journeyStage === "link_clicked" || journeyStage === "product_viewed") return "negative";
  if (journeyStage === "added_to_cart" || journeyStage === "checkout_started") return "warning";
  if (creatorCode !== "None used at checkout") return "positive";
  if (state === "verified") return "warning";
  return "negative";
}

export function getReversalReasonCode(commission: Commission) {
  const reason = `${commission.reversalReason ?? ""} ${commission.reversalCategory ?? ""}`.toLowerCase();

  if (reason.includes("return") || reason.includes("cancel")) {
    return { code: "RET-01", label: "Customer Return" };
  }

  if (reason.includes("duplicate")) {
    return { code: "DUP-02", label: "Duplicate Order" };
  }

  return { code: "POL-03", label: "Policy Violation / Non-Incremental" };
}

export function getValidationDaysRemaining(commission: Commission) {
  return Math.max(0, commission.validationWindowDays - getAgeDays(commission.conversionTimestamp));
}

export function getAuditLogEntries(commission: Commission, attribution: AttributionRecord): AuditLogEntry[] {
  return [
    { id: "click-id", label: "Click ID", value: `${commission.id.toLowerCase()}-${commission.orderId.toLowerCase()}` },
    { id: "tracking-method", label: "Tracking Method", value: getTrackingMethod(commission.referrerSource) },
    { id: "source", label: "Source Metadata", value: getSourceMetadata(commission.referrerSource) },
    { id: "session", label: "Session ID", value: getSessionId(commission) },
    { id: "continuity", label: "Device Continuity", value: getIdMatchLabel(commission, attribution.state) },
    { id: "rule", label: "Attribution Rule", value: attribution.activeRule },
    { id: "commerce", label: "Commerce Platform Ref", value: getCommercePlatformRef(commission) },
    { id: "creator-code", label: "Checkout Code", value: attribution.creatorCode }
  ];
}

function getEstimatedOrderValue(commission: Commission) {
  const rate = getProgramCommissionRatePercent(commission.programName);
  return rate > 0 ? commission.amount / (rate / 100) : commission.amount;
}

function formatTimelineTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  })
    .format(new Date(iso))
    .replace(" ", "")
    .toUpperCase();
}

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

function getReviewTimestamp(commission: Commission) {
  const reviewStep = commission.stateHistory.find((step) => step.status === "pending" || step.status === "locked");
  return reviewStep?.at ?? commission.conversionTimestamp;
}

function getReversalTimestamp(commission: Commission) {
  const reversedStep = commission.stateHistory.find((step) => step.status === "reversed");
  return reversedStep?.at ?? addMinutes(commission.conversionTimestamp, 1440);
}

function getPaidTimestamp(commission: Commission) {
  const paidStep = commission.stateHistory.find((step) => step.status === "paid");
  return paidStep?.at ?? addMinutes(getReviewTimestamp(commission), 1440);
}

function getReturnVisitCopy(device: string) {
  if (device === "Desktop") {
    return {
      title: "They came back to the site on their computer to look around.",
      subtitle: "Multi-session return on Desktop"
    };
  }

  if (device === "Tablet") {
    return {
      title: "They came back to browse again from their tablet.",
      subtitle: "Multi-session return on Tablet"
    };
  }

  return {
    title: "They kept browsing after the first click.",
    subtitle: `Multi-session return on ${device}`
  };
}

function getContinuityCopy(state: AttributionState) {
  if (state === "verified") {
    return {
      title: "The click path stayed connected across their journey.",
      subtitle: "Session continuity remained strong."
    };
  }

  if (state === "unestablished") {
    return {
      title: "We could not fully connect the click path to checkout.",
      subtitle: "Session continuity weakened before purchase."
    };
  }

  return {
    title: "We’ve linked their original click to the later visit.",
    subtitle: "Cross-device or probabilistic match."
  };
}

function getAlertCopy(commission: Commission, attribution: AttributionRecord) {
  if (commission.status === "reversed") {
    return {
      title: "A conflicting validation signal was raised on this sale.",
      subtitle: attribution.conflictingSignal ?? "This commission entered a contested review flow."
    };
  }

  if (commission.riskFlags?.length) {
    return {
      title: `${commission.riskFlags[0]} challenged this sale.`,
      subtitle: attribution.conflictingSignal ?? "A risk signal introduced competing attribution evidence."
    };
  }

  return {
    title: "A dispute was opened on this commission.",
    subtitle: attribution.conflictingSignal ?? "The original attribution path is under review."
  };
}

function getJourneyProgressRank(journeyStage: CommissionJourneyStage) {
  if (journeyStage === "link_clicked") return 0;
  if (journeyStage === "product_viewed") return 3;
  if (journeyStage === "added_to_cart") return 4;
  if (journeyStage === "checkout_started") return 5;
  if (journeyStage === "transaction_recorded") return 6;
  if (journeyStage === "in_validation") return 7;
  if (journeyStage === "approved_for_payout") return 7;
  if (journeyStage === "paid_out") return 7;
  return 7;
}

function getTimelineTimestamp(iso: string, progression: AttributionTimelineEvent["progression"]) {
  return progression === "expected" ? "Expected" : formatTimelineTime(iso);
}

function getProgression(stepRank: number, currentRank: number): AttributionTimelineEvent["progression"] {
  if (stepRank < currentRank) return "completed";
  if (stepRank === currentRank) return "current";
  return "expected";
}

export function getAttributionTimeline(commission: Commission, attribution: AttributionRecord): AttributionTimelineEvent[] {
  const journeyMinutes = Math.max(6, getClickToConversionMinutes(commission.clickTimestamp, commission.conversionTimestamp));
  const browseTime = addMinutes(commission.clickTimestamp, Math.min(2, Math.max(1, journeyMinutes - 4)));
  const continuityTime = addMinutes(commission.clickTimestamp, Math.min(3, Math.max(2, journeyMinutes - 3)));
  const productTime = addMinutes(commission.clickTimestamp, Math.min(4, Math.max(3, journeyMinutes - 2)));
  const cartTime = addMinutes(commission.clickTimestamp, Math.min(5, Math.max(4, journeyMinutes - 1)));
  const checkoutTime = addMinutes(commission.clickTimestamp, Math.min(6, Math.max(5, journeyMinutes)));
  const returnVisit = getReturnVisitCopy(commission.device);
  const continuity = getContinuityCopy(attribution.state);
  const currentRank = getJourneyProgressRank(commission.journeyStage);
  const hasTransaction = hasRecordedTransaction(commission.journeyStage);

  const events: AttributionTimelineEvent[] = [
    {
      id: "link",
      title: "Link clicked for the first time!",
      subtitle: `Referral captured via ${attribution.creatorInteraction.replace(" clicked", "")}.`,
      metadataLabel: `${getTrackingMethod(commission.referrerSource)} · ${getSourceMetadata(commission.referrerSource)}`,
      timestamp: getTimelineTimestamp(commission.clickTimestamp, getProgression(0, currentRank)),
      progression: getProgression(0, currentRank),
      icon: "link",
      tone: "default",
      auditEntries: [
        { id: "tracking-method", label: "Tracking Method", value: getTrackingMethod(commission.referrerSource) },
        { id: "source", label: "Source Metadata", value: getSourceMetadata(commission.referrerSource) },
        { id: "click-id", label: "Click ID", value: `${commission.id.toLowerCase()}-${commission.orderId.toLowerCase()}` }
      ]
    }
  ];

  events.push({
    id: "return",
    title: returnVisit.title,
    subtitle: returnVisit.subtitle,
    timestamp: getTimelineTimestamp(browseTime, getProgression(1, currentRank)),
    progression: getProgression(1, currentRank),
    icon: "monitor",
    tone: "default"
  });

  events.push({
    id: "continuity",
    title: continuity.title,
    subtitle: continuity.subtitle,
    metadataLabel: `${getSessionId(commission)} · ${getIdMatchLabel(commission, attribution.state)}`,
    timestamp: getTimelineTimestamp(continuityTime, getProgression(2, currentRank)),
    progression: getProgression(2, currentRank),
    icon: "spark",
    tone: attribution.state === "unestablished" ? "alert" : "default",
    auditEntries: [
      { id: "session-id", label: "Session ID", value: getSessionId(commission) },
      { id: "device", label: "Device Continuity", value: getIdMatchLabel(commission, attribution.state) }
    ]
  });

  events.push({
    id: "product",
    title: "They are checking out specific products you recommended.",
    subtitle: `High-intent views around ${attribution.product}.`,
    timestamp: getTimelineTimestamp(productTime, getProgression(3, currentRank)),
    progression: getProgression(3, currentRank),
    icon: "eye",
    tone: "default"
  });

  events.push({
    id: "cart",
    title:
      commission.journeyStage === "added_to_cart"
        ? "They added your pick to their cart, but checkout has not happened yet."
        : getProgression(4, currentRank) === "expected"
          ? "They are expected to add your pick to their cart next."
          : "They added your pick to their cart!",
    subtitle:
      commission.journeyStage === "added_to_cart"
        ? "Cart activity is the latest shared state on this record."
        : getProgression(4, currentRank) === "expected"
          ? "Cart activity has not been observed yet."
          : "Product added to cart during the referral journey.",
    timestamp: getTimelineTimestamp(cartTime, getProgression(4, currentRank)),
    progression: getProgression(4, currentRank),
    icon: "cart",
    tone: "default"
  });

  events.push({
    id: "checkout",
    title:
      commission.journeyStage === "checkout_started"
        ? "They started checkout, but the transaction has not posted yet."
        : getProgression(5, currentRank) === "expected"
          ? "Checkout is expected after cart activity is confirmed."
          : "They’ve started the checkout process.",
    subtitle:
      commission.journeyStage === "checkout_started"
        ? "Checkout is in progress and we are still waiting for the order signal."
        : getProgression(5, currentRank) === "expected"
          ? "No checkout start signal has been recorded yet."
          : `Checkout started with a ${attribution.confidence.toLowerCase()}-confidence attribution path.`,
    metadataLabel: `${getCommercePlatformRef(commission)} · ${getCheckoutSignalLabel(attribution.state, attribution.creatorCode, commission.journeyStage)}`,
    timestamp: getTimelineTimestamp(checkoutTime, getProgression(5, currentRank)),
    progression: getProgression(5, currentRank),
    icon: "card",
    tone: "default",
    auditEntries: [
      { id: "commerce-platform", label: "Commerce Platform Ref", value: getCommercePlatformRef(commission) },
      { id: "checkout-code", label: "Checkout Signal", value: getCheckoutSignalLabel(attribution.state, attribution.creatorCode, commission.journeyStage) }
    ]
  });

  if (attribution.state === "disputed") {
    const alertCopy = getAlertCopy(commission, attribution);
    events.push({
      id: "alert",
      title: alertCopy.title,
      subtitle: alertCopy.subtitle,
      timestamp: formatTimelineTime(addMinutes(commission.conversionTimestamp, 1)),
      progression: "current",
      icon: "alert",
      tone: "alert"
    });
  }

  events.push({
    id: "conversion",
    title:
      commission.journeyStage === "in_validation"
        ? "The transaction posted and is now being validated."
        : getProgression(6, currentRank) === "expected"
          ? "Conversion is expected once checkout is completed."
          : "The sale is complete. You get the credit!",
    subtitle:
      commission.journeyStage === "in_validation"
        ? "Transaction received, but the system is still confirming it."
        : getProgression(6, currentRank) === "expected"
          ? "No transaction has been recorded yet."
          : "Order finalized and verified.",
    timestamp: getTimelineTimestamp(commission.conversionTimestamp, getProgression(6, currentRank)),
    progression: getProgression(6, currentRank),
    icon: "success",
    tone: "success"
  });

  events.push({
    id: "review",
    title:
      commission.journeyStage === "in_validation"
        ? "Your commission is being reviewed"
        : getProgression(7, currentRank) === "expected"
          ? "Review is expected after the transaction is recorded."
          : commission.status === "locked"
            ? "Your commission is locked while validation finishes"
            : "Commission review completed",
    subtitle:
      commission.journeyStage === "in_validation"
        ? "Commission remains in review before final approval."
        : getProgression(7, currentRank) === "expected"
          ? "Validation has not started yet."
          : commission.status === "locked"
            ? "Commission is locked while validation finishes."
            : "Review logic has already been applied to this commission.",
    timestamp: getTimelineTimestamp(getReviewTimestamp(commission), getProgression(7, currentRank)),
    progression: getProgression(7, currentRank),
    icon: "review",
    tone: "review"
  });

  if (commission.status === "paid") {
    events.push({
      id: "payout",
      title: "Commission will be transferred",
      subtitle: "Payout has been queued after review and moved into the transfer cycle.",
      timestamp: formatTimelineTime(getPaidTimestamp(commission)),
      progression: "current",
      icon: "payout",
      tone: "success"
    });
  }

  if (commission.status === "reversed") {
    events.push({
      id: "reversed",
      title:
        commission.reversalCategory === "Customer"
          ? "The customer changed their mind and returned the items"
          : "The brand reversed the commission after review.",
      subtitle: commission.reversalNote || commission.reversalReason || "A reversal event was recorded for this order.",
      timestamp: formatTimelineTime(getReversalTimestamp(commission)),
      progression: "current",
      icon: "reverse",
      tone: "alert"
    });
  }

  return events;
}

export function getAttributionRecord(commission: Commission): AttributionRecord {
  const buyerSegment = deriveBuyerSegment(commission);
  const buyerBehaviour = toBuyerBehaviour(buyerSegment);
  const clickToPurchaseMinutes = getClickToConversionMinutes(commission.clickTimestamp, commission.conversionTimestamp);
  const source = toSourceLabel(commission.referrerSource);
  const disputes = DISPUTES.filter((item) => item.commissionId === commission.id);
  const hasDispute = disputes.length > 0;
  const hasRisk = Boolean(commission.riskFlags?.length);
  const weakReferrer = ["Search", "Direct link", "Newsletter"].includes(commission.referrerSource);
  const preTransaction = !hasRecordedTransaction(commission.journeyStage);
  const unattributed = (weakReferrer && commission.customerType === "Returning" && !hasDispute && !hasRisk) || preTransaction;

  let state: AttributionState = "verified";
  if (unattributed) state = "unestablished";
  else if (hasDispute || hasRisk || commission.status === "reversed" || clickToPurchaseMinutes > 1440) state = "disputed";

  const confidence: ConfidenceLevel =
    state === "verified" ? (clickToPurchaseMinutes <= 30 ? "High" : "Medium") : state === "disputed" ? "Medium" : "Low";

  const sameSession = clickToPurchaseMinutes <= 30 && !weakReferrer;
  const creatorCode =
    preTransaction
      ? "No checkout yet"
      : state === "verified"
        ? `${commission.publisher.slice(0, 5).toUpperCase()}10 used at checkout`
        : "None used at checkout";
  const conflictingSignal =
    state === "disputed"
      ? hasDispute
        ? `A dispute is open on this commission citing ${disputes[0].reason.toLowerCase()}. The brand response is ${
            disputes[0].brandResponse ? "still contested by the creator." : "still pending."
          }`
        : hasRisk
          ? `${commission.riskFlags?.[0]} was detected during validation, creating competing evidence against the original attribution path.`
          : "Purchase timing or status history introduces competing signals that weaken the original creator claim."
      : undefined;

  const signals: EvidenceSignal[] =
    state === "verified"
      ? [
          { label: "Direct click path detected", status: "positive" },
          { label: "Session continuity confirmed", status: "positive" },
          { label: "Device fingerprint aligned", status: "positive" },
          { label: getCheckoutSignalLabel(state, creatorCode, commission.journeyStage), status: getCheckoutSignalStatus(state, creatorCode, commission.journeyStage) }
        ]
      : state === "disputed"
        ? [
            { label: "Original click path detected", status: "positive" },
            { label: "Session continuity partially confirmed", status: "positive" },
            { label: "Competing or contested attribution signal present", status: "warning" },
            { label: getCheckoutSignalLabel(state, creatorCode, commission.journeyStage), status: getCheckoutSignalStatus(state, creatorCode, commission.journeyStage) }
          ]
        : [
            { label: "No reliable creator click path confirmed", status: "negative" },
            { label: "No session continuity supporting attribution", status: "negative" },
            { label: "Device continuity is unresolved", status: "negative" },
            { label: getCheckoutSignalLabel(state, creatorCode, commission.journeyStage), status: getCheckoutSignalStatus(state, creatorCode, commission.journeyStage) }
          ];

  const systemConfidence =
    preTransaction
      ? "This journey is still in-flight, so payout certainty depends on whether it turns into a verified order."
      : state === "verified"
      ? "Payout is on strong footing because click, session, and device signals align with the recorded order."
      : state === "disputed"
        ? "Payout should stay in review until the missing or conflicting checkout evidence is resolved."
        : "Payout certainty is low because the system cannot defend creator influence with enough verified signals.";

  const verifiedSignalCount = signals.filter((signal) => signal.status === "positive").length;
  const missingSignals = signals.filter((signal) => signal.status !== "positive").map((signal) => signal.label).join("; ");

  return {
    commissionId: commission.id,
    creator: state === "unestablished" && !preTransaction ? "Unattributed" : commission.publisher,
    source: state === "unestablished" && !preTransaction ? "No creator interaction detected" : source,
    product: CUSTOMER_PROFILES[commission.orderId]?.purchased ?? commission.productCategory,
    orderValue: formatCurrency(getEstimatedOrderValue(commission), commission.currency),
    commission: formatCurrency(commission.amount, commission.currency),
    state,
    confidence,
    buyerBehaviour,
    creatorInteraction:
      state === "unestablished" && !preTransaction ? "No creator link click or code detected prior to purchase" : `${source} clicked`,
    clickTimestamp: state === "unestablished" && !preTransaction ? undefined : formatDateTime(commission.clickTimestamp),
    purchaseTimestamp: hasRecordedTransaction(commission.journeyStage) ? formatDateTime(commission.conversionTimestamp) : "No transaction yet",
    timeToPurchase: hasRecordedTransaction(commission.journeyStage) ? `${clickToPurchaseMinutes} minutes` : "In progress",
    sessionContinuity:
      state === "verified"
        ? sameSession
          ? "Same device session confirmed"
          : "Likely same purchase journey"
        : state === "disputed"
          ? "Session continuity weakened during review"
          : "No prior session detected",
    creatorCode,
    conflictingSignal,
    systemNote:
      state === "unestablished"
        ? preTransaction
          ? "This shared commission record is still pre-transaction. It shows the creator-assisted journey before a purchase is recorded."
          : "This conversion occurred inside an active affiliate programme but without detectable creator influence. The commission is held pending manual review."
        : undefined,
    systemConfidence,
    actions:
      state === "disputed"
        ? ["Review Commission", "Open Dispute"]
        : state === "unestablished"
          ? ["Flag for Review"]
          : undefined,
    signals,
    integritySummary: `Attribution Integrity: ${verifiedSignalCount}/${signals.length} Signals`,
    integrityDescription:
      missingSignals.length > 0
        ? `${signals.filter((signal) => signal.status === "positive").map((signal) => signal.label.replace(" detected", "").replace(" confirmed", "")).join(", ")} verified; ${missingSignals} missing or contested.`
        : "Click, session, device, and checkout evidence are all verified.",
    activeRule: `Last-Click / ${commission.validationWindowDays}-Day Window`
  };
}

export function getAttributionSummary(commissions: Commission[]) {
  const records = commissions.map(getAttributionRecord);
  const summary = {
    verified: { conversions: 0, revenue: 0, commission: 0 },
    disputed: { conversions: 0, revenue: 0, commission: 0 },
    unestablished: { conversions: 0, revenue: 0, commission: 0 }
  };

  for (const record of records) {
    const revenue = Number.parseFloat(record.orderValue.replace(/[$,]/g, ""));
    const commission = Number.parseFloat(record.commission.replace(/[$,]/g, ""));
    summary[record.state].conversions += 1;
    summary[record.state].revenue += revenue;
    summary[record.state].commission += commission;
  }

  return summary;
}
