import express from "express";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";

import pool from "./utils/pool";
import auth from "./routes/auth";

const isProd = process.env.NODE_ENV === "production";

// INIT EXPRESS & BODY PARSER
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS policy
const origin = process.env.WEBSITE_URL ?? "http://localhost:8080";
app.use(cors({ origin }));

// INIT SESSION
const secret = process.env.SESSION_SECRET ?? "development secret";
const setupPgSession = pgSession(session);
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret,
    store: new setupPgSession({
      pool,
      createTableIfMissing: true,
    }),
    cookie: {
      httpOnly: isProd,
      secure: isProd,
      sameSite: isProd ? "none" : false,
    },
  })
);

app.get("/ping", (req, res) => {
  res.send("pong");
});
app.use("/auth", auth);

app.listen(process.env.PORT ?? 5000);
