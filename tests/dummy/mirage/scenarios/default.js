const numberOfSiblings = 5;

export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */

  let users = server.createList('user', 1);
  let tops = server.createList('top', numberOfSiblings);
  tops[0].update('users', users);

  tops.forEach(top => {
    let middles = server.createList('middle', numberOfSiblings, {
      top
    });

    middles.forEach(middle => {
      server.createList('bottom', numberOfSiblings, {
        middle
      });
    });
  });
}
