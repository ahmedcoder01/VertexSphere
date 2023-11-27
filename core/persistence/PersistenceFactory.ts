import config from "../../config";
import { GraphCore } from "../../interfaces";
import { ForkProcessStore } from "./strategies/ForkProcessStore/index";
import { InProcessStore } from "./strategies/InProcessStore/InProcessStore";

export class PersistenceFactory {
  static create(graph: GraphCore, location: string) {
    const strategies = {
      InProcessStore: InProcessStore,
      ForkProcessStore: ForkProcessStore,
    };
    const Store = strategies[config.flushStrategy];
    if (!Store) throw new Error("Invalid flush strategy");
    const flushStrategy = new Store(graph, location);

    return flushStrategy;
  }
}
