import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test labels CRUD', () => {
  let app;
  let knex;
  let models;
  let authCookie;
  const testData = getTestData();
  const labelId = 1;

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

  it('new', async () => {
    const responseWithoutAuth = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
    });

    expect(responseWithoutAuth.statusCode).toBe(302);

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies: authCookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.labels.new;

    const responseWithoutAuth = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      payload: {
        data: params,
      },
    });

    expect(responseWithoutAuth.statusCode).toBe(302);

    await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      cookies: authCookie,
      payload: {
        data: params,
      },
    });

    const label = await models.label.query().findOne({ name: params.name });

    expect(label).toMatchObject(params);
  });

  it('edit', async () => {
    const responseWithoutAuth = await app.inject({
      method: 'GET',
      url: `labels/${labelId}/edit`,
    });

    expect(responseWithoutAuth.statusCode).toBe(302);

    const response = await app.inject({
      method: 'GET',
      url: `labels/${labelId}/edit`,
      cookies: authCookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const params = testData.labels.edited;

    const responseWithoutAuth = await app.inject({
      method: 'PATCH',
      url: `labels/${labelId}`,
      payload: {
        data: params,
      },
    });

    expect(responseWithoutAuth.statusCode).toBe(302);

    await app.inject({
      method: 'PATCH',
      url: `labels/${labelId}`,
      cookies: authCookie,
      payload: {
        data: params,
      },
    });

    const label = await models.label.query().findOne({ name: params.name });

    expect(label).toMatchObject(params);
  });

  afterAll(async () => {
    await app.close();
  });
});
