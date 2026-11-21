import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, random, staticFile } from "remotion";

/* =====================================================================================================
   MOTOR DE COLLAGE · Vive de lo Tuyo
   Piezas para animar imágenes recortadas en un espacio 3D, con cámara, foco, texturas y letras.
   Todo se calcula a partir del segundo `t`, así el vídeo sale igual siempre.

   Cómo se usa (resumen):
   1. Cada escena es un <Mundo cam={...}> con capas <L p={[x, y, z]}> dentro. z grande = lejos.
   2. La cámara es una función del tiempo que devuelve { x, y, z, giro, fd, ap }.
      fd = distancia a la que enfoca (0 = el plano de las capas con z = 0); ap = cuánto desenfoca lo demás.
   3. OJO: el ojo de la cámara está PERS (1500) px por detrás de su plano. Para «meterse» en algo que
      está en z, la cámara tiene que llegar a z + 1200 o más, no a z.
   4. Las transiciones se hacen entre escenas: Iris (círculo que se abre desde un punto) y Barrido
      (algo en primer término cruza y tapa la lente). El cambio de escena va en el pico del movimiento.
   5. Los textos van fuera de la cámara, con <Antetitulo> y <Linea>, para que se lean siempre.
   6. Encima de todo, <Textura>. Y el desenfoque de movimiento con usarMovimiento + <FiltroMovimiento>.
   ===================================================================================================== */

export const W = 1920, H = 1080, PERS = 1500;

/* ---------- curvas y tiempo ---------- */
export const SALE = Easing.bezier(0.16, 1, 0.3, 1);      // llega rápido y frena
export const ENTRA = Easing.bezier(0.7, 0, 0.84, 0);     // arranca lento y acelera (para salir lanzado)
export const VAIVEN = Easing.bezier(0.65, 0, 0.35, 1);   // suave por los dos lados
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** de v0 a v1 entre los segundos a y b, con la curva e */
export const lin = (t: number, a: number, b: number, v0: number, v1: number, e: (n: number) => number = Easing.linear) =>
  interpolate(t, [a, b], [v0, v1], { ...clamp, easing: e });
/** péndulo que se apaga: empieza en amp y se asienta en 0 pasándose un poco */
export const pend = (t: number, at: number, amp: number, w = 7, d = 4) => {
  const u = t - at;
  return u < 0 ? amp : amp * Math.exp(-d * u) * Math.cos(w * u);
};
/** temblor mínimo de cámara en mano */
export const tiembla = (t: number) => ({ x: 2.2 * Math.sin(t * 2.3) + 1.4 * Math.sin(t * 3.9 + 1), y: 1.8 * Math.cos(t * 1.9) + 1.3 * Math.sin(t * 4.6) });

/* ---------- colores del estilo «Archivo» (cámbialos por los de tu guía de estilo) ---------- */
export const COLOR = { crema: "#F3EBDD", ambar: "#F2B45C", lima: "#C6F94D", noche: "#0D0B0A", tinta: "#1B140F" };

/* ---------- fuentes: se cargan antes del primer fotograma ---------- */
export const TITULAR = "TitularVDLT", ANTE = "AnteVDLT", CURSIVA = "CursivaVDLT";
let cargadas: Promise<unknown> | null = null;
const cargar = () => {
  if (cargadas) return cargadas;
  const caras: [string, string, FontFaceDescriptors][] = [
    [TITULAR, "fonts/Bricolage.ttf", { weight: "200 800", stretch: "75% 100%" }],
    [ANTE, "fonts/Jakarta.ttf", { weight: "200 800" }],
    [CURSIVA, "fonts/instrumentserif-italic.woff2", { style: "italic", weight: "400" }],
    [CURSIVA, "fonts/instrumentserif-normal.woff2", { style: "normal", weight: "400" }],
  ];
  cargadas = Promise.all(caras.map(async ([f, u, d]) => { const c = await new FontFace(f, `url(${staticFile(u)})`, d).load(); document.fonts.add(c); }));
  return cargadas;
};
export const useFuentes = () => {
  const [h] = React.useState(() => delayRender("fuentes"));
  React.useEffect(() => { cargar().then(() => continueRender(h)); }, [h]);
};

/* ---------- cámara y capas ---------- */
export type V3 = [number, number, number];
export type Cam = { x: number; y: number; z: number; giro: number; fd: number; ap: number };
const CamCtx = React.createContext<Cam>({ x: 0, y: 0, z: 0, giro: 0, fd: 0, ap: 1 });

