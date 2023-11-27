import { DiskFlush } from "../../DiskStore";
import * as fs from "fs";
import * as util from "util";

export class InProcessStore extends DiskFlush {
  persist(): Promise<void> {
    const snapshot = this.createSnapshot();
    const serializeSnapshot = InProcessStore.serialize(snapshot);
    const buffer = Buffer.from(serializeSnapshot);

    return new Promise((resolve, reject) => {
      const writeFile = util.promisify(fs.writeFile);
      writeFile(this.location, buffer)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }
}
