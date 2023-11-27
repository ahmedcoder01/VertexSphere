import { stringify } from "flatted";
import { DiskFlush } from "../../DiskStore";
import * as childProcess from "child_process";

export class ForkProcessStore extends DiskFlush {
  persist(): Promise<void> {
    return new Promise((resolve, reject) => {
      const snapshot = this.createSnapshot();
      const serializeSnapshot = ForkProcessStore.serialize(snapshot);

      const fork = childProcess.fork(__dirname + "/ForkProcessFlushChild.ts");
      fork.send({ snapshot: serializeSnapshot, location: this.location });

      // Listen for messages from the child process
      fork.on("message", (message) => {
        if (message === "done") {
          resolve();
        }
      });

      // Handle errors
      fork.on("error", (err) => {
        reject(err);
      });

      // Handle exit if the process exits before finishing
      fork.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });
    });
  }
}
