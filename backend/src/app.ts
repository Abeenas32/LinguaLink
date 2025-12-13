import http from "http";
import app from "./server";
import dotenv from "dotenv"
import { initWebSocket } from "./websocket";


dotenv.config();
const server = http.createServer(app);
initWebSocket(server);
const PORT = process.env.PORT;
server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));

