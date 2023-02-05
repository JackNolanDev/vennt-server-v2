import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { Result } from "./types";
import { wrapErrorResult, wrapSuccessResult } from "./db";

export const getS3Client = (): Result<S3Client> => {
  if (
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  ) {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    return wrapSuccessResult(client);
  }
  return wrapErrorResult("R2 env variables not set", 500);
};

export const configureS3BucketCors = async (
  bucket: string
): Promise<Result<boolean>> => {
  const client = getS3Client();
  if (!client.success) return client;
  const allowedOrigins = process.env.WEBSITE_URL
    ? ["http://localhost:5173", process.env.WEBSITE_URL]
    : ["http://localhost:5173"];
  const response = await client.result.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedMethods: ["GET"],
            AllowedOrigins: allowedOrigins,
          },
        ],
      },
    })
  );
  console.log(response);
  return wrapSuccessResult(true);
};
