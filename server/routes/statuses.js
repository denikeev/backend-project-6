import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;

  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const statuses = await models.status.query();
        reply.render('statuses/index', { statuses });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      if (req.isAuthenticated()) {
        const status = new models.status();
        reply.render('statuses/new', { status });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .get('/statuses/:id/edit', async (req, reply) => {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const status = await models.status.query().findOne({ id });
        reply.render('statuses/edit', { status });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .post('/statuses', async (req, reply) => {
      if (req.isAuthenticated()) {
        const status = new models.status();
        status.$set(req.body.data);

        try {
          const validStatus = await models.status.fromJson(req.body.data);
          await models.status.query().insert(validStatus);
          req.flash('info', i18next.t('flash.statuses.create.success'));
          reply.redirect(app.reverse('statuses'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.statuses.create.error'));
          reply.render('statuses/new', { status, errors: data });
        }

        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .patch('/statuses/:id', async (req, reply) => {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const status = await models.status.query().findOne({ id });

        try {
          await status.$query().update(req.body.data);
          req.flash('info', i18next.t('flash.statuses.edit.success'));
          reply.redirect(app.reverse('statuses'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.statuses.edit.failed'));
          reply.render('statuses/edit', { status, errors: data });
        }

        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .delete('/statuses/:id', async (req, reply) => {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const currentTasks = await models.task.query()
          .where({ status_id: id });

        if (currentTasks.length === 0) {
          await models.status.query().deleteById(id);
          req.flash('info', i18next.t('flash.statuses.delete.success'));
          reply.redirect(app.reverse('statuses'));
        }

        req.flash('error', i18next.t('flash.statuses.delete.failed'));
        reply.redirect(app.reverse('statuses'));
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    });
};
