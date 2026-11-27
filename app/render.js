// Rendering for DealHound: the deal grid and the single-deal detail page.
//
// Everything here builds plain DOM nodes from the deal data. No network
// request is made: the cards link out to the stores, they never load from them.

import { CHECKED_AT, VERDICTS, deals } from "./deals.js";
import { boardStats, categories, checkedLabel, discountOf, money, savingsOf, stores } from "./filters.js";

const VERDICT_CLASS = { "true-low": "verdict-true", strong: "verdict-strong", routine: "verdict-routine" };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function verdictBadge(deal) {
  const badge = el("span", `verdict ${VERDICT_CLASS[deal.verdict]}`);
  badge.textContent = VERDICTS[deal.verdict].label;
  badge.title = VERDICTS[deal.verdict].blurb;
  return badge;
}

/** One deal card for the grid. */
export function dealCard(deal) {
  const card = el("article", "card");
  const top = el("div", "card-top");
  top.append(verdictBadge(deal), el("span", "discount", `-${discountOf(deal)}%`));
  card.append(top);

  const title = el("h3", "card-title");
  const link = el("a", "card-link", deal.title);
  link.href = `#/deal/${deal.id}`;
  title.append(link);
  card.append(title);

  const meta = el("p", "card-meta", `${deal.store} · ${deal.category}`);
  card.append(meta);

  const prices = el("div", "card-prices");
  const now = el("span", "price-now", money(deal.price));
  if (deal.unit) now.append(el("span", "price-unit", ` ${deal.unit}`));
  const was = el("span", "price-was", money(deal.was));
  const save = el("span", "price-save", `Save ${money(savingsOf(deal))}`);
  prices.append(now, was, save);
  card.append(prices);

  const checked = el("p", "card-checked", `Checked ${checkedLabel(deal.checked)}`);
  card.append(checked);

  const actions = el("div", "card-actions");
  const storeLink = el("a", "button button-store", `View at ${deal.store}`);
  storeLink.href = deal.url;
  storeLink.target = "_blank";
  storeLink.rel = "noopener";
  const detailLink = el("a", "button button-ghost", "Why this is a deal");
  detailLink.href = `#/deal/${deal.id}`;
  actions.append(storeLink, detailLink);
  card.append(actions);
  return card;
}

/** The toolbar: search box, category/store/discount filters and sort. */
export function toolbar(state, onChange) {
  const bar = el("div", "toolbar");
  const search = el("input", "toolbar-search");
  search.type = "search";
  search.placeholder = "Search deals, stores, categories…";
  search.value = state.query || "";
  search.setAttribute("aria-label", "Search deals");
  search.addEventListener("input", () => onChange({ ...state, query: search.value }));
  bar.append(search);

  const makeSelect = (label, value, options, key) => {
    const wrap = el("label", "toolbar-field", label);
    const select = el("select");
    for (const option of options) {
      const node = el("option", undefined, option.label);
      node.value = option.value;
      if (option.value === value) node.selected = true;
      select.append(node);
    }
    select.addEventListener("change", () => onChange({ ...state, [key]: select.value }));
    wrap.append(select);
    return wrap;
  };

  bar.append(
    makeSelect(
      "Category",
      state.category,
      [{ value: "All", label: "All categories" }].concat(categories().map((name) => ({ value: name, label: name }))),
      "category",
    ),
    makeSelect(
      "Store",
      state.store,
      [{ value: "All", label: "All stores" }].concat(stores().map((name) => ({ value: name, label: name }))),
      "store",
    ),
    makeSelect(
      "Min. discount",
      state.minDiscount,
      [
        { value: "0", label: "Any discount" },
        { value: "25", label: "25% off or more" },
        { value: "40", label: "40% off or more" },
        { value: "50", label: "50% off or more" },
      ],
      "minDiscount",
    ),
    makeSelect(
      "Sort by",
      state.sort,
      [
        { value: "discount", label: "Biggest discount" },
        { value: "savings", label: "Biggest saving ($)" },
        { value: "verdict", label: "Best verdict first" },
        { value: "price-low", label: "Lowest price" },
        { value: "price-high", label: "Highest price" },
      ],
      "sort",
    ),
  );

  return bar;
}

