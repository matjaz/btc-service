import { Request } from "express";

export function getDomainFromReq(req: Request): string {
  return process.env.LNURL_DOMAIN || req.hostname;
}

export function lud16URL(username: string, domain: string) {
  // TODO: add onion support
  return `https://${domain}/.well-known/lnurlp/${username}`;
}

export function identifier(username: string, domain: string): string {
  return `${username}@${domain}`;
}
