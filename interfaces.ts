export interface Edge {
  _in: Vertex | null;
  _out: Vertex | null;

  metadata: { label: string; [key: string]: any };
}

export type IdType = string | number;

export type PipeOutput = IGremlin | "done" | "pull" | false;
export interface EdgeParam {
  _in: IdType;
  _out: IdType;
  label: string;
}

export interface Vertex {
  _id?: IdType;
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

  filterEdgeByMetaData(
    edgeMetadata: { [key: string]: string | number },
    filter: { [key: string]: string | number }
  ): any;

  getEdges(): Edge[];
  getVertices(): Vertex[];
  getVertexIndexes(): { [key: string]: Vertex | null };
  getAutoId(): number;

  setVertexIndexes(vertexIndexes: { [key: string]: Vertex | null }): void;

  setAutoId(autoId: number): void;
}

export interface GraphQuery {
  // adds a step to the query
  add(pipetype: string, args: any[]): this;

  // [key: string]: (...args: any[]) => this;
  [key: string]: any;
}

export interface IGremlin {
  v?: Vertex;
  result?: any;
  state?: any;
}

export type PipetypeFn = (graph: GraphCore, args: any[], maybeGremlin: PipeOutput, state: any) => PipeOutput;
