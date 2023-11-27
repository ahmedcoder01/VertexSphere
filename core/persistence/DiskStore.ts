import config from "../../config";
import { GraphCore } from "../../interfaces";
import * as fs from "fs";
import * as util from "util";
import { parse, stringify } from "flatted";

export abstract class DiskFlush {
  protected graph: GraphCore;
  protected location: string;
  protected DEFAULT_FLUSH_INTERVAL = 5 * 60 * 1000;
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor(graph: GraphCore, location: string) {
    this.graph = graph;
    this.location = location;
  }

  async persist(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setup() {
    this.schedule();
  }

  schedule() {
    // this.persist();
    this.schedulerInterval && clearInterval(this.schedulerInterval);
    this.schedulerInterval = setInterval(async () => {
      await this.persist();
    }, config.flushIntervalInMins * 60 * 1000 || this.DEFAULT_FLUSH_INTERVAL);
  }

  createSnapshot() {
    const vertices = this.graph.getVertices();
    const edges = this.graph.getEdges();
    const indexes = this.graph.getVertexIndexes();
    const autoId = this.graph.getAutoId();

    const snapshot = {
      vertices,
      edges,
      indexes,
      autoId,
    };

    return snapshot;
  }

  static serialize(snapshot: any) {
    const json = stringify(snapshot);

    return json;
  }

  static deserialize(snapshot: string) {
    try {
      const buffer = Buffer.from(snapshot);
      const json = buffer.toString("utf8");
      console.log("json", json);
      const parsed = parse(json);
      return parsed;
    } catch (e) {
      throw new Error("Could not deserialize snapshot");
    }
  }

  loadData() {
    try {
      // check if file exists
      if (!fs.existsSync(this.location)) return;
      // check if file is empty
      if (fs.statSync(this.location).size === 0) return;

      const data = fs.readFileSync(this.location, "utf8");
      const snapshot = DiskFlush.deserialize(data);
      console.log("snapshot", snapshot);

      this.graph.addVertices(snapshot.vertices);
      this.graph.addEdges(snapshot.edges);
      this.graph.setVertexIndexes(snapshot.indexes);
      this.graph.setAutoId(snapshot.autoId);
    } catch (e) {
      console.log(e.message || "Could not load data from disk");
    }
  }
}
