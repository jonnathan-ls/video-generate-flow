import React from "react";
import { AbsoluteFill, Easing, staticFile, useCurrentFrame } from "remotion";
import { COLOR, Cam, Clip, Efectos, FiltroMovimiento, Foto, H, Iris, L, Linea, Antetitulo, Mundo, Particulas, Textura, V3, VAIVEN, SALE, W, barrido, clipSrc, fotograma, lin, pend, proyecta, tiembla, useFuentes, usarMovimiento } from "../motor/collage";

/* EJEMPLO · «Mary Anderson y el limpiaparabrisas» (10 s, 1080x1920, 60 fps).
   Es la prueba del vídeo de YouTube, hecha con el motor. Sirve de modelo para escribir escenas nuevas.
   Imágenes (Nano Banana 2.1 en Google Flow, recortadas): public/img/calle.jpg, mesa.jpg, 06_farola.png,
   04_boceto_patente.png y 04_boceto_blanco.png. Clips (Omni 1.1 Flash en Flow, recortados): public/clips/tranvia (96) y public/clips/mujer (111).
   1) La calle nevada en 3D; el tranvía llega por las vías; la cámara se mete en el hueco que limpia el conductor y el hueco se abre en IRIS.
   2) Ella, en el tranvía; la luz de las farolas le cruza la cara; el marco de la ventana pasa por delante (BARRIDO).
   3) La hoja cae sobre la mesa y el dibujo aparece barrido en arco, como un limpiaparabrisas. */

export const EJ_FPS = 60;
export const EJ_DUR = 600;
const IRIS0 = 3.4, T2 = 3.82;   // el hueco del cristal se abre y la escena 1 se va
const BARRA = 6.42, T3 = 6.7;   // el marco cruza por delante; en su centro cambia la escena

/* =====================================================================================================
   ESCENA 1 · la calle
   ===================================================================================================== */
const CALLE = { w: 3600, h: 3600 * (2752 / 1536) };
const CALLE_Y = -(0.53 - 0.5) * CALLE.h;              // el horizonte de la foto cae en y = 0
const SUELO = 700;                                     // altura de la cámara sobre la nieve
const TR = { w: 1300 * (656 / 757), h: 1300 };         // tranvía (clip de Flow, 96 fotogramas)
const TR_X = 60;
const tranviaZ = (t: number) => lin(t, 0, 3.3, 2400, 820, Easing.bezier(0.25, 0.1, 0.3, 1));
const LIMPIO = (t: number): V3 => [TR_X - TR.w / 2 + 0.53 * TR.w, SUELO - TR.h + 0.38 * TR.h, tranviaZ(t)];
const FAROLA = { w: 1750 * (382 / 2604), h: 1750 };

const cam1 = (t: number): Cam => {
  const P = LIMPIO(t);
  const lanza = Math.pow(lin(t, 2.8, T2, 0, 1), 1.6);
  const base = { x: 0, y: -10, z: lin(t, 0, 2.7, -260, 220, Easing.bezier(0.33, 0, 0.2, 1)) };
  const j = tiembla(t);
  return {
    x: base.x + (P[0] - base.x) * lanza + j.x,
    y: base.y + (P[1] - base.y) * lanza + j.y,
    z: base.z + (P[2] + 1200 - base.z) * lanza,                 // el ojo va 1500 por detrás: para meterse en el cristal hay que pasarlo
    giro: pend(t, 0, -6, 3.2, 1.6) + 9 * lanza * lanza,
    fd: tranviaZ(t) - 30, ap: 0.55,
  };
};

