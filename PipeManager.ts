import { VertexSphere } from "./VertexSphere";
import { GraphQuery, GraphCore, IGremlin, PipetypeFn } from "./interfaces";

export class PipeManager {
  private pipetypes: { [key: string]: PipetypeFn };
  private pipetypesLog: any[];
  private graph: GraphCore;

  constructor(graph: GraphCore) {
    this.pipetypes = {};
    this.pipetypesLog = [];
    this.graph = graph;
    this.addDefaultPipetypes();
  }

  addPipetype(name: string, fn: PipetypeFn) {
    this.pipetypes[name] = fn;

    // add to log for replaying on new query instances
    this.pipetypesLog.push({
      args: [].slice.call(arguments),
      name,
      fn,
    });
  }

  getPipetype(name: string) {
    if (!this.pipetypes[name]) console.warn("Pipetype not found: " + name);
    return this.pipetypes[name] || this.fauxPipetype;
  }

  private fauxPipetype(
    graph: any,
    _: any,
    maybeGremlin?: IGremlin,
    state?: any[]
  ) {
    return maybeGremlin || "pull";
  }

  applyPipetypes(query: GraphQuery) {
    this.pipetypesLog.forEach((log) => {
      query[log.name] = () => {
        return query.add(log.name, [].slice.call(arguments));
      };
    });
  }

  private addDefaultPipetypes() {
    // default: vertex, in, out

    this.addPipetype("vertex", (graph, args, gremlin, state) => {
      if (!state.vertices) state.vertices = graph.findVertices(args);

      if (!state.vertices.length) return "done";

      const currV = state.vertices.pop();
      return VertexSphere.createGremlin(currV, gremlin.state);
    });
  }
}
