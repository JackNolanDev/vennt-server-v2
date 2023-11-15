import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ResultError, wrapErrorResult } from "./db";

let client: DynamoDBClient | null = null;

export const getDynamoClient = (): DynamoDBClient => {
  if (client) {
    return client;
  }
  if (
    !process.env.AWS_DYNAMO_ACCESS_KEY_ID ||
    !process.env.AWS_DYNAMO_SECRET_ACCESS_KEY ||
    !process.env.AWS_DYNAMO_REGION
  ) {
    throw new ResultError(
      wrapErrorResult("Dynamo env variables not defined", 500)
    );
  }
  client = new DynamoDBClient({
    credentials: {
      accessKeyId: process.env.AWS_DYNAMO_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_DYNAMO_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_DYNAMO_REGION,
  });
  return client;
};
