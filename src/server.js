import express from "express";
import loader from "./loaders/index.js";

function createServer() {
  const app = express();
  loader(app);
  return app;
}

export default createServer;
