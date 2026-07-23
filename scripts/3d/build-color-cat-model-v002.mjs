import fs from "node:fs";

const sourcePath = process.argv[2] ?? "assets/models/source/color-cat/model-source-v002.glb";
const outputPath = process.argv[3] ?? "color-cat-split-v002.glb";

const sourceBytes = fs.readFileSync(sourcePath);
const sourceJsonLength = sourceBytes.readUInt32LE(12);
const document = JSON.parse(sourceBytes.subarray(20, 20 + sourceJsonLength).toString());
const sourceBinaryHeader = 20 + sourceJsonLength;
const sourceBinaryLength = sourceBytes.readUInt32LE(sourceBinaryHeader);
const sourceBinaryStart = sourceBinaryHeader + 8;
const sourceBinary = Buffer.from(
  sourceBytes.subarray(sourceBinaryStart, sourceBinaryStart + sourceBinaryLength),
);
const primitive = document.meshes[0].primitives[0];

function accessorView(accessorIndex) {
  const accessor = document.accessors[accessorIndex];
  const bufferView = document.bufferViews[accessor.bufferView];
  const offset =
    sourceBytes.byteOffset +
    sourceBinaryStart +
    (bufferView.byteOffset ?? 0) +
    (accessor.byteOffset ?? 0);
  const componentCount = { SCALAR: 1, VEC2: 2, VEC3: 3 }[accessor.type] ?? 1;
  const length = accessor.count * componentCount;
  if (accessor.componentType === 5125) {
    return new Uint32Array(sourceBytes.buffer, offset, length);
  }
  if (accessor.componentType === 5126) {
    return new Float32Array(sourceBytes.buffer, offset, length);
  }
  throw new Error(`Unsupported accessor component type: ${accessor.componentType}`);
}

const positions = accessorView(primitive.attributes.POSITION);
const sourceIndices = accessorView(primitive.indices);
const vertexCount = positions.length / 3;
const parent = new Int32Array(vertexCount);
const rank = new Uint8Array(vertexCount);
parent.fill(-1);

function find(vertex) {
  let root = vertex;
  while (parent[root] >= 0) root = parent[root];
  while (vertex !== root) {
    const next = parent[vertex];
    parent[vertex] = root;
    vertex = next;
  }
  return root;
}

function union(a, b) {
  let rootA = find(a);
  let rootB = find(b);
  if (rootA === rootB) return;
  if (rank[rootA] < rank[rootB]) [rootA, rootB] = [rootB, rootA];
  parent[rootB] = rootA;
  if (rank[rootA] === rank[rootB]) rank[rootA] += 1;
}

for (let index = 0; index < sourceIndices.length; index += 3) {
  const a = sourceIndices[index];
  const b = sourceIndices[index + 1];
  const c = sourceIndices[index + 2];
  union(a, b);
  union(a, c);
}

const yarnRoots = new Set();
for (let vertex = 0; vertex < vertexCount; vertex += 1) {
  const x = positions[vertex * 3];
  const y = positions[vertex * 3 + 1];
  const z = positions[vertex * 3 + 2];
  const ballSeed = x > 0.52 && y < -0.03 && z > 0.14;
  const looseStrandSeed = x > 0.35 && y < -0.36 && z > 0.44;
  if (ballSeed || looseStrandSeed) yarnRoots.add(find(vertex));
}
if (yarnRoots.size !== 24) {
  throw new Error(`Expected 24 yarn components, found ${yarnRoots.size}`);
}

let yarnIndexCount = 0;
for (let index = 0; index < sourceIndices.length; index += 3) {
  if (yarnRoots.has(find(sourceIndices[index]))) yarnIndexCount += 3;
}
const bodyIndices = new Uint32Array(sourceIndices.length - yarnIndexCount);
const yarnIndices = new Uint32Array(yarnIndexCount);
let bodyCursor = 0;
let yarnCursor = 0;
for (let index = 0; index < sourceIndices.length; index += 3) {
  const target = yarnRoots.has(find(sourceIndices[index])) ? yarnIndices : bodyIndices;
  const cursor = target === yarnIndices ? yarnCursor : bodyCursor;
  target[cursor] = sourceIndices[index];
  target[cursor + 1] = sourceIndices[index + 1];
  target[cursor + 2] = sourceIndices[index + 2];
  if (target === yarnIndices) yarnCursor += 3;
  else bodyCursor += 3;
}

function alignedBuffer(buffer) {
  const padding = (4 - (buffer.length % 4)) % 4;
  return padding === 0 ? buffer : Buffer.concat([buffer, Buffer.alloc(padding)]);
}

const binaryParts = [alignedBuffer(sourceBinary)];
let binaryLength = binaryParts[0].length;

function appendIndices(indices) {
  const data = alignedBuffer(Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength));
  const bufferViewIndex = document.bufferViews.length;
  document.bufferViews.push({
    buffer: 0,
    byteOffset: binaryLength,
    byteLength: indices.byteLength,
    target: 34963,
  });
  binaryParts.push(data);
  binaryLength += data.length;

  const accessorIndex = document.accessors.length;
  document.accessors.push({
    bufferView: bufferViewIndex,
    componentType: 5125,
    count: indices.length,
    min: [indices.reduce((value, item) => Math.min(value, item), Infinity)],
    max: [indices.reduce((value, item) => Math.max(value, item), -Infinity)],
    type: "SCALAR",
  });
  return accessorIndex;
}

const bodyAccessor = appendIndices(bodyIndices);
const yarnAccessor = appendIndices(yarnIndices);
const bodyMaterial = primitive.material ?? 0;
document.materials[bodyMaterial].name = "color_cat_new_body";
const yarnMaterial = structuredClone(document.materials[bodyMaterial]);
yarnMaterial.name = "color_cat_new_yarn";
yarnMaterial.pbrMetallicRoughness = {
  ...yarnMaterial.pbrMetallicRoughness,
  baseColorFactor: [1, 0.999, 1, 1],
};
const yarnMaterialIndex = document.materials.length;
document.materials.push(yarnMaterial);

document.meshes[0].name = "color_cat_new";
document.meshes[0].primitives = [
  { ...primitive, indices: bodyAccessor, material: bodyMaterial },
  { ...primitive, indices: yarnAccessor, material: yarnMaterialIndex },
];
document.buffers[0].byteLength = binaryLength;

const binary = Buffer.concat(binaryParts);
const jsonBytes = Buffer.from(JSON.stringify(document));
const jsonPadding = (4 - (jsonBytes.length % 4)) % 4;
const paddedJson = Buffer.concat([jsonBytes, Buffer.alloc(jsonPadding, 0x20)]);
const totalLength = 12 + 8 + paddedJson.length + 8 + binary.length;
const output = Buffer.alloc(totalLength);
output.writeUInt32LE(0x46546c67, 0);
output.writeUInt32LE(2, 4);
output.writeUInt32LE(totalLength, 8);
output.writeUInt32LE(paddedJson.length, 12);
output.writeUInt32LE(0x4e4f534a, 16);
paddedJson.copy(output, 20);
const binaryHeader = 20 + paddedJson.length;
output.writeUInt32LE(binary.length, binaryHeader);
output.writeUInt32LE(0x004e4942, binaryHeader + 4);
binary.copy(output, binaryHeader + 8);
fs.writeFileSync(outputPath, output);

console.log(
  JSON.stringify(
    {
      sourcePath,
      outputPath,
      yarnComponents: yarnRoots.size,
      bodyTriangles: bodyIndices.length / 3,
      yarnTriangles: yarnIndices.length / 3,
      outputBytes: output.length,
    },
    null,
    2,
  ),
);
