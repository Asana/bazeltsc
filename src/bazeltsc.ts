// bazeltsc: Bazel TypeScript Compiler.

// built-in node packages
import * as path from "path";
import * as readline from "readline";

// imported npm packages
import * as ts from "typescript";
import * as protobuf from "google-protobuf";
import * as minimist from "minimist";

// imports of our own code
import * as worker from "../lib/worker_protocol_pb";

interface Args {
    max_compiles: number;        // e.g. --max_compiles=10
    persistent_worker?: boolean; // Bazel passes --persistent_worker
    debug?: boolean;             // --debug lets you run this interactively
}

let parsedCommandLine: ts.ParsedCommandLine;
let maxCompiles: number; // 0 means no limit

const languageServiceHost: ts.LanguageServiceHost = {
    getCompilationSettings: (): ts.CompilerOptions => parsedCommandLine.options,
    getNewLine: () => ts.sys.newLine,
    getScriptFileNames: (): string[] => parsedCommandLine.fileNames,
    getScriptVersion: (fileName: string): string => {
        // If the file's size or modified-timestamp changed, it's a different version.
        return ts.sys.getFileSize(fileName) + ":" + ts.sys.getModifiedTime(fileName).getTime();
    },
    getScriptSnapshot: (fileName: string): ts.IScriptSnapshot | undefined => {
        if (!ts.sys.fileExists(fileName)) {
            return undefined;
        }
        let text = ts.sys.readFile(fileName);
        return {
            getText: (start: number, end: number) => {
                if (start === 0 && end === text.length) { // optimization
                    return text;
                } else {
                    return text.slice(start, end);
                }
            },
            getLength: () => text.length,
            getChangeRange: (oldSnapshot: ts.IScriptSnapshot): ts.TextChangeRange | undefined => {
                const oldText = oldSnapshot.getText(0, oldSnapshot.getLength());

                // Find the offset of the first char that differs between oldText and text
                let firstDiff = 0;
                while (firstDiff < oldText.length &&
                       firstDiff < text.length &&
                       text[firstDiff] === oldText[firstDiff]) {
                    firstDiff++;
                }

                // Find the offset of the last char that differs between oldText and text
                let oldIndex = oldText.length;
                let newIndex = text.length;
                while (oldIndex > firstDiff &&
                       newIndex > firstDiff &&
                       oldText[oldIndex - 1] === text[newIndex - 1]) {
                    oldIndex--;
                    newIndex--;
                }

                return {
                    span: {
                        start: firstDiff,
                        length: oldIndex - firstDiff
                    },
                    newLength: newIndex - firstDiff
                };
            },
            dispose: () => { text = ""; }
        };
    },
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getDefaultLibFileName: ts.getDefaultLibFilePath
};

const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: (fileName: string) => fileName,
    getNewLine: () => ts.sys.newLine
};

class LanguageServiceProvider {
    private _languageService: ts.LanguageService = ts.createLanguageService(languageServiceHost);
    private _count = 0;

    // Every N compiles, this will release the current TypeScript LanguageService, create a new
    // one, and do a gc(). N defaults to 10, and is overridden with --max_compiles=N
    acquire() {
        if (!this._languageService || (maxCompiles && this._count >= maxCompiles)) {
            this._languageService = ts.createLanguageService(languageServiceHost);
            this._count = 0;
            if (global.gc) {
                global.gc();
            }
        }

        ++this._count;
        return this._languageService;
    }
}

const languageServiceProvider = new LanguageServiceProvider();

function fileNotFoundDiagnostic(filename: string): ts.Diagnostic {
    return {
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: `File '${filename}' not found.`, // ugh, hard-coded
        category: ts.DiagnosticCategory.Error,
        code: 6053 // ugh, hard-coded
    };
}

// Returns an array of zero or more diagnostic messages, one for each file that does not exist.
// I would really prefer to let the TypeScript compiler take care of this, but I couldn't find a way.
function ensureRootFilesExist(filenames: string[]): ts.Diagnostic[] {
    return filenames
        .filter(filename => !ts.sys.fileExists(filename))
        .map(filename => fileNotFoundDiagnostic(filename));
}

