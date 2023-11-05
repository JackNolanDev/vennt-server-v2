import { JsonStorageKey, Result } from "vennt-library";
import { ResultError, wrapErrorResult, wrapSuccessResult } from "../utils/db";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "../utils/s3";
import axios from "axios";

export const JSON_STORAGE_BUCKET = "json-storage";
export const JSON_STORAGE_PUBLIC_URL =
  process.env.JSON_STORAGE_URL ??
  "https://pub-8e2f06dbcb7b4dde8553a52dd656dbee.r2.dev";

export const dbUpsertJSONDocument = async (
  key: JsonStorageKey,
  document: object
): Promise<Result<boolean>> => {
  const client = getS3Client();
  if (!client.success) return client;
  const response = await client.result.send(
    new PutObjectCommand({
      Bucket: JSON_STORAGE_BUCKET,
      Key: key,
      Body: JSON.stringify(document),
    })
  );
  if (response.$metadata.httpStatusCode === 200) {
    console.log(`PUT ${key} in storage`);
    return wrapSuccessResult(true);
  }
  return wrapErrorResult("S3 PUT failed", 500);
};

export const dbGetJSONDocument = async <T>(key: JsonStorageKey): Promise<T> => {
  const axiosResponse = await axios.get(`${JSON_STORAGE_PUBLIC_URL}/${key}`);
  if (axiosResponse.status === 200) {
    if (typeof axiosResponse.data === "object") {
      return axiosResponse.data;
    }
    throw new ResultError(wrapErrorResult("invalid JSON in storage", 500));
  }
  throw new ResultError(
    wrapErrorResult(axiosResponse.statusText, axiosResponse.status)
  );
};
