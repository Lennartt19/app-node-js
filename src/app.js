import express from "express";
import { TaskStore } from "./store/taskStore.js";
import { createTasksRouter } from "./routes/tasks.js";
import { errorHandler, notFound } from "./middleware/errors.js";

/**
 * Crea la aplicación Express sin escuchar en un puerto,
 * para que los tests puedan usarla con supertest.
 */
export function createApp(store = new TaskStore()) {
  const app = express();

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/tasks", createTasksRouter(store));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
