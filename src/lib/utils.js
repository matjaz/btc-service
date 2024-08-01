export function getDomainFromReq(req) {
  return process.env.LNURL_DOMAIN || req.hostname;
}

export function lud16URL(username, domain) {
  // TODO: add onion support
  return `https://${domain}/.well-known/lnurlp/${username}`;
}
