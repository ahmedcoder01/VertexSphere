import * as fs from "fs";
import * as util from "util";

import { parse } from "flatted";

process.on("message", ({ snapshot, location }: { snapshot: string; location: string }) => {
  console.log("ForkProcessFlushChild: graph", snapshot);
  const buffer = Buffer.from(snapshot);

  const writeFile = util.promisify(fs.writeFile);
  writeFile(location, buffer)
    .then(() => {
      process.send("done");
    })
    .catch((err) => {
      throw err;
    });
});
