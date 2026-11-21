import React from "react";
import { AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame } from "remotion";
import { COLOR, Cam, Foto, H, L, Linea, Antetitulo, Mundo, Particulas, Textura, W, FiltroMovimiento, SALE, ENTRA, VAIVEN, barrido, lin, pend, tiembla, useFuentes, usarMovimiento } from "./motor/collage";

/* A queda de Saigon · 15 s · 1920x1080 · 30 fps · estilo Archivo · kit director-de-collage */
export const FPS = 30;
export const DURACION = 15 * FPS;

const PERS = 1500;
const B1 = 4.62, B2 = 8.52, B3 = 12.52, DB = 0.56;   // início de cada barrido; o corte cai 0,28 s depois
const S2 = B1 + DB / 2, S3 = B2 + DB / 2, S4 = B3 + DB / 2;

/* fundo à profundidade z, cobrindo a tela com 15% de margem */
const Bg: React.FC<{ src: string; z: number; cx?: number; cy?: number; style?: React.CSSProperties }> = ({ src, z, cx = 0, cy = 0, style }) => {
  const w = W * ((PERS + z) / PERS) * 1.15, h = w * 9 / 16;
  return <L p={[cx - w / 2, cy - h / 2, z]}><Foto src={src} w={w} h={h} style={style} /></L>;
};
/* objeto com os pés em y (mundo) e centro em x */
const Obj: React.FC<{ src: string; ar: number; w: number; x: number; yFeet: number; z: number; style?: React.CSSProperties; box?: React.CSSProperties; children?: React.ReactNode }> = ({ src, ar, w, x, yFeet, z, style, box, children }) => {
  const h = w / ar;
  return (
    <L p={[x - w / 2, yFeet - h, z]}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "50% 100%", ...box }}>
        <Foto src={src} w={w} h={h} style={style} />
        {children}
      </div>
    </L>
  );
};
const sombra = (w: number, yFeet: number, x: number, z: number, op = 0.55) => (
  <L p={[x - w / 2, yFeet - w * 0.07, z]}>
    <div style={{ width: w, height: w * 0.14, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(8,8,10,${op}), rgba(8,8,10,0))` }} />
  </L>
);

/* ===================== CENA 1 · telhado, 29 de abril (0 – 4,9 s) ===================== */
const HC1 = 330;                                   // altura do chão do telhado no mundo
const HELI = { w: 1250, ar: 1284 / 382, z: 300 };
const heliPos = (t: number) => {
  const pouso = lin(t, 0, 1.4, 0, 1, Easing.bezier(0.2, 0.6, 0.3, 1));
  const sobe = lin(t, 3.48, 5.0, 0, 1, Easing.bezier(0.5, 0, 0.8, 0.5));
  const vib = (1 - sobe * 0.6) * (t > 1.3 ? 1 : 0.4);
  return {
    x: 120 + (1 - pouso) * 700 + sobe * 1200,
    y: HC1 - (1 - pouso) * 360 - sobe * 900 + 3 * vib * Math.sin(t * 53) + 2 * Math.sin(t * 31),
    z: HELI.z + sobe * 900,
    sobe, pouso,
  };
};
const cam1 = (t: number): Cam => {
  const j = tiembla(t);
  return { x: lin(t, 0, 4.9, -40, 80) + j.x, y: -10 + j.y, z: lin(t, 0, 4.9, -80, 160, Easing.bezier(0.33, 0, 0.3, 1)), giro: pend(t, 0, -2.5, 3, 1.8), fd: 300, ap: 0.28 };
};
const Escena1: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const p = heliPos(t);
  const poeira = Math.max(lin(t, 0.4, 1.4, 0.2, 1) * lin(t, 1.4, 2.2, 1, 0.3), lin(t, 3.4, 3.9, 0, 1) * lin(t, 3.9, 4.9, 1, 0.2));
  const escx = lin(t, 1.3, 2.0, 1, 0, SALE);
  return (
    <Mundo cam={cam}>
      <Bg src="img/telhado.jpg" z={1200} cy={-40} style={{ filter: "saturate(0.9) contrast(1.05)" }} />
      <Particulas t={t} n={50} semilla="p1" caja={[1800, 700, 500]} centro={[0, 120, 900]} caida={-30} viento={-90} color="rgba(255,205,140,A)" tam={9} luz={0.6} />
      {sombra(HELI.w * 0.8, HC1 + 8, p.x, p.z, 0.5 * (1 - p.sobe) * p.pouso)}
      {/* escada com as pessoas: chega com o helicóptero e fica no teto */}
      <Obj src="img/escada.png" ar={993 / 663} w={760} x={-180 + escx * 800} yFeet={HC1 + 40} z={260}
        box={{ transform: `translateY(${(2.5 * Math.sin(t * 5)).toFixed(1)}px)`, opacity: lin(t, 1.0, 1.5, 0, 1) }}
        style={{ filter: "brightness(0.92) contrast(1.05)" }} />
      <Obj src="img/heli.png" ar={HELI.ar} w={HELI.w} x={p.x} yFeet={p.y} z={p.z}
        box={{ transform: `rotate(${(-p.sobe * 7 + 0.5 * Math.sin(t * 40)).toFixed(2)}deg)` }}
        style={{ filter: "contrast(1.05) saturate(0.9) drop-shadow(-24px 30px 40px rgba(0,0,0,0.5))" }} />
      <Particulas t={t} n={26} semilla="po" caja={[1500, 260, 300]} centro={[100, HC1 - 120, 300]} caida={-160} viento={260 * poeira} color="rgba(200,170,130,A)" tam={34} luz={0.75 * poeira} />
    </Mundo>
  );
};

/* ===================== CENA 2 · avenida e palácio, 30 de abril (4,9 – 8,8 s) ===================== */
const HC2 = 210;
const GATE = { w: 1800, ar: 1289 / 693, z: 1500 };
const tankZ = (t: number) => t < 7.96 ? lin(t, 4.7, 7.96, 2150, 1520, Easing.bezier(0.3, 0.1, 0.8, 0.8)) : lin(t, 7.96, 9.0, 1520, 1000, Easing.bezier(0.2, 0.4, 0.5, 1));
const cam2 = (t: number): Cam => {
  const j = tiembla(t + 4);
  const choque = t > 7.96 ? Math.exp(-(t - 7.96) * 6) * 14 * Math.sin((t - 7.96) * 60) : 0;
  return { x: lin(t, 4.7, 8.8, -90, 40, VAIVEN) + j.x + choque, y: -30 + j.y + choque * 0.8, z: lin(t, 4.7, 8.8, -150, 480, Easing.bezier(0.25, 0.1, 0.3, 1)), giro: pend(t, 4.7, 2.2, 3, 1.8), fd: 1500, ap: 0.2 };
};
const Escena2: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const cai = lin(t, 7.96, 8.45, 0, 1, Easing.bezier(0.5, 0, 0.9, 0.6));
  const tz = tankZ(t);
  const poeira = lin(t, 7.9, 8.2, 0, 1) * lin(t, 8.2, 9.0, 1, 0.1);
  return (
    <Mundo cam={cam}>
      <Bg src="img/avenida.jpg" z={1800} style={{ filter: "saturate(0.9) contrast(1.05)" }} />
      <Particulas t={t} n={40} semilla="p2" caja={[1800, 600, 500]} centro={[0, 0, 1300]} caida={-25} viento={-70} color="rgba(255,215,160,A)" tam={9} luz={0.55} />
      {sombra(GATE.w, HC2 + 6, 0, GATE.z, 0.4 * (1 - cai))}
      <Obj src="img/portao.png" ar={GATE.ar} w={GATE.w} x={0} yFeet={HC2} z={GATE.z}
        box={{ transform: `scaleY(${(1 - 0.92 * cai).toFixed(3)}) skewX(${(cai * 4).toFixed(2)}deg)`, opacity: 1 - 0.5 * cai * cai }}
        style={{ filter: "brightness(0.9) contrast(1.05)" }} />
      {sombra(1500 * 0.8, HC2 + 8, 0, tz, 0.55)}
      <Obj src="img/tanque.png" ar={1022 / 652} w={1500} x={(tz - 1500) * -0.05} yFeet={HC2 + Math.max(0, 1520 - tz) * 0.5 + 2 * Math.sin(t * 38)} z={tz}
        box={{ transform: `rotate(${(0.35 * Math.sin(t * 22)).toFixed(2)}deg)` }}
        style={{ filter: "contrast(1.05) saturate(0.9) drop-shadow(-18px 24px 30px rgba(0,0,0,0.5))" }} />
      <Particulas t={t} n={34} semilla="pd" caja={[1100, 280, 260]} centro={[0, HC2 - 160, GATE.z - 100]} caida={-120} viento={90 * poeira} color="rgba(205,180,140,A)" tam={50} luz={0.8 * poeira} />
    </Mundo>
  );
};

/* ===================== CENA 3 · o presidente do Sul (8,8 – 12,8 s) ===================== */
const cam3 = (t: number): Cam => {
  const j = tiembla(t + 9);
  return { x: lin(t, 8.5, 12.8, 40, -30) + j.x, y: -20 + j.y, z: lin(t, 8.5, 12.8, -150, 260, Easing.bezier(0.25, 0.1, 0.25, 1)), giro: pend(t, 8.5, -2.4, 3, 1.8), fd: 500, ap: 0.3 };
};
const Escena3: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const respira = 1 + 0.006 * Math.sin(t * 2.1);
  return (
    <Mundo cam={cam}>
      <Bg src="img/gabinete.jpg" z={1600} style={{ filter: "brightness(0.8) saturate(0.85)" }} />
      <Particulas t={t} n={50} semilla="p3" caja={[1600, 700, 500]} centro={[0, 0, 900]} caida={-16} viento={14} color="rgba(255,214,150,A)" tam={7} luz={0.55} />
      {sombra(500, 560, 330, 500, 0.5)}
      <Obj src="img/minh.png" ar={400 / 686} w={640} x={330} yFeet={560} z={500}
        box={{ transform: `scale(${respira})` }}
        style={{ filter: "brightness(0.9) contrast(1.05) drop-shadow(-30px 30px 40px rgba(0,0,0,0.55))" }} />
    </Mundo>
  );
};

/* ===================== CENA 4 · armas no chão (12,8 – 15 s) ===================== */
const cam4 = (t: number): Cam => {
  const j = tiembla(t + 14);
  return { x: lin(t, 12.5, 15, -30, 20) + j.x, y: -10 + j.y, z: lin(t, 12.5, 15, -120, 100, Easing.bezier(0.25, 0.1, 0.25, 1)), giro: pend(t, 12.5, 2, 3, 1.8), fd: 700, ap: 0.25 };
};
const Escena4: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const baixa = lin(t, 13.8, 14.6, 0, 1, VAIVEN);
  const queda = lin(t, 14.0, 14.55, 0, 1, Easing.bezier(0.5, 0, 0.9, 0.7));
  return (
    <Mundo cam={cam}>
      <Bg src="img/patio.jpg" z={1800} style={{ filter: "saturate(0.9) contrast(1.05)" }} />
      <Particulas t={t} n={40} semilla="p4" caja={[1800, 600, 500]} centro={[0, 0, 1200]} caida={-20} viento={-60} color="rgba(255,205,140,A)" tam={9} luz={0.5} />
      {sombra(1500, 440, 0, 700, 0.5)}
      <Obj src="img/soldados.png" ar={1263 / 633} w={1700} x={0} yFeet={440} z={700}
        box={{ transform: `scaleY(${(1 - 0.06 * baixa).toFixed(3)}) rotate(${(1.2 * baixa).toFixed(2)}deg)` }}
        style={{ filter: "brightness(0.85) contrast(1.08) saturate(0.9) drop-shadow(-20px 24px 30px rgba(0,0,0,0.5))" }} />
      <Obj src="img/fuzis.png" ar={927 / 506} w={520} x={30} yFeet={470 - (1 - queda) * 330} z={560}
        box={{ opacity: lin(t, 13.95, 14.1, 0, 1) }}
        style={{ filter: "brightness(0.85) contrast(1.05) drop-shadow(-10px 14px 20px rgba(0,0,0,0.5))" }} />
    </Mundo>
  );
};

/* ===================== textos ===================== */
const TOP = { position: "absolute" as const, left: 110, top: 96, width: 1100 };

export const Collage: React.FC = () => {
  useFuentes();
  const f = useCurrentFrame();
  const t = f / FPS;
  const [m1, m2, m3] = [barrido(t, B1, DB), barrido(t, B2, DB), barrido(t, B3, DB)];
  const cams = [cam1, cam2, cam3, cam4];
  const esc = t < S2 ? 0 : t < S3 ? 1 : t < S4 ? 2 : 3;
  const cam = cams[esc](t), antes = cams[esc](t - 1 / 30);
  const { bx, by } = usarMovimiento(cam, antes);
  const flash = Math.max(0, 1 - Math.abs(t - 8.0) / 0.12) * 0.35;
  const contador = t < 12.06 ? (t < 11.75 ? 0 : 1) : 2;
  const pop = lin(t, 12.06, 12.3, 1.4, 1, SALE);
  const fade = lin(t, 0, 0.35, 1, 0) + lin(t, 14.45, 15.0, 0, 1);
  return (
    <AbsoluteFill style={{ background: COLOR.noche, overflow: "hidden" }}>
      <Audio src={staticFile("voz/narracao.wav")} />
      <FiltroMovimiento t={t} bx={bx} by={by}>
        {t < B1 + DB ? <Escena1 t={t} cam={cam1(t)} /> : null}
        {t >= B1 - 0.05 && t < B2 + DB ? m1.destapa(<Escena2 t={t} cam={cam2(t)} />) : null}
        {t >= B2 - 0.05 && t < B3 + DB ? m2.destapa(<Escena3 t={t} cam={cam3(t)} />) : null}
        {t >= B3 - 0.05 ? m3.destapa(<Escena4 t={t} cam={cam4(t)} />) : null}
      </FiltroMovimiento>
      {m1.tapa}{m2.tapa}{m3.tapa}
      {/* flash do portão caindo */}
      <AbsoluteFill style={{ background: "#FFD9A0", mixBlendMode: "screen", opacity: flash }} />

      {t < S2 ? (
        <div style={TOP}>
          <Antetitulo t={t} at={0.3} txt="Saigon" sale={4.3} />
          <Linea t={t} at={0.45} tam={120} sale={4.3} trozos={[{ txt: "29 de" }, { txt: "abril", serif: true, color: COLOR.ambar }]} />
        </div>
      ) : null}
      {t >= S2 && t < S3 ? (
        <div style={TOP}>
          <Antetitulo t={t} at={S2 + 0.05} txt="Palácio presidencial" sale={8.35} />
          <Linea t={t} at={S2 + 0.2} tam={120} sale={8.35} trozos={[{ txt: "30 de" }, { txt: "abril", serif: true, color: COLOR.ambar }]} />
        </div>
      ) : null}
      {t >= S3 && t < S4 ? (
        <div style={TOP}>
          <Antetitulo t={t} at={9.55} txt="Presidente do Sul" sale={11.95} />
          <Linea t={t} at={9.7} tam={112} sale={12.0} trozos={[{ txt: "Duong Van Minh" }]} />
          {t >= 11.75 ? (
            <div style={{ position: "absolute", left: 0, top: 200, display: "flex", alignItems: "baseline", gap: 26, opacity: lin(t, 11.75, 11.9, 0, 1) }}>
              <div key={contador} style={{ fontFamily: "CursivaVDLT", fontStyle: "italic", fontSize: 230, lineHeight: 1, color: COLOR.ambar, transform: `scale(${contador === 2 ? pop : 1})`, transformOrigin: "0 80%", textShadow: "0 3px 34px rgba(0,0,0,0.5)" }}>{contador}</div>
              <div style={{ fontFamily: "TitularVDLT", fontWeight: 560, fontStretch: "82%", fontSize: 84, letterSpacing: "-0.025em", color: COLOR.crema, textShadow: "0 3px 34px rgba(0,0,0,0.5)" }}>{contador === 1 ? "dia" : "dias"} no cargo</div>
            </div>
          ) : null}
        </div>
      ) : null}
      {t >= S4 ? (
        <div style={TOP}>
          <Linea t={t} at={13.0} tam={120} trozos={[{ txt: "Deporem" }, { txt: "as" }]} />
          <Linea t={t} at={13.8} tam={120} trozos={[{ txt: "armas", serif: true, color: COLOR.lima }]} />
        </div>
      ) : null}
      <Textura t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.min(1, fade) }} />
    </AbsoluteFill>
  );
};
