import { Request } from "express";

export function getDomainFromReq(req: Request): string {
  const domain = process.env.LNURL_DOMAIN || req.hostname;
  if (!domain) {
    throw new Error("Missing domain in request");
  }
  return domain;
}

export function lud16URL(username: string, domain: string) {
  // TODO: add onion support
  return `https://${domain}/.well-known/lnurlp/${username}`;
}

export function identifier(username: string, domain: string): string {
  return `${username}@${domain}`;
}
