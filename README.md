# Persistent TypeScript compiler

This is a TypeScript compiler that can be used as a Bazel "persistent worker."
If it is launched with `--persistent_worker`, then it will run in a loop,
reading compilation arguments (in protobuf format) from stdin; doing a compile;
and then writing the results (also in protobuf format) to stdout.  (The format
is defined by Bazel.)

For Bazel projects that do a lot of TypeScript compilation, this has two
performance benefits:

1. It avoids compiler startup time.
2. It avoids unnecessarily re-parsing source files. Specifically, the runtime
   file, lib.d.ts, will only be read once; any any other .ts or .d.ts files
   will also only be read once.

## To clone this repo:

For now, **you must have bazeltsc be a sibling of CODEZ**. Typically, you will
have CODEZ in `~/sandbox/asana`; in that case, bazeltsc will be in
`~/sandbox/bazeltsc`. This will change in the future. More on this in the
section below on using bazeltsc with CODEZ.

## To build:

    npm run build

## To run:

### A regular compile:

    $ bin/bazeltsc [tsc-args] foo.ts ...

### This is how Bazel invokes it as a peristent worker:

    $ bin/bazeltsc --persistent_worker

From that point on, Bazel sends protobuf-encoded messages to bazeltsc on stdin
(protobuf WorkRequest), and bazeltsc responds with protobuf-encoded messages
on stdout (protobuf WorkResponse). 

### To manually test multiple-compile capability:

    $ bin/bazeltsc --debug

From that point on, type one set of tsc arguments at the prompt; it will do a
compile, and then display the compiler output.

    $ bin/bazeltsc --debug
    --noImplicitAny --outFile out.js foo.ts bar.ts

### To use it with CODEZ:

This is a temporary solution -- obviously this will change. The way this works
is that `bazeltsc/dist` is actually a symlink that points into the CODEZ
source tree, so when you build `bazeltsc`, the binary ends up in a place where
CODEZ can find it and use it.

So if you modify bazeltsc and rebuild it, then you will notice that the target
files in your CODEZ repo have changed; you can then commit them if that is your
intent.

#### Steps to update CODEZ to use a new version of bazeltsc:

1.  As described above, clone bazeltsc as a sibling of CODEZ:

        $ cd $CODEZ/..
        $ git clone git@github.com:Asana/bazeltsc.git

2.  Edit bazeltsc sources as desired.
3.  Recompile bazeltsc with `tsc`. This will update the binaries in CODEZ.
4.  Test your changes by rebuilding CODEZ
5.  Commit the changes in BOTH the bazeltsc repo AND the CODEZ repo.
