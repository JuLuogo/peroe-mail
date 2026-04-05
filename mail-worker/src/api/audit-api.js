import app from '../hono/hono';
import auditService from '../service/audit-service';
import result from '../model/result';
import userContext from '../security/user-context';

app.get('/audit/list', async (c) => {
	const data = await auditService.list(c, c.req.query());
	return c.json(result.ok(data));
});

app.get('/audit/detail', async (c) => {
	const data = await auditService.detail(c, c.req.query());
	return c.json(result.ok(data));
});
