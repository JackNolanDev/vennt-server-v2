# Vennt Backend (TS)

A rebuild of the original Vennt backend server in TS with a Mongo database

Requirements:
`bun`

### Useful commands

Start dev server:
`bun run dev`

Start prod server:
`bun run start`

### Environment variables

| variable                       | use                                                       | default                                               |
| ------------------------------ | --------------------------------------------------------- | ----------------------------------------------------- |
| `WEBSITE_URL`                  | Sets the website URL for CORS                             | `http://localhost:8080`                               |
| `PORT`                         | The port the server is listening on                       | `5000`                                                |
| `SESSION_SECRET`               | A secret string used to generate session tokens for users | `"development secret"`                                |
| `DATABASE_URL`                 | Used to connect to the Postgres database                  | If unset, attempts to join a local DB                 |
| `R2_ACCOUNT_ID`                | Cloudflare account ID for storing JSON objects            | ""                                                    |
| `R2_ACCESS_KEY_ID`             | Cloudflare access key ID                                  | ""                                                    |
| `R2_SECRET_ACCESS_KEY`         | Cloudflare secret access key                              | ""                                                    |
| `JSON_STORAGE_URL`             | Public Cloudflare R2 URL for JSON STORAGE                 | `https://pub-8e2f06dbcb7b4dde8553a52dd656dbee.r2.dev` |
| `AWS_DYNAMO_ACCESS_KEY_ID`     | AWS access key ID for programmatic access to DynamoDB     | ""                                                    |
| `AWS_DYNAMO_SECRET_ACCESS_KEY` | AWS secret access key for programmatic access to DynamoDB | ""                                                    |
| `AWS_DYNAMO_REGION`            | AWS region for DynamoDB                                   | ""                                                    |
