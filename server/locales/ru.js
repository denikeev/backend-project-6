// @ts-check

export default {
  translation: {
    appName: 'Fastify Шаблон',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        delete: {
          success: 'Пользователь успешно удалён',
        },
        edit: {
          noAccess: 'Вы не можете редактировать или удалять другого пользователя',
          modified: 'Пользователь успешно изменён',
          failed: 'Не удалось изменить пользователя',
        },
      },
      statuses: {
        create: {
          success: 'Статус успешно создан',
          error: 'Не удалось создать статус',
        },
        edit: {
          success: 'Статус успешно изменён',
          failed: 'Не удалось изменить статус',
        },
        delete: {
          success: 'Статус успешно удалён',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        statuses: 'Статусы',
        tasks: 'Задачи',
      },
    },
    views: {
      common: {
        id: 'ID',
        name: 'Наименование',
      },
      actions: {
        delete: 'Удалить',
        edit: 'Изменить',
      },
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        email: 'Email',
        createdAt: 'Дата создания',
        head: 'Действия',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        edit: {
          title: 'Изменение пользователя',
        },
      },
      tasks: {
        status: 'Статус',
        author: 'Автор',
        executor: 'Исполнитель',
        creationDate: 'Дата создания',
        actions: {
          createTask: 'Создать задачу',
        },
      },
      statuses: {
        name: 'Наименование',
        createdAt: 'Дата создания',
        head: 'Действия',
        actions: {
          createStatus: 'Создать статус',
          create: 'Создать',
        },
        new: {
          head: 'Создание статуса',
        },
        edit: {
          title: 'Изменение статуса',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
