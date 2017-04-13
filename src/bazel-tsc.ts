// bazel-tsc: Bazel TypeScript Compiler.

import * as fs from "fs";
import * as ts from "typescript";
import * as readline from "readline";

const protobuf = require("google-protobuf");
const worker = require("./worker_protocol_pb");

let parsedCommandLine: ts.ParsedCommandLine;

const languageServiceHost: ts.LanguageServiceHost = {
    getCompilationSettings: (): ts.CompilerOptions => parsedCommandLine.options,
    getNewLine: () => ts.sys.newLine,
    getScriptFileNames: (): string[] => parsedCommandLine.fileNames,
    getScriptVersion: (fileName: string): string => { // TODO: should this by dynamic or not?
        // If the file's size or modified-timestamp changed, it's a different version.
        const stats = fs.statSync(fileName);
        const version = stats.size + ":" + stats.mtime.getTime();
        return version;
    },
    getScriptSnapshot: (fileName: string): ts.IScriptSnapshot | undefined => {
        if (!fs.existsSync(fileName)) {
            return undefined;
        }
        let text = fs.readFileSync(fileName, "utf-8");
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
                let oldText = oldSnapshot.getText(0, oldSnapshot.getLength());

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
    getCurrentDirectory: process.cwd,
    getDefaultLibFileName: ts.getDefaultLibFilePath
};

const languageService: ts.LanguageService = ts.createLanguageService(languageServiceHost);

const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
    getCurrentDirectory: process.cwd,
    getCanonicalFileName: (fileName: string) => fileName,
    getNewLine: () => ts.sys.newLine
};

function compile(args: string[]): { exitCode: number, output: string } {
    // const startTime = process.hrtime();

    let exitCode = ts.ExitStatus.DiagnosticsPresent_OutputsSkipped;
    let output = "";

    try {
        let emitSkipped = true;
        let diagnostics: ts.Diagnostic[] = [];

        parsedCommandLine = ts.parseCommandLine(args);
        if (parsedCommandLine.errors.length > 0) {
            diagnostics = parsedCommandLine.errors;
        } else if (parsedCommandLine.options.version) {
            output += `Version ${ts.version}\n`;
        } else {
            // This call to languageService.getProgram() will clear out any modified SourceFiles
            // from the compiler's cache.
            const program = languageService.getProgram();
            diagnostics = ts.getPreEmitDiagnostics(program);
            if (diagnostics.length === 0) {
                // We would like to use the TypeScript library's built-in writeFile function;
                // the only way to get access to it is to call createCompilerHost().
                const compilerHost = ts.createCompilerHost(parsedCommandLine.options);

                // Write the compiled files to disk!
                const emitOutput = program.emit(undefined /* all files */, compilerHost.writeFile);

                diagnostics = emitOutput.diagnostics;
                emitSkipped = emitOutput.emitSkipped;
            }
        }

        // const elapsedTime = process.hrtime(startTime);
        // output += `Compilation time: ${(elapsedTime[0] + elapsedTime[1] / 1e9)}s${ts.sys.newLine}`;
        output += ts.formatDiagnostics(diagnostics, formatDiagnosticsHost);

        // TODO: check for diagnostics and extendedDiagnostics flags

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
    } finally {
        return { exitCode, output };
    }
};

function readUnsignedVarint32(a: { [index: number]: number }): {
    value: number,  // the value of the varint32 that was read
    length: number  // the number of bytes that the encoded varint32 took
} {
    let b: number;
    let result: number;
    let offset = 0;

    do {
        b = a[offset++]; result  = (b & 0x7F)         ; if (!(b & 0x80)) break;
        b = a[offset++]; result |= (b & 0x7F) << (7*1); if (!(b & 0x80)) break;
        b = a[offset++]; result |= (b & 0x7F) << (7*2); if (!(b & 0x80)) break;
        b = a[offset++]; result |= (b & 0x7F) << (7*3); if (!(b & 0x80)) break;
        b = a[offset++]; result |=  b         << (7*4); if (!(b & 0x80)) break;
    } while (false); // i.e. only once

    return { value: result, length: offset };
}

function persistentWorker(exit: (exitCode: number) => void) {
    let data: Buffer = null;
    let dataOffset = 0;

    process.stdin.on('data', (chunk: Buffer) => {
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
        writer.encoder_.writeUnsignedVarint32(workResponseBytes.length);
        const lengthArray: any = writer.encoder_.end(); // array

        const buffer: Buffer = new Buffer(lengthArray.length + workResponseBytes.length);
        buffer.set(lengthArray); // the varint-encoded length...
        buffer.set(workResponseBytes, lengthArray.length); // ...followed by the WorkResponse
        process.stdout.write(new Buffer(buffer));
    });

    process.stdin.on('end', () => {
        exit(0);
    });
}

function main(argv: string[], exit: (exitCode: number) => void) {
    // This is the flag that Bazel passes when it wants us to remain in memory as a persistent worker,
    // communicating with Bazel via protobuf over stdin/stdout.
    if (argv.indexOf("--persistent_worker") !== -1) {
        persistentWorker(exit);
    } else if (argv.indexOf("--debug") !== -1) {
        // Read regular text (not protobuf) from stdin; print to stdout
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('line', (input: string) => {
            const args = input.split(" ");
            const { exitCode, output } = compile(args);
            process.stdout.write(`Exit code: ${exitCode}. Output:\n${output}`);
        });
        rl.on('close', () => {
            exit(0);
        });
    } else { // not --persistent_worker nor --debug; just a regular compile
        const args = argv.slice(2);
        const { exitCode, output } = compile(args);
        if (output)
            process.stdout.write(output); // TODO: stderr or stdout?
        exit(exitCode);
    }
}

main(process.argv, process.exit);

/* vim:set et ts=4 sw=4: */
