var Datomic, datomic, schema;

schema = require('./schema');

Datomic = require('..').Datomic;

datomic = new Datomic('localhost', 8888, 'db', 'test');

beforeNext(function() {
  return datomic.ready;
});

it('should make transactions', function() {
  return datomic.transact(schema.movies).then(function(future) {
    return future.has(':db-after').should.be["true"];
  });
});

it('should get an entity', function() {
  return datomic.entity(1).then(function(entity) {
    return entity.get(':db/id').should.equal(1);
  });
});

it('should get an entity with options', function() {
  return datomic.entity(1, {
    since: 0
  }).then(function(entity) {
    return entity.get(':db/id').should.equal(1);
  });
});

it('should allow to query', function() {
  return datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "trainspotting"]]').then(function() {
    return datomic.q('[:find ?m :where [?m :movie/title "trainspotting"]]');
  }).then(function(movies) {
    return movies.get(0).get(0).should.be.above(1);
  });
});

it('should allow to query with opt', function() {
  return datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "the matrix"]]').then(function() {
    return datomic.transact('[[:db/add #db/id [:db.part/user] :movie/title "the matrix reloaded"]]');
  }).then(function() {
    return datomic.q('[:find ?m :where [?m :movie/title]]', {
      limit: 1,
      offset: 2
    });
  }).then(function(movies) {
    return movies.get(0).get(0).should.be.above(1);
  });
});

it('should allow passing arguments to query', function() {
  var args, query;
  query = '[:find ?first ?height :in [?last ?first ?email] [?email ?height]]';
  args = "[\n  [\"Doe\" \"John\" \"jdoe@example.com\"]\n  [\"jdoe@example.com\" 71]\n]";
  return datomic.q(query, {
    args: args
  }).then(function(data) {
    data.get(0).get(0).should.equal('John');
    return data.get(0).get(1).should.equal(71);
  });
});
