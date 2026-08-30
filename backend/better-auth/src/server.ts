import { createServer } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { handlePostsRoute } from "./routes/posts";

const port = Number(process.env.PORT ?? 3002);
const authHandler = toNodeHandler(auth);

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (await handlePostsRoute(req, res, url)) return;
  authHandler(req, res);
});

server.listen(port, () => {
  console.log(`better-auth listening on :${port}`);
});
