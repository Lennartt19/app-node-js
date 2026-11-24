/** Error HTTP personalizado con código de estado. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** 404 para rutas no encontradas. */
export function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
}

/** Manejador centralizado de errores. */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: status >= 500 ? "Error interno del servidor" : err.message,
  });
}
