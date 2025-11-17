/* eslint-disable no-unused-vars */
const addNotificationMessage = (type) => {
  addNotification({
    type,
    code: 'This is a notification message',
    title: 'Title of notification message',
    parameters: {shouldToast: true}
  });
};
