# Vennt Backend (TS)

A rebuild of the original Vennt backend server in TS with a Mongo database

Requirements:
`node, pnpm`

### Useful commands

Start dev server:
`pnpm run dev`

Production build:
`pnpm run build`

Start server:
`pnpm run start`

### Environment variables

| variable         | use                                                       | default                               |
| ---------------- | --------------------------------------------------------- | ------------------------------------- |
| `WEBSITE_URL`    | sets the website URL for CORS                             | `http://localhost:8080`               |
| `PORT`           | The port the server is listenning on                      | `5000`                                |
| `SESSION_SECRET` | A secret string used to generate session tokens for users | `"development secret"`                |
| `DATABASE_URL`   | Used to connect to the Postgres database                  | If unset, attempts to join a local DB |
