export interface Edge {
  _in: Vertex | null;
  _out: Vertex | null;
  label: string;
}

export interface EdgeParam {
  _in: number;
  _out: number;
  label: string;
}

export interface Vertex {
  _id?: number;
  _in: Edge[];
  _out: Edge[];
  name: string;
}

export interface GraphCore {
  addVertex(v: Vertex): void;
  addEdge(e: EdgeParam): void;

  addVertices(vs: Vertex[]): void;
  addEdges(es: EdgeParam[]): void;
}

export interface GraphQuery {
  // adds a step to the query
  add(pipetype: string, args: any[]): this;

  [key: string]: Function | any;
}

export interface IGremlin {
  state: any;
}

export type PipetypeFn = (
  graph: GraphCore,
  args: any[],
  gremlin: IGremlin,
  state: any
) => any;
