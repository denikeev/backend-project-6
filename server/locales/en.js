// @ts-check

export default {
  translation: {
    appName: 'Fastify Boilerplate',
    flash: {
      session: {
        create: {
          success: 'You are logged in',
          error: 'Wrong email or password',
        },
        delete: {
          success: 'You are logged out',
        },
      },
      users: {
        create: {
          error: 'Failed to register',
          success: 'User registered successfully',
        },
        delete: {
          success: 'User has been successfully deleted',
        },
        edit: {
          noAccess: 'You cannot edit or delete another user',
          modified: 'User has been successfully changed',
          failed: 'Unable to change user',
        },
      },
      authError: 'Access denied! Please login',
    },
    layouts: {
      application: {
        users: 'Users',
        signIn: 'Login',
        signUp: 'Register',
        signOut: 'Logout',
        statuses: 'Statuses',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Login',
          submit: 'Login',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        createdAt: 'Created at',
        head: 'Actions',
        actions: {
          delete: 'Delete',
          edit: 'Edit',
        },
        new: {
          submit: 'Register',
          signUp: 'Register',
        },
        edit: {
          title: 'Changing the user',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Name',
        createdAt: 'Created at',
        head: 'Actions',
        actions: {
          createStatus: 'Create a status',
          create: 'Create',
        },
        new: {
          head: 'Creating a status',
        },
      },
      welcome: {
        index: {
          hello: 'Hello from Hexlet!',
          description: 'Online programming school',
          more: 'Learn more',
        },
      },
    },
  },
};
