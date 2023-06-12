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
  });

  it('index', async () => {
    const responseWithoutAuth = await app.inject({
      method: 'GET',
      url: app.reverse('labels'),
    });

    expect(responseWithoutAuth.statusCode).toBe(302);

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels'),
      cookies: authCookie,
    });

    expect(response.statusCode).toBe(200);
  });

  afterAll(async () => {
    await app.close();
  });
});