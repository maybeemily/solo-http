const request = require('supertest');
const app = require('../lib/app');
const People = require('../lib/models/People');


describe('people creates a new person', ()=> {
    afterEach(() => {
        return People.drop();
    });

    it('POST/people creates a new person in the database', ()=> {
        return request(app)
            .post('/people')
            .send({ name: 'emily', age: 35, color: 'green' })
            .then(res => {
                expect(res.body).toEqual({
                    name: 'emily',
                    age: 35,
                    color: 'green',
                    _id: expect.any(String)
                });
            });
    });

    it('GET/people returns a list of people in database', ()=> {
        return People.create({
            name: 'tester'
        })
            .then(()=> {
                return request(app)
                    .get('/people')
                    .then(res => {
                        expect(res.body).toHaveLength(1);
                    });
            });
        
    });

    it('GET/people can return a person by id', ()=> {
        return People.create({ name: 'ben', age: 39, color: 'purple' })
            .then(createdPerson => {
                return request(app)
                    .get(`/people/${createdPerson._id}`);
            })
            .then(res => {
                expect(res.body).toEqual({
                    name: 'ben',
                    age: 39,
                    color: 'purple'
                });
            });
    });

    it('PUT/people can update a person by id', ()=> {
        return People.create({ name: 'benny', age: 39, color: 'purple' })
            .then(person => {
                return request(app)
                    .put(`/people/${person._id}`)
                    .send({ name: 'ben' });
            })
            .then(res => {
                expect(res.body).toEqual({ name: 'ben', age: 30, color: 'purple'});
            });
    });

    it('deletes a person by id', ()=> {
        return People.create({ name: 'ben', age: 39, color: 'purple' })
            .then(person => {
                return request(app)
                    .delete(`/people/${person._id}`);
            })
            .then(res => {
                expect(res.body).toEqual({ deleted : 1 });
            });
    });
});
