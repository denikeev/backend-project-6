// @ts-check

import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;

  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new models.user();
      reply.render('users/new', { user });
    })
    .get('/users/:id/edit', async (req, reply) => {
      const { id } = req.params;
      const user = await models.user.query().findOne({ id });

      if (req.isAuthenticated()) {
        if (req.user.id === Number(id)) {
          reply.render('users/edit', { user });
          return reply;
        }

        req.flash('error', i18next.t('flash.users.edit.noAccess'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    })
    .post('/users', async (req, reply) => {
      const user = new models.user();
      user.$set(req.body.data);

      try {
        const validUser = await models.user.fromJson(req.body.data);
        await models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }

      return reply;
    })
    .patch('/users/:id', async (req, reply) => {
      const { id } = req.params;
      const user = await models.user.query().findOne({ id });

      if (req.user.id === Number(id)) {
        try {
          await user.$query().update(req.body.data);
          req.flash('info', i18next.t('flash.users.edit.modified'));
          reply.redirect(app.reverse('users'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.users.edit.failed'));
          reply.render('users/edit', { user, errors: data });
        }

        return reply;
      }

      req.flash('error', i18next.t('flash.users.edit.noAccess'));
      reply.redirect(app.reverse('users'));
      return reply;
    })
    .delete('/users/:id', async (req, reply) => {
      const { id } = req.params;

      if (req.isAuthenticated()) {
        if (req.user.id === Number(id)) {
          const userTasks = await models.task.query()
            .where({ executor_id: id });

          if (userTasks.length === 0) {
            req.logOut();
            await models.user.query().deleteById(id);
            req.flash('info', i18next.t('flash.users.delete.success'));
            reply.redirect(app.reverse('root'));
          }

          req.flash('error', i18next.t('flash.users.delete.failed'));
          reply.redirect(app.reverse('users'));
        }

        req.flash('error', i18next.t('flash.users.edit.noAccess'));
        reply.redirect(app.reverse('users'));
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    });
};
