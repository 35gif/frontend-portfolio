import { useEffect, useRef, useState, type FC } from "react";

/**
 * GPU-only glyph atmosphere. No DOM capture — scroll stays smooth.
 * Looks like a spray/ASCII film over the page via mix-blend.
 */
const VS = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_cell;
uniform sampler2D u_atlas;
uniform float u_cols;
uniform float u_rows;
uniform float u_chars;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float lumaNoise(vec2 id, float t){
  float n = hash(id + floor(t * 0.7));
  float m = hash(id * 1.7 - floor(t * 0.35));
  float dist = length((id - u_mouse / u_cell) * vec2(1.0, 1.15));
  float glow = exp(-dist * 0.09) * 0.55;
  return clamp(0.35 + 0.45 * n + 0.25 * m + glow, 0.0, 1.0);
}

void main(){
  vec2 pixel = v_uv * u_res;
  vec2 cell = floor(pixel / u_cell);
  vec2 local = fract(pixel / u_cell);
  local.y = 1.0 - local.y;

  float L = lumaNoise(cell, u_time);
  float idx = floor(L * (u_chars - 1.001));
  float col = mod(idx, u_cols);
  float row = floor(idx / u_cols);
  vec2 atlasUv = (vec2(col, row) + local) / vec2(u_cols, u_rows);
  float g = texture(u_atlas, atlasUv).r;

  float edge = step(0.06, local.x) * step(local.x, 0.94) * step(0.1, local.y) * step(local.y, 0.92);
  float a = g * edge * (0.18 + 0.55 * L);
  // warm signal yellow / spray pink tint
  vec3 warm = mix(vec3(0.96, 0.78, 0.18), vec3(1.0, 0.35, 0.45), hash(cell * 0.3));
  outColor = vec4(warm, a);
}`;

const CHARSET = " .:-=+*#%@";

function makeAtlas(gl: WebGL2RenderingContext) {
  const cols = 8;
  const rows = 2;
  const cell = 64;
  const c = document.createElement("canvas");
  c.width = cols * cell;
  c.height = rows * cell;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${cell * 0.7}px "IBM Plex Mono", ui-monospace, monospace`;
  for (let i = 0; i < CHARSET.length; i++) {
    const x = (i % cols) * cell + cell / 2;
    const y = Math.floor(i / cols) * cell + cell / 2;
    ctx.fillText(CHARSET[i], x, y);
  }
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  return { tex, cols, rows, count: CHARSET.length };
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || "shader");
  }
  return sh;
}

export const GlyphField: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (!on) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VS);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const atlas = makeAtlas(gl);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uCell = gl.getUniformLocation(prog, "u_cell");
    const uAtlas = gl.getUniformLocation(prog, "u_atlas");
    const uCols = gl.getUniformLocation(prog, "u_cols");
    const uRows = gl.getUniformLocation(prog, "u_rows");
    const uChars = gl.getUniformLocation(prog, "u_chars");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let raf = 0;
    let alive = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const onMove = (e: PointerEvent) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      mouse.current.x = e.clientX * dpr;
      mouse.current.y = (window.innerHeight - e.clientY) * dpr;
    };

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(frame);
      }
    };

    const frame = (t: number) => {
      if (!alive) return;
      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlas.tex);
      gl.uniform1i(uAtlas, 0);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.current.x, mouse.current.y);
      gl.uniform1f(uTime, reduced ? 0 : t * 0.001);
      gl.uniform1f(uCell, Math.max(10, Math.round(12 * Math.min(window.devicePixelRatio || 1, 1.5))));
      gl.uniform1f(uCols, atlas.cols);
      gl.uniform1f(uRows, atlas.rows);
      gl.uniform1f(uChars, atlas.count);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
      gl.deleteTexture(atlas.tex);
    };
  }, [on]);

  return (
    <div className="glyph-ui" data-glyph-ui="1">
      {on ? <canvas ref={canvasRef} className="glyph-canvas" aria-hidden /> : null}
      <button
        type="button"
        className={`glyph-toggle${on ? " is-on" : ""}`}
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
      >
        {on ? "FX on" : "FX off"}
      </button>
    </div>
  );
};
