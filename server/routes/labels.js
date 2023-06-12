import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;

  const handleAuthError = (req, reply) => {
    req.flash('error', i18next.t('flash.authError'));
    reply.redirect(app.reverse('root'));
    return reply;
  };

  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const labels = await models.label.query();
        reply.render('labels/index', { labels });
        return reply;
      }

      return handleAuthError(req, reply);
    })
    .get('/labels/new', { name: 'newLabel' }, (req, reply) => {
      if (req.isAuthenticated()) {
        const label = new models.label();
        reply.render('labels/new', { label });
        return reply;
      }

      return handleAuthError(req, reply);
    })
    .get('/labels/:id/edit', async (req, reply) => {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const label = await models.label.query().findById(id);
        reply.render('labels/edit', { label });
        return reply;
      }

      return handleAuthError(req, reply);
    })
    .post('/labels', async (req, reply) => {
      if (req.isAuthenticated()) {
        const label = new models.label();
        label.$set(req.body.data);

        try {
          const validLabel = await models.label.fromJson(req.body.data);
          await models.label.query().insert(validLabel);
          req.flash('info', i18next.t('flash.labels.create.success'));
          reply.redirect(app.reverse('labels'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.labels.create.error'));
          reply.render('labels/new', { label, errors: data });
        }

        return reply;
      }

      return handleAuthError(req, reply);
    })
    .patch('/labels/:id', async (req, reply) => {
      if (req.isAuthenticated()) {
        const { id } = req.params;
        const label = await models.label.query().findById(id);

        try {
          await label.$query().update(req.body.data);
          req.flash('info', i18next.t('flash.labels.edit.success'));
          reply.redirect(app.reverse('labels'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.labels.edit.failed'));
          reply.render('labels/edit', { label, errors: data });
        }

        return reply;
      }

      return handleAuthError(req, reply);
    });
};