/** una capa en el espacio: se coloca a su distancia y se desenfoca según lo lejos que quede del foco.
    `mas` suma desenfoque fijo (para fondos que siempre van borrosos) */
export const L: React.FC<{ p: V3; mas?: number; children: React.ReactNode }> = ({ p, mas = 0, children }) => {
  const cam = React.useContext(CamCtx);
  const d = p[2] - cam.z;
  if (PERS + d < 60) return null;
  const s = PERS / (PERS + d);
  const coc = Math.min(40, cam.ap * 20 * PERS * Math.abs(1 / (PERS + d) - 1 / (PERS + cam.fd))) + mas;
  const b = coc / s;
  return <div style={{ position: "absolute", left: p[0], top: p[1], transform: `translateZ(${(-p[2]).toFixed(1)}px)`, filter: b > 0.45 ? `blur(${b.toFixed(2)}px)` : undefined }}>{children}</div>;
};
/** una imagen de public/ a un tamaño fijo */
export const Foto: React.FC<{ src: string; w: number; h: number; style?: React.CSSProperties }> = ({ src, w, h, style }) => (
  <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, ...style }} />
);
/** clip de vídeo de ía recortado fotograma a fotograma (public/clips/<nombre>/f_000.png…), a 24 fps */
export const CLIP_FPS = 24;
export const fotograma = (t: number, t0: number, n: number) => Math.max(0, Math.min(n - 1, Math.floor((t - t0) * CLIP_FPS)));
export const clipSrc = (nombre: string, i: number) => `clips/${nombre}/f_${String(i).padStart(3, "0")}.png`;
export const Clip: React.FC<{ nombre: string; n: number; t: number; t0: number; w: number; h: number; style?: React.CSSProperties }> = ({ nombre, n, t, t0, w, h, style }) => (
  <Foto src={clipSrc(nombre, fotograma(t, t0, n))} w={w} h={h} style={style} />
);
/** el mundo de una escena, visto por su cámara */
/** OJO: un mixBlendMode suelto dentro del mundo aplana TODO el 3D (se ve ampliado y luego negro). Los brillos con fusión van dentro de la capa L de su foto. */
export const Mundo: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <AbsoluteFill style={{ perspective: PERS, perspectiveOrigin: "50% 50%" }}>
    <div style={{ position: "absolute", left: W / 2, top: H / 2, transformStyle: "preserve-3d", transform: `rotateZ(${(-cam.giro).toFixed(3)}deg) translate3d(${(-cam.x).toFixed(2)}px, ${(-cam.y).toFixed(2)}px, ${cam.z.toFixed(2)}px)` }}>
      <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
    </div>
  </AbsoluteFill>
);
/** dónde cae en pantalla un punto del mundo (para el iris o para pegar algo a un objeto) */
export const proyecta = (p: V3, c: Cam) => {
  const s = PERS / (PERS + p[2] - c.z);
  const x = (p[0] - c.x) * s, y = (p[1] - c.y) * s;
  const g = (-c.giro * Math.PI) / 180;
  return { x: W / 2 + x * Math.cos(g) - y * Math.sin(g), y: H / 2 + x * Math.sin(g) + y * Math.cos(g), s };
};

/* ---------- animación secundaria: copos, polvo, luces ---------- */
/** partículas a varias profundidades; de cerca se vuelven discos desenfocados.
    color con «A» donde va la opacidad, por ejemplo "rgba(240,245,248,A)". caida negativa = suben */
export const Particulas: React.FC<{ t: number; n: number; semilla: string; caja: V3; centro?: V3; caida: number; viento: number; color: string; tam: number; luz?: number }> = ({ t, n, semilla, caja, centro = [0, 0, 0], caida, viento, color, tam, luz = 1 }) => {
  const cam = React.useContext(CamCtx);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const rx = random(`${semilla}x${i}`), ry = random(`${semilla}y${i}`), rz = random(`${semilla}z${i}`), rv = random(`${semilla}v${i}`);
        const z = centro[2] + (rz * 2 - 1) * caja[2];
        const y = ((((ry * 2 - 1) * caja[1] + t * caida * (0.6 + rv)) % (2 * caja[1])) + 3 * caja[1]) % (2 * caja[1]) - caja[1] + centro[1];
        const x = centro[0] + (rx * 2 - 1) * caja[0] + t * viento * (0.5 + rv) + 26 * Math.sin(t * (0.7 + rv) + i);
        const d = z - cam.z;
        if (PERS + d < 120) return null;
        const s = PERS / (PERS + d);
        const coc = Math.min(36, cam.ap * 22 * PERS * Math.abs(1 / (PERS + d) - 1 / (PERS + cam.fd)));
        const lado = (tam * (0.5 + rv) + coc * 1.8) / s;
        const a = (0.95 * luz) / (1 + coc * 0.12);
        return <div key={i} style={{ position: "absolute", left: x - lado / 2, top: y - lado / 2, width: lado, height: lado, borderRadius: "50%", transform: `translateZ(${(-z).toFixed(1)}px)`, background: `radial-gradient(closest-side, ${color.replace("A", a.toFixed(3))} 0%, ${color.replace("A", (a * 0.5).toFixed(3))} 60%, ${color.replace("A", "0")} 100%)` }} />;
      })}
    </>
  );
};