const Escena1: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const z = tranviaZ(t);
  const faro = 0.75 + 0.25 * Math.sin(t * 9) * Math.sin(t * 5.3);
  return (
    <Mundo cam={cam}>
      <L p={[-CALLE.w / 2, CALLE_Y - CALLE.h / 2, 2600]}><Foto src="img/calle.jpg" w={CALLE.w} h={CALLE.h} /></L>
      <Particulas t={t} n={70} semilla="nl" caja={[2600, 2600, 500]} centro={[0, 0, 1900]} caida={170} viento={-60} color="rgba(236,242,246,A)" tam={12} />
      <L p={[TR_X - TR.w / 2, SUELO - TR.h, z]}>
        <div style={{ position: "absolute", left: 0, top: 0, width: TR.w, height: TR.h }}>
          {/* sombra en la nieve */}
          <div style={{ position: "absolute", left: TR.w * 0.02, top: TR.h * 0.9, width: TR.w * 1.0, height: TR.h * 0.16, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(10,14,20,0.55), rgba(10,14,20,0))", filter: "blur(8px)" }} />
          <Clip nombre="tranvia" n={96} t={t} t0={0} w={TR.w} h={TR.h} style={{ filter: "saturate(0.85) contrast(1.06)" }} />
          {/* el faro calienta la nieve y el aire */}
          <div style={{ position: "absolute", left: TR.w * 0.77 - 520, top: TR.h * 0.67 - 520, width: 1040, height: 1040, borderRadius: "50%", mixBlendMode: "screen", opacity: faro, background: "radial-gradient(closest-side, rgba(255,196,110,0.7) 0%, rgba(255,170,80,0.22) 30%, rgba(255,160,70,0) 100%)" }} />
        </div>
      </L>
      {([[700, 560, 1.7]] as [number, number, number][]).map(([x, z, k]) => (
        <L key={x} p={[x - FAROLA.w / 2, SUELO + 60 - FAROLA.h, z]}>
          <Foto src="img/06_farola.png" w={FAROLA.w} h={FAROLA.h} style={{ filter: "brightness(0.8) contrast(1.05)" }} />
          <div style={{ position: "absolute", left: FAROLA.w / 2 - 330, top: FAROLA.h * 0.065 - 330, width: 660, height: 660, borderRadius: "50%", mixBlendMode: "screen", opacity: 0.8 + 0.12 * Math.sin(t * 7 + k), background: "radial-gradient(closest-side, rgba(255,200,120,0.75) 0%, rgba(255,170,80,0.2) 32%, rgba(255,160,70,0) 100%)" }} />
        </L>
      ))}
      <Particulas t={t} n={46} semilla="nm" caja={[1500, 1700, 500]} centro={[0, 0, 700]} caida={210} viento={-80} color="rgba(240,245,248,A)" tam={14} />
      <Particulas t={t} n={10} semilla="nc" caja={[800, 1100, 200]} centro={[0, 0, -50]} caida={260} viento={-110} color="rgba(245,248,250,A)" tam={20} luz={0.75} />
    </Mundo>
  );
};

/* =====================================================================================================
   ESCENA 2 · ella
   ===================================================================================================== */
const MU = { w: 1980 * (631 / 1110), h: 1980 };         // ella (clip de Flow, 111 fotogramas)
const MU_T0 = 3.3;
const cam2 = (t: number): Cam => {
  const u = t - T2 + 0.47;                                 // empieza a moverse ya dentro del iris
  const j = tiembla(t + 4);
  return { x: lin(u, 0, 3.5, -90, 50, Easing.bezier(0.3, 0, 0.3, 1)) + j.x, y: -20 + j.y, z: -240 + 170 * lin(u, 0, 3.4, 0, 1, Easing.bezier(0.25, 0.1, 0.25, 1)), giro: pend(t, T2 - 0.2, 4, 4.5, 2.2), fd: 0, ap: 0.75 };
};
const Escena2: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const respira = 1 + 0.005 * Math.sin((t - T2) * 2.1);
  const fr = clipSrc("mujer", fotograma(t, MU_T0, 111));
  /* el tranvía avanza: la luz de cada farola le cruza la cara de derecha a izquierda */
  const pasa = ((t - 3.6) / 1.45) % 1, barre = 130 - 190 * pasa;
  return (
    <Mundo cam={cam}>
      {/* la ciudad por la ventana: lejos, oscura y fuera de foco */}
      <L p={[-CALLE.w * 0.7, -CALLE.h * 0.55, 2400]} mas={6}><Foto src="img/calle.jpg" w={CALLE.w * 1.4} h={CALLE.h * 1.4} style={{ filter: "brightness(0.55) saturate(0.8)" }} /></L>
      <Particulas t={t} n={18} semilla="farolas" caja={[1700, 900, 300]} centro={[0, -200, 1700]} caida={0} viento={-70} color="rgba(255,190,110,A)" tam={30} luz={0.8} />
      <Particulas t={t} n={40} semilla="n2" caja={[1800, 1800, 300]} centro={[0, 0, 1300]} caida={150} viento={-70} color="rgba(235,240,245,A)" tam={9} luz={0.8} />
      <L p={[-610, -470, 0]}>
        <div style={{ position: "absolute", left: 0, top: 0, width: MU.w, height: MU.h, transform: `scale(${respira})`, transformOrigin: "50% 100%" }}>
          <Foto src={fr} w={MU.w} h={MU.h} style={{ filter: "contrast(1.04) saturate(0.9) drop-shadow(-30px 40px 60px rgba(0,0,0,0.55))" }} />
          {/* luz cálida de farola por la derecha, une la figura con la ciudad */}
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.55, WebkitMaskImage: `url(${staticFile(fr)})`, WebkitMaskSize: "100% 100%", background: "linear-gradient(270deg, rgba(255,170,90,0.55) 0%, rgba(255,170,90,0) 38%)" }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", WebkitMaskImage: `url(${staticFile(fr)})`, WebkitMaskSize: "100% 100%", background: `linear-gradient(100deg, rgba(255,180,100,0) ${(barre - 26).toFixed(1)}%, rgba(255,186,110,0.34) ${barre.toFixed(1)}%, rgba(255,180,100,0) ${(barre + 26).toFixed(1)}%)` }} />
        </div>
      </L>
      <Particulas t={t} n={8} semilla="n2c" caja={[900, 1100, 150]} centro={[0, 0, -400]} caida={190} viento={-90} color="rgba(245,248,250,A)" tam={16} luz={0.55} />
    </Mundo>
  );
};

