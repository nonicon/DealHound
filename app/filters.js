// Filtering, sorting and board statistics for DealHound.
//
// Pure functions only: they take the deal list and a filter state and return
// a new list, so the rendering layer never has to reason about ordering.

import { deals } from "./deals.js";

/** The discount percentage of one deal, from its sale and usual prices. */
export function discountOf(deal) {
  if (!deal.was || deal.was <= deal.price) return 0;
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

/** The dollars saved on one deal. */
export function savingsOf(deal) {
  return Math.max(0, deal.was - deal.price);
}

/** Every category present in the data, in first-seen order. */
export function categories() {
  const seen = [];
  for (const deal of deals) {
    if (!seen.includes(deal.category)) seen.push(deal.category);
  }
  return seen;
}

/** Every store present in the data, in first-seen order. */
export function stores() {
  const seen = [];
  for (const deal of deals) {
    if (!seen.includes(deal.store)) seen.push(deal.store);
  }
  return seen;
}

/**
 * Filter and sort the deals.
 * state: { query, category, store, minDiscount, sort }
 * sort: "discount" | "savings" | "price-low" | "price-high" | "verdict"
 */
export function filterDeals(state) {
  const query = (state.query || "").trim().toLowerCase();
  const wanted = deals.filter((deal) => {
    if (state.category && state.category !== "All" && deal.category !== state.category) return false;
    if (state.store && state.store !== "All" && deal.store !== state.store) return false;
    if (state.minDiscount && discountOf(deal) < Number(state.minDiscount)) return false;
    if (query) {
      const haystack = `${deal.title} ${deal.store} ${deal.category} ${deal.source}`.toLowerCase();
      if (!query.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  });

  const rank = { "true-low": 0, strong: 1, routine: 2 };
  const sorted = [...wanted];
  switch (state.sort) {
    case "savings":
      sorted.sort((a, b) => savingsOf(b) - savingsOf(a));
      break;
    case "price-low":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "verdict":
      sorted.sort((a, b) => rank[a.verdict] - rank[b.verdict] || discountOf(b) - discountOf(a));
      break;
    case "discount":
    default:
      sorted.sort((a, b) => discountOf(b) - discountOf(a) || savingsOf(b) - savingsOf(a));
      break;
  }
  return sorted;
}

/** Board-wide totals for the header: deal count, total savings, average cut. */
export function boardStats(list) {
  const total = list.length;
  const saved = list.reduce((sum, deal) => sum + savingsOf(deal), 0);
  const average = total === 0 ? 0 : Math.round(list.reduce((sum, deal) => sum + discountOf(deal), 0) / total);
  const trueLows = list.filter((deal) => deal.verdict === "true-low").length;
  return { total, saved, average, trueLows };
}

/** Format a dollar amount with cents only when it has them. */
export function money(amount) {
  return amount % 1 === 0 ? `$${amount.toLocaleString("en-US")}` : `$${amount.toFixed(2)}`;
}

/** Format an ISO check time as "27 Nov 2026, 06:20 UTC". */
export function checkedLabel(iso) {
  const date = new Date(iso);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hours}:${minutes} UTC`;
}
