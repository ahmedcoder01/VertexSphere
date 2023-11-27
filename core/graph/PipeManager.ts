import { VertexSphere } from "./VertexSphere";
import { GraphQuery, GraphCore, IGremlin, PipetypeFn, Edge, PipeOutput } from "../../interfaces";

export class PipeManager {
  private pipetypes: { [key: string]: PipetypeFn };
  // private pipetypesLog: any[];
  private graph: GraphCore;
  private query: GraphQuery;

  constructor(query: GraphQuery, graph: GraphCore) {
    this.pipetypes = {};
    // this.pipetypesLog = [];
    this.graph = graph;
    this.query = query;
    this.addDefaultPipetypes();
  }

  addPipetype(name: string, fn: PipetypeFn) {
    this.pipetypes[name] = fn;

    const callFn = function () {
      return this.query.add(name, [].slice.call(arguments));
    };
    this.query[name] = callFn.bind(this);

    // add to log for replaying on new query instances
    // this.pipetypesLog.push({
    //   args: [].slice.call(arguments),
    //   name,
    //   fn,
    // });
  }

  getPipetype(name: string) {
    if (!this.pipetypes[name]) console.warn("Pipetype not found: " + name);
    return this.pipetypes[name] || this.fauxPipetype;
  }

  private fauxPipetype(graph: any, _: any, maybeGremlin?: IGremlin | any, state?: any[]): PipeOutput {
    return maybeGremlin || "pull";
  }

  // bindPipetypes(query: GraphQuery) {
  //   this.pipetypesLog.forEach((log) => {
  //     query[log.name] = () => {
  //       return query.add(log.name, [].slice.call(arguments));
  //     };
  //   });
  // }

  private addDefaultPipetypes() {
    // default: vertex, in, out

    this.addPipetype("vertex", (graph, args, gremlin, state) => {
      if (!state.vertices) {
        state.vertices = graph.findVertices(args);
      }

      if (!state.vertices.length) return "done";

      const currV = state.vertices.pop();
      return VertexSphere.createGremlin(currV, (gremlin as IGremlin).state);
    });

    this.addPipetype("in", (graph, args, gremlin, state: { gremlin?: IGremlin; edges?: Edge[] }) => {
      if (!gremlin && (!state.edges || !state.edges?.length)) {
        return "pull";
      }

      if (!state.edges || !state.edges.length) {
        const inEdges = this.graph.findInEdges((gremlin as IGremlin).v!);
        state.edges = inEdges.filter((e) => this.graph.filterEdgeByMetaData(e.metadata, args[0]));
      }

      if (!state?.edges?.length) return "pull";

      const currV = state.edges.pop()?._out!;

      return VertexSphere.createGremlin(currV, (gremlin as IGremlin).state);
    });

    this.addPipetype("out", (graph, args, gremlin, state: { gremlin?: IGremlin; edges?: Edge[] }) => {
      if (!gremlin && (!state.edges || !state.edges?.length)) {
        return "pull";
      }

      if (!state.edges || !state.edges.length) {
        state.gremlin = gremlin as IGremlin;

        // find edges and filter by passed args
        const outEdges = this.graph.findOutEdges((gremlin as IGremlin).v!);
        state.edges = outEdges.filter((e) => this.graph.filterEdgeByMetaData(e.metadata, args[0]));
      }

      if (!state?.edges?.length) return "pull";

      const currV = state.edges.pop()?._in!;

      return VertexSphere.createGremlin(currV, (gremlin as IGremlin).state);
    });

    this.addPipetype("unique", (graph, args, gremlin, state) => {
      if (!gremlin || !(gremlin as IGremlin).v) return "pull";

      if (!state.seen) state.seen = {};

      const _id = (gremlin as IGremlin).v._id;
      if (state.seen[_id]) return "pull";

      state.seen[_id] = true;

      return gremlin;
    });

    this.addPipetype("take", (graph, args, gremlin, state) => {
      if (!gremlin) return "pull";
      const limit = args[0];

      if (state.taken == limit) {
        state.taken = 0;
        return "done";
      }

      state.taken = state.taken ? state.taken + 1 : 1;

      return gremlin;
    });
  }
}
