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

In our internal usage at Asana, using bazeltsc has led to roughly a 2x to 4x
speedup in TypeScript compilation (the numbers are affected by a variety of
factors).

## Installation

You will need to get bazeltsc into a place where Bazel can find it. One way to
do this is by using Bazel's
[`rules_nodejs`](https://github.com/bazelbuild/rules_nodejs); but you can do it
any way you like.

Instructions if you are using `rules_nodejs`:

*   Follow the [`rules_nodejs`](https://github.com/bazelbuild/rules_nodejs)
    setup instructions.

*   Add `bazeltsc` to your `package.json`:

        npm install --save-dev bazeltsc

*   Run the Bazel equivalent of `npm install`:

        bazel run @nodejs//:npm install

*   Copy `tsc.bzl` from `node_modules/bazeltsc/tsc.bzl` into your repo
    somewhere.  (We intend to clean this up as soon as we figure out how to get
    Bazel to be able to find `tsc.bzl` directly from inside `node_modules`.)

*   Use the example from the `example` directory -- especially the `WORKSPACE`
    and `BUILD` file -- to finish setting things up.

*   It is essential that when you run Bazel, you invoke it with
    `--strategy=TsCompile=worker`. This is what tells Bazel to use `bazeltsc`
    as a persistent worker instead of as a regular tool that is invoked once
    per compilation.

    You will probably want to add that to a `.bazelrc` file in the root directory
    of your project, so that you don't have to specify it on the command line:

        # This will be used every time someone does `bazel build ...`:
        build --strategy=TsCompile=worker

## Experimenting with bazeltsc

Normally, you just let Bazel launch bazeltsc. But it is helpful to understand
how bazeltsc is launched by Bazel, and how you can experiment with it yourself.

bazeltsc can run in any of three modes:

*   **As a bazel persistent worker.**  Bazel will launch it with this command line: 

        bazeltsc --persistent_worker

    At that point, bazeltsc is reading protobuf-formatted compilation requests
    from stdin; compiling; and returning protobuf-formatted results on stdout.

*   **As a thin wrapper around tsc.**  Examples:

        bazeltsc --outDir target foo.ts bar.ts
        bazeltsc @argfile

    This provides no functionality beyond what tsc itself provides; it is
    supported in case, for whatever reason, there are times when you want to
    tell Bazel not to use persistent workers.

*   **In "debug" mode.** If you want to experiment interactively with bazeltsc,
    run it like this:

        bazeltsc --debug

    Then, at the `>` prompt, enter a full tsc command line. This will let you
    see the speed difference between an initial compilation and a subsequent
    one.

    For example:

        bazeltsc --debug
        > x.ts
        Compilation took 890ms. Exit code: 0.
        > x.ts
        Compilation took 351ms. Exit code: 0.
