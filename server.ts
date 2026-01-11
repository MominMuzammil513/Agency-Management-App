// server.ts - Custom Next.js Server with Socket.io
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initializeSocketServer } from "./lib/socket-server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io server
  initializeSocketServer(httpServer);

  httpServer
    .once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use.`);
        process.exit(1);
      }
    })
    .listen(port, () => {
      console.log(`> 🚀 Ready on http://${hostname}:${port}`);
      console.log(`> 📡 Socket.io server initialized`);
    });
});