/* ---------- letras: palabra a palabra, suben desde una máscara y se enfocan ---------- */
export type Trozo = { txt: string; serif?: boolean; color?: string };
/** una línea de texto. Una <Linea> por renglón (así controlas dónde se corta) */
export const Linea: React.FC<{ t: number; at: number; trozos: Trozo[]; tam: number; sale?: number; paso?: number }> = ({ t, at, trozos, tam, sale, paso = 0.075 }) => {
  let k = 0;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: tam * 0.24, lineHeight: 1 }}>
      {trozos.flatMap((tr, j) =>
        tr.txt.split(" ").map((w, i) => {
          const a = at + paso * k++;
          const p = lin(t, a, a + 0.62, 0, 1, SALE);
          const fuera = sale === undefined ? 0 : lin(t, sale + 0.03 * k, sale + 0.03 * k + 0.32, 0, 1, ENTRA);
          return (
            <span key={`${j}-${i}`} style={{ display: "inline-block", overflow: "hidden", paddingBottom: tam * 0.16, marginBottom: -tam * 0.16, paddingTop: tam * 0.06 }}>
              <span style={{
                display: "inline-block",
                transform: `translateY(${((1 - p) * 140 - fuera * 140).toFixed(2)}%) rotate(${((1 - p) * 4).toFixed(2)}deg)`,
                visibility: p <= 0.001 || fuera >= 0.999 ? "hidden" : "visible",
                filter: `blur(${((1 - p) * 7 + fuera * 6).toFixed(2)}px)`,
                fontFamily: tr.serif ? CURSIVA : TITULAR,
                fontStyle: tr.serif ? "italic" : "normal",
                fontWeight: tr.serif ? 400 : 560,
                fontStretch: tr.serif ? undefined : "82%",
                fontVariationSettings: tr.serif ? undefined : "'opsz' 96",
                fontSize: tr.serif ? tam * 1.14 : tam,
                letterSpacing: tr.serif ? "-0.01em" : "-0.025em",
                color: tr.color ?? COLOR.crema,
                textShadow: "0 3px 34px rgba(0,0,0,0.5)",
              }}>{w}</span>
            </span>
          );
        }),
      )}
    </div>
  );
};
/** antetítulo pequeño en mayúsculas espaciadas, con una raya que se dibuja */
export const Antetitulo: React.FC<{ t: number; at: number; txt: string; sale?: number; color?: string }> = ({ t, at, txt, sale, color = COLOR.ambar }) => {
  const p = lin(t, at, at + 0.7, 0, 1, SALE), raya = lin(t, at - 0.1, at + 0.5, 0, 1, SALE);
  const fuera = sale === undefined ? 0 : lin(t, sale, sale + 0.3, 0, 1, ENTRA);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: 1 - fuera, marginBottom: 26 }}>
      <div style={{ width: 54, height: 2, background: color, transform: `scaleX(${raya})`, transformOrigin: "0 50%" }} />
      <div style={{ fontFamily: ANTE, fontWeight: 600, fontSize: 27, letterSpacing: "0.24em", color: COLOR.crema, opacity: 0.88 * p, transform: `translateX(${((1 - p) * -18).toFixed(1)}px)`, textTransform: "uppercase", textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>{txt}</div>
    </div>
  );
};

/* ---------- transiciones ---------- */
/** iris: la escena siguiente aparece dentro de un círculo que crece desde un punto de la pantalla */
export const Iris: React.FC<{ t: number; desde: number; hasta: number; centro: { x: number; y: number }; children: React.ReactNode }> = ({ t, desde, hasta, centro, children }) => {
  if (t < desde) return null;
  const r = lin(t, desde, hasta, 0, 1, Easing.bezier(0.55, 0, 0.9, 0.4)) * 1900 + 70 * lin(t, desde - 0.15, desde + 0.1, 0, 1);
  return <AbsoluteFill style={{ clipPath: t < hasta ? `circle(${r.toFixed(1)}px at ${centro.x.toFixed(1)}px ${centro.y.toFixed(1)}px)` : undefined }}>{children}</AbsoluteFill>;
};
/** algo oscuro cruza en primer término de derecha a izquierda y destapa la escena siguiente.
    Devuelve dos piezas: `destapa` (envuelve la escena nueva) y `tapa` (va encima de todo) */
