const webpack = require('webpack');

module.exports = {
  entry: './lib/bazeltsc.js',
  output: {
    filename: 'dist/bazeltsc.js'
  },
  target: 'node',
  externals: {
    // This handles require("typescript") from a file that is inside Bazel's
    // sandbox.
    //
    // This is complicated. We want typescript to be a "peer dependency" -- not
    // bundled, but rather, located dynamically at runtime (in order to allow
    // people who are using bazeltsc to use it with any version of TypeScript).
    // But if we just use a regular import or require() from this file, then we
    // will be potentially bypassing Bazel's sandboxing, by starting at this
    // file's location and searching up from there for node_modules/typescript
    // directory. Instead, we want to start at Bazel's execution_root (see
    // `bazel info execution_root`).
    //
    // The safest way we have found to do that is to dynamically write a short
    // JavaScript file to the process.cwd() directory (which is the
    // execution_root), and let _that_ file call require().
    'typescript': `(function() {
      const fs = require("fs");
      const path = require("path");
      const typescriptProxy = path.join(process.cwd(), "typescript_proxy.js");
      fs.writeFileSync(typescriptProxy, 'module.exports = require("typescript");');
      return require(typescriptProxy);
    })()`
  }
}
