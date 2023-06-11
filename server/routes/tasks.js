import i18next from 'i18next';
import _ from 'lodash';

const getTaskData = (models) => async (task) => {
  const status = await models.status.query().findById(task.statusId);
  const creatorUser = await models.user.query().findById(task.creatorId);
  const creatorName = `${creatorUser.firstName} ${creatorUser.lastName}`;
  const result = { ...task, statusName: status.name, creatorName };

  if (task.executorId !== null) {
    const executorUser = await models.user.query().findById(task.executorId);
    const executorName = `${executorUser.firstName} ${executorUser.lastName}`;
    return { ...result, executorName };
  }

  return result;
};

const handleTaskCreation = (data, creatorId) => {
  const pureData = _.omitBy({ ...data, creatorId }, (i) => i === '');
  return Object.keys(pureData).reduce((acc, key) => (
    (key === 'statusId' || key === 'executorId') ? { ...acc, [key]: Number(pureData[key]) } : { ...acc, [key]: pureData[key] }
  ), {});
};

export default (app) => {
  const { models } = app.objection;

  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const tasksRaw = await models.task.query();

        const tasks = Promise.all(tasksRaw.map(getTaskData(models)));

        return tasks.then((data) => {
          reply.render('tasks/index', { tasks: data });
          return reply;
        });
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = new models.task();
        const statuses = await models.status.query();
        const users = await models.user.query();

        reply.render('tasks/new', { task, statuses, users });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .get('/tasks/:id', async (req, reply) => {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const task = await models.task.query().findById(id);
        const taskData = await getTaskData(models)(task);

        reply.render('tasks/task', { task: taskData });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .get('/tasks/:id/edit', async (req, reply) => {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const task = await models.task.query().findOne({ id });
        const statuses = await models.status.query();
        const users = await models.user.query();

        reply.render('tasks/edit', { task, statuses, users });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .post('/tasks', async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = new app.objection.models.task();
        const statuses = await models.status.query();
        const users = await models.user.query();
        const creatorId = Number(req.user.id);
        const processedData = handleTaskCreation(req.body.data, creatorId);
        task.$set(processedData);

        try {
          const validTask = await models.task.fromJson(processedData);
          await models.task.query().insert(validTask);
          req.flash('info', i18next.t('flash.tasks.create.success'));
          reply.redirect(app.reverse('tasks'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.tasks.create.error'));
          reply.render('tasks/new', {
            task, statuses, users, errors: data,
          });
        }

        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .patch('/tasks/:id', async (req, reply) => {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const task = await models.task.query().findById(id);
        const statuses = await models.status.query();
        const users = await models.user.query();
        const processedData = handleTaskCreation(req.body.data, task.creatorId);
        task.$set(processedData);

        try {
          await task.$query().update(processedData);
          req.flash('info', i18next.t('flash.tasks.edit.success'));
          reply.redirect(app.reverse('tasks'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.tasks.create.error'));
          reply.render('tasks/edit', {
            task, statuses, users, errors: data,
          });
        }

        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .delete('/tasks/:id', async (req, reply) => {
      const { id } = req.params;

      if (req.isAuthenticated()) {
        const task = await app.objection.models.task.query().findById(id);

        if (req.user.id === task.creatorId) {
          await app.objection.models.task.query().deleteById(id);
          req.flash('info', i18next.t('flash.tasks.delete.success'));
          reply.redirect(app.reverse('tasks'));
        }

        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    });
};
