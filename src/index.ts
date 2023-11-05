import express from "express";
import cors from "cors";
import dotEnv from "dotenv";

import abilityRoute from "./routes/ability";
import authRoute from "./routes/auth";
import entityRoute from "./routes/entity";
import itemRoute from "./routes/item";
import adminRoute from "./routes/admin";
import campaignRoute from "./routes/campaign";
import campaignInvitesRoute from "./routes/campaignInvites";

dotEnv.config();

const isProd = process.env.NODE_ENV === "production";

// INIT EXPRESS & BODY PARSER
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS policy
const allowed_origins = ["http://localhost:5173"];
if (process.env.WEBSITE_URL) {
  allowed_origins.push(process.env.WEBSITE_URL);
}
app.use(cors({ origin: allowed_origins, credentials: true }));

app.get("/ping", (_req, res) => {
  res.send("pong");
});
app.use("/ability", abilityRoute);
app.use("/auth", authRoute);
app.use("/entity", entityRoute);
app.use("/item", itemRoute);
app.use("/admin", adminRoute);
app.use("/campaign", campaignRoute);
app.use("/campaign_invite", campaignInvitesRoute);

console.log(
  `${isProd ? "Production" : "Local"} server started using bun version: ${
    // @ts-expect-error Bun is defined by Bun runtime
    Bun.version
  }`
);

app.listen(process.env.PORT ?? 5001);
