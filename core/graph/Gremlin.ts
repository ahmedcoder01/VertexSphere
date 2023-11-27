import { IGremlin, Vertex } from "../../interfaces";

export class Gremlin implements IGremlin {
  v: Vertex;
  state: { [key: string]: any };

  constructor(v: Vertex, state: { [key: string]: any }) {
    this.v = v;
    this.state = state;
  }
}
