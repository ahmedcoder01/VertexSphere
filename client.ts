import { VertexSphere } from "./core/graph/VertexSphere";

const graphDb = new VertexSphere({
  diskLocation: "./db.bin",
});

// graphDb.addVertices([
//   {
//     _id: "Thor",
//     metadata: { name: "Thor" },
//     _in: [],
//     _out: [],
//   },
//   {
//     _id: "Mark",
//     metadata: { name: "Mark" },
//     _in: [],
//     _out: [],
//   },
//   {
//     _id: "Girl",
//     metadata: { name: "Girl" },
//     _in: [],
//     _out: [],
//   },
//   {
//     _id: "Girl_UNIQUE",
//     metadata: { name: "Girl_UNIQUE" },
//     _in: [],
//     _out: [],
//   },
// ]);

// graphDb.addEdges([
//   {
//     _in: "Girl",
//     _out: "Thor",
//     label: "sister",
//   },
//   {
//     _in: "Girl",
//     _out: "Mark",
//     label: "sister",
//   },
//   {
//     _in: "Girl_UNIQUE",
//     _out: "Mark",
//     label: "sister",
//   },
// ]);

(async () => {
  console.log("querying");
  // @ts-ignore
  const q = await graphDb.v("Thor", "Mark").out("sister").take(1).run();
  console.log("done");
  console.log(q);
})();
