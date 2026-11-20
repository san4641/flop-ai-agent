



import { FlopClient, FlopHTTPError } from "@flop-labs/client";

const client = new FlopClient({
  baseURL: "https://api.flop.network/api/v1"
});

try {
  const result = await client.listModels({ limit: 10 });
  console.log(result);
} catch (error) {
  console.log("Error name:", error.name);
  console.log("Error message:", error.message);

  if (error instanceof FlopHTTPError) {
    console.log("HTTP status:", error.status);
    console.log("Gateway response:", error.body);
  }
}
