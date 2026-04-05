import app from '../hono/hono';
import contactService from '../service/contact-service';
import result from '../model/result';
import userContext from '../security/user-context';

app.get('/contact/list', async (c) => {
	const data = await contactService.list(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok(data));
});

app.post('/contact/add', async (c) => {
	await contactService.add(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.put('/contact/update', async (c) => {
	await contactService.update(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.delete('/contact/delete', async (c) => {
	await contactService.delete(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.put('/contact/toggleStar', async (c) => {
	await contactService.toggleStar(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.get('/contact/groupList', async (c) => {
	const list = await contactService.groupList(c, userContext.getUserId(c));
	return c.json(result.ok(list));
});

app.post('/contact/groupAdd', async (c) => {
	await contactService.groupAdd(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.put('/contact/groupUpdate', async (c) => {
	await contactService.groupUpdate(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok());
});

app.delete('/contact/groupDelete', async (c) => {
	await contactService.groupDelete(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok());
});
