# Bayanihan Fund

A transparent, community-driven medical crowdfunding application built on **Stellar** and **Soroban**. This project is an end-to-end prototype that allows community members to donate directly to a beneficiary and log their contributions on-chain to track the funding goal.

The project consists of two parts:
- **Frontend** — a Next.js app with a premium glassmorphic UI where users can connect Freighter, send an XLM donation, and log their contribution.
- **Soroban Smart Contract** — a Rust contract (`BayanihanFundContract`) deployed on the Stellar testnet that acts as an immutable, shared tracker for the funding goal (`target`) and the total amount collected (`raised`).

```text
.
├── web/                      # Next.js 16 + TypeScript + Tailwind frontend
├── contracts/savings-goal/   # Rust Soroban contract (init / contribute / get_state)
├── scripts/                  # deploy.ps1 (Windows) / deploy.sh
├── Cargo.toml                # Rust workspace
└── CLAUDE.md                 # stack notes + Stellar gotchas
```

## Prerequisites

- **Node.js 20+** and **npm** — for the frontend.
- **Freighter** browser extension — create a wallet, switch it to **Test Net**.
- For the contract track: **Rust**, the `wasm32v1-none` target, and the **Stellar CLI**.

*(You can run the frontend with just Node + Freighter. Rust/CLI are only needed if you want to modify and deploy the Soroban contract yourself.)*

### Install the contract toolchain (Windows)

Install Rust and the Stellar CLI:

```powershell
winget install --id Rustlang.Rustup -e --accept-source-agreements --accept-package-agreements
winget install --id Stellar.StellarCLI -e --accept-source-agreements --accept-package-agreements
```

Then **open a new terminal** (so `cargo`/`stellar` land on PATH) and configure the Rust target:

**Easiest — GNU toolchain** (no admin, no large download):
```powershell
rustup default stable-x86_64-pc-windows-gnu
rustup target add wasm32v1-none
```

**Or MSVC** (matches Stellar's docs): install the **Visual C++ Build Tools** (the "Desktop development with C++" workload), then:
```powershell
rustup target add wasm32v1-none
```

## 1. Run the Frontend

To view the Bayanihan Fund app locally:

```powershell
cd web
npm install
npm run dev
```

Open <http://localhost:3000>, then:
1. **Connect Freighter** (approve in the extension; make sure it's on Test Net).
2. **Fund with Friendbot** — easily grab testnet XLM for testing.
3. **Send a Donation** — Enter a beneficiary address and an amount to send XLM directly via the Stellar network.
4. **Log your Contribution** — Submit the same amount to the Soroban smart contract to permanently update the community tracker!

`web/.env.local` contains the testnet config and the deployed `NEXT_PUBLIC_CONTRACT_ID`. 

## 2. Build & Deploy the Soroban Contract

The smart contract (`contracts/savings-goal/src/lib.rs`) handles the immutable state for the fundraiser:

| Function | Purpose |
|---|---|
| `init(target: i128)` | Set the fundraising goal (can only be called once). |
| `contribute(amount: i128) -> i128` | Add to the `raised` total; returns the new total. |
| `get_state() -> State` | Read the current `{ raised, target }`. |

To re-deploy it to testnet:

```powershell
# from the repo root
cargo test                 # runs the contract unit tests (no network needed)

# deploy to testnet + auto-wire the contract ID into web/.env.local
.\scripts\deploy.ps1       # macOS/Linux:  ./scripts/deploy.sh
```

The script handles funding a deployment identity, building the contract, deploying it, initializing it with a default target, and injecting the new ID into your Next.js environment variables. Restart `npm run dev` to see your new contract active in the UI!

## Troubleshooting

- **Freighter "not detected"** — install it, reload the page, and confirm it's unlocked.
- **Payment fails `op_no_destination`** — fund the destination account first.
- **`tx_bad_auth`** — wrong network passphrase; this app uses `Networks.TESTNET`.
- **Contract panel can't read state** — make sure you deployed *and* ran `init`, and that `NEXT_PUBLIC_CONTRACT_ID` is set, then restart the dev server.
