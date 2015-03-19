# datomicjs

js driver for datomic

## Install

`npm install`

## Requirements

Requires that you have a Datomic server running and accessible.

## Dependencies

Uses [solicit](https://github.com/jkroso/solicit) as HTTP service to interact with Datomic server via REST API.

[hydro](https://github.com/hydrojs/hydro) is used for tests.

## Usage

See `datomic.js`

`Datomic(server, port, alias, name)`

Create Schema:

```
schema.movies = '[
  {:db/id #db/id[:db.part/db]
   :db/ident :movie/title
   :db/valueType :db.type/string
   :db/cardinality :db.cardinality/one
   :db/doc "movie's title"
   :db.install/_attribute :db.part/db}'
   '
```

Then use...

```
Datomic = require('datomicjs').Datomic;
imdb = new Datomic('localhost', 8888, 'db', 'imdb');

// use the DB
imdb.transact(...);

datomic.transact(schema.movies).then((future) ->
  console.log(future);


// to build a Query
find = require('datomicjs').Query;
find('?m')
  .where('?m', ':movie/title', 'trainspotting')
  .toString()
...
```

### API

```
imdb.transact(data)
imdb.entity(id, opts)
imdb.q(query, opts)
```

### EDN

[parse EDN](https://github.com/jkroso/parse-edn) and [serialize EDN](https://github.com/jkroso/serialize-edn) are used to work with the Clojure Map structures of Datomic. The interop with Clojure is done by taking a string with the Map syntax and serializing it to EDN (for queries etc) and conversely parsing a received EDN structure from Datomic (ie. data).

Please continue ;)

## Troubleshoot

In your branch the test suite won't run because you changed the API of index.js from a function to an object. 

You need to run `make datomic` and leave it running in a seperate terminal window while you run `make test` or `make serve`.





