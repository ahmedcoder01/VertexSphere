import { PipeManager } from "./PipeManager";
import { Query } from "./Query";
import { Edge, EdgeParam, GraphCore, Vertex } from "./interfaces";

export class VertexSphere implements GraphCore {
  private edges: Edge[];
  private vertices: Vertex[];
  private vertexIndexes: { [key: string]: Vertex | null };
  private autoId: number;
  public pipetypes: PipeManager;

  constructor(v: Vertex[], e: EdgeParam[]) {
    this.edges = [];
    this.vertices = [];
    this.vertexIndexes = {};
    this.autoId = 1;
    this.pipetypes = new PipeManager(this);

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
      label: e.label,
    };

    if (!_edge._in || !_edge._out)
      throw new Error(
        "That edge's " + (_edge._in ? "out" : "in") + " vertex wasn't found"
      );

    _edge._in._in.push(_edge);
    _edge._out._out.push(_edge);

    this.edges.push(_edge);
  }

  private findVById(id: number) {
    return this.vertexIndexes[id];
  }

  public v() {
    const q = new Query(this);
    // populate the query with pipetypes
    this.pipetypes.applyPipetypes(q);

    q.add("vertex", [].slice.call(arguments));
    return q;
  }

  static createGremlin(vertex: Vertex, state: any) {}
}
