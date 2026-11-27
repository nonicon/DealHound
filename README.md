# DealHound

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/nonicon/DealHound/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/nonicon/DealHound/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

DealHound is a Black Friday and Cyber Monday deal finder with 37 real deals, each checked at its store on Black Friday, 27 November 2026. Every deal shows its product, store, store link, sale price, usual price, discount, and when the price was checked — plus an honest verdict: **True low**, **Strong price**, or **Routine sale**. Search and filter by category, store, and discount; sort by biggest discount, biggest saving, verdict, or price; open any deal for its verdict, its price history, and the same product's price at other stores.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network requests: the site is static files under `app/`, and the deals live in `app/deals.js`.

## How the deals were checked

Each price was read from the named store or from a deals source that names the store on 27 November 2026, and each deal card records the source and the check time. The verdict weighs the sale price against the store's usual price and the price history the source reports — a True low is a record or near-record low, a Strong price is a solid genuine cut, and a Routine sale is a real but small cut worth comparing first. Prices move during Black Friday week, so the site tells shoppers to confirm the live price on the store page before buying.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=nonicon&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
