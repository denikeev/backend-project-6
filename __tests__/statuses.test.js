import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let authCookie;
  const testData = getTestData();

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

  it('new status', async () => {
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

  afterAll(async () => {
    await app.close();
  });
});
