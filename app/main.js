// DealHound bootstrap: hash routing and filter state.
//
// Routes:
//   #/            the deal board (search, filters, sort)
//   #/deal/<id>   one deal, with its verdict, price history and store links
// Anything else renders the board. Filter state lives in memory and the
// list re-renders on every change.

import { deals } from "./deals.js";
import { filterDeals } from "./filters.js";
import { detailView, listView, notFoundView } from "./render.js";

const root = document.getElementById("app");

const DEFAULT_STATE = {
  query: "",
  category: "All",
  store: "All",
  minDiscount: "0",
  sort: "discount",
};

let state = { ...DEFAULT_STATE };

function withResults(nextState) {
  return { ...nextState, results: filterDeals(nextState) };
}

function render() {
  const hash = window.location.hash || "#/";
  const match = hash.match(/^#\/deal\/([\w-]+)$/);
  root.replaceChildren();
  if (match) {
    const deal = deals.find((candidate) => candidate.id === match[1]);
    root.append(deal ? detailView(deal) : notFoundView());
    return;
  }
  root.append(
    listView(withResults(state), (nextState) => {
      state = { ...nextState };
      render();
    }),
  );
  // Keep the user's place: re-rendering the list after typing in the search
  // box would otherwise drop focus, so restore it and the caret.
  const search = root.querySelector(".toolbar-search");
  if (search && document.activeElement !== search && state.query) {
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  }
}

window.addEventListener("hashchange", render);
render();
