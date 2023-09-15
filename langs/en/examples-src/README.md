# README of /examples-src/

This folder contains all the existing examples.


## Creating an example

1. add a new folder like `/examples-src/new-example` (`new-example` is later used as the example ID)
2. fill the `/examples-src/new-example` folder with all the files of the new example
3. add an `/examples-src/new-example/$descriptor.json` file with meaningful data (see existing examples)

NOTE: only the files included in the `$descriptor.files` list will be published


## Publishing an example

1. add the example ID to the `/examples-src/$descriptor.json` file

NOTE: only the examples included in the `$descriptor` list will be published


## Rollup

The `generate-json-folders` (rollup plugin) creates a bunch of JSON files based on the structure of the `examples-src` tree and its `$descriptor` files.

Just run `$ yarn build` to see the result in `/examples/`.
