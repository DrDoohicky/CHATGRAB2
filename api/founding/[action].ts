// Plain Vercel Node functions need a route at this nested path.
// Express owns the status, checkout, receipt and raw signed-webhook handlers.
import app from '../../server.js';
export default app;
