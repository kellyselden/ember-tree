const numberOfSiblings = 5;

export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.

    Make sure to define a factory for each model you want to create.
  */

  let users = server.createList('user', 1);
  let tops = server.createList('top', numberOfSiblings);
  tops[0].update('users', users);

  tops.forEach(top => {
    let middles = server.createList('middle', numberOfSiblings, {
      top
    });
    top.update('middles', middles);

    middles.forEach(middle => {
      let bottoms = server.createList('bottom', numberOfSiblings, {
        middle
      });
      middle.update('bottoms', bottoms);
    });
  });
}