// We need to mimic the behavior of tsc: Read arguments from the command line, but also, if none
// were specified or if a project was specified with "--project" / "-p", then read tsconfig.json.
function parseCommandLine(args: string[]): ts.ParsedCommandLine {
    let pcl = ts.parseCommandLine(args);

    // If there are no command line arguments, or if the user specified "--project" / "-p", then
    // we need to read tsconfig.json
    const configFileOrDirectory = (args.length > 0)
        ? pcl.options.project
        : ".";

    if (configFileOrDirectory) {
        if (pcl.fileNames.length > 0) {
            pcl.errors.push({
                file: undefined,
                start: undefined,
                length: undefined,
                messageText: "Option 'project' cannot be mixed with source files on a command line.",
                category: ts.DiagnosticCategory.Error,
                code: 5042 // ugh, hard-coded
            });
            return pcl;
        }

        const configFileName: string = ts.sys.directoryExists(configFileOrDirectory)
            ? path.join(configFileOrDirectory, "tsconfig.json")
            : configFileOrDirectory;

        if (!ts.sys.fileExists(configFileName)) {
            pcl.errors.push( fileNotFoundDiagnostic(configFileName) );
            return pcl;
        }

        const parseConfigHost = {
            useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
            readDirectory: ts.sys.readDirectory,
            fileExists: ts.sys.fileExists,
            readFile: ts.sys.readFile
        };

        // Read and parse tsconfig.json, merging it with any other args from command line
        pcl = ts.parseJsonConfigFileContent(
            JSON.parse(ts.sys.readFile(configFileName)),
            parseConfigHost,
            ".",
            pcl.options,
            configFileName
        );
    }

    return pcl;
}

function compile(args: string[]): { exitCode: number, output: string } {
    let exitCode = ts.ExitStatus.DiagnosticsPresent_OutputsSkipped;
    let output = "";

    try {
        let emitSkipped = true;
        const diagnostics: ts.Diagnostic[] = [];

        parsedCommandLine = parseCommandLine(args);

        if (parsedCommandLine.errors.length > 0) {
            diagnostics.push(...parsedCommandLine.errors);
        } else if (parsedCommandLine.options.version) {
            output += `Version ${ts.version}\n`;
        } else {
            diagnostics.push(...ensureRootFilesExist(parsedCommandLine.fileNames));
            if (diagnostics.length === 0) {
                const languageService = languageServiceProvider.acquire();
                // This call to languageService.getProgram() will clear out any modified SourceFiles
                // from the compiler's cache.
                const program = languageService.getProgram();
                diagnostics.push(...ts.getPreEmitDiagnostics(program));
                if (diagnostics.length === 0) {
                    // We would like to use the TypeScript library's built-in writeFile function;
                    // the only way to get access to it is to call createCompilerHost().
                    const compilerHost = ts.createCompilerHost(parsedCommandLine.options);

                    // Write the compiled files to disk!
                    const emitOutput = program.emit(undefined /* all files */, compilerHost.writeFile);

                    diagnostics.push(...emitOutput.diagnostics);
                    emitSkipped = emitOutput.emitSkipped;
                }
            }
        }

        output += ts.formatDiagnostics(diagnostics, formatDiagnosticsHost);

        if (emitSkipped) {
            exitCode = ts.ExitStatus.DiagnosticsPresent_OutputsSkipped;
        } else if (diagnostics.length > 0) {
            exitCode = ts.ExitStatus.DiagnosticsPresent_OutputsGenerated;
        } else {
            exitCode = ts.ExitStatus.Success;
        }
    } catch (e) {
        exitCode = ts.ExitStatus.DiagnosticsPresent_OutputsSkipped;
        output = "" + e.stack;
    }
    return { exitCode, output };
}

// Reads an unsigned varint32 from a protobuf-formatted array
function readUnsignedVarint32(a: { [index: number]: number }): {
    value: number,  // the value of the varint32 that was read
    length: number  // the number of bytes that the encoded varint32 took
} {
    let b: number;
    let result = 0;
    let offset = 0;

    // Each byte has 7 bits of data, plus a high bit which indicates whether
    // the value continues over into the next byte. A 32-bit value will never
    // have more than 5 bytes of data (because 5 * 7 is obviously more than
    // enough bits).
    for (let i = 0; i < 5; i++) {
        b = a[offset++];
        result |= (b & 0x7F) << (7 * i);
        if (!(b & 0x80)) {
            break;
        }
    }

    return { value: result, length: offset };
}

