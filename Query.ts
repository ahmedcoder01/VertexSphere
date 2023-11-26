import { PipeManager } from "./PipeManager";
import { GraphQuery, GraphCore, IGremlin } from "./interfaces";

export class Query implements GraphQuery {
  public graph: GraphCore;
  public pipeManager: PipeManager;
  public state: any[];
  public program: any[];
  public gremlins: any[];

  constructor(graph: GraphCore, pipeManager: PipeManager) {
    this.graph = graph;
    this.state = [];
    this.program = [];
    this.gremlins = [];
    this.pipeManager = pipeManager;
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
    let maybeGremlin: IGremlin | "done" | "pull" | false = false;
    const results = [];

    while (doneIndex < limit) {
      const state = this.state[pc] || {};
      const programStep = this.program[pc];
      const pipeFn = this.pipeManager.getPipetype(programStep[0]);
      maybeGremlin = await pipeFn(
        this.graph,
        programStep[1],
        maybeGremlin,
        state
      );

      if (maybeGremlin == "pull") {
        maybeGremlin = false;
        // try to go the previous pipe if not done
        if (pc - 1 > doneIndex) {
          pc--;
          continue;
        } else {
          doneIndex = pc;
        }

        continue;
      }

      if (maybeGremlin == "done") {
        maybeGremlin = false;
        doneIndex = pc;
      }

      pc++;

      if (pc > limit) {
        // valid result
        pc--;
        let gremlin = maybeGremlin as IGremlin;
        results.push(gremlin?.result ? gremlin?.result : gremlin);
      }
    }
  }
}
