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
      statuses: {
        create: {
          success: 'Status successfully created',
          error: 'Failed to create status',
        },
        edit: {
          success: 'Status successfully changed',
        },
        delete: {
          success: 'Status successfully deleted',
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
        tasks: 'Tasks',
      },
    },
    views: {
      common: {
        id: 'ID',
        name: 'Name',
      },
      actions: {
        delete: 'Delete',
        edit: 'Edit',
      },
      session: {
        new: {
          signIn: 'Login',
          submit: 'Login',
        },
      },
      users: {
        email: 'Email',
        createdAt: 'Created at',
        head: 'Actions',
        new: {
          submit: 'Register',
          signUp: 'Register',
        },
        edit: {
          title: 'Changing the user',
        },
      },
      tasks: {
        status: 'Status',
        author: 'Author',
        executor: 'Executor',
        creationDate: 'Creation date',
        new: {
          head: 'Creating a task',
          description: 'Description',
        },
        actions: {
          createTask: 'Create task',
        },
      },
      statuses: {
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
