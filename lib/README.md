`worker_protocol.js` and `worker_protocol.d.ts` were generated from Bazel's
`src/main/protobuf/worker_protocol.proto` by following these steps:

    # Install the Bazel source as a sibling of $CODEZ
    cd $CODEZ/..
    git clone git@github.com:Asana/bazel.git
    cd bazel
    git checkout <desired-branch>

    # Install protobufjs command-line conversion tool (pbjs and pbts)
    npm install -g protobufjs

    # Go to the directory where we want worker_protocol.js and
    # worker_protocol.d.ts to be put
    cd $CODEZ/asana2/tools/web/ftsc/lib

    # Create worker_protocol.js
    pbjs -t static-module -w amd -o worker_protocol.js \
      $CODEZ/../bazel/src/main/protobuf/worker_protocol.proto

    # Create worker_protocol.d.ts
    pbts -o worker_protocol.d.ts worker_protocol.js

Or:

    # Get protoc
    brew install protobuf
    protoc --js_out=import_style=commonjs,binary:. worker_protocol.proto

Or:

    pbjs $CODEZ/../bazel/src/main/protobuf/worker_protocol.proto \
      > worker_protocol.json
