import { PipeManager } from "./PipeManager";
import { GraphQuery, GraphCore, IGremlin, PipeOutput } from "../../interfaces";

export class Query implements GraphQuery {
  private graph: GraphCore;
  private pipeManager: PipeManager;
  private globalState: any[];
  private program: any[];
  private gremlins: any[];

  constructor(graph: GraphCore) {
    this.graph = graph;
    this.globalState = [];
    this.program = [];
    this.gremlins = [];
    this.pipeManager = new PipeManager(this, graph);
  }

  add(pipetype: string, args: any[]): this {
    const step = [pipetype, args];

    this.program.push(step);
    return this;
  }

  async run() {
    // query engine
    let pc = this.program.length - 1;
    const limit = pc;
    let doneIndex = -1;
    let maybeGremlin: PipeOutput = false;
    let results: IGremlin[] = [];

    while (doneIndex < limit) {
      const state = this.globalState[pc] ? this.globalState[pc] : (this.globalState[pc] = []);
      const programStep = this.program[pc];
      const pipeFn = this.pipeManager.getPipetype(programStep[0]);
      maybeGremlin = await pipeFn(this.graph, programStep[1], maybeGremlin, state);

      if (maybeGremlin == "pull") {
        maybeGremlin = false;
        // try to go the previous pipe if not done
        if (pc - 1 > doneIndex) {
          pc--;
          continue;
        } else {
          doneIndex = pc;
        }
      }

      if (maybeGremlin == "done") {
        maybeGremlin = false;
        doneIndex = pc;
      }

      pc++; // 3 limit: 2

      if (pc > limit) {
        // only push results if we're at the end of the  (last pipe)

        // valid result
        let gremlin = maybeGremlin as IGremlin;
        if (gremlin) results.push(gremlin);
        maybeGremlin = false;
        pc--;
      }
    }

    results = results.map((g) => (g?.result ? g.result : g.v));
    return results;
  }

  // [key: string]: (...args: any[]) => this;
}
