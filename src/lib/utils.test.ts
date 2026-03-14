import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { Request } from "express";
import { getDomainFromReq } from "./utils.js";

function makeReq(hostname: string | undefined): Request {
  return { hostname } as unknown as Request;
}

describe("getDomainFromReq", () => {
  const originalEnv = process.env.LNURL_DOMAIN;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.LNURL_DOMAIN;
    } else {
      process.env.LNURL_DOMAIN = originalEnv;
    }
  });

  it("returns LNURL_DOMAIN env var when set", () => {
    process.env.LNURL_DOMAIN = "configured.example.com";
    assert.equal(
      getDomainFromReq(makeReq("other.example.com")),
      "configured.example.com",
    );
  });

  it("returns req.hostname when LNURL_DOMAIN is unset", () => {
    delete process.env.LNURL_DOMAIN;
    assert.equal(
      getDomainFromReq(makeReq("host.example.com")),
      "host.example.com",
    );
  });

  it("throws when LNURL_DOMAIN is unset and hostname is undefined", () => {
    delete process.env.LNURL_DOMAIN;
    assert.throws(
      () => getDomainFromReq(makeReq(undefined)),
      /Missing domain in request/,
    );
  });

  it("throws when LNURL_DOMAIN is unset and hostname is empty string", () => {
    delete process.env.LNURL_DOMAIN;
    assert.throws(
      () => getDomainFromReq(makeReq("")),
      /Missing domain in request/,
    );
  });
});
