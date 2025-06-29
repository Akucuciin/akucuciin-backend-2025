export default function requestLogger(req, res, next) {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);

    const log = [
      `[${new Date().toISOString()}]`,
      `| ${req.ip}`,
      `| ${req.method} ${req.originalUrl}`,
      `| Status: ${res.statusCode}`,
      `| Duration: ${durationMs}ms`,
      `| User ID: ${req.user?.id || 'NO USER'}`,
      `| Host: ${req.headers.host}`,
      `| Referer: ${req.headers.referer}`,
      `| User-Agent: ${req.headers['user-agent']}`,
      `| Content Length: ${res.get('Content-Length') || 0}`,
    ].join(' ');

    console.error(log);
  });

  next();
}
