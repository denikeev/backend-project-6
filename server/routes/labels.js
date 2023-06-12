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
    });
};
