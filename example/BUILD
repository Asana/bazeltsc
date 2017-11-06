package(default_visibility = ["//visibility:public"])

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")
load(":tsc.bzl", "tsc")

nodejs_binary(
    name = "bazeltsc",
    entry_point = "bazeltsc/bin/bazeltsc",
)

# outputs are x.js, x.js.map, x.d.ts
tsc(
    name = "x",
    srcs = ["x.ts"]
)
