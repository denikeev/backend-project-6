import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let authCookie;
  const testData = getTestData();
  const id = 1;

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
    await knex.migrate.latest();
    await prepareData(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(302);

    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    authCookie = { [name]: value };

    const responseStatuses = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
      cookies: authCookie,
    });

    expect(responseStatuses.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
    });

    expect(response.statusCode).toBe(302);

    const responseStatuses = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: authCookie,
    });

    expect(responseStatuses.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.statuses.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      cookies: authCookie,
      payload: {
        data: params,
      },
    });

    const status = await models.status.query().findOne({ name: params.name });

    expect(status).toMatchObject(params);
  });

  it('edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `statuses/${id}/edit`,
    });

    expect(response.statusCode).toBe(302);

    const responseStatuses = await app.inject({
      method: 'GET',
      url: `statuses/${id}/edit`,
      cookies: authCookie,
    });

    expect(responseStatuses.statusCode).toBe(200);
  });

  it('update', async () => {
    const params = testData.statuses.edited;
    const paramsEmptyName = testData.statuses.notEdited;

    const response = await app.inject({
      method: 'PATCH',
      url: `statuses/${id}`,
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    await app.inject({
      method: 'PATCH',
      url: `statuses/${id}`,
      cookies: authCookie,
      payload: {
        data: params,
      },
    });

    await app.inject({
      method: 'PATCH',
      url: `statuses/${id}`,
      cookies: authCookie,
      payload: {
        data: paramsEmptyName,
      },
    });

    const status = await models.status.query().findOne({ name: params.name });

    expect(status).toMatchObject(params);
  });

  it('delete', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `statuses/${id}`,
    });

    expect(response.headers.location).toBe('/');

    await app.inject({
      method: 'DELETE',
      url: `statuses/${id}`,
      cookies: authCookie,
    });

    const status = await models.status.query().findById({ id: 1 });
    expect(status).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
