// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat model
const Cat = models.Cat.CatModel;
const Dog = models.Dog.DogModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

const defaultData2 = {
  name: 'unknown',
  age: 0,
};
// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);
let lastAdded2 = new Dog(defaultData2);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    currentName2: lastAdded2.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

const readAllCats = (req, res, callback) => {
  Cat.find(callback).lean();
};

const readAllDogs = (req, res, callback2) => {
  Dog.find(callback2).lean();
};

const readCat = (req, res) => {
  const name1 = req.query.name;

  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // return success
    return res.json(doc);
  };

  Cat.findByName(name1, callback);
};

const readDog = (req, res) => {
  const name2 = req.query.name;

  const callback2 = (err, doc) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // return success
    return res.json(doc);
  };
  Dog.findByName2(name2, callback2);
};

const hostPage1 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err });
    }

    // return success
    return res.render('page1', { cats: docs });
  };

  readAllCats(req, res, callback);
};

const hostPage3 = (req, res) => {
  const callback2 = (err, docs) => {
    if (err) {
      return res.status(500).json({ err });
    }

    // return success
    return res.render('page3', { dogs: docs });
  };

  readAllDogs(req, res, callback2);
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage4 = (req, res) => {
  res.render('page4');
};

const getName = (req, res) => {
  res.json({ name: lastAdded.name });
};

const getName2 = (req, res) => {
  res.json({ name2: lastAdded2.name });
};

const setName = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
  }

  // if required fields are good, then set name
  const name = `${req.body.firstname} ${req.body.lastname}`;

  // dummy JSON to insert into database
  const catData = {
    name,
    bedsOwned: req.body.beds,
  };

  // create a new object of CatModel with the object to save
  const newCat = new Cat(catData);

  // create new save promise for the database
  const savePromise = newCat.save();

  savePromise.then(() => {
    // set the lastAdded cat to our newest cat object.
    // This way we can update it dynamically
    lastAdded = newCat;

    // return success
    res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned });
  });

  // if error, return it
  savePromise.catch((err) => res.status(500).json({ err }));

  return res;
};

const setName2 = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.age) {
    return res.status(400).json({ error: 'firstname,lastname and age are all required' });
  }

  // if required fields are good, then set name
  const name = `${req.body.firstname} ${req.body.lastname}`;

  const dogData = {
    name,
    age: req.body.age,
  };

  const newDog = new Dog(dogData);

  const savePromise2 = newDog.save();

  savePromise2.then(() => {
    lastAdded2 = newDog;

    res.json({ name: lastAdded2.name, beds: lastAdded2.age });
  });

   savePromise2.catch((err) => res.status(500).json({ err }));

  return res;
};

const searchName = (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  return Cat.findByName(req.query.name, (err, doc) => {
    
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    if (!doc) {
      return res.json({ error: 'No cats found' });
    }
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  });

  
};

const searchName2 = (req, res) =>{  

  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  return Dog.findByName2(req.query.name, (err, doc) => {

    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }

    return res.json({ name: doc.name, beds: doc.age });
  });

};

const updateLast = (req, res) => {
  lastAdded.bedsOwned++;
  lastAdded2.age++;

  const savePromise = lastAdded.save();
  const savePromise2 = lastAdded2.save();

  savePromise.then(() => res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned }));
  savePromise2.then(() => res.json({ name: lastAdded2.name, beds: lastAdded2.age }));

  savePromise.catch((err) => res.status(500).json({ err }));
  savePromise2.catch((err) => res.status(500).json({ err }));
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readCat,
  readDog,
  getName,
  getName2,
  setName,
  setName2,
  updateLast,
  searchName,
  searchName2,
  notFound,
};
