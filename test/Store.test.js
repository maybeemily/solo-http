const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const Store = require('../lib/Store');

describe('Store', () => {
  let store = null;

  beforeAll(done => {
    mkdirp('./testData/store', done);
  });

  beforeEach(() => {
    store = new Store('./testData/store');
  });

  beforeEach(done => {
    store.drop(done);
  });

  afterAll(done => {
    rimraf('./testData', done);
  });

  it.only('creates an object in my store', ()=> {
    return store.create ({ name: 'ryan' })
      .then(createdPerson => {
        expect(createdPerson).toEqual({ name: 'ryan', _id: expect.any(String) });
      });
  });


  //create item. then after i'm done creating i
  //get my createdUncle. Then with that, I will find
  //the Created Uncle. The promise all is so I can send
  //both uncles to the next then. I then expect my founduncle
  //to be the same uncle that I created. 
  it('finds an object by id', () => {
    return store.create({ name: 'uncle bob' })
      .then(createdUncle => {
        return Promise.all([
          Promise.resolve(createdUncle),
          store.findById(createdUncle._id)
        ]);
      })
      .then(([createdUncle, foundUncle]) => {
        expect(foundUncle).toEqual({ name: 'uncle bob', _id: createdUncle._id });
      });
  });

  //underscore in next test map - meaning there is no value
  it.only('find all objects tracked by the store', ()=> {
    const undefinedArray = [...Array(5)];
    const arrayOfItems = undefinedArray.map((_, item) => ([item]));
    const promises = arrayOfItems.map(item => store.create(item));
    
    return Promise.all(promises)
      .then(items => {
        return Promise.all([
          Promise.resolve(items),
          store.find()
        ]);
      })
      .then(([items, listOfItems]) => {
        const [item1, item2, item3, item4, item5] = items;
        expect(listOfItems).toHaveLength(5);
        expect(listOfItems).toContainEqual(item1);
        expect(listOfItems).toContainEqual(item2);
        expect(listOfItems).toContainEqual(item3);
        expect(listOfItems).toContainEqual(item4);
        expect(listOfItems).toContainEqual(item5);
      });
  });

  it('deletes an object with an id', done => {
    store.create({ item: 'I am going to delete' }, (err, createdItem) => {
      store.findByIdAndDelete(createdItem._id, (err, result) => {
        expect(err).toBeFalsy();
        expect(result).toEqual({ deleted: 1 });
        store.findById(createdItem._id, (err, foundItem) => {
          expect(err).toBeTruthy();
          expect(foundItem).toBeFalsy();
          done();
        });
      });
    });
  });

  it('updates an existing object', done => {
    store.create({ name: 'rayn' }, (err, typoCreated) => {
      store.findByIdAndUpdate(typoCreated._id, { name: 'ryan' }, (err, updatedWithoutTypo) => {
        expect(err).toBeFalsy();
        expect(updatedWithoutTypo).toEqual({ name: 'ryan', _id: typoCreated._id });
        store.findById(typoCreated._id, (err, foundObj) => {
          expect(foundObj).toEqual(updatedWithoutTypo);
          done();
        });

      });
    });
  });
});
