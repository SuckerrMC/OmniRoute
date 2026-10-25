import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export async function inspectModels(config, token, fetchImpl = fetch) {
  const url = new URL(config.gateway);
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error("Gateway must be a loopback HTTP root URL.");
  }
  const response = await fetchImpl(new URL("/v1/models", url), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!response.ok) throw new Error(`Catalog request failed (HTTP ${response.status}).`);
  const body = await response.json();
  if (!Array.isArray(body.data) || body.data.some((m) => typeof m?.id !== "string")) {
    throw new Error("Invalid model catalog.");
  }
  const ids = [...new Set(body.data.map((m) => m.id))].sort();
  if (!Array.isArray(config.verifiedFreeModels) || !config.roles) {
    throw new Error("Invalid Agent OS configuration.");
  }
  const roles = {};
  for (const role of ["architect", "coder", "reviewer", "tester"]) {
    const model = config.roles[role];
    roles[role] = {
      model: model ?? null,
      status: !model
        ? "unassigned"
        : !ids.includes(model)
          ? "not-in-catalog"
          : !config.verifiedFreeModels.includes(model)
            ? "free-status-unverified"
            : "catalog-present; live-compatibility-unverified",
    };
  }
  return {
    models: ids,
    roles,
    note: "Catalog presence does not prove free pricing or working tool calls.",
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const config = JSON.parse(
      await readFile(new URL("../../config/agent-os.json", import.meta.url))
    );
    console.log(
      JSON.stringify(await inspectModels(config, process.env.ANTHROPIC_AUTH_TOKEN), null, 2)
    );
  } catch {
    console.error("Model inventory failed. Check local gateway, authentication and configuration.");
    process.exitCode = 1;
  }
}
