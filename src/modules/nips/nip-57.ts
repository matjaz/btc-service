import App from "../../app";

// https://github.com/nostr-protocol/nips/blob/master/57.md
//
// Disabled: setting allowsNostr/nostrPubkey promises wallets a zap
// receipt (kind 9735) after payment, but nothing in this codebase
// publishes one — there's no nostr signing key or relay client wired
// up. Advertising zap support without delivering receipts would break
// zap-aware clients, so this is a no-op until receipts are implemented.
export default function lightningZaps(app: App) {}
