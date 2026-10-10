# PUZZLED

A puzzle-themed adaptation of the Circuit launchpad experience, built as a responsive static website.

## Included

- Landing page, builder, piece library, examples, gallery, explore, stock-themed templates, docs, and local coin drafts.
- PNG/JPEG/WebP upload with a 1000×1000 center crop.
- Exactly 3, 4, or 5 interlocking PFP pieces. Each behavior selection connects a piece; removing it reopens the puzzle. Coin details stay gated until completion.
- Configurable behaviors and a local simulation with conditions and persistent counters. Money, media, AI, social posts, and HTTP calls are simulated.
- Local drafts, JSON project import/export, completed PFP export, public-metadata generation.
- Phantom/Solflare connection and pump.fun token creation using the official `@pump-fun/pump-sdk` create_v2 instruction. Wallet signing, RPC preflight, transaction submission, confirmation, and explorer links are implemented.

## Run

Serve `dist/` with any static HTTP server. Open `index.html` through HTTP, rather than a file URL, because the app uses ES modules.

To rebuild the SDK browser bundle: install dependencies from `pnpm-lock.yaml`, then run `node build.mjs`. The checked-in `dist/launch.bundle.js` can be served without installing packages. No frontend framework is required.

## Live launch setup

1. Upload a PFP, connect all pieces, and enter coin details.
2. Download the completed PFP and host it publicly on IPFS or another public image host.
3. In Review → RPC connection & metadata tools, enter its public image URI and download `metadata.json`.
4. Host the JSON publicly. Paste that metadata URI in the review form. Private Sites URLs will not work as public metadata.
5. Open the site in a browser with a compatible Solana wallet. Set a browser-compatible Solana mainnet RPC, connect the wallet, review the details, and request creation. The wallet must hold enough SOL for rent and network fees.

No wallet key is requested or held by this app. No transaction was submitted during development. Actual funded-wallet creation remains untested.

## Material limits

This implementation does not reproduce Circuit's proprietary live execution infrastructure. Autonomous fee-funded buybacks, burns, airdrops, agents, AI, API calls, social integrations, stock purchases, rule locking, and public network indexing require a production backend and service credentials. Exported behaviors are a rule plan and metadata extension; they are not deployed executable Solana rules. Stock pairing is a theme preset. Idea matching uses keywords, not an AI model.

Drafts and uploaded images stay in browser localStorage. Explore lists confirmed launches made on this device. The host starts private. Launch metadata must be hosted separately on a public service.

## Verification

Run `node --test tests/prelaunch.test.mjs` for the prelaunch checks. All 8 tests pass for buy/sell event simulation, financial-action ordering, condition gates, puzzle layouts, and offline official SDK instruction generation. The browser bundle builds successfully.

See [VERIFICATION.md](VERIFICATION.md) for the exact test scope and missing live functionality. Actual on-chain buying and selling are not implemented. A funded-wallet token launch remains untested and requires the site owner's wallet and public metadata.
