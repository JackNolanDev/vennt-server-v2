import express from "express";
import cors from "cors";
import dotEnv from "dotenv";

import abilityRoute from "./routes/ability";
import authRoute from "./routes/auth";
import entityRoute from "./routes/entity";
import itemRoute from "./routes/item";
import adminRoute from "./routes/admin";

dotEnv.config();

const isProd = process.env.NODE_ENV === "production";

// INIT EXPRESS & BODY PARSER
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS policy
const origin = process.env.WEBSITE_URL ?? "http://localhost:5173";
app.use(cors({ origin, credentials: true }));

app.get("/ping", (req, res) => {
  res.send("pong");
});
app.use("/ability", abilityRoute);
app.use("/auth", authRoute);
app.use("/entity", entityRoute);
app.use("/item", itemRoute);
app.use("/admin", adminRoute);

console.log(`${isProd ? "Production" : "Local"} server started`);

app.listen(process.env.PORT ?? 5000);
