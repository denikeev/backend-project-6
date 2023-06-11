// @ts-check

import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData } from './helpers/index.js';

describe('test users CRUD', () => {
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

    // TODO: пока один раз перед тестами
    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
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

  beforeEach(async () => {
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });

    expect(user).toMatchObject(expected);
  });

  it('edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: 'users/4/edit',
    });

    expect(response.statusCode).toBe(302);

    const responseEditPage = await app.inject({
      method: 'GET',
      url: 'users/2/edit',
      cookies: authCookie,
    });

    expect(responseEditPage.statusCode).toBe(200);
  });

  it('no access for edit/delete', async () => {
    const id = 2;
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existingSecond,
      },
    });

    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const responseEditPage = await app.inject({
      method: 'GET',
      url: `users/${id}/edit`,
      cookies: cookie,
    });

    expect(responseEditPage.statusCode).toBe(302);

    const responseDeleteUser = await app.inject({
      method: 'DELETE',
      url: `users/${id}`,
      cookies: cookie,
    });

    expect(responseDeleteUser.statusCode).toBe(302);
  });

  it('update', async () => {
    const params = testData.users.editedNew;
    const responseSignInOtherUser = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: params,
      },
    });

    const [sessionCookie] = responseSignInOtherUser.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const responseUpdateNoAccess = await app.inject({
      method: 'PATCH',
      url: 'users/2',
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(responseUpdateNoAccess.statusCode).toBe(302);

    const responseSignInCurrentUser = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.new,
      },
    });

    const [sessionCookieCurrent] = responseSignInCurrentUser.cookies;
    const { name: nameCurrent, value: valueCurrent } = sessionCookieCurrent;
    const cookie2 = { [nameCurrent]: valueCurrent };

    await app.inject({
      method: 'PATCH',
      url: 'users/4',
      cookies: cookie2,
      payload: {
        data: testData.users.editedNew,
      },
    });

    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });

    expect(user).toMatchObject(expected);
  });

  it('delete', async () => {
    const taskId = 1;
    const createTaskParams = testData.tasks.new;
    const userId = 2;
    const user = await models.user.query().findById(userId);

    await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      cookies: authCookie,
      payload: {
        data: createTaskParams,
      },
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `users/${userId}`,
    });

    expect(response.statusCode).toBe(302);

    await app.inject({
      method: 'DELETE',
      url: `users/${userId}`,
      cookies: authCookie,
    });

    let actualUser = await models.user.query().findById(userId);

    expect(actualUser).toStrictEqual(user);

    await app.inject({
      method: 'DELETE',
      url: `tasks/${taskId}`,
      cookies: authCookie,
    });

    await app.inject({
      method: 'DELETE',
      url: `users/${userId}`,
      cookies: authCookie,
    });

    actualUser = await models.user.query().findById(userId);
    expect(actualUser).toBeUndefined();
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    // await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
