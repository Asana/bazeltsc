def _tsc_impl(ctx):
    # Generate the "@"-file containing the command-line args for the unit of work.
    tsc_arguments = [
            ## Modify these args as desired for your project!
            "--outFile", ctx.outputs.js.path,
            "--module", "amd",
            "--declaration", # generate .d.ts file
            "--sourceMap", # generate .js.map file
        ] + [
            src.path for src in ctx.files.srcs
        ]
    argfile = ctx.new_file(ctx.configuration.bin_dir, ctx.label.name + ".params")
    ctx.file_action(
        output = argfile,
        content = "".join([arg + "\n" for arg in tsc_arguments])
    )
    ctx.action(
        executable = ctx.executable._bazeltsc,
        arguments = [
            "@" + argfile.path # this must be the last argument
        ],
        inputs = ctx.files.srcs + [argfile],
        outputs = [ctx.outputs.js, ctx.outputs.dts, ctx.outputs.map],
        mnemonic = "TsCompile",
        progress_message = "Compile TypeScript {}".format(ctx.label),
        execution_requirements = { "supports-workers": "1" },
    )

tsc = rule(
    implementation = _tsc_impl,
    attrs = {
        "srcs": attr.label_list(
            mandatory = True,
            allow_files = True
        ),
        "_bazeltsc": attr.label(
            default = Label("//:bazeltsc"),
            executable = True,
            cfg = "host"
        ),
    },
    outputs = {
        "js": "%{name}.js",
        "map": "%{name}.js.map",
        "dts": "%{name}.d.ts",
    }
)
