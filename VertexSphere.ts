import { Gremlin } from "./Gremlin";
import { PipeManager } from "./PipeManager";
import { Query } from "./Query";
import { Edge, EdgeParam, GraphCore, Vertex } from "./interfaces";

export class VertexSphere implements GraphCore {
  private edges: Edge[];
  private vertices: Vertex[];
  private vertexIndexes: { [key: string]: Vertex | null };
  private autoId: number;

  constructor(v?: Vertex[], e?: EdgeParam[]) {
    this.edges = [];
    this.vertices = [];
    this.vertexIndexes = {};
    this.autoId = 1;

    if (Array.isArray(v)) this.addVertices(v);
    if (Array.isArray(e)) this.addEdges(e);
  }

  public addEdges(es: EdgeParam[]): void {
    es.forEach((e) => this.addEdge(e));
  }

  public addVertices(vs: Vertex[]): void {
    vs.forEach((v) => this.addVertex(v));
  }

  public addVertex(v: Vertex) {
    if (!v._id) {
      v._id = this.autoId++;
    }

    v._in = [];
    v._out = [];

    this.vertices.push(v);
    this.vertexIndexes[v._id] = v;
  }

  public addEdge(e: EdgeParam) {
    const _edge: Edge = {
      _in: this.findVById(e._in),
      _out: this.findVById(e._out),
      metadata: {
        label: e.label,
      },
    };

    if (!_edge._in || !_edge._out)
      throw new Error(
        "That edge's " + (_edge._in ? "out" : "in") + " vertex wasn't found"
      );

    _edge._in._in.push(_edge);
    _edge._out._out.push(_edge);

    this.edges.push(_edge);
  }

  private findVById(id: string | number) {
    return this.vertexIndexes[id];
  }

  //* query initiator
  public v() {
    const pipetypes = new PipeManager(this);
    const q = new Query(this, pipetypes);
    // populate the query with pipetypes
    // FIXME: now, all of the pipetypes that will be initiated after the bindpiptypes() is called will no be registered
    // this.pipetypes.bindPipetypes(q);

    q.add("vertex", [].slice.call(arguments));
    return q;
  }

  findVertices(args: any[]): Vertex[] {
    // three cases: pass empty arg, pass _id obj key or pass string

    if (typeof args[0] == "object") {
      return this.searchVertices(args[0]);
    } else if (args.length == 0) {
      return this.vertices;
    } else {
      return this.findVerticesByIds(args);
    }
  }

  private findVerticesByIds(ids: (number | string)[]) {
    return ids.map((id) => this.findVById(id)).filter(Boolean) as Vertex[];
  }

  private searchVertices(filter: { [key: string]: string | number }) {
    return this.vertices.filter((v) => this.objectFilter(v.metadata, filter));
  }

  private objectFilter(
    t: { [key: string]: string | number },
    filter: { [key: string]: string | number }
  ) {
    for (const key in filter) {
      if (t[key] !== filter[key]) return false;

      return true;
    }
  }

  public findOutEdges(v: Vertex) {
    return this.edges.filter((e) => e._out?._id == v._id);
  }

  public findInEdges(v: Vertex) {
    return this.edges.filter((e) => e._in?._id == v._id);
  }

  filterEdge(filter: { [key: string]: string | number }): Function {
    return (edge: Edge) => {
      if (!filter) return true;
      if (typeof filter == "string")
        // string filter: label must match
        return edge.metadata.label == filter;

      if (Array.isArray(filter))
        // array filter: must contain label
        return !!~filter.indexOf(edge.metadata.label);

      return this.objectFilter(edge.metadata, filter);
    };
  }

  static createGremlin(vertex: Vertex, state: any) {
    return new Gremlin(vertex, state || {});
  }
}
