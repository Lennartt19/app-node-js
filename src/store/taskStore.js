/**
 * Almacenamiento en memoria de tareas.
 * Es un repositorio simple que se puede reemplazar por otro
 * (SQLite, JSON, etc.) sin tocar los controladores.
 */
export class TaskStore {
  #tasks = new Map();
  #nextId = 1;

  findAll() {
    return [...this.#tasks.values()];
  }

  findById(id) {
    return this.#tasks.get(id) ?? null;
  }

  create({ title, description = "" }) {
    const task = {
      id: this.#nextId++,
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.#tasks.set(task.id, task);
    return task;
  }

  update(id, fields) {
    const existing = this.#tasks.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...fields,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.#tasks.set(id, updated);
    return updated;
  }

  remove(id) {
    return this.#tasks.delete(id);
  }

  clear() {
    this.#tasks.clear();
    this.#nextId = 1;
  }
}
