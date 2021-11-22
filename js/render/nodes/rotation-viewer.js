import {Material} from '../core/material.js';
import {Node} from '../core/node.js';
import {Primitive, PrimitiveAttribute} from '../core/primitive.js';
import {SevenSegmentText} from './seven-segment-text.js';

class RotationMaterial extends Material {
  get materialName() {
    return 'STATS_VIEWER';
  }

  get vertexSource() {
    return `
    attribute vec3 POSITION;
    attribute vec3 COLOR_0;
    varying vec4 vColor;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vColor = vec4(COLOR_0, 1.0);
      return proj * view * model * vec4(POSITION, 1.0);
    }`;
  }

  get fragmentSource() {
    return `
    precision mediump float;
    varying vec4 vColor;

    vec4 fragment_main() {
      return vColor;
    }`;
  }
}

export class RotationViewer extends Node {
  constructor() {
    super();

    this._fpsVertexBuffer = null;
    this._fpsRenderPrimitive = null;
    this._fpsNode = null;

    this.orientationXDisplay = new SevenSegmentText();
    this.orientationYDisplay = new SevenSegmentText();
    this.orientationZDisplay = new SevenSegmentText();
    this.orientationWDisplay = new SevenSegmentText();

    // Hard coded because it doesn't change:
    // Scale by 0.075 in X and Y
    // Translate into upper left corner w/ z = 0.02
    this.orientationXDisplay.matrix = new Float32Array([
      0.075, 0, 0, 0,
      0, 0.075, 0, 0,
      0, 0, 1, 0,
      -0.3625, 0.3625, 0.02, 1,
    ]);

    this.orientationYDisplay.matrix = new Float32Array([
      0.075, 0, 0, 0,
      0, 0.075, 0, 0,
      0, 0, 1, 0,
      -0.3625, 0.1625, 0.02, 1,
    ]);

    this.orientationZDisplay.matrix = new Float32Array([
      0.075, 0, 0, 0,
      0, 0.075, 0, 0,
      0, 0, 1, 0,
      -0.3625, -0.1625, 0.02, 1,
    ]);

    this.orientationWDisplay.matrix = new Float32Array([
      0.075, 0, 0, 0,
      0, 0.075, 0, 0,
      0, 0, 1, 0,
      -0.3625, -0.3625, 0.02, 1,
    ]);
  }

  onRendererChanged(renderer) {
    this.clearNodes();

    let gl = renderer.gl;

    let fpsVerts = [];
    let fpsIndices = [];

    function addBGSquare(left, bottom, right, top, z, r, g, b) {
      let idx = fpsVerts.length / 6;

      fpsVerts.push(left, bottom, z, r, g, b);
      fpsVerts.push(right, top, z, r, g, b);
      fpsVerts.push(left, top, z, r, g, b);
      fpsVerts.push(right, bottom, z, r, g, b);

      fpsIndices.push(idx, idx+1, idx+2,
                       idx, idx+3, idx+1);
    }

    // Panel Background
    addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.125);

    this._fpsVertexBuffer = renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(fpsVerts), gl.DYNAMIC_DRAW);
    let fpsIndexBuffer = renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fpsIndices));

    let fpsAttribs = [
      new PrimitiveAttribute('POSITION', this._fpsVertexBuffer, 3, gl.FLOAT, 24, 0),
      new PrimitiveAttribute('COLOR_0', this._fpsVertexBuffer, 3, gl.FLOAT, 24, 12),
    ];

    let fpsPrimitive = new Primitive(fpsAttribs, fpsIndices.length);
    fpsPrimitive.setIndexBuffer(fpsIndexBuffer);
    fpsPrimitive.setBounds([-0.5, -0.5, 0.0], [0.5, 0.5, 0.015]);

    this._fpsRenderPrimitive = renderer.createRenderPrimitive(fpsPrimitive, new RotationMaterial());
    this._fpsNode = new Node();
    this._fpsNode.addRenderPrimitive(this._fpsRenderPrimitive);

    this.addNode(this._fpsNode);
    this.addNode(this.orientationXDisplay);
    this.addNode(this.orientationYDisplay);
    this.addNode(this.orientationZDisplay);
    this.addNode(this.orientationWDisplay);
  }

  setPose(pose) {
      // Assume that there's only one view
      // let matrix = pose.views[0].projectionMatrix;
      // console.log(pose);
      // console.log(pose.transform.orientation);
      // console.log(pose.transform.matrix);
      // console.log(matrix);

      this.orientationXDisplay.text = `X ${pose.transform.orientation.x * 100}`;
      this.orientationYDisplay.text = `Y ${pose.transform.orientation.y * 100}`;
      this.orientationZDisplay.text = `Z ${pose.transform.orientation.z * 100}`;
      this.orientationWDisplay.text = `W ${pose.transform.orientation.w * 100}`;
      // this._sevenSegmentNode.text = `${}`;
  }
}
