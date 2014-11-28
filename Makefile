src=query.js test/datomic.js test/imdb.js test/query.js test/schema.js

serve: node_modules compile
	@node_modules/serve/bin/serve -op 61172

datomic:
	@datomic-rest -p 8888 db datomic:mem:// -o http://localhost:61172

node_modules: package.json
	@packin install -m $< -f $@

test: node_modules
	@node_modules/hydro/bin/_hydro test/{datomic,query,imdb}.coffee \
		--setup test/hydro.conf.js \
		--formatter $</hydro-dot

%.js: %.coffee
	@node_modules/coffee-script/bin/coffee -bp $< > $@

clean:
	@rm -f $(src) test/pid

compile:
	@make $(src)

.PHONY: test clean compile datomic
