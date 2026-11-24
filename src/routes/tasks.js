import { Router } from "express";
import { HttpError } from "../middleware/errors.js";

const VALID_BOOLEAN_FIELDS = ["completed"];
const VALID_STRING_FIELDS = ["title", "description"];

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "El id debe ser un número entero positivo");
  }
  return id;
}

function validateCreateBody(body) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Se espera un cuerpo JSON");
  }
  if (typeof body.title !== "string" || body.title.trim() === "") {
    throw new HttpError(400, "El campo 'title' es obligatorio y no puede estar vacío");
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    throw new HttpError(400, "El campo 'description' debe ser una cadena");
  }
}

function pickUpdatableFields(body) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Se espera un cuerpo JSON");
  }

  const fields = {};
  for (const key of Object.keys(body)) {
    if (VALID_STRING_FIELDS.includes(key) || VALID_BOOLEAN_FIELDS.includes(key)) {
      fields[key] = body[key];
    }
  }

  if (Object.keys(fields).length === 0) {
    throw new HttpError(400, "No hay campos válidos para actualizar");
  }
  if (fields.title !== undefined && (typeof fields.title !== "string" || fields.title.trim() === "")) {
    throw new HttpError(400, "El campo 'title' no puede estar vacío");
  }
  if (fields.description !== undefined && typeof fields.description !== "string") {
    throw new HttpError(400, "El campo 'description' debe ser una cadena");
  }
  if (fields.completed !== undefined && typeof fields.completed !== "boolean") {
    throw new HttpError(400, "El campo 'completed' debe ser booleano");
  }

  return fields;
}

export function createTasksRouter(store) {
  const router = Router();

  // GET /tasks — listar todas
  router.get("/", (req, res) => {
    res.json(store.findAll());
  });

  // GET /tasks/:id — obtener una
  router.get("/:id", (req, res) => {
    const task = store.findById(parseId(req.params.id));
    if (!task) throw new HttpError(404, "Tarea no encontrada");
    res.json(task);
  });

  // POST /tasks — crear
  router.post("/", (req, res) => {
    validateCreateBody(req.body);
    const task = store.create({
      title: req.body.title.trim(),
      description: (req.body.description ?? "").trim(),
    });
    res.status(201).json(task);
  });

  // PATCH /tasks/:id — actualización parcial
  router.patch("/:id", (req, res) => {
    const id = parseId(req.params.id);
    const fields = pickUpdatableFields(req.body);
    const task = store.update(id, fields);
    if (!task) throw new HttpError(404, "Tarea no encontrada");
    res.json(task);
  });

  // DELETE /tasks/:id — eliminar
  router.delete("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (!store.remove(id)) throw new HttpError(404, "Tarea no encontrada");
    res.status(204).end();
  });

  return router;
}
