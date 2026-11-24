# API de Tareas (Node.js + Express)

API REST sencilla para gestionar tareas, con almacenamiento en memoria y tests de integración.

## Requisitos

- Node.js >= 20

## Instalación

```bash
npm install
```

## Uso

```bash
npm start        # arranca el servidor en http://localhost:3000
npm run dev      # arranca con recarga automática (node --watch)
```

## Tests

```bash
npm test         # ejecuta los tests
npm run test:watch
```

## Endpoints

| Método | Ruta          | Descripción                    |
|--------|---------------|--------------------------------|
| GET    | `/health`     | Comprobación de estado         |
| GET    | `/tasks`      | Listar todas las tareas        |
| GET    | `/tasks/:id`  | Obtener una tarea              |
| POST   | `/tasks`      | Crear una tarea                |
| PATCH  | `/tasks/:id`  | Actualizar campos parciales    |
| DELETE | `/tasks/:id`  | Eliminar una tarea             |

### Ejemplos

```bash
# Crear
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Aprender Node", "description": "Con Express"}'

# Listar
curl http://localhost:3000/tasks

# Marcar como completada
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Eliminar
curl -X DELETE http://localhost:3000/tasks/1
```

## Estructura

```
├── src/
│   ├── app.js                    # Crea la app Express (sin escuchar)
│   ├── server.js                 # Arranca el servidor
│   ├── routes/tasks.js           # Rutas y validación
│   ├── middleware/errors.js      # Errores HTTP centralizados
│   └── store/taskStore.js        # Repositorio en memoria
├── test/
│   └── tasks.test.js             # Tests con node:test + supertest
└── package.json
```

La app se separa en `app.js` (configuración) y `server.js` (arranque) para que los tests
puedan usar la app directamente con `supertest` sin abrir puertos.
