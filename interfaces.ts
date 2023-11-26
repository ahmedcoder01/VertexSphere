export interface Edge {
  _in: Vertex | null;
  _out: Vertex | null;

  metadata: { label: string; [key: string]: any };
}

export interface EdgeParam {
  _in: number;
  _out: number;
  label: string;
}

export interface Vertex {
  _id?: number | string;
  _in: Edge[];
  _out: Edge[];

  metadata: { [key: string]: any };
}

export interface GraphCore {
  addVertex(v: Vertex): void;
  addEdge(e: EdgeParam): void;

  addVertices(vs: Vertex[]): void;
  addEdges(es: EdgeParam[]): void;

  findVertices(args: any[]): Vertex[];

  findInEdges(v: Vertex): Edge[];
  findOutEdges(v: Vertex): Edge[];

  filterEdge(
    edgeMetadata: { [key: string]: string | number },
    filter: { [key: string]: string | number }
  ): Function;
}

export interface GraphQuery {
  // adds a step to the query
  add(pipetype: string, args: any[]): this;

  [key: string]: Function | any;
}

export interface IGremlin {
  v?: Vertex;
  result?: any;
  state?: any;
}

export type PipetypeFn = (
  graph: GraphCore,
  args: any[],
  gremlin: IGremlin | any,
  state: any
) => any;
