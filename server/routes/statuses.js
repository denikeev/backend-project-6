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
    });
};
