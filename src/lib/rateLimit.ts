import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  ProvisionedThroughputExceededException,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import type { NextRequest } from "next/server";

const client = new DynamoDBClient({});

/**
 * Client IP used as the rate-limit key.
 *
 * TEMPORARY: logs the candidate headers so we can prove which one CloudFront
 * sets to the real viewer IP. Keyed on the first X-Forwarded-For entry until
 * then, which never blocks real visitors but can be spoofed.
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  console.log("ip-debug", {
    xForwardedFor: forwarded,
    xRealIp: request.headers.get("x-real-ip"),
    cloudfrontViewerAddress: request.headers.get("cloudfront-viewer-address"),
  });
  return forwarded.split(",")[0].trim() || "unknown";
}

/**
 * Count one request for `ip` on `route` and report whether it is within
 * `limit` requests per fixed `windowSeconds` window.
 *
 * Counters live in DynamoDB so every Lambda instance shares them. Without a
 * table (plain `next dev`) every request is allowed.
 */
export async function isWithinRateLimit(
  route: string,
  ip: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const table = process.env.RATE_LIMIT_TABLE;
  if (!table) return true;

  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  try {
    await client.send(
      new UpdateItemCommand({
        TableName: table,
        Key: { pk: { S: `${route}#${ip}#${window}` } },
        UpdateExpression: "ADD #count :one SET expiresAt = :expiresAt",
        ConditionExpression: "attribute_not_exists(#count) OR #count < :limit",
        ExpressionAttributeNames: { "#count": "count" },
        ExpressionAttributeValues: {
          ":one": { N: "1" },
          ":limit": { N: String(limit) },
          ":expiresAt": { N: String((window + 2) * windowSeconds) },
        },
      }),
    );
    return true;
  } catch (error) {
    // Over the limit, or the table is throttled by a request flood.
    if (
      error instanceof ConditionalCheckFailedException ||
      error instanceof ProvisionedThroughputExceededException
    ) {
      return false;
    }
    throw error;
  }
}
