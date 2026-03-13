"use client";

import type { BrandScreen } from "@/components/brand/brand-shell";
import type { PublisherScreen } from "@/components/publisher/publisher-shell";

type AppNavigationState = {
  view: "brand" | "publisher";
  screen: BrandScreen | PublisherScreen;
  program?: string;
  commission?: string;
  creator?: string;
  businessUnit?: string;
};

function setOptionalParam(params: URLSearchParams, key: string, value?: string) {
  if (!value) {
    params.delete(key);
    return;
  }

  params.set(key, value);
}

export function buildAppNavigationHref(state: AppNavigationState): string {
  const url = new URL(window.location.href);

  url.searchParams.set("view", state.view);
  url.searchParams.set("screen", state.screen);
  setOptionalParam(url.searchParams, "program", state.program);
  setOptionalParam(url.searchParams, "commission", state.commission);
  setOptionalParam(url.searchParams, "creator", state.creator);
  setOptionalParam(url.searchParams, "businessUnit", state.businessUnit);

  return `${url.pathname}${url.search}${url.hash}`;
}
