// Fotogramas de control: saca imágenes sueltas de la composición para revisarlas antes de exportar.
// Uso: node herramientas/fotogramas.mjs 0.5 2 3.5 6   (segundos)   → salida/control/s_XX_XX.png
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "fs";
import path from "path";
const raiz = process.cwd();
const out = path.join(raiz, "salida/control");
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts") });
const comp = await selectComposition({ serveUrl, id: process.env.COMP || "Collage" });
for (const s of process.argv.slice(2).map(Number)) {
  const nombre = `s_${s.toFixed(2).padStart(5, "0").replace(".", "_")}.png`;
  await renderStill({ serveUrl, composition: comp, frame: Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps)), output: path.join(out, nombre), scale: 0.5, chromiumOptions: { gl: "vulkan" } });
  console.log(nombre);
}
