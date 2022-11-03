import express from "express";
import cors from "cors";

const isProd = process.env.NODE_ENV === "production";

// INIT EXPRESS
const app = express();

// CORS policy
const origin = isProd ? process.env.WEBSITE_URL : "http://localhost:8080";
app.use(cors({ origin }));

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(process.env.PORT || 5000);
