import {
  Commission,
  CUSTOMER_PROFILES,
  DISPUTES,
  deriveBuyerSegment,
  formatCurrency,
  formatDateTime,
  getProgramCommissionRatePercent,
  getClickToConversionMinutes
} from "@/lib/mock-data";

export type AttributionState = "verified" | "disputed" | "unestablished";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export type EvidenceSignal = {
  label: string;
  status: "positive" | "warning" | "negative";
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
};

export type AttributionTimelineEvent = {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
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
    | "reverse";
  tone: "default" | "alert" | "success" | "review";
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

export function getAttributionTimeline(commission: Commission, attribution: AttributionRecord): AttributionTimelineEvent[] {
  const journeyMinutes = Math.max(6, getClickToConversionMinutes(commission.clickTimestamp, commission.conversionTimestamp));
  const browseTime = addMinutes(commission.clickTimestamp, Math.min(2, Math.max(1, journeyMinutes - 4)));
  const continuityTime = addMinutes(commission.clickTimestamp, Math.min(3, Math.max(2, journeyMinutes - 3)));
  const productTime = addMinutes(commission.clickTimestamp, Math.min(4, Math.max(3, journeyMinutes - 2)));
  const cartTime = addMinutes(commission.clickTimestamp, Math.min(5, Math.max(4, journeyMinutes - 1)));
  const checkoutTime = addMinutes(commission.clickTimestamp, Math.min(6, Math.max(5, journeyMinutes)));
  const returnVisit = getReturnVisitCopy(commission.device);
  const continuity = getContinuityCopy(attribution.state);

  const events: AttributionTimelineEvent[] = [
    {
      id: "link",
      title: "Link clicked for the first time!",
      subtitle: `Referral captured via ${attribution.creatorInteraction.replace(" clicked", "")}.`,
      timestamp: formatTimelineTime(commission.clickTimestamp),
      icon: "link",
      tone: "default"
    },
    {
      id: "return",
      title: returnVisit.title,
      subtitle: returnVisit.subtitle,
      timestamp: formatTimelineTime(browseTime),
      icon: "monitor",
      tone: "default"
    },
    {
      id: "continuity",
      title: continuity.title,
      subtitle: continuity.subtitle,
      timestamp: formatTimelineTime(continuityTime),
      icon: "spark",
      tone: attribution.state === "unestablished" ? "alert" : "default"
    },
    {
      id: "product",
      title: "They are checking out specific products you recommended.",
      subtitle: `High-intent views around ${attribution.product}.`,
      timestamp: formatTimelineTime(productTime),
      icon: "eye",
      tone: "default"
    },
    {
      id: "cart",
      title: "They added your pick to their cart!",
      subtitle: "Product added to cart during the referral journey.",
      timestamp: formatTimelineTime(cartTime),
      icon: "cart",
      tone: "default"
    },
    {
      id: "checkout",
      title: "They’ve started the checkout process.",
      subtitle: `Checkout started with a ${attribution.confidence.toLowerCase()}-confidence attribution path.`,
      timestamp: formatTimelineTime(checkoutTime),
      icon: "card",
      tone: "default"
    }
  ];

  if (attribution.state === "disputed") {
    const alertCopy = getAlertCopy(commission, attribution);
    events.push({
      id: "alert",
      title: alertCopy.title,
      subtitle: alertCopy.subtitle,
      timestamp: formatTimelineTime(addMinutes(commission.conversionTimestamp, 1)),
      icon: "alert",
      tone: "alert"
    });
  }

  if (attribution.state !== "unestablished") {
    events.push({
      id: "conversion",
      title: "The sale is complete. You get the credit!",
      subtitle: "Order finalized and verified.",
      timestamp: formatTimelineTime(commission.conversionTimestamp),
      icon: "success",
      tone: "success"
    });
  }

  if (["pending", "recorded", "locked"].includes(commission.status)) {
    events.push({
      id: "review",
      title: "Your commission is being reviewed",
      subtitle:
        commission.status === "locked"
          ? "Commission is locked while validation finishes."
          : "Commission remains in review before final approval.",
      timestamp: formatTimelineTime(getReviewTimestamp(commission)),
      icon: "review",
      tone: "review"
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
  const unattributed = weakReferrer && commission.customerType === "Returning" && !hasDispute && !hasRisk;

  let state: AttributionState = "verified";
  if (unattributed) state = "unestablished";
  else if (hasDispute || hasRisk || commission.status === "reversed" || clickToPurchaseMinutes > 1440) state = "disputed";

  const confidence: ConfidenceLevel =
    state === "verified" ? (clickToPurchaseMinutes <= 30 ? "High" : "Medium") : state === "disputed" ? "Medium" : "Low";

  const sameSession = clickToPurchaseMinutes <= 30 && !weakReferrer;
  const creatorCode = state === "verified" ? `${commission.publisher.slice(0, 5).toUpperCase()}10 used at checkout` : "None used at checkout";
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
          { label: "Time-to-purchase within expected window", status: "positive" }
        ]
      : state === "disputed"
        ? [
            { label: "Original click path detected", status: "positive" },
            { label: "Competing or contested attribution signal present", status: "warning" },
            { label: "Validation requires manual review", status: "warning" },
            { label: "No checkout code confirms creator intent", status: "negative" }
          ]
        : [
            { label: "No reliable creator click path confirmed", status: "negative" },
            { label: "No creator code at checkout", status: "negative" },
            { label: "No session continuity supporting attribution", status: "negative" }
          ];

  const systemConfidence =
    state === "verified"
      ? `${confidence} — strong alignment between creator interaction and purchase`
      : state === "disputed"
        ? "Medium — attribution path exists but conflicting or contested signals remain"
        : "Low — insufficient signals to attribute this conversion confidently";

  return {
    commissionId: commission.id,
    creator: state === "unestablished" ? "Unattributed" : commission.publisher,
    source: state === "unestablished" ? "No creator interaction detected" : source,
    product: CUSTOMER_PROFILES[commission.orderId]?.purchased ?? commission.productCategory,
    orderValue: formatCurrency(getEstimatedOrderValue(commission), commission.currency),
    commission: formatCurrency(commission.amount, commission.currency),
    state,
    confidence,
    buyerBehaviour,
    creatorInteraction:
      state === "unestablished" ? "No creator link click or code detected prior to purchase" : `${source} clicked`,
    clickTimestamp: state === "unestablished" ? undefined : formatDateTime(commission.clickTimestamp),
    purchaseTimestamp: formatDateTime(commission.conversionTimestamp),
    timeToPurchase: `${clickToPurchaseMinutes} minutes`,
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
        ? "This conversion occurred inside an active affiliate programme but without detectable creator influence. The commission is held pending manual review."
        : undefined,
    systemConfidence,
    actions:
      state === "disputed"
        ? ["Review Commission", "Open Dispute"]
        : state === "unestablished"
          ? ["Flag for Review"]
          : undefined,
    signals
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
