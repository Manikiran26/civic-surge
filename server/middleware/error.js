export function notFound(req, res) {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
  });
}

export function errorHandler(err, _req, res, _next) {
  void _req;
  void _next;
  const status = err.statusCode || err.status || 500;
  const payload = {
    error: err.publicMessage || err.message || "Internal server error",
  };

  if (status >= 500) {
    console.error(err);
  }

  if (err.details) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
}
