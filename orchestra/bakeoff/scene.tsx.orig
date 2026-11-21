// Cena com objetos animados: fundo (imagem do Flow) + atores recortados (PNG com alfa) que se movem no tempo da fala + efeitos (explosão, fogo, apagão).
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, E, F, clamp} from '../lacre/tokens';
import {LightRays, Particles} from '../lacre/layers';

const FPS = 30;
export type Actor = {
	src: string;
	from: [number, number]; // posição do pé/base (% da largura, % da altura)
	to?: [number, number];
	h: number; // altura do ator em % da altura do quadro
	t0_s?: number; // início do movimento (tempo da cena)
	t1_s?: number; // fim do movimento
	ease?: 'inout' | 'out' | 'linear';
	bob?: number; // balanço vertical (px)
	rock?: number; // balanço angular (graus)
	period?: number; // período do balanço (quadros)
	slices?: number; // fatias independentes (coluna de soldados marchando)
	ar?: number; // largura/altura da imagem (necessário com slices)
	flip?: boolean;
	wake?: boolean; // espuma na linha d'água
	smoke?: [number, number]; // origem da fumaça em % do ator (x, y a partir do topo)
	appear_s?: number;
	scale1?: number; // escala final (aproximação)
	sink?: number; // fração da altura escondida sob a água (casco)
	land?: boolean; // chega à praia em t1_s (som de encalhe)
	tint?: string; // filtro CSS extra (ex.: dessaturar casco)
	path?: [number, number][]; // trajeto por pontos (substitui from→to; from = 1º ponto)
	path_s?: number[]; // tempo (s, da cena) de cada ponto do trajeto: pausas e idas e voltas com tempo próprio (easing inOut por trecho)
	gait?: number; // com slices: passada das pernas (graus de inclinação; 0 = sem passada). Padrão 9
	legs?: number; // fração inferior da altura que são pernas (padrão 0.42)
	wave?: number; // com slices: bandeira tremulando (amplitude px) em vez de passos
	blend?: 'screen' | 'multiply'; // fogo/explosão do Flow sobre preto → 'screen'
	grow?: [number, number]; // escala de appear_s até t1_s (ex.: [0.3, 1.2] explosão)
	fade_s?: number; // começa a sumir neste tempo (0,6 s)
	hide_s?: number; // some de vez neste tempo (bomba que atinge o chão)
	rotor?: [number, number, number]; // hélice/rotor: centro x,y (% do ator) e largura (% do ator)
	emit?: {at: [number, number]; color?: string; dir?: [number, number]; from_s?: number; to_s?: number; size?: number; rate?: number}; // rastro: fumaça, borrifo, poeira (dir em % da altura do ator por ciclo)
	depth?: number; // parallax: 1 = plano do fundo; >1 mais perto (move mais com o pan da cena)
	rot?: [number, number]; // rotação ao longo do trajeto (graus)
	opacity?: number;
	frames?: string[]; // ciclo de caminhada: poses do mesmo personagem (mesma escala, alinhadas pela base); trocam só enquanto anda
	frame_fps?: number; // poses por segundo (padrão 7)
	frame_phase?: number; // deslocamento do ciclo (em poses), para cada pessoa da coluna pisar em tempo diferente
	flag?: {amp?: number; len?: number; speed?: number; strips?: number; pole?: number; pole_w?: number}; // bandeira contínua: faixas finas, borda do mastro fixa; pole = mastro (% da altura da tela) abaixo da bandeira
	tilt?: number; // papel deitado na mesa: rotateX em graus (perspectiva), base fixa
	rope_from?: [number, number]; // cabo do ponto fixo (% da tela, ex.: ponta da lança) até o topo do objeto
	layer?: 'front'; // desenhado depois da camada `front` da cena (na frente do recorte do fundo)
	rope?: boolean; // cabo de guindaste: linha do topo do objeto até o alto da tela
	label?: string; // etiqueta de papel sobre o objeto (pasta: 'EMPRÉSTIMO')
	flicker?: number; // com blend: tremulação de chama (fração da altura)
	sfx?: string; // som do movimento (mixer): steps, water, engine, plane, rotor, crowd, jeep, crane, paper, stamp, thud, flag, none
	note?: string; // motivo narrativo do som (R16)
};
export type Fx =
	| {kind: 'explosion'; x: number; y: number; at_s: number; size?: number}
	| {kind: 'fire'; x: number; y: number; w?: number; from_s?: number}
	| {kind: 'blackout'; at_s: number}
| {kind: 'smoke'; x: number; y: number; from_s?: number; w?: number; color?: string}
	| {kind: 'searchlight'; x: number; y: number; from_s?: number; phase?: number}
| {kind: 'tracers'; x: number; y: number; from_s: number; to_s: number; w?: number}
	| {kind: 'flash'; x: number; y: number; at_s: number; size?: number}
	| {kind: 'typing'; x: number; y: number; w?: number; lines: string[]; from_s: number; to_s: number; size?: number; paper?: boolean}
	| {kind: 'calendar'; x: number; y: number; w?: number; from: number; to: number; from_s: number; to_s: number}
	| {kind: 'dominoes'; x: number; y: number; n?: number; w?: number; fall_s: number; wobble_s?: number; step_s?: number};
