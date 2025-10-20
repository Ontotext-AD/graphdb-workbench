const addNotificationMessage = (type) => {
  const notification = {
    code: 'This is a toast message',
    title: 'Title of toast message',
    type: type,
  };
  addNotification(notification);
};

const addLongNotificationMessage = (type) => {
  const notification = {
    code: 'second a little bit longer  adsa sdas dasdasd asd  a sda sda asd as astoast messa' +
      'ged dasd asd asd asd as das das das da sdas a sdasadasdas da dasd as adsas dasda sda sdas asd asd ' +
      ' adsd asd asd asdas d',
    type: type,
  };
  addNotification(notification);
};

const addNotificationWithLink = (type) => {
  const notification = {
    code: '<a href="#" target="_blank">Click here for more information</a>',
    type: type,
  };
  addNotification(notification);
};
