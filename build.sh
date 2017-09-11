#!/usr/bin/env bash
#
# Run this with: "npm run build"

set -o errexit -o pipefail

if ! $(echo $PATH | tr : '\n' | grep '\/node_modules\/\.bin$' >/dev/null); then
	echo 'run this script via "npm run build"'
	exit 1
fi

rm -rf lib
mkdir -p lib

# input: proto/worker_protocol.proto
# output: lib/worker_protocol_pb.{js,d.ts}
protoc \
	--plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
	--js_out=import_style=commonjs,binary:lib \
	--ts_out=service=true:lib \
	-Iproto \
	worker_protocol.proto

# output: lib/bazeltsc.js
tsc

# output: dist/bazeltsc.js (final, single-file bundle)
rm -rf dist
mkdir dist
webpack
