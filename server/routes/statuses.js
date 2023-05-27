import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const statuses = await app.objection.models.status.query();
        reply.render('statuses/index', { statuses });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      if (req.isAuthenticated()) {
        const status = new app.objection.models.status();
        reply.render('statuses/new', { status });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .get('/statuses/:id/edit', async (req, reply) => {
      const { id } = req.params;
      const status = await app.objection.models.status.query().findOne({ id });

      if (req.isAuthenticated()) {
        reply.render('statuses/edit', { status });
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .post('/statuses', async (req, reply) => {
      if (req.isAuthenticated()) {
        const status = new app.objection.models.status();
        status.$set(req.body.data);

        try {
          const validStatus = await app.objection.models.status.fromJson(req.body.data);
          await app.objection.models.status.query().insert(validStatus);
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
    });
};
