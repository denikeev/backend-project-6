import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test tasks CRUD', () => {
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
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
    });

    expect(response.statusCode).toBe(302);

    const responseWithAuthCookie = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      cookies: authCookie,
    });

    expect(responseWithAuthCookie.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
    });

    expect(response.statusCode).toBe(302);

    const responseWithAuthCookie = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies: authCookie,
    });

    expect(responseWithAuthCookie.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.tasks.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      cookies: authCookie,
      payload: {
        data: params,
      },
    });

    const task = await models.task.query().findOne({ id: 1 });

    expect(task).toMatchObject(params);
  });

  afterAll(async () => {
    await app.close();
  });
});
