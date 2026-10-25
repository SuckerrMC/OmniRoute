import test from "node:test";
import assert from "node:assert/strict";
import { inspectModels } from "../../scripts/dev/agent-os-inventory.mjs";

const config = {
  gateway: "http://127.0.0.1:20128",
  roles: { coder: "free/a", tester: "missing", reviewer: "paid/b" },
  verifiedFreeModels: ["free/a"],
};
test("inventory uses GET discovery and keeps availability separate from pricing", async () => {
  let called = 0;
  const result = await inspectModels(config, "test-token", async (url, options) => {
    called++;
    assert.equal(url.href, "http://127.0.0.1:20128/v1/models");
    assert.equal(options.method, undefined);
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, "Bearer test-token");
    return Response.json({ data: [{ id: "paid/b" }, { id: "free/a" }, { id: "free/a" }] });
  });
  assert.equal(called, 1);
  assert.deepEqual(result.models, ["free/a", "paid/b"]);
  assert.match(result.roles.coder.status, /live-compatibility-unverified/);
  assert.equal(result.roles.tester.status, "not-in-catalog");
  assert.equal(result.roles.reviewer.status, "free-status-unverified");
  assert.equal(result.roles.architect.status, "unassigned");
  assert.ok(!JSON.stringify(result).includes("test-token"));
});
test("rejects non-loopback URLs before transmitting credentials", async () => {
  for (const gateway of [
    "https://example.org",
    "http://localhost.evil.test",
    "http://user:secret@localhost",
    "http://localhost/v1",
    "http://localhost?key=secret",
  ]) {
    await assert.rejects(
      inspectModels({ ...config, gateway }, "secret", () => {
        throw new Error("should not fetch");
      }),
      /loopback/
    );
  }
});
test("does not expose upstream error bodies", async () => {
  await assert.rejects(
    inspectModels(config, null, async () => new Response("secret-provider-error", { status: 401 })),
    /HTTP 401/
  );
});
test("rejects malformed catalogs", async () => {
  await assert.rejects(
    inspectModels(config, null, async () => Response.json({ data: [{ name: "bad" }] })),
    /Invalid model catalog/
  );
});