/* =====================================================================================================
   ESCENA 3 · la patente
   ===================================================================================================== */
const PA = { w: 1180 * (1410 / 2206), h: 1180 };
const PIVOTE = { x: 0.4, y: 0.52 };                     // el eje del limpiaparabrisas en el dibujo
const cam3 = (t: number): Cam => {
  const u = t - T3;
  const j = tiembla(t + 9);
  return { x: -18 + 30 * lin(u, 0, 3.3, 0, 1) + j.x, y: -60 + j.y, z: -260 + 120 * lin(u, 0, 3.3, 0, 1, Easing.bezier(0.25, 0.1, 0.25, 1)), giro: pend(t, T3 - 0.1, -7, 5, 2.4), fd: 0, ap: 0.6 };
};
const Escena3: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const u = t - T3;
  const cae = lin(u, -0.15, 0.75, 0, 1, SALE);
  const z = (1 - cae) * 1400, giro = -4 + pend(u, 0.0, -26, 6, 3.4) * (cae > 0 ? 1 : 1);
  const inclina = (1 - cae) * 38;
  const barrido = lin(t, 7.35, 8.75, 0, 360, VAIVEN);
  const escobilla = lin(t, 7.3, 7.45, 0, 1) * lin(t, 8.7, 8.95, 1, 0);
  const tinta = `conic-gradient(from 200deg at ${PIVOTE.x * 100}% ${PIVOTE.y * 100}%, #000 0deg, #000 ${barrido.toFixed(2)}deg, transparent ${(barrido + 0.6).toFixed(2)}deg)`;
  return (
    <Mundo cam={cam}>
      {/* mesa: madera oscura con la luz de un flexo */}
      <L p={[-1700, -2400, 900]}>
        <Foto src="img/mesa.jpg" w={3400} h={3400 * (2752 / 1536)} style={{ top: -300, filter: "brightness(0.92) saturate(0.95)" }} />
      </L>
      <Particulas t={t} n={34} semilla="p3" caja={[1300, 1600, 400]} centro={[0, 0, 500]} caida={-14} viento={12} color="rgba(255,214,150,A)" tam={6} luz={0.65} />
      <L p={[-PA.w / 2 + 10, -PA.h / 2 + 140, z]}>
        <div style={{ position: "absolute", left: 0, top: 0, width: PA.w, height: PA.h, transform: `rotateX(${inclina.toFixed(2)}deg) rotate(${giro.toFixed(2)}deg)`, transformOrigin: "50% 40%" }}>
          <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(${(18 + 30 * (1 - cae)).toFixed(0)}px ${(40 + 80 * (1 - cae)).toFixed(0)}px ${(40 + 50 * (1 - cae)).toFixed(0)}px rgba(0,0,0,0.6))` }}>
            <Foto src="img/04_boceto_blanco.png" w={PA.w} h={PA.h} />
          </div>
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: tinta, maskImage: tinta }}>
            <Foto src="img/04_boceto_patente.png" w={PA.w} h={PA.h} />
          </div>
          {/* la escobilla que va dibujando */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 10 }}><div style={{ position: "absolute", left: PIVOTE.x * PA.w, top: PIVOTE.y * PA.h, width: PA.h * 1.25, height: 9, marginTop: -4.5, borderRadius: 5, background: `linear-gradient(90deg, ${COLOR.tinta} 0%, rgba(27,20,15,0.85) 70%, rgba(27,20,15,0) 100%)`, transformOrigin: "0 50%", transform: `rotate(${(200 - 90 + barrido).toFixed(2)}deg)`, opacity: escobilla, filter: "blur(0.5px)", boxShadow: "0 6px 12px rgba(0,0,0,0.3)" }} /></div>
          <div style={{ position: "absolute", left: PIVOTE.x * PA.w - 9, top: PIVOTE.y * PA.h - 9, width: 18, height: 18, borderRadius: "50%", background: COLOR.tinta, opacity: escobilla }} />
          {/* luz del flexo sobre el papel */}
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", background: "radial-gradient(70% 55% at 55% 35%, rgba(255,220,160,0.45), rgba(0,0,0,0.25))" }} />
        </div>
      </L>
    </Mundo>
  );
};


export const Ejemplo: React.FC = () => {
  useFuentes();
  const t = useCurrentFrame() / EJ_FPS;
  const c1 = cam1(t), c2 = cam2(t), c3 = cam3(t);
  const escena = t < T2 ? 1 : t < T3 ? 2 : 3;
  const cam = escena === 1 ? c1 : escena === 2 ? c2 : c3;
  const antes = (escena === 1 ? cam1 : escena === 2 ? cam2 : cam3)(t - 1 / 30);
  const { bx, by } = usarMovimiento(cam, antes);
  const marco = barrido(t, BARRA);
  return (
    <AbsoluteFill style={{ background: COLOR.noche, overflow: "hidden" }}>
      <FiltroMovimiento t={t} bx={bx} by={by}>
        {t < T2 ? <Escena1 t={t} cam={c1} /> : null}
        {t < T3 + 0.05 ? <Iris t={t} desde={IRIS0} hasta={T2} centro={proyecta(LIMPIO(t), c1)}><Escena2 t={t} cam={c2} /></Iris> : null}
        {t >= T3 - 0.05 ? marco.destapa(<Escena3 t={t} cam={c3} />) : null}
      </FiltroMovimiento>
      {marco.tapa}
      {t < T2 ? (
        <div style={{ position: "absolute", left: 92, top: 300, width: 900 }}>
          <Antetitulo t={t} at={0.35} txt="Invierno" sale={2.95} />
          <Linea t={t} at={0.55} tam={128} sale={2.95} trozos={[{ txt: "Nueva York," }, { txt: "1902", serif: true, color: COLOR.ambar }]} />
        </div>
      ) : null}
      {t > T2 && t < T3 + 0.1 ? (
        <div style={{ position: "absolute", left: 92, top: 250, width: 900 }}>
          <Linea t={t} at={T2 + 0.25} tam={104} sale={BARRA - 0.05} trozos={[{ txt: "Una mujer vio" }]} />
          <Linea t={t} at={T2 + 0.48} tam={104} sale={BARRA} trozos={[{ txt: "lo que nadie" }]} />
          <Linea t={t} at={T2 + 0.72} tam={104} sale={BARRA + 0.05} trozos={[{ txt: "miraba.", serif: true }]} />
        </div>
      ) : null}
      {t > T3 ? (
        <div style={{ position: "absolute", left: 92, top: 236, width: 920 }}>
          <Antetitulo t={t} at={T3 + 0.55} txt="Mary Anderson · patente de 1903" />
          <Linea t={t} at={T3 + 0.75} tam={104} trozos={[{ txt: "Y dibujó el" }]} />
          <Linea t={t} at={T3 + 0.98} tam={104} trozos={[{ txt: "limpiaparabrisas.", serif: true, color: COLOR.lima }]} />
        </div>
      ) : null}
      <Textura t={t} />
      <Efectos fps={EJ_FPS} lista={[["riser.wav", 3.3, 0.22, 1.04], ["sw_a.wav", 3.55, 0.34, 0.41], ["sw_b.wav", 6.62, 0.32, 0.25], ["papel.wav", 7.38, 0.34, 0.16]]} />
    </AbsoluteFill>
  );
};
