// ftsc: Fast TypeScript Compiler.

import * as fs from "fs";
import * as ts from "typescript";
//import * as protobuf from "protobufjs";
//import * as protobuf from "google-protobuf";
import * as child_process from "child_process";
import * as path from "path";
import * as buffer from "buffer";

//import * as protobuf from "google-protobuf";
const protobuf = require("google-protobuf");
//const worker = require("lib/worker_protocol_pb.js");
const worker = require("./worker_protocol_pb.js");

fs.writeFileSync("/tmp/ftsc", "" + new Date() + "\n");
let logged = "";
function log(s: string) {
    const all = "\n" + s + "\n";
    logged += all;
    fs.appendFileSync("/tmp/ftsc", all);
}
function logBuffer(b: any) {
    log(b.toString("hex"));
    // let out = "";
    // for (const value of b) {
    //     out += String.fromCharCode(value);
    // }
    // log(out);
}

// This is the flag that Bazel passes when it wants us to remain in memory as a persistent worker,
// communicating with Bazel via protobuf over stdin/stdout.
if (process.argv.indexOf("--persistent_worker") !== -1) {
    try {
        // const proto_path =
        //     "/private/var/tmp/_bazel_mikemorearty/9c7cd8557030180b585ae77b9f68b5a2/execroot/asana2/bazel-out/host/bin/tools/web/ftsc/ftsc.runfiles/asana2/tools/web/ftsc/lib/worker_protocol.proto";
        log("in try");
        log("protobuf: " + protobuf + "\n" + JSON.stringify(protobuf) +
            "\nprotobuf.Message: " + (<any>protobuf).Message +
            "\nworker: " + Object.keys(worker) +
            "\nworker.WorkRequest: " + Object.keys(worker.WorkRequest) +
            "\nprotobuf.load: " + (<any>protobuf).load +
            "\nargv: " + JSON.stringify(process.argv) +
            "\ncurrent directory: " + path.resolve("./") +
            "\nproto path: " + path.join(__dirname, "lib/worker_protocol.proto"));
        //(<any>protobuf).load(path.join(__dirname, "lib/worker_protocol.proto"), (err: any, root: any) => {
        //const root = (<any>protobuf).loadSync(proto_path);

        log("argv:" + process.argv +
            "\nprotobuf: " + JSON.stringify(protobuf));
        //    "\nroot: " + root);

        // const workRequest = new worker.WorkRequest();
        // workRequest.setArgumentsList(["first arg", "second arg"]);
        // const bytes = workRequest.serializeBinary();
        // const wr2 = worker.WorkRequest.deserializeBinary(bytes);
        // log("wr1.arguments: " + workRequest.getArgumentsList());
        // log("wr2.arguments: " + wr2.getArgumentsList());

        process.stdin.on('data', (chunk: any) => {
            //const chunk: Buffer = new Buffer();
            //process.stdin.read(chunk);
            log("length: " + chunk.length);
            logBuffer(chunk);
            const a = [];
            for (let i=0; i<chunk.length; i++) { a.push(chunk[i]); }
            log("protobuf.BinaryReader: " + protobuf.BinaryReader);
            const reader = new protobuf.BinaryReader(a);
            reader.decoder_.skipVarint();
            //reader.readUint();
            //for (const i  chunk.values()) a.push(v);
            const workRequest = new worker.WorkRequest();
            worker.WorkRequest.deserializeBinaryFromReader(workRequest, reader);
            log("workRequest.arguments: " + workRequest.getArgumentsList());

            const args = workRequest.getArgumentsList();
            const outfileArg = args.find(arg => arg.indexOf("--output_file=") !== -1);
            const outfile = outfileArg.slice(14);
            fs.writeFileSync(outfile, new Date() + "\n");

            const workResponse = new worker.WorkResponse();
            workResponse.setExitCode(0);
            workResponse.setOutput("hello, world\n" + logged);
            const bytes: Uint8Array = workResponse.serializeBinary();
            const writer = new protobuf.BinaryWriter();
            writer.encoder_.writeUnsignedVarint64(bytes.length);
            const lengthArray: any = writer.encoder_.end(); // array
            const all = [].concat(lengthArray);
            for (const v in bytes) all.push(bytes[v]);
            process.stdout.write(new buffer.Buffer(all));
        });

        process.stdin.on('end', () => {
            process.exit(0); // xcxc
        });
    } catch (e) {
        log(e);
    }
} else { // not --persistent_worker -- just a regular compile
    console.log("this is ftsc");
    console.log("argv:", process.argv);
    //console.log("ts:", ts, JSON.stringify(ts));
    //console.log("protobuf:", protobuf, JSON.stringify(protobuf));
    console.log("protobuf.load:", (<any>protobuf).load, JSON.stringify((<any>protobuf).load));
}

// const host = {
//     directoryExists: (x: string) => { console.log("directoryExists:", x); return true; },
//     getDirectories: (x: string): string[] => { console.log("getDirectories:", x); return []; },
//     fileExists: (x: string) => { console.log("fileExists:", x); return true; },
//     readFile: (x: string) => { console.log("readFile:", x); return ""; }
// };
// console.log(ts.getDefaultLibFilePath(ts.getDefaultCompilerOptions()));
// console.log(ts.getAutomaticTypeDirectiveNames(ts.getDefaultCompilerOptions(), host));

//child_process.fork(path.join(__dirname, "/ftscd.js"));