/** The full list view: header stats, toolbar, result count and the grid. */
export function listView(state, onChange) {
  const page = el("div", "page");
  const stats = boardStats(deals);

  const hero = el("section", "hero");
  hero.append(
    el("p", "hero-kicker", "Black Friday · Cyber Monday · Checked today"),
    el("h1", "hero-title", "Real Black Friday deals, checked by hand."),
    el(
      "p",
      "hero-sub",
      "Every price below was verified at the named store or in a deals source that names it, " +
        `on ${checkedLabel(CHECKED_AT)}. No inflated list prices, no invented deals: each card says ` +
        "whether the cut is a true low, a strong price, or just a routine sale.",
    ),
  );
  const statRow = el("div", "stat-row");
  for (const [value, label] of [
    [String(stats.total), "deals checked"],
    [`${stats.average}%`, "average discount"],
    [money(stats.saved), "total savings if you bought one of each"],
    [String(stats.trueLows), "true lows"],
  ]) {
    const stat = el("div", "stat");
    stat.append(el("span", "stat-value", value), el("span", "stat-label", label));
    statRow.append(stat);
  }
  hero.append(statRow);
  page.append(hero);

  const bar = toolbar(state, onChange);
  page.append(bar);

  const count = el("p", "result-count");
  count.textContent =
    state.results.length === deals.length
      ? `Showing all ${deals.length} deals, sorted by biggest discount.`
      : `Showing ${state.results.length} of ${deals.length} deals.`;
  page.append(count);

  if (state.results.length === 0) {
    const empty = el("div", "empty");
    empty.append(
      el("h2", undefined, "No deals match those filters."),
      el("p", undefined, "Try a different search word, or clear a filter to see the full board again."),
    );
    const clear = el("button", "button", "Show all deals");
    clear.addEventListener("click", () =>
      onChange({ query: "", category: "All", store: "All", minDiscount: "0", sort: "discount", results: deals }),
    );
    empty.append(clear);
    page.append(empty);
    return page;
  }

  const grid = el("div", "grid");
  for (const deal of state.results) grid.append(dealCard(deal));
  page.append(grid);
  return page;
}

/** The single-deal detail view, reached at #/deal/<id>. */
export function detailView(deal) {
  const page = el("div", "page");
  const back = el("a", "back-link", "← Back to all deals");
  back.href = "#/";
  page.append(back);

  const detail = el("section", "detail");
  const head = el("div", "detail-head");
  head.append(verdictBadge(deal), el("span", "discount detail-discount", `-${discountOf(deal)}%`));
  detail.append(head);
  detail.append(el("h1", "detail-title", deal.title));
  detail.append(el("p", "detail-meta", `${deal.store} · ${deal.category}`));

  const prices = el("div", "detail-prices");
  const now = el("span", "price-now detail-now", money(deal.price));
  if (deal.unit) now.append(el("span", "price-unit", ` ${deal.unit}`));
  prices.append(now, el("span", "price-was", money(deal.was)), el("span", "price-save", `You save ${money(savingsOf(deal))}`));
  detail.append(prices);

  const verdict = el("div", "detail-verdict");
  verdict.append(
    el("h2", undefined, `Verdict: ${VERDICTS[deal.verdict].label}`),
    el("p", undefined, `${VERDICTS[deal.verdict].blurb} ${deal.note}`),
  );
  detail.append(verdict);

  if (deal.alsoAt && deal.alsoAt.length > 0) {
    const compare = el("div", "detail-compare");
    compare.append(el("h2", undefined, "Same product at other stores"));
    const table = el("table", "compare-table");
    const headRow = el("tr");
    headRow.append(el("th", undefined, "Store"), el("th", undefined, "Price"));
    table.append(headRow);
    const ownRow = el("tr");
    ownRow.append(el("td", undefined, deal.store), el("td", undefined, money(deal.price)));
    table.append(ownRow);
    for (const other of deal.alsoAt) {
      const row = el("tr");
      row.append(el("td", undefined, other.store), el("td", undefined, money(other.price)));
      table.append(row);
    }
    compare.append(table);
    detail.append(compare);
  }

  const facts = el("dl", "detail-facts");
  const addFact = (term, value) => {
    facts.append(el("dt", undefined, term), el("dd", undefined, value));
  };
  addFact("Store", deal.store);
  addFact("Checked", checkedLabel(deal.checked));
  addFact("Price read at", deal.source);
  addFact("Usual price", `${money(deal.was)}${deal.unit ? ` ${deal.unit}` : ""}`);
  detail.append(facts);

  const actions = el("div", "card-actions detail-actions");
  const storeLink = el("a", "button button-store", `View at ${deal.store}`);
  storeLink.href = deal.url;
  storeLink.target = "_blank";
  storeLink.rel = "noopener";
  actions.append(storeLink);
  detail.append(actions);

  const note = el(
    "p",
    "detail-note",
    "Prices move during Black Friday week. Confirm the live price on the store page before buying; " +
      "this page shows the price as checked at the time above.",
  );
  detail.append(note);
  page.append(detail);
  return page;
}

/** The "deal not found" view for an unknown hash id. */
export function notFoundView() {
  const page = el("div", "page");
  const empty = el("div", "empty");
  empty.append(
    el("h1", undefined, "That deal is not on the board."),
    el("p", undefined, "It may have sold out or the link may be mistyped."),
  );
  const back = el("a", "button", "Back to all deals");
  back.href = "#/";
  empty.append(back);
  page.append(empty);
  return page;
}
