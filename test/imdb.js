var Datomic, add_movie, find, imdb, schema;

schema = require('./schema');

find = require('../query');

Datomic = require('..');

imdb = new Datomic('localhost', 8888, 'db', 'imdb');

add_movie = function(title, rating) {
  return imdb.transact("[\n{:db/id #db/id[:db.part/user]\n :movie/title \"" + title + "\"\n :movie/rating " + rating + "}]");
};

describe('Sample with movies', function() {
  beforeNext(function() {
    return imdb.ready.then(function() {
      return imdb.transact(schema.movies);
    }).then(function() {
      return add_movie('trainspotting', 8.2);
    }).then(function() {
      return add_movie('pulp fiction', 8.9);
    }).then(function() {
      return add_movie('fight club', 8.8);
    }).then(function() {
      return add_movie('lola rennt', 7.9);
    });
  });
  it('should return all', function() {
    return imdb.q('[:find ?m :where [?m :movie/title]]').then(function(movies) {
      return movies.size.should.be.above(1);
    });
  });
  it('should find a movie over 8.8', function() {
    return imdb.q('[:find ?t :where [?m :movie/title ?t] [?m :movie/rating ?r] [(> ?r  8.8)]]').then(function(movies) {
      return movies.toJS().should.eql([['pulp fiction']]);
    });
  });
  it('should find any movie', function() {
    return imdb.q('[:find ?m :in $ ?t :where [?m :movie/title ?t]]', {
      args: '[{:db/alias "db/imdb"} "fight club"]'
    }).then(function(movies) {
      return movies.size.should.be.above(0);
    });
  });
  return it('should find trainspotting', function() {
    return imdb.q('[:find ?e :where [?e :movie/title "trainspotting"]]').then(function(movies) {
      return imdb.entity(movies.get(0).get(0));
    }).then(function(movie) {
      return movie.get(':movie/title').should.eql('trainspotting');
    });
  });
});
