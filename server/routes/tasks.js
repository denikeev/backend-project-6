import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  const { models } = app.objection;

  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const tasksRaw = await models.task.query();

        const tasks = Promise.all(tasksRaw.map(async (task) => {
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
        }));

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
    .post('/tasks', async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = new app.objection.models.task();
        const statuses = await models.status.query();
        const users = await models.user.query();
        const creatorId = Number(req.user.id);

        const processedData = (() => {
          const pureData = _.omitBy({ ...req.body.data, creatorId }, (i) => i === '');
          return Object.keys(pureData).reduce((acc, key) => (
            (key === 'statusId' || key === 'executorId') ? { ...acc, [key]: Number(pureData[key]) } : { ...acc, [key]: pureData[key] }
          ), {});
        })();

        task.$set(processedData);

        try {
          const validTask = await app.objection.models.task.fromJson(processedData);
          await app.objection.models.task.query().insert(validTask);
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
    });
};
