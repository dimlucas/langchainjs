import { awaitAllCallbacks } from "langchain/callbacks";
import path from "path";
import os from "os";
import url from "url";

const [exampleName, ...args] = process.argv.slice(2);

if (!exampleName) {
  console.error("Please provide path to example to run");
  process.exit(1);
}

// Allow people to pass all possible variations of a path to an example
// ./src/foo.ts, ./dist/foo.js, src/foo.ts, dist/foo.js, foo.ts
let exampleRelativePath = exampleName;

if (exampleRelativePath.startsWith("./examples/")) {
  exampleRelativePath = exampleName.slice(11);
} else if (exampleRelativePath.startsWith("examples/")) {
  exampleRelativePath = exampleName.slice(9);
}

if (exampleRelativePath.startsWith("./src/")) {
  exampleRelativePath = exampleRelativePath.slice(6);
} else if (exampleRelativePath.startsWith("./dist/")) {
  exampleRelativePath = exampleRelativePath.slice(7);
} else if (exampleRelativePath.startsWith("src/")) {
  exampleRelativePath = exampleRelativePath.slice(4);
} else if (exampleRelativePath.startsWith("dist/")) {
  exampleRelativePath = exampleRelativePath.slice(5);
}

let runExample;
let metaUrl = import.meta.url;
if (os.platform() !== "win32") {
  metaUrl = url.fileURLToPath(metaUrl);
}
try {
  ({ run: runExample } = await import(
    path.join(
      path.dirname(metaUrl),
      exampleRelativePath
    )
  ));
} catch (e) {
  throw new Error(`Could not load example ${exampleName}: ${e}`);
}

if (runExample) {
  const maybePromise = runExample(args);

  if (maybePromise instanceof Promise) {
    maybePromise
      .catch((e) => {
        console.error(`Example failed with:`);
        console.error(e);
      })
      .finally(() => awaitAllCallbacks());
  }
}
