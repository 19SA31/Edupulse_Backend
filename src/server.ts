import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import { createServer } from "http";
import routes from "./routes/route";
import morgan = require("morgan");

dotenv.config();

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
connectDB();
const server = createServer(app);

routes(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server is running on port http://localhost:${PORT}`)
);
