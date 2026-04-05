import app from '../hono/hono';
import twoFactorService from '../service/two-factor-service';
import result from '../model/result';
import userContext from '../security/user-context';

app.get('/2fa/setup', async (c) => {
	const data = await twoFactorService.getSetupData(c, userContext.getUserId(c));
	return c.json(result.ok(data));
});

app.post('/2fa/enable', async (c) => {
	await twoFactorService.enable(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.post('/2fa/disable', async (c) => {
	await twoFactorService.disable(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.post('/2fa/verify', async (c) => {
	const data = await twoFactorService.verify(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok(data));
});

app.get('/2fa/status', async (c) => {
	const enabled = await twoFactorService.isEnabled(c, userContext.getUserId(c));
	return c.json(result.ok({ enabled }));
});
