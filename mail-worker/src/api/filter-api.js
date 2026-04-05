import app from '../hono/hono';
import filterService from '../service/filter-service';
import result from '../model/result';
import userContext from '../security/user-context';

app.get('/filter/list', async (c) => {
	const list = await filterService.list(c, userContext.getUserId(c));
	return c.json(result.ok(list));
});

app.post('/filter/add', async (c) => {
	await filterService.add(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.put('/filter/update', async (c) => {
	await filterService.update(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.delete('/filter/delete', async (c) => {
	await filterService.delete(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.put('/filter/toggle', async (c) => {
	await filterService.toggle(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});
