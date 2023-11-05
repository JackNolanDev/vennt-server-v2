# Vennt Backend (TS)

A rebuild of the original Vennt backend server in TS with a Mongo database

Requirements:
`bun`

### Useful commands

Start dev server:
`bun run dev`

Start prod server:
`pnpm run start`

### Environment variables

| variable               | use                                                       | default                                               |
| ---------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| `WEBSITE_URL`          | Sets the website URL for CORS                             | `http://localhost:8080`                               |
| `PORT`                 | The port the server is listening on                       | `5000`                                                |
| `SESSION_SECRET`       | A secret string used to generate session tokens for users | `"development secret"`                                |
| `DATABASE_URL`         | Used to connect to the Postgres database                  | If unset, attempts to join a local DB                 |
| `R2_ACCOUNT_ID`        | Cloudflare account ID for storing JSON objects            | ""                                                    |
| `R2_ACCESS_KEY_ID`     | Cloudflare access key ID                                  | ""                                                    |
| `R2_SECRET_ACCESS_KEY` | Cloudflare secret access key                              | ""                                                    |
| `JSON_STORAGE_URL`     | Public Cloudflare R2 URL for JSON STORAGE                 | `https://pub-8e2f06dbcb7b4dde8553a52dd656dbee.r2.dev` |

TODO items

- [x] Store user session in local storage instead of cookie for now so safari is happy with it. Send in header
- [x] Safari does not like :has selector for layout management - try using JS for now
- [x] Try adding 0 width floating bar at the top of the header so the color extends up on mobile safari (actually solved using theme metadata on header)
- [x] Try increasing text size of all inputs to prevent zoom on ios
- [x] Add `in_storage` flag to items, which means it will not count towards bulk but also can no longer be used
- [ ] Add "refresh item" confirmation button for updating an item to the latest version on the wiki
- [ ] Add "refresh ability" confirmation button for updating an ability to the latest version on the wiki
- [ ] Add ability editing
- [ ] Add custom ability generation
- [ ] Add removing abilities
- [ ] (MAYBE) Start tracking entities with a game version number. I can rerun the web scrapers and have them save to new keys, and when the entity version is newer we will read from the newer wiki pages.
- [ ] Support multiple gifts
- [ ] Support gift traits
