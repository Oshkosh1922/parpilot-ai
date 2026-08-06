import http from "node:http";
import { handleRequest } from "./src/platform/http-app.js";
const port=Number(process.env.PORT||3000);
http.createServer(handleRequest).listen(port,()=>console.log(`ParPilot running at http://localhost:${port}`));
