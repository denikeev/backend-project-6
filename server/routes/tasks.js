import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;

  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const tasks = await models.task.query();
        reply.render('tasks/index', { tasks });
        return reply;
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
    });
};
