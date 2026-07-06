const apiUrl = process.env.SMOKE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const webUrl = process.env.SMOKE_WEB_URL ?? "http://localhost:3000";

await checkJson(`${apiUrl}/health`, "API health", (payload) => payload?.status === "ok");
await checkText(webUrl, "Web home", (body) => body.includes("Subscription Tracker"));
await checkJson(`${apiUrl}/docs-json`, "OpenAPI document", (payload) => payload?.openapi === "3.0.0");

console.warn("Smoke check passed.");

async function checkJson(url, label, validate) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (!validate(payload)) {
    throw new Error(`${label} returned an unexpected payload.`);
  }
}

async function checkText(url, label, validate) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${response.statusText}`);
  }

  const body = await response.text();

  if (!validate(body)) {
    throw new Error(`${label} returned an unexpected page.`);
  }
}
