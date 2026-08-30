import { createServer } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const port = Number(process.env.PORT ?? 3002);

const server = createServer(toNodeHandler(auth));

server.listen(port, () => {
  console.log(`better-auth listening on :${port}`);
});