function persistentWorker(exit: (exitCode: number) => void) {
    let data: Buffer = null;
    let dataOffset = 0;

    process.stdin.on("data", (chunk: Buffer) => {
        if (data === null) {
            // This is the first chunk of data for a new WorkRequest. Each incoming
            // WorkRequest is preceded by its length, encoded as a Protobuf varint32.
            // (Bazel calls Protobuf's writeDelimitedTo -- the Java source is here:
            // http://goo.gl/4udNmR).
            const varint = readUnsignedVarint32(chunk);
            const messageSize = varint.value;
            if (messageSize <= chunk.length - varint.length) {
                // `chunk` contains the entire message, so just point into it
                data = chunk.slice(varint.length, varint.length + varint.value);
                dataOffset = data.length;
            } else {
                // `chunk` contains only the first part of the message, so
                // allocate a new Buffer which will hold the entire message
                data = Buffer.allocUnsafe(messageSize);
                dataOffset = chunk.copy(data, 0, varint.length);
            }
        } else {
            // This is an additional chunk of data for a WorkRequest whose first
            // part already came in earlier; just append it
            dataOffset += chunk.copy(data, dataOffset);
        }

        // Keep reading chunks of data until we have read the entire WorkRequest
        if (dataOffset < data.length) {
            return;
        }

        // Turn the buffer into a Bazel WorkRequest
        const reader = new protobuf.BinaryReader(new Uint8Array(data));
        const workRequest = new worker.WorkRequest();
        worker.WorkRequest.deserializeBinaryFromReader(workRequest, reader);

        data = null;
        dataOffset = 0;

        // Run the compiler
        const args = workRequest.getArgumentsList();
        const { exitCode, output } = compile(args);

        // Turn the result into a Bazel WorkResponse, and send it protobuf-encoded to stdout
        const workResponse = new worker.WorkResponse();
        workResponse.setExitCode(exitCode);
        workResponse.setOutput(output);

        const workResponseBytes: Uint8Array = workResponse.serializeBinary();

        // Bazel wants the response to be preceded by a varint-encoded length
        const writer = new protobuf.BinaryWriter();
        // TODO this is not cool, encoder_ is an undocumented internal property. But I haven't
        // found another way to do what I want here.
        const encoder_ = (writer as any).encoder_;
        encoder_.writeUnsignedVarint32(workResponseBytes.length);
        const lengthArray: any = encoder_.end(); // array

        const buffer: Buffer = new Buffer(lengthArray.length + workResponseBytes.length);
        buffer.set(lengthArray); // the varint-encoded length...
        buffer.set(workResponseBytes, lengthArray.length); // ...followed by the WorkResponse
        process.stdout.write(new Buffer(buffer));
    });

    process.stdin.on("end", () => {
        exit(0);
    });
}

function main(args: string[], exit: (exitCode: number) => void) {
    const argv = {
        max_compiles: 10,  // default, can be overridden with --max_compiles=N
        ...minimist<Args>(args)
    };

    maxCompiles = argv.max_compiles;

    // This is the flag that Bazel passes when it wants us to remain in memory as a persistent worker,
    // communicating with Bazel via protobuf over stdin/stdout.
    if (argv["persistent_worker"]) {
        persistentWorker(exit);
    } else if (argv["debug"]) {
        // Read regular text (not protobuf) from stdin; print to stdout
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.prompt();

        rl.on("line", (input: string) => {
            const startTime = process.hrtime();

            const cmdArgs = input.split(" ");
            const { exitCode, output } = compile(cmdArgs);

            const elapsedTime = process.hrtime(startTime);
            const elapsedMillis = Math.floor((elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e6);
            let message = `Compilation took ${elapsedMillis}ms. Exit code: ${exitCode}.`;
            if (output) {
                message += ` Compiler output:\n${output}`;
            } else {
                message += "\n";
            }
            process.stdout.write(message);
            rl.prompt();
        });
        rl.on("close", () => {
            exit(0);
        });
    } else { // not --persistent_worker nor --debug; just a regular compile
        const { exitCode, output } = compile(args);
        if (output) {
            process.stdout.write(output);
        }
        exit(exitCode);
    }
}

main(ts.sys.args, ts.sys.exit);
