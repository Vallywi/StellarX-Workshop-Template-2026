# Bayanihan Community Fund (Medical Expense Crowdfund)

**The Problem:** Surprise medical bills devastate families, and traditional crowdfunding platforms take a 5-10% cut of donations.
**The User:** A community member (donor) who wants to contribute directly to a neighbor's medical emergency.
**The Core Action:** The user donates funds (USDC/XLM) directly to the beneficiary's wallet and updates the on-chain "raised" milestone tracker.
**The Data:** The smart contract tracks the `target` (the total amount needed) and `raised` (the total amount contributed so far).

## Screens
A single MVP screen that displays:
1. The Bayanihan Fund progress bar (Current Raised / Target).
2. A "Donate" panel where the user enters an amount.
3. A confirmation once the payment and contract update succeed.

## Acceptance Checks
- [ ] **Check 1:** The page displays the correct target and current raised amount fetched from the Soroban contract.
- [ ] **Check 2:** A donor can submit a donation (Stellar payment) that successfully confirms on the testnet.
- [ ] **Check 3:** The Soroban contract's "raised" total increases by the exact donated amount.