export type SceneSpec2 = {front?: string; bg: string; bg2?: string; bg2_at_s?: number; pan?: [number, number]; z0?: number; z1?: number; ox?: string; oy?: string; dx?: number; actors?: Actor[]; fx?: Fx[]; rays?: number; night?: boolean};

const ease = (k: Actor['ease']) => (k === 'linear' ? undefined : k === 'out' ? E.out : E.inOut);

const ActorView: React.FC<{a: Actor; t0: number}> = ({a, t0}) => {
	const f = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const s0 = ((a.t0_s ?? t0) - t0) * FPS;
	const s1 = a.t1_s !== undefined ? (a.t1_s - t0) * FPS : durationInFrames;
	const p = interpolate(f, [s0, Math.max(s0 + 1, s1)], [0, 1], {...clamp, easing: ease(a.ease)});
	const to = a.to ?? a.from;
	let px = a.from[0] + (to[0] - a.from[0]) * p, py = a.from[1] + (to[1] - a.from[1]) * p;
	let pp = p;
	if (a.path && a.path_s && a.path_s.length === a.path.length) {
		const ts = a.path_s.map((t) => (t - t0) * FPS);
		let k = 0;
		while (k < ts.length - 2 && f >= ts[k + 1]) k++;
		const r = interpolate(f, [ts[k], Math.max(ts[k] + 1, ts[k + 1])], [0, 1], {...clamp, easing: E.inOut});
		px = a.path[k][0] + (a.path[k + 1][0] - a.path[k][0]) * r;
		py = a.path[k][1] + (a.path[k + 1][1] - a.path[k][1]) * r;
		pp = f <= ts[0] ? 0 : f >= ts[ts.length - 1] ? 1 : 0.5;
	} else if (a.path && a.path.length > 1) {
		const n = a.path.length - 1, u = Math.min(n - 1e-6, p * n), k = Math.floor(u), r = u - k;
		px = a.path[k][0] + (a.path[k + 1][0] - a.path[k][0]) * r;
		py = a.path[k][1] + (a.path[k + 1][1] - a.path[k][1]) * r;
	}
	const {pan, tt} = React.useContext(PanCtx);
	const dep = (a.depth ?? 1) - 1;
	const x = (px / 100) * width + pan[0] * tt * dep;
	const y = (py / 100) * height + pan[1] * tt * dep;
	const ap = a.appear_s !== undefined ? (a.appear_s - t0) * FPS : s0;
	const g = a.grow ? interpolate(f, [ap, Math.max(ap + 1, s1)], a.grow, {...clamp, easing: E.out}) : 1;
	const sc = (1 + ((a.scale1 ?? 1) - 1) * p) * g;
	const fo = a.fade_s !== undefined ? interpolate(f, [(a.fade_s - t0) * FPS, (a.fade_s - t0) * FPS + 18], [1, 0], clamp) : 1;
	const hid = a.hide_s !== undefined && f >= (a.hide_s - t0) * FPS ? 0 : 1;
	const rot = a.rot ? a.rot[0] + (a.rot[1] - a.rot[0]) * p : 0;
	const per = a.period ?? 40;
	const vis = (a.appear_s !== undefined ? interpolate(f, [(a.appear_s - t0) * FPS, (a.appear_s - t0) * FPS + 10], [0, 1], clamp) : 1) * fo * hid * (a.opacity ?? 1);
	const hpx = (a.h / 100) * height * sc;
	const moving = pp > 0 && pp < 1;
if (a.slices && a.slices >= 1) {
		const n = a.slices;
		const sw = (hpx * (a.ar ?? 2)) / n;
		return (
			<div style={{position: 'absolute', left: x, top: y, translate: '-50% -100%', height: hpx, width: sw * n, opacity: vis, display: 'flex', scale: a.flip ? '-1 1' : undefined}}>
				{Array.from({length: n}).map((_, i) => {
					const ph = i * 1.7;
					if (a.wave) {
						const dy = Math.sin(f / 6 - i * 0.55) * a.wave;
						return (
							<div key={i} style={{height: hpx, width: sw + 1, overflow: 'hidden', flex: 'none', translate: `0px ${dy}px`, filter: `brightness(${1 + Math.cos(f / 6 - i * 0.55) * 0.08})`}}>
								<Img src={staticFile(a.src)} style={{height: hpx, maxWidth: 'none', marginLeft: -i * sw, filter: a.tint}} />
							</div>
						);
					}
					const walking = moving || !a.to;
					const cyc = f / (a.period ? a.period / 6.28 : 5) + ph;
					const step = walking ? Math.abs(Math.sin(cyc)) : 0;
					const lg = a.legs ?? 0.42;
					const sk = walking ? Math.sin(cyc) * (a.gait ?? 9) : 0;
					const im = (clip: string, extra: React.CSSProperties = {}) => (
						<Img src={staticFile(a.src)} style={{position: 'absolute', left: -i * sw, top: 0, height: hpx, maxWidth: 'none', clipPath: clip, filter: `${a.tint ?? ''} drop-shadow(0 10px 14px rgba(0,0,0,0.45))`, ...extra}} />
					);
					return (
						<div key={i} style={{position: 'relative', height: hpx, width: sw, overflow: 'hidden', flex: 'none', translate: `0px ${-step * (a.bob ?? 3)}px`, rotate: `${walking ? Math.sin(cyc) * (a.rock ?? 1.2) : 0}deg`, transformOrigin: '50% 100%'}}>
							{(a.gait ?? 9) > 0 ? (
								<>
									{im(`inset(0 0 ${lg * 100 - 1}% 0)`)}
									<div style={{position: 'absolute', inset: 0, transformOrigin: `50% ${(1 - lg) * 100}%`, transform: `skewX(${sk}deg)`}}>{im(`inset(${(1 - lg) * 100}% 0 0 0)`)}</div>
								</>
							) : (
								im('none')
							)}
						</div>
					);
				})}
			</div>
		);
	}
	const fl = a.flicker ? 1 + a.flicker * (0.55 * Math.sin(f / 2.3) + 0.45 * Math.sin(f / 3.7 + 1.3)) : 1;
	const nfr = a.frames?.length ?? 0;
	const walkNow = nfr > 0 && moving;
	const fidx = nfr > 0 ? (walkNow ? Math.floor((f / FPS) * (a.frame_fps ?? 7) + (a.frame_phase ?? 0)) % nfr : Math.floor(a.frame_phase ?? 0) % nfr) : 0;
	const src = nfr > 0 ? a.frames![fidx] : a.src;
	const bob = nfr > 0 ? (walkNow && fidx % 2 === 1 ? -(a.bob ?? 2) : 0) : Math.sin((f / per) * Math.PI * 2) * (a.bob ?? 0);
	const rock = nfr > 0 ? 0 : Math.sin((f / per) * Math.PI * 2 + 1) * (a.rock ?? 0);
	const ropeEl = a.rope_from ? (() => {
		const ax = (a.rope_from[0] / 100) * width, ay = (a.rope_from[1] / 100) * height;
		const tx = x, ty = y + bob - hpx * 0.98;
		const len = Math.hypot(tx - ax, ty - ay), ang = (Math.atan2(ty - ay, tx - ax) * 180) / Math.PI;
		return <div style={{position: 'absolute', left: ax, top: ay, width: len, height: 3, transformOrigin: '0 50%', rotate: `${ang}deg`, background: 'rgba(28,26,24,0.9)', opacity: vis}} />;
	})() : null;
	if (a.flag) {
		const fg = a.flag, n = fg.strips ?? 90, W = hpx * (a.ar ?? 1.5), sw = W / n, amp = fg.amp ?? hpx * 0.06, k = (2 * Math.PI) / (fg.len ?? W * 0.6), sp = fg.speed ?? 0.22;
		const pw = fg.pole_w ?? Math.max(4, hpx * 0.03);
		return (
			<div style={{position: 'absolute', left: x - W / 2, top: y - hpx, width: W, height: hpx, opacity: vis}}>
				{fg.pole ? <div style={{position: 'absolute', left: -pw, top: -hpx * 0.06, width: pw, height: hpx * 1.06 + (fg.pole / 100) * height, background: 'linear-gradient(90deg, #5a4a36, #a08a68 45%, #4a3c2c)'}} /> : null}
				{Array.from({length: n}).map((_, i) => {
					const u = i / n, xx = u * W;
					const env = Math.pow(u, 0.85);
					const ph = k * xx - f * sp;
					const dy = amp * env * Math.sin(ph);
					const shade = 1 + 0.16 * env * Math.cos(ph);
					return (
						<div key={i} style={{position: 'absolute', left: xx, top: dy, width: sw + 1.2, height: hpx, overflow: 'hidden'}}>
							<Img src={staticFile(a.src)} style={{position: 'absolute', left: -xx, top: 0, width: W, height: hpx, maxWidth: 'none', filter: `${a.tint ?? ''} brightness(${shade})`}} />
						</div>
					);
				})}
			</div>
		);
	}
	return (
		<>
		{ropeEl}
		<div style={{position: 'absolute', left: x, top: y + bob + hpx * (a.sink ?? 0), translate: '-50% -100%', rotate: `${rock + rot}deg`, transformOrigin: '50% 90%', opacity: vis, mixBlendMode: a.blend, clipPath: a.sink ? `inset(-200% -20% ${a.sink * 100}% -20%)` : undefined}}>
			{a.rope && <div style={{position: 'absolute', left: '50%', bottom: '96%', width: 3, height: 2400, translate: '-50% 0', background: 'linear-gradient(180deg, rgba(30,28,26,0.2), rgba(30,28,26,0.9))'}} />}
			{a.smoke && <Plume xPct={a.smoke[0]} yPct={a.smoke[1]} h={hpx} />}
			{a.emit && <Emit e={a.emit} h={hpx} t0={t0} flip={a.flip} />}
<Img src={staticFile(src)} style={{height: hpx, display: 'block', transformOrigin: '50% 100%', scale: `${a.flip ? -1 : 1} ${fl}`, transform: a.tilt ? `perspective(${hpx * 3}px) rotateX(${a.tilt}deg)` : undefined, filter: a.blend ? `${a.tint ?? ''} brightness(${0.9 + 0.15 * Math.sin(f / 2.1)})` : `${a.tint ?? ''} drop-shadow(0 14px 18px rgba(0,0,0,0.45))`}} />
			{a.rotor && <div style={{position: 'absolute', left: `${(a.flip ? 100 - a.rotor[0] : a.rotor[0])}%`, top: `${a.rotor[1]}%`, width: `${a.rotor[2]}%`, height: hpx * 0.05, translate: '-50% -50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(30,30,30,0.55), rgba(30,30,30,0.15) 60%, rgba(30,30,30,0) 72%)', scale: `${0.85 + 0.15 * Math.abs(Math.sin(f * 1.3))} 1`, filter: 'blur(1.5px)'}} />}
			{a.label && (
				<div style={{position: 'absolute', left: '50%', top: '50%', translate: '-50% -50%', rotate: '-2deg', background: C.paper, padding: `${hpx * 0.04}px ${hpx * 0.1}px`, border: `${Math.max(2, hpx * 0.012)}px solid ${C.ink}`, fontFamily: F.sans, fontWeight: 800, fontSize: Math.max(22, hpx * 0.13), letterSpacing: 3, color: C.ink, whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0,0,0,0.35)'}}>{a.label}</div>
			)}
			{a.wake && <div style={{position: 'absolute', left: '-4%', right: '-4%', bottom: hpx * (a.sink ?? 0) - hpx * 0.06, height: hpx * 0.12, background: 'radial-gradient(ellipse, rgba(8,10,14,0.6) 0%, rgba(8,10,14,0) 70%)'}} />}
			{a.wake && (
				<div style={{position: 'absolute', left: '-2%', right: '-2%', bottom: hpx * (a.sink ?? 0) - hpx * 0.015, height: hpx * 0.035, background: 'linear-gradient(90deg, rgba(250,248,240,0) 0%, rgba(250,248,240,0.9) 12%, rgba(250,248,240,0.55) 50%, rgba(250,248,240,0.85) 88%, rgba(250,248,240,0) 100%)', opacity: moving ? 0.95 : 0.55, filter: 'blur(1.5px)', translate: `${Math.sin(f / 7) * 3}px 0px`}} />
			)}
			{a.wake && moving && (
				<div style={{position: 'absolute', left: a.flip ? '70%' : '-45%', width: '75%', bottom: hpx * (a.sink ?? 0) - hpx * 0.04, height: hpx * 0.07, background: a.flip ? 'linear-gradient(90deg, rgba(250,248,240,0.6), rgba(250,248,240,0))' : 'linear-gradient(270deg, rgba(250,248,240,0.6), rgba(250,248,240,0))', filter: 'blur(3px)', clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)'}} />
			)}
		</div>
		</>
	);
};

const PanCtx = React.createContext<{pan: [number, number]; tt: number}>({pan: [0, 0], tt: 0});

const Emit: React.FC<{e: NonNullable<Actor['emit']>; h: number; t0: number; flip?: boolean}> = ({e, h, t0, flip}) => {
	const f = useCurrentFrame();
	const a = e.from_s !== undefined ? (e.from_s - t0) * FPS : 0;
	const b = e.to_s !== undefined ? (e.to_s - t0) * FPS : 1e9;
	if (f < a) return null;
	const [dx, dy] = e.dir ?? [0.6, -0.9];
	const sz = e.size ?? 1;
	const per = e.rate ?? 60;
	const ax = flip ? 100 - e.at[0] : e.at[0];
	return (
		<div style={{position: 'absolute', left: `${ax}%`, top: `${e.at[1]}%`, width: 0, height: 0}}>
			{Array.from({length: 12}).map((_, i) => {
				const born = Math.floor((f - a) / per - i / 12) * per + (i / 12) * per + a; // quadro em que esta partícula nasceu
				if (born > b) return null;
				const t = ((f - a) / per + i / 12) % 1;
				const r = h * sz * (0.05 + t * 0.2);
				return <div key={i} style={{position: 'absolute', left: (flip ? -dx : dx) * t * h - r, top: dy * t * h - r, width: r * 2, height: r * 2, borderRadius: '50%', background: e.color ?? 'rgba(40,38,40,0.55)', opacity: (t < 0.12 ? 0.6 + t * 3 : Math.sin(Math.PI * (0.12 + t * 0.88))) * 0.85, filter: 'blur(6px)'}} />;
			})}
		</div>
	);
};

const Plume: React.FC<{xPct: number; yPct: number; h: number}> = ({xPct, yPct, h}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', left: `${xPct}%`, top: `${yPct}%`, width: 0, height: 0}}>
			<div style={{position: 'absolute', left: -h * 0.05, top: -h * 0.09, width: h * 0.1, height: h * 0.1, borderRadius: '50%', background: 'rgba(70,66,66,0.55)', filter: 'blur(4px)'}} />
			{Array.from({length: 9}).map((_, i) => {
				const t = (f / 70 + i / 9) % 1;
				const r = h * (0.06 + t * 0.22);
				return <div key={i} style={{position: 'absolute', left: t * h * 0.5 - r, top: -t * h * 0.9 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'rgba(80,76,76,0.4)', opacity: (t < 0.15 ? 0.8 : Math.sin(Math.PI * (0.15 + t * 0.85)) * 0.9) * (1 - t * 0.5) * 0.7, filter: `blur(${6 + t * 10}px)`}} />;
			})}
		</div>
	);
};

const Explosion: React.FC<{x: number; y: number; at: number; size: number}> = ({x, y, at, size}) => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const k = f - at;
	if (k < 0) return null;
	const cx = (x / 100) * width, cy = (y / 100) * height;
	const fire = interpolate(k, [0, 8, 40], [0, 1, 0.25], clamp);
	const R = size * interpolate(k, [0, 14], [0.2, 1], {...clamp, easing: E.out});
	const ring = interpolate(k, [0, 22], [0, size * 2.6], clamp);
	const ringO = interpolate(k, [0, 22], [0.7, 0], clamp);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{Array.from({length: 14}).map((_, i) => {
				const t = Math.min(1, (k + i * 2) / 160);
				const r = size * (0.3 + t * 1.1);
				return <div key={`s${i}`} style={{position: 'absolute', left: cx - r + Math.sin(i * 2.1) * size * 0.4 + t * size * 0.8, top: cy - r - t * size * 3.2, width: r * 2, height: r * 2, borderRadius: '50%', background: 'rgba(28,24,24,0.75)', opacity: interpolate(k, [6, 20], [0, 0.85], clamp) * (1 - t * 0.6), filter: 'blur(10px)'}} />;
			})}
			{Array.from({length: 7}).map((_, i) => {
				const ox = Math.cos(i * 2.4) * R * 0.45 * (i ? 1 : 0), oy = Math.sin(i * 2.4) * R * 0.35 * (i ? 1 : 0) - interpolate(k, [0, 40], [0, R * 0.6], clamp) * (i % 2);
				const rr = R * (i ? 0.55 + random(`fb${i}`) * 0.3 : 0.8);
				return <div key={`fb${i}`} style={{position: 'absolute', left: cx + ox - rr, top: cy + oy - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,245,210,1) 0%, rgba(255,180,80,0.95) 28%, rgba(210,70,25,0.85) 55%, rgba(90,25,10,0) 74%)', opacity: fire * (i ? 0.9 : 1), mixBlendMode: 'screen', filter: 'blur(3px)'}} />;
			})}
			<div style={{position: 'absolute', left: cx - ring, top: cy - ring * 0.35, width: ring * 2, height: ring * 0.7, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,220,170,0) 55%, rgba(255,220,170,0.35) 70%, rgba(255,220,170,0) 80%)', opacity: ringO}} />
			{Array.from({length: 26}).map((_, i) => {
				const ang = random(`d${i}`) * Math.PI - Math.PI;
				const sp = 6 + random(`v${i}`) * 14;
				const dx = Math.cos(ang) * sp * k;
				const dy = Math.sin(ang) * sp * k + 0.35 * k * k;
				return <div key={`d${i}`} style={{position: 'absolute', left: cx + dx, top: cy + dy, width: 3 + (i % 4), height: 9 + (i % 5) * 3, borderRadius: 2, rotate: `${k * (8 + i)}deg`, background: i % 4 ? '#1c1310' : '#ff9a4a', filter: 'blur(0.8px)', opacity: interpolate(k, [0, 34], [1, 0], clamp)}} />;
			})}
			<AbsoluteFill style={{background: 'rgba(255,220,160,1)', opacity: interpolate(k, [0, 2, 10], [0, 0.33, 0], clamp), mixBlendMode: 'screen'}} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at ${x}% ${y}%, rgba(255,120,40,0.45), rgba(0,0,0,0) 70%)`, opacity: interpolate(k, [4, 30], [0, 1], clamp), mixBlendMode: 'screen'}} />
		</AbsoluteFill>
	);
};

const Fire: React.FC<{x: number; y: number; w: number; from: number}> = ({x, y, w, from}) => {
	const f = useCurrentFrame();
	if (f < from) return null;
	const o = interpolate(f, [from, from + 20], [0, 1], clamp);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
			{Array.from({length: 7}).map((_, i) => {
				const fl = 0.75 + 0.25 * Math.sin(f / 2.3 + i * 1.9) * Math.sin(f / 5.1 + i);
				return <div key={i} style={{position: 'absolute', left: `calc(${x}% + ${(i - 3) * w * 0.12}px)`, top: `${y}%`, width: w * 0.3, height: w * 0.55 * fl, translate: '-50% -100%', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 80%, rgba(255,230,150,0.9), rgba(255,120,40,0.6) 45%, rgba(160,40,10,0) 72%)', mixBlendMode: 'screen', filter: 'blur(9px)'}} />;
			})}
			<div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: w * 2.4, height: w * 1.4, translate: '-50% -70%', background: 'radial-gradient(ellipse, rgba(255,130,50,0.4), rgba(0,0,0,0) 70%)', mixBlendMode: 'screen', opacity: 0.6 + 0.4 * Math.sin(f / 3)}} />
		</AbsoluteFill>
	);
};

export const SceneView: React.FC<{s: SceneSpec2; t0: number}> = ({s, t0}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(f, [0, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	const z = (s.z0 ?? 1.02) + ((s.z1 ?? 1.1) - (s.z0 ?? 1.02)) * t;
	const ex = (s.fx ?? []).filter((x) => x.kind === 'explosion') as Extract<Fx, {kind: 'explosion'}>[];
	let shake = 0;
	for (const e of ex) {
		const k = f - (e.at_s - t0) * FPS;
		if (k >= 0 && k < 20) shake = Math.max(shake, (1 - k / 20) * 7.5);
	}
	const bo = (s.fx ?? []).find((x) => x.kind === 'blackout') as Extract<Fx, {kind: 'blackout'}> | undefined;
	const dark = bo ? interpolate(f, [(bo.at_s - t0) * FPS, (bo.at_s - t0) * FPS + 8], [0, 0.7], clamp) : 0;
	return (
		<AbsoluteFill style={{background: '#0b0908', overflow: 'hidden'}}>
			<AbsoluteFill style={{transformOrigin: `${s.ox ?? '50%'} ${s.oy ?? '60%'}`, scale: String(z), translate: `${(s.dx ?? 0) * t + (s.pan?.[0] ?? 0) * t + Math.sin(f * 1.7) * shake}px ${(s.pan?.[1] ?? 0) * t + Math.cos(f * 2.3) * shake}px`}}>
				<PanCtx.Provider value={{pan: s.pan ?? [0, 0], tt: t}}>
				<Img src={staticFile(s.bg)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
				{s.bg2 && <Img src={staticFile(s.bg2)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: interpolate(f, [((s.bg2_at_s ?? t0) - t0) * FPS, ((s.bg2_at_s ?? t0) - t0) * FPS + 9], [0, 1], clamp)}} />}
				<AbsoluteFill style={{background: '#06080e', opacity: dark}} />
				{(s.fx ?? []).filter((x) => x.kind === 'smoke').map((x, i) => {
					const sm = x as Extract<Fx, {kind: 'smoke'}>;
					return <SmokeCol key={`sm${i}`} x={sm.x} y={sm.y} w={sm.w ?? 120} from={((sm.from_s ?? t0) - t0) * FPS} color={sm.color} />;
				})}
				{(s.fx ?? []).filter((x) => x.kind === 'searchlight').map((x, i) => {
					const sl = x as Extract<Fx, {kind: 'searchlight'}>;
					return <Searchlight key={`sl${i}`} x={sl.x} y={sl.y} phase={sl.phase ?? i * 1.7} />;
				})}
				{(s.actors ?? []).filter((a) => a.layer !== 'front').map((a, i) => <ActorView key={i} a={a} t0={t0} />)}
					{s.front && <Img src={staticFile(s.bg)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: s.front}} />}
					{(s.actors ?? []).filter((a) => a.layer === 'front').map((a, i) => <ActorView key={`f${i}`} a={a} t0={t0} />)}
				{(s.fx ?? []).filter((x) => x.kind === 'tracers').map((x, i) => {
					const tr = x as Extract<Fx, {kind: 'tracers'}>;
					return <Tracers key={`tr${i}`} x={tr.x} y={tr.y} w={tr.w ?? 600} from={(tr.from_s - t0) * FPS} to={(tr.to_s - t0) * FPS} />;
				})}
				{(s.fx ?? []).filter((x) => x.kind === 'fire').map((x, i) => {
					const fi = x as Extract<Fx, {kind: 'fire'}>;
					return <Fire key={`fi${i}`} x={fi.x} y={fi.y} w={fi.w ?? 160} from={((fi.from_s ?? t0) - t0) * FPS} />;
				})}
					{ex.map((e, i) => <Explosion key={`ex${i}`} x={e.x} y={e.y} at={(e.at_s - t0) * FPS} size={e.size ?? 160} />)}
					{(s.fx ?? []).map((x, i) => {
						if (x.kind === 'typing') return <Typing key={`ty${i}`} d={x} t0={t0} />;
						if (x.kind === 'calendar') return <Calendar key={`ca${i}`} d={x} t0={t0} />;
						if (x.kind === 'dominoes') return <Dominoes key={`do${i}`} d={x} t0={t0} />;
						return null;
					})}
				</PanCtx.Provider>
			</AbsoluteFill>
			<LightRays opacity={s.rays ?? (s.night ? 0 : 0.14)} angle={14} />
			<Particles count={28} kind={s.night ? 'embers' : 'dust'} opacity={s.night ? 0.5 : 0.35} />
			{(s.fx ?? []).filter((x) => x.kind === 'flash').map((x, i) => {
				const fl = x as Extract<Fx, {kind: 'flash'}>;
				return <Flash key={`fl${i}`} x={fl.x} y={fl.y} at={(fl.at_s - t0) * FPS} size={fl.size ?? 260} />;
			})}
		</AbsoluteFill>
	);
};

const SmokeCol: React.FC<{x: number; y: number; w: number; from: number; color?: string}> = ({x, y, w, from, color}) => {
	const f = useCurrentFrame();
	if (f < from) return null;
	const col = color ?? 'rgba(24,22,24,0.7)';
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: w * 0.45, height: w * 0.6, translate: '-50% -80%', borderRadius: '50%', background: col, opacity: 0.9, filter: 'blur(6px)'}} />
			{Array.from({length: 12}).map((_, i) => {
				const t = ((f - from) / 110 + i / 12) % 1;
				const r = w * (0.2 + t * 0.9);
				return <div key={i} style={{position: 'absolute', left: `calc(${x}% + ${t * w * 0.9 + Math.sin(i * 2.3) * w * 0.2 * t}px)`, top: `calc(${y}% - ${t * w * 4}px)`, width: r * 2, height: r * 2, translate: '-50% -50%', borderRadius: '50%', background: col, opacity: (t < 0.12 ? 0.6 + t * 2.5 : Math.sin(Math.PI * (0.12 + t * 0.88))) * 0.85, filter: 'blur(12px)'}} />;
			})}
		</AbsoluteFill>
	);
};

const Searchlight: React.FC<{x: number; y: number; phase: number}> = ({x, y, phase}) => {
	const f = useCurrentFrame();
	const a = -90 + Math.sin(f / 45 + phase) * 32;
	return (
		<div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: 1400, height: 120, transformOrigin: '0% 50%', translate: '0 -50%', rotate: `${a}deg`, background: 'linear-gradient(90deg, rgba(255,245,215,0.35), rgba(255,245,215,0.12) 60%, rgba(255,245,215,0))', clipPath: 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%)', filter: 'blur(3px)', mixBlendMode: 'screen'}} />
	);
};

const Tracers: React.FC<{x: number; y: number; w: number; from: number; to: number}> = ({x, y, w, from, to}) => {
	const f = useCurrentFrame();
	if (f < from || f > to + 12) return null;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			{Array.from({length: 10}).map((_, i) => {
				const per = 9 + (i % 4) * 3;
				const k = (f - from + i * 5) % per;
				const live = f - from + i * 5 >= 0 && f <= to;
				const sx = (x / 100) * 1920 + (random(`tx${i}`) - 0.5) * w;
				const sy = (y / 100) * 1080 + random(`ty${i}`) * 40;
				const ang = -25 - random(`ta${i}`) * 40;
				const len = 120 + k * 22;
				return (
					<React.Fragment key={i}>
						<div style={{position: 'absolute', left: sx, top: sy, width: len, height: 3, transformOrigin: '0 50%', rotate: `${ang}deg`, background: 'linear-gradient(90deg, rgba(255,200,120,0), rgba(255,220,150,0.9))', opacity: live && k < per * 0.6 ? 1 : 0}} />
						<div style={{position: 'absolute', left: sx - 14, top: sy - 14, width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,200,1), rgba(255,170,80,0) 70%)', opacity: live && k < 2 ? 1 : 0}} />
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};

// Flash de câmera de imprensa: estouro local + clarão leve da tela (≤ 0,22; o evento de som correspondente é visual: true).
const Flash: React.FC<{x: number; y: number; at: number; size: number}> = ({x, y, at, size}) => {
	const f = useCurrentFrame();
	const k = f - at;
	if (k < 0 || k > 14) return null;
	const o = interpolate(k, [0, 1, 12], [0, 1, 0], clamp);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			<div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: size * 2, height: size * 2, translate: '-50% -50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(230,240,255,0.85) 12%, rgba(200,220,255,0.25) 40%, rgba(200,220,255,0) 70%)', opacity: o}} />
			<div style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: size * 4, height: 6, translate: '-50% -50%', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))', opacity: o * 0.8, filter: 'blur(2px)'}} />
			<AbsoluteFill style={{background: 'rgba(235,240,255,1)', opacity: o * 0.22}} />
		</AbsoluteFill>
	);
};

// Máquina de escrever: folha com texto batido letra a letra; a folha sobe uma linha a cada retorno do carro.
const Typing: React.FC<{d: Extract<Fx, {kind: 'typing'}>; t0: number}> = ({d, t0}) => {
	const f = useCurrentFrame();
	const a = (d.from_s - t0) * FPS, b = (d.to_s - t0) * FPS;
	const total = d.lines.reduce((n, l) => n + l.length, 0);
	const typed = Math.floor(interpolate(f, [a, b], [0, total], clamp));
	const size = d.size ?? 34, lh = size * 1.5, w = d.w ?? 760;
	let left = typed, cur = 0;
	const shown = d.lines.map((l, i) => {
		const n = Math.max(0, Math.min(l.length, left));
		left -= n;
		if (n > 0) cur = i;
		return l.slice(0, n);
	});
	const jitter = typed > 0 && typed < total ? Math.sin(f * 3.1) * 1.5 : 0;
	const own = d.paper !== false;
	return (
		<div style={{position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: w, translate: `-50% ${own ? -cur * lh : 0}px`}}>
			{own && <div style={{position: 'absolute', left: 0, right: 0, top: -lh * 7, height: lh * (d.lines.length + 9), background: 'linear-gradient(180deg, #f1ead8 0%, #e9dfc6 100%)', boxShadow: '0 10px 30px rgba(0,0,0,0.45)'}} />}
			<div style={{position: 'relative', padding: `0 ${size * 1.2}px`, fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, fontSize: size, lineHeight: `${lh}px`, color: '#1d1a17', whiteSpace: 'pre', translate: `${jitter}px 0px`}}>
				{shown.map((l, i) => <div key={i}>{l || ' '}</div>)}
			</div>
		</div>
	);
};

// Calendário de folhas: o ano volta de `from` para `to`; cada folha arrancada voa e gira para fora.
const Calendar: React.FC<{d: Extract<Fx, {kind: 'calendar'}>; t0: number}> = ({d, t0}) => {
	const f = useCurrentFrame();
	const a = (d.from_s - t0) * FPS, b = (d.to_s - t0) * FPS;
	const steps = Math.abs(d.to - d.from);
	const dir = d.to < d.from ? -1 : 1;
	const p = interpolate(f, [a, b], [0, steps], {...clamp, easing: E.inOut});
	const k = Math.floor(p);
	const w = d.w ?? 420, h = w * 1.15;
	const page = (yr: number, extra: React.CSSProperties, key: string) => (
		<div key={key} style={{position: 'absolute', inset: 0, background: '#efe7d2', border: '2px solid #2a241e', boxShadow: '0 12px 28px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 0%', ...extra}}>
			<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: h * 0.16, background: C.seal}} />
			<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: w * 0.36, color: C.ink, marginTop: h * 0.12}}>{yr}</div>
		</div>
	);
	const flying: React.ReactNode[] = [];
	for (let j = Math.max(0, k - 3); j <= k && j < steps; j++) {
		const u = Math.min(1, (p - j) * 1.6);
		if (u <= 0) continue;
		flying.push(page(d.from + dir * j, {translate: `${u * w * 1.4}px ${-u * h * 0.2 + u * u * h * 0.9}px`, rotate: `${u * 55}deg`, opacity: 1 - u * 0.9, zIndex: 3}, `fl${j}`));
	}
	const under = d.from + dir * Math.min(steps, k + (p > 0 ? 1 : 0));
	return (
		<div style={{position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: w, height: h, translate: '-50% -50%'}}>
			{page(under, {}, 'under')}
			{flying}
			<div style={{position: 'absolute', top: -14, left: w * 0.2, width: w * 0.6, height: 22, background: '#3a3029', borderRadius: 6, zIndex: 4}} />
		</div>
	);
};

// Dominós em fila: o primeiro balança e cai na palavra; os vizinhos caem em sequência.
const Dominoes: React.FC<{d: Extract<Fx, {kind: 'dominoes'}>; t0: number}> = ({d, t0}) => {
	const f = useCurrentFrame();
	const {width} = useVideoConfig();
	const n = d.n ?? 7, tw = d.w ?? 70, th = tw * 2.3, gap = tw * 0.95;
	const x0 = (d.x / 100) * width - ((n - 1) * (tw + gap)) / 2;
	const fall = (d.fall_s - t0) * FPS, step = (d.step_s ?? 0.3) * FPS;
	const wob = d.wobble_s !== undefined ? (d.wobble_s - t0) * FPS : fall;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{Array.from({length: n}).map((_, i) => {
				const st = fall + i * step;
				const tt = (f - st) / (step * 1.05);
				let ang = tt <= 0 ? 0 : tt >= 1 ? 74 : 74 * tt * tt;
				if (i === 0 && f >= wob && f < fall) ang = Math.sin((f - wob) / 3.2) * 4 * Math.min(1, (f - wob) / 20);
				const x = x0 + i * (tw + gap);
				return (
					<React.Fragment key={i}>
						<div style={{position: 'absolute', left: x - tw * 0.1, top: `calc(${d.y}% - 6px)`, width: tw * 1.2 + (Math.max(0, ang) / 74) * th * 0.9, height: 14, background: 'radial-gradient(ellipse, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%)'}} />
						<div style={{position: 'absolute', left: x, top: `calc(${d.y}% - ${th}px)`, width: tw, height: th, transformOrigin: '100% 100%', rotate: `${ang}deg`, background: 'linear-gradient(90deg, #efe8d6, #d9cfb6)', border: '3px solid #1a1612', borderRadius: tw * 0.12, boxShadow: 'inset -6px 0 0 rgba(0,0,0,0.12)'}}>
							<div style={{position: 'absolute', left: '12%', right: '12%', top: '49%', height: 3, background: '#1a1612'}} />
							{[0.22, 0.75].map((yy, k) => <div key={k} style={{position: 'absolute', left: '50%', top: `${yy * 100}%`, width: tw * 0.2, height: tw * 0.2, translate: '-50% -50%', borderRadius: '50%', background: k === 0 && i === 0 ? C.seal : '#1a1612'}} />)}
						</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
