import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db"
import { createServer } from "http"
import routes from "./routes/route"


dotenv.config()

const app = express()
app.use(express.json())

app.use(
    cors({
      origin: "http://localhost:5173", 
      credentials: true, 
    })
  );
  

connectDB()
const server = createServer(app)

app.use(express.json());

routes(app)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server is running on port http://localhost:${PORT}`))