`worker_protocol_pb.js` was generated from Bazel's
`src/main/protobuf/worker_protocol.proto` by following these steps:

    # Get the file (change `0.5.4` to a different tag if desired):
    BAZEL_VERSION=0.5.4
    curl -OL https://raw.githubusercontent.com/bazelbuild/bazel/$BAZEL_VERSION/src/main/protobuf/worker_protocol.proto

    # Get protoc and run it
    # Mac: brew install protobuf
    # Linux: See https://github.com/google/protobuf/#protocol-compiler-installation
    protoc --js_out=import_style=commonjs,binary:. worker_protocol.proto
