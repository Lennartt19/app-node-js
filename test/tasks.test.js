import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { TaskStore } from "../src/store/taskStore.js";

describe("API de tareas", () => {
  let app;
  let store;

  beforeEach(() => {
    store = new TaskStore();
    app = createApp(store);
  });

  describe("GET /health", () => {
    it("devuelve estado ok", async () => {
      const res = await request(app).get("/health");
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { status: "ok" });
    });
  });

  describe("GET /tasks", () => {
    it("devuelve una lista vacía al inicio", async () => {
      const res = await request(app).get("/tasks");
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, []);
    });

    it("devuelve las tareas creadas", async () => {
      await request(app).post("/tasks").send({ title: "Comprar pan" });
      await request(app).post("/tasks").send({ title: "Estudiar Node" });

      const res = await request(app).get("/tasks");
      assert.equal(res.status, 200);
      assert.equal(res.body.length, 2);
      assert.equal(res.body[0].title, "Comprar pan");
      assert.equal(res.body[1].title, "Estudiar Node");
    });
  });

  describe("POST /tasks", () => {
    it("crea una tarea con 201", async () => {
      const res = await request(app)
        .post("/tasks")
        .send({ title: "Aprender Express", description: "Con tests" });

      assert.equal(res.status, 201);
      assert.equal(res.body.title, "Aprender Express");
      assert.equal(res.body.description, "Con tests");
      assert.equal(res.body.completed, false);
      assert.ok(res.body.id);
      assert.ok(res.body.createdAt);
    });

    it("rechaza un título vacío con 400", async () => {
      const res = await request(app).post("/tasks").send({ title: "" });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /title/);
    });

    it("rechaza una petición sin título con 400", async () => {
      const res = await request(app).post("/tasks").send({});
      assert.equal(res.status, 400);
      assert.match(res.body.error, /title/);
    });

    it("rechaza una descripción no string con 400", async () => {
      const res = await request(app)
        .post("/tasks")
        .send({ title: "Válida", description: 42 });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /description/);
    });
  });

  describe("GET /tasks/:id", () => {
    it("devuelve la tarea solicitada", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({ title: "Una tarea" });

      const res = await request(app).get(`/tasks/${created.body.id}`);
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, created.body);
    });

    it("devuelve 404 si no existe", async () => {
      const res = await request(app).get("/tasks/999");
      assert.equal(res.status, 404);
      assert.match(res.body.error, /no encontrada/i);
    });

    it("devuelve 400 si el id no es numérico", async () => {
      const res = await request(app).get("/tasks/abc");
      assert.equal(res.status, 400);
      assert.match(res.body.error, /id/);
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("actualiza el título", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({ title: "Título viejo" });

      const res = await request(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ title: "Título nuevo" });

      assert.equal(res.status, 200);
      assert.equal(res.body.title, "Título nuevo");
      assert.equal(res.body.description, "");
      assert.notEqual(res.body.updatedAt, created.body.updatedAt);
    });

    it("marca como completada", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({ title: "Tarea" });

      const res = await request(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ completed: true });

      assert.equal(res.status, 200);
      assert.equal(res.body.completed, true);
    });

    it("devuelve 404 si la tarea no existe", async () => {
      const res = await request(app).patch("/tasks/999").send({ title: "X" });
      assert.equal(res.status, 404);
    });

    it("devuelve 400 si no hay campos válidos", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({ title: "Tarea" });

      const res = await request(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ unknownField: "valor" });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /campos válidos/);
    });

    it("devuelve 400 si 'completed' no es booleano", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({ title: "Tarea" });

      const res = await request(app)
        .patch(`/tasks/${created.body.id}`)
        .send({ completed: "sí" });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /completed/);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("elimina una tarea con 204", async () => {
      const created = await request(app)
        .post("/tasks")
        .send({ title: "Bórrame" });

      const res = await request(app).delete(`/tasks/${created.body.id}`);
      assert.equal(res.status, 204);

      const after = await request(app).get("/tasks");
      assert.equal(after.body.length, 0);
    });

    it("devuelve 404 si la tarea no existe", async () => {
      const res = await request(app).delete("/tasks/999");
      assert.equal(res.status, 404);
    });
  });

  describe("404 global", () => {
    it("devuelve 404 para rutas desconocidas", async () => {
      const res = await request(app).get("/ruta-que-no-existe");
      assert.equal(res.status, 404);
      assert.match(res.body.error, /no encontrada/i);
    });
  });
});

describe("TaskStore", () => {
  let store;

  beforeEach(() => {
    store = new TaskStore();
  });

  it("asigna ids incrementales", () => {
    const a = store.create({ title: "A" });
    const b = store.create({ title: "B" });
    assert.equal(a.id, 1);
    assert.equal(b.id, 2);
  });

  it("clear reinicia el almacén y los ids", () => {
    store.create({ title: "A" });
    store.clear();
    assert.deepEqual(store.findAll(), []);
    const a = store.create({ title: "A" });
    assert.equal(a.id, 1);
  });

  it("update devuelve null con id inexistente", () => {
    assert.equal(store.update(42, { title: "X" }), null);
  });

  it("remove devuelve false con id inexistente", () => {
    assert.equal(store.remove(42), false);
  });
});
