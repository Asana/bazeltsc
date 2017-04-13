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

For now, **you must have bazel-tsc be a sibling of CODEZ**. Typically, you will
have CODEZ in `~/sandbox/asana`; in that case, bazel-tsc will be in
`~/sandbox/bazel-tsc`. This will change in the future. More on this in the
section below on using bazel-tsc with CODEZ.

## To build:

    tsc

## To run:

### A regular compile:

    $ node target/bazel-tsc [tsc-args] foo.ts ...

### This is how Bazel invokes it as a peristent worker:

    $ node target/bazel-tsc --persistent_worker

From that point on, Bazel sends protobuf-encoded messages to bazel-tsc on stdin
(protobuf WorkRequest), and bazel-tsc responds with protobuf-encoded messages
on stdout (protobuf WorkResponse). 

### To manually test multiple-compile capability:

    $ node target/bazel-tsc --debug

From that point on, type one set of tsc arguments at the prompt; it will do a
compile, and then display the compiler output.

    $ node target/bazel-tsc --debug
    --noImplicitAny --outFile out.js foo.ts bar.ts

### To use it with CODEZ:

This is a temporary solution -- obviously this will change. The way this works
is that `bazel-tsc/target` is actually a symlink that points into the CODEZ
source tree, so when you build `bazel-tsc`, the binary ends up in a place where
CODEZ can find it and use it.

So if you modify bazel-tsc and rebuild it, then you will notice that the target
files in your CODEZ repo have changed; you can then commit them if that is your
intent.

#### Steps to update CODEZ to use a new version of bazel-tsc:

1.  As desribed above, clone bazel-tsc as a sibling of CODEZ:

        $ cd $CODEZ/..
        $ git clone git@github.com:Asana/bazel-tsc.git

2.  Edit bazel-tsc sources as desired.
3.  Recompile bazel-tsc with `tsc`. This will update the binaries in CODEZ.
4.  Test your changes by rebuilding CODEZ
5.  Commit the changes in BOTH the bazel-tsc repo AND the CODEZ repo.
