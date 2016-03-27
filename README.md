# datomicjs

js driver for Datomic via [REST API](http://docs.datomic.com/rest.html)

Note: Under development... Please help out!

Currently refactoring to ES6 with Babel

## Install

Add to your `package.json` `dependencies`

```json
  "dependencies": {
    "datomic": "kristianmandrup/datomicjs",
    // ...
```

Then install:

`npm install`

## Development

Use npm tasks such as:

`npm watch` - compile ES6 files in `/src` to ES5 in `/lib`

Also check the `Makefile` for `make` tasks you can use.

## Requirements

Requires that you have a Datomic server running and accessible.
See [Datomic Getting Started](http://docs.datomic.com/getting-started.html)

Also see [setup guide below](#Setup Datomic REST server)

## Alternatives

Another approach is to use [PossibleDB](https://github.com/runexec/PossibleDB) which uses Datascript with RethinkDB as a persistence layer.

## Dependencies

- [solicit](https://github.com/jkroso/solicit) as HTTP service to interact with Datomic server via REST API.
- [hydro](https://github.com/hydrojs/hydro) for tests.
- [jsedn](https://github.com/kristianmandrup/jsedn) to serialize EDN to string for transmission over HTTP.

### Includes

- [Datomex](https://hexdocs.pm/datomex/) driver ported from Elixir (untested!)
- Datomic (partial) API wrapper
- Query builder

## Usage

```js
var dat = require('datomic');
var Datomic = dat.Datomic;
var Query = dat.Query;
var Datomex = dat.Datomex;
var datomic = Datomic(server, port, alias, name);
```

Using ES2015 modules with destructuring:

```js
import { Datomic, Query, Datomex} from 'datomic';
```

You can also use the factory function `Datomic.create` with an options Object:

`var imdb = Datomic.create({alias: 'db', name: 'imdb'});`

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

## Setup Datomic REST server

1. Download and install Datomic free (it should work with Pro as well, but is not tested)

  [http://downloads.datomic.com/free.html](http://downloads.datomic.com/free.html)

2. Open terminal and start transactor

    cd ~/projects/datomic-free-0.8.3862
    bin/transactor config/samples/free-transactor-template.properties

  It should display something like this:

    System started datomic:free://localhost:4334/<DB-NAME>, storing data in: data

3. Load the Seattle schema from datomic/sample directory. Here we'll create a "seattle" database in datomic.

    cd ~/projects/datomic-free-0.8.3862
    bin/shell

  In the datomic shell, run the following commands:

    uri = "datomic:free://localhost:4334/seattle";
    Peer.createDatabase(uri);
    conn = Peer.connect(uri);

    schema_rdr = new FileReader("samples/seattle/seattle-schema.dtm");
    schema_tx = Util.readAll(schema_rdr).get(0);
    txResult = conn.transact(schema_tx).get();

    data_rdr = new FileReader("samples/seattle/seattle-data0.dtm");
    data_tx = Util.readAll(data_rdr).get(0);
    txResult = conn.transact(data_tx).get();

4. Open an other terminal and start Datomic REST

    cd ~/projects/datomic-free-0.8.3862
    bin/rest -p 9000 testing datomic:free://localhost:4334/

  It should display something like this:

    REST API started on port: 9000
       testing = datomic:free://localhost:4334/


## Troubleshoot

You need to run `make datomic` and leave it running in a seperate terminal window while you run `make test` or `make serve`.

### More resources

- [Datomic REST API Setup](https://gist.github.com/g-k/3688420)
- [datomic-in-the-browser](http://ragnard.github.io/2013/08/12/datomic-in-the-browser.html)
- [datomic REST client in ruby](https://github.com/cldwalker/datomic-client)
- [Datomex Elixir driver](https://github.com/edubkendo/datomex)
- [datomic-json-rest](https://github.com/sullerandras/datomic-json-rest)
