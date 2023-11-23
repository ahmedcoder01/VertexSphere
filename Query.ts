import { PipeManager } from "./PipeManager";
import { GraphQuery, GraphCore } from "./interfaces";

export class Query implements GraphQuery {
  public graph: GraphCore;
  public state: any[];
  public program: any[];
  public gremlins: any[];

  constructor(graph: GraphCore) {
    this.graph = graph;
    this.state = [];
    this.program = [];
    this.gremlins = [];
  }

  add(pipetype: string, args: any[]): this {
    const step = [pipetype, args];

    this.program.push(step);
    return this;
  }
}