export const barrido = (t: number, desde: number, dura = 0.56, color = "linear-gradient(90deg, #120C08 0%, #2A1C12 30%, #3A2718 48%, #24180F 70%, #0E0906 100%)") => {
  const x = lin(t, desde, desde + dura, 1.9, -1.9, VAIVEN) * W;
  const vel = Math.abs(lin(t + 1 / 30, desde, desde + dura, 1.9, -1.9, VAIVEN) * W - x);
  const activo = t > desde - 0.05 && t < desde + dura + 0.06;
  return {
    destapa: (hijos: React.ReactNode) => <AbsoluteFill style={{ clipPath: t < desde + dura ? `inset(0 0 0 ${Math.max(0, W / 2 + x + 300).toFixed(0)}px)` : undefined }}>{hijos}</AbsoluteFill>,
    tapa: activo ? (
      <>
        <svg width="0" height="0" style={{ position: "absolute" }}><defs><filter id="barrido" x="-60%" y="-5%" width="220%" height="110%"><feGaussianBlur stdDeviation={`${Math.min(60, vel * 0.35).toFixed(1)} 0`} /></filter></defs></svg>
        <div style={{ position: "absolute", left: W / 2 + x - 300, top: -100, width: 600, height: H + 200, filter: "url(#barrido)", background: color }} />
      </>
    ) : null,
  };
};

/* ---------- desenfoque de movimiento de la cámara ---------- */
/** cuánto desenfocar en x e y según lo que se mueve la cámara (se mide en 1/30 s, se pinte a 30 o a 60) */
export const usarMovimiento = (cam: Cam, antes: Cam) => {
  const vx = Math.abs(cam.x - antes.x), vy = Math.abs(cam.y - antes.y), vz = Math.abs(cam.z - antes.z) * 0.22, vg = Math.abs(cam.giro - antes.giro) * 8;
  return { bx: Math.min(30, vx * 0.24 + (vz + vg) * 0.28), by: Math.min(30, vy * 0.24 + (vz + vg) * 0.28) };
};
/** envuelve las escenas: desenfoque de movimiento + parpadeo de exposición de película */
export const FiltroMovimiento: React.FC<{ t: number; bx: number; by: number; children: React.ReactNode }> = ({ t, bx, by, children }) => {
  const parpadeo = 1 + 0.04 * (random(`e${Math.floor(t * 12)}`) - 0.35);
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}><defs><filter id="mov" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} /></filter></defs></svg>
      <AbsoluteFill style={{ filter: `${bx > 1 || by > 1 ? "url(#mov) " : ""}contrast(1.05) saturate(0.9) brightness(${parpadeo.toFixed(4)})` }}>{children}</AbsoluteFill>
    </>
  );
};

/* ---------- textura: grano que cambia 15 veces por segundo, trama fina y viñeta. No viaja con la cámara ---------- */
export const Textura: React.FC<{ t: number; grano?: number }> = ({ t, grano = 0.42 }) => {
  const g = Math.floor(t * 15);
  return (
    <>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: grano, backgroundImage: `url(${staticFile(`textura/grano${(g % 3) + 1}.png`)})`, backgroundSize: "420px 420px", backgroundPosition: `${Math.round(random(`gx${g}`) * 420)}px ${Math.round(random(`gy${g}`) * 420)}px` }} />
      <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity: 0.22, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, rgba(0,0,0,0.35) 1px 3px)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 78% at 50% 46%, rgba(0,0,0,0) 55%, rgba(8,10,14,0.35) 82%, rgba(4,5,8,0.72) 100%)" }} />
    </>
  );
};

/* ---------- sonido: efectos colocados por su golpe ---------- */
/** cada efecto: [archivo en public/sfx, segundo en que debe sonar el golpe, volumen, segundo del golpe dentro del archivo] */
export const Efectos: React.FC<{ fps: number; lista: [string, number, number, number?][] }> = ({ fps, lista }) => (
  <>
    {lista.map(([n, at, v, pico = 0], i) => (
      <Sequence key={i} from={Math.max(0, Math.round((at - pico) * fps))} layout="none">
        <Audio src={staticFile(`sfx/${n}`)} volume={v} />
      </Sequence>
    ))}
  </>
);
