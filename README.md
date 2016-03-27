# datomicjs

js driver for datomic

## Install

`npm install`

## Requirements

Requires that you have a Datomic server running and accessible.

## Alternatives

Another approach is to use [PossibleDB](https://github.com/runexec/PossibleDB) which uses Datascript with RethinkDB as a persistence layer.

## Dependencies

Uses [solicit](https://github.com/jkroso/solicit) as HTTP service to interact with Datomic server via REST API.

[hydro](https://github.com/hydrojs/hydro) is used for tests.

## Usage

```js
var dat = require('datomic');
var Datomic = dat.Datomic;
var Query = dat.Query;
var datomic = Datomic(server, port, alias, name);
```

Or better, using ES2015 modules with destructuring:

```js
import { Datomic, Query} from 'datomic';
```

### Create Schema:

```
var schema = {};
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
var Datomic = require('datomicjs');

// server, port, alias, name
var imdb = new Datomic('localhost', 8888, 'db', 'imdb');

// alternative in options Object form (default: localhost:8888)
var imdb = new Datomic({host: 'localhost', port: 8888, alias: 'db', name: 'imdb'});

// use the DB
// Each transaction must be an Array such as:
// - [:db/id, -1, :name,  "Maksim"]

imdb.transact([transaction, ...]);

imdb.transact(schema.movies).then((future) => {
  console.log(future);
}


// to build a Query
query = require('datomicjs').Query;

// Get titles from year 2000
var findMovieTitles = query('?m', '?title')
  .where('?m', ':movie/title', '?title')
  .and('?m', ':movie/year', 2000))
  .toString();

// send query to DB
imdb.q(findMovieTitles, opts)
```

### API

```
imdb.transact(data)
imdb.entity(id, opts)
imdb.q(query, opts)
```

### EDN
You can parse and serialize EDN via [jsedn](https://github.com/shaunxcode/jsedn) if you are used to work with the Clojure Map structures of Datomic. 

The interop with Clojure is done by taking a string with the Map syntax and serializing it to EDN (for queries etc) and conversely parsing a received EDN structure from Datomic (ie. data).

## Troubleshoot

In your branch the test suite won't run because you changed the API of index.js from a function to an object. 

You need to run `make datomic` and leave it running in a seperate terminal window while you run `make test` or `make serve`.





