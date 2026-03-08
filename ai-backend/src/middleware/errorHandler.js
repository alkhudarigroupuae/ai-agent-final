export function errorHandler(err, req, res, next) {
  console.error('[SaleParts AI Backend Error]', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
}
