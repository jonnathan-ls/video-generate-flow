// Ilustração procedural em SVG: nenhuma imagem externa. Tudo é função do quadro atual.
import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, E, clamp} from './tokens';

const W = 1920;
const H = 1080;

export const Sky: React.FC<{stops: [string, number][]}> = ({stops}) => (
	<AbsoluteFill style={{background: `linear-gradient(180deg, ${stops.map(([c, p]) => `${c} ${p}%`).join(',')})`}} />
);

export const Sun: React.FC<{x: number; y: number; r?: number; color?: string; glow?: string}> = ({x, y, r = 90, color = '#ffe2a8', glow = 'rgba(255,190,110,0.55)'}) => {
	const frame = useCurrentFrame();
	const rise = Math.sin(frame / 60) * 4;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: x - r * 5, top: y - r * 5 + rise, width: r * 10, height: r * 10, background: `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 62%)`}} />
			<div style={{position: 'absolute', left: x - r, top: y - r + rise, width: r * 2, height: r * 2, borderRadius: '50%', background: color}} />
		</AbsoluteFill>
	);
};

/** Crista de relevo procedural com parallax lateral. */
export const Ridge: React.FC<{seed: number; baseY: number; amp: number; color: string; speed?: number; fog?: string}> = ({seed, baseY, amp, color, speed = 0.15, fog}) => {
	const frame = useCurrentFrame();
	const off = frame * speed;
	const pts: string[] = [];
	for (let x = -60; x <= W + 60; x += 30) {
		const xx = x + off;
		const y = baseY - amp * (0.5 * Math.sin(xx * 0.004 + seed * 3) + 0.3 * Math.sin(xx * 0.011 + seed * 7) + 0.2 * Math.sin(xx * 0.027 + seed));
		pts.push(`${x},${y.toFixed(1)}`);
	}
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				{fog && (
					<linearGradient id={`fog${seed}`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={color} />
						<stop offset="1" stopColor={fog} />
					</linearGradient>
				)}
			</defs>
			<polygon points={`-60,${H} ${pts.join(' ')} ${W + 60},${H}`} fill={fog ? `url(#fog${seed})` : color} />
		</svg>
	);
};

/** Água com ondas animadas (linhas senoidais em fase deslocada). */
export const Sea: React.FC<{y: number; top: string; bottom: string; line?: string; lines?: number}> = ({y, top, bottom, line = 'rgba(255,230,190,0.22)', lines = 16}) => {
	const frame = useCurrentFrame();
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="seag" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={top} />
					<stop offset="1" stopColor={bottom} />
				</linearGradient>
			</defs>
			<rect x={0} y={y} width={W} height={H - y} fill="url(#seag)" />
			{Array.from({length: lines}).map((_, i) => {
				const yy = y + 12 + Math.pow(i / lines, 1.6) * (H - y - 20);
				const amp = 2 + (i / lines) * 9;
				let d = `M0 ${yy}`;
				for (let x = 0; x <= W; x += 40) d += ` L${x} ${(yy + Math.sin(x * 0.012 + frame * (0.05 + i * 0.004) + i * 1.7) * amp).toFixed(1)}`;
				return <path key={i} d={d} fill="none" stroke={line} strokeWidth={1.2 + i * 0.12} />;
			})}
		</svg>
	);
};

/** Navio à vela construído com caminhos: casco, mastros, velas e cordame. */
export const Ship: React.FC<{x: number; y: number; s?: number; hull?: string; sail?: string; flag?: string; sway?: number; phase?: number; dx?: number}> = ({x, y, s = 1, hull = '#1a1410', sail = '#e6d6b0', flag = C.seal, sway = 1.6, phase = 0, dx = 0}) => {
	const frame = useCurrentFrame();
	const rot = Math.sin(frame / 38 + phase) * sway;
	const bob = Math.sin(frame / 31 + phase) * 4 * s;
	const masts = [-70, 0, 68];
	return (
		<g transform={`translate(${x + dx} ${y + bob}) rotate(${rot}) scale(${s})`}>
			<path d="M-150 0 L150 0 L118 46 Q0 58 -120 46 Z" fill={hull} />
			<path d="M-150 0 L150 0 L146 -12 L-146 -12 Z" fill={hull} opacity={0.85} />
			<line x1={-150} y1={-18} x2={150} y2={-18} stroke={C.brass} strokeWidth={3} />
			{masts.map((mx, i) => {
				const h = [250, 320, 270][i];
				return (
					<g key={i}>
						<line x1={mx} y1={-12} x2={mx} y2={-h} stroke={hull} strokeWidth={5} />
						{[0.28, 0.58, 0.84].map((k, j) => {
							const sy = -h * k;
							const w = 64 - j * 12;
							const belly = 12 + Math.sin(frame / 24 + i + j) * 3;
							return (
								<path
									key={j}
									d={`M${mx - w} ${sy} Q${mx} ${sy + belly} ${mx + w} ${sy} L${mx + w - 8} ${sy - 62 + j * 6} Q${mx} ${sy - 62 + j * 6 + belly * 0.7} ${mx - w + 8} ${sy - 62 + j * 6} Z`}
									fill={sail}
									opacity={0.95 - j * 0.08}
									stroke="rgba(0,0,0,0.25)"
									strokeWidth={1.5}
								/>
							);
						})}
						<path d={`M${mx} ${-h} l${28 + Math.sin(frame / 7 + i) * 5} 8 l-${28 + Math.sin(frame / 7 + i) * 5} 8 Z`} fill={flag} />
					</g>
				);
			})}
			<line x1={-70} y1={-250} x2={-150} y2={-12} stroke={hull} strokeWidth={1.5} opacity={0.6} />
			<line x1={68} y1={-270} x2={150} y2={-12} stroke={hull} strokeWidth={1.5} opacity={0.6} />
		</g>
	);
};

/** Torre de Belém simplificada: corpo, ameias, guarita e base. */
export const BelemTower: React.FC<{x: number; y: number; s?: number; color?: string; light?: string}> = ({x, y, s = 1, color = '#d9c59a', light = '#f5e3b8'}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-170} y={-30} width={340} height={40} fill={color} />
		{Array.from({length: 14}).map((_, i) => (
			<rect key={i} x={-166 + i * 24} y={-44} width={14} height={16} fill={color} />
		))}
		<rect x={-60} y={-230} width={120} height={200} fill={color} />
		{Array.from({length: 6}).map((_, i) => (
			<rect key={i} x={-60 + i * 21} y={-246} width={14} height={18} fill={color} />
		))}
		<rect x={-60} y={-230} width={30} height={200} fill={light} opacity={0.35} />
		<rect x={-30} y={-150} width={22} height={40} rx={11} fill="#3a2c1c" />
		<rect x={12} y={-150} width={22} height={40} rx={11} fill="#3a2c1c" />
		<rect x={-110} y={-120} width={36} height={90} fill={color} />
		<path d="M-116 -120 L-92 -150 L-68 -120 Z" fill={color} />
		<rect x={-200} y={10} width={400} height={26} fill="#2a2118" opacity={0.7} />
	</g>
);

/** Silhueta de cidade em blocos com janelas acesas. */
export const Skyline: React.FC<{y: number; color: string; seed: number; win?: string; density?: number}> = ({y, color, seed, win = '#ffd98a', density = 0.12}) => {
	const frame = useCurrentFrame();
	const blocks: React.ReactNode[] = [];
	let x = -20;
	let i = 0;
	while (x < W + 20) {
		const w = 50 + random(`w${seed}${i}`) * 90;
		const h = 60 + random(`h${seed}${i}`) * 170;
		blocks.push(<rect key={`b${i}`} x={x} y={y - h} width={w} height={h} fill={color} />);
		if (random(`t${seed}${i}`) > 0.55) blocks.push(<polygon key={`t${i}`} points={`${x},${y - h} ${x + w / 2},${y - h - 28} ${x + w},${y - h}`} fill={color} />);
		for (let wy = y - h + 14; wy < y - 14; wy += 26) {
			for (let wx = x + 10; wx < x + w - 14; wx += 20) {
				if (random(`l${seed}${i}${wx}${wy}`) < density) blocks.push(<rect key={`${i}-${wx}-${wy}`} x={wx} y={wy} width={7} height={11} fill={win} opacity={0.5 + 0.4 * Math.sin(frame / 20 + wx)} />);
			}
		}
		x += w + 2;
		i++;
	}
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			{blocks}
			<rect x={0} y={y} width={W} height={H - y} fill={color} />
		</svg>
	);
};

/** Multidão em silhueta: cabeças, corpos e chapéus, com balanço individual. */
export const Crowd: React.FC<{count: number; seed: number; baseY: number; x0?: number; x1?: number; scale?: number; colors?: string[]; hats?: number; slope?: number}> = ({
	count,
	seed,
	baseY,
	x0 = 0,
	x1 = W,
	scale = 1,
	colors = ['#1a1410', '#2a1d18', '#3a1f1c', '#241a24', '#2c2a2e'],
	hats = 0.5,
	slope = 0,
}) => {
	const frame = useCurrentFrame();
	const people = Array.from({length: count}).map((_, i) => {
		const r = (k: string) => random(`${seed}${k}${i}`);
		const x = x0 + (x1 - x0) * ((i + r('x') * 0.8) / count);
		const s = (0.75 + r('s') * 0.5) * scale;
		const y = baseY + (r('y') - 0.5) * 70 * scale - slope * (x - x0);
		return {x, y, s, c: colors[Math.floor(r('c') * colors.length)], hat: r('h') < hats, phase: r('p') * 6, dress: r('d') > 0.6};
	});
	people.sort((a, b) => a.y - b.y);
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			{people.map((p, i) => {
				const b = Math.sin(frame / 7 + p.phase) * 3 * p.s;
				return (
					<g key={i} transform={`translate(${p.x} ${p.y + b}) scale(${p.s})`}>
						<ellipse cx={0} cy={4} rx={22} ry={6} fill="rgba(0,0,0,0.35)" />
						{p.dress ? <path d="M-16 0 L-9 -78 L9 -78 L16 0 Z" fill={p.c} /> : <rect x={-11} y={-84} width={22} height={86} rx={8} fill={p.c} />}
						<circle cx={0} cy={-96} r={11} fill={p.c} />
						{p.hat && <path d="M-20 -102 Q0 -128 20 -102 L12 -104 Q0 -112 -12 -104 Z" fill={p.c} />}
					</g>
				);
			})}
		</svg>
	);
};

/** Caixas e baús em primeiro plano (para a cena do cais). */
export const Crates: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#2a1b12'}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={0} y={-54} width={90} height={54} fill={color} />
		<rect x={0} y={-54} width={90} height={8} fill="rgba(255,255,255,0.08)" />
		<rect x={70} y={-96} width={64} height={42} fill={color} opacity={0.92} />
		<line x1={0} y1={-27} x2={90} y2={-27} stroke={C.brass} strokeOpacity={0.5} strokeWidth={2} />
	</g>
);

/** Palmeira: tronco curvo e folhas em leque. */
export const Palm: React.FC<{x: number; y: number; s?: number; color?: string; lean?: number}> = ({x, y, s = 1, color = '#0f2a22', lean = 1}) => {
	const frame = useCurrentFrame();
	const sw = Math.sin(frame / 30 + x) * 3;
	return (
		<g transform={`translate(${x} ${y}) scale(${s * lean} ${s})`}>
			<path d={`M0 0 Q${30 + sw} -150 ${20 + sw * 2} -300`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
			{Array.from({length: 7}).map((_, i) => {
				const a = -170 + i * 28 + sw * 2;
				const rad = (a * Math.PI) / 180;
				const ex = 20 + sw * 2 + Math.cos(rad) * 150;
				const ey = -300 + Math.sin(rad) * 110 + 40;
				return <path key={i} d={`M${20 + sw * 2} -300 Q${(20 + ex) / 2} ${-300 + Math.sin(rad) * 140 - 40} ${ex} ${ey}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />;
			})}
		</g>
	);
};

/** Casario colonial em blocos coloridos, com telhados e portas. */
export const Colonial: React.FC<{x: number; y: number; n: number; seed: number; s?: number}> = ({x, y, n, seed, s = 1}) => {
	const cols = ['#c9a36a', '#b5533c', '#d8c28a', '#8e1b1b', '#e1d2a8'];
	let cx = 0;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			{Array.from({length: n}).map((_, i) => {
				const w = 70 + random(`cw${seed}${i}`) * 50;
				const h = 60 + random(`ch${seed}${i}`) * 60;
				const col = cols[Math.floor(random(`cc${seed}${i}`) * cols.length)];
				const g = (
					<g key={i} transform={`translate(${cx} 0)`}>
						<rect x={0} y={-h} width={w} height={h} fill={col} />
						<polygon points={`-6,${-h} ${w / 2},${-h - 26} ${w + 6},${-h}`} fill="#6b2a1f" />
						<rect x={w / 2 - 7} y={-30} width={14} height={30} fill="#3a2418" />
						<rect x={10} y={-h + 14} width={12} height={18} fill="#3a2418" opacity={0.8} />
						<rect x={w - 22} y={-h + 14} width={12} height={18} fill="#3a2418" opacity={0.8} />
					</g>
				);
				cx += w + 4;
				return g;
			})}
		</g>
	);
};

/** Silhueta de Napoleão: bicórnio de lado, cabeça, ombreiras, casaca, mão no colete e botas. Contorno de luz. */
export const NapoleonSilhouette: React.FC<{x: number; y: number; h: number; color?: string; rim?: string}> = ({x, y, h, color = '#0c0908', rim = '#ffb15a'}) => {
	const s = h / 430;
	const frame = useCurrentFrame();
	const breathe = Math.sin(frame / 34) * 1.5;
	const glow = 14 + Math.sin(frame / 20) * 4;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} style={{filter: `drop-shadow(0 0 ${glow}px ${rim})`}}>
			<g transform={`translate(-110 ${-430 + breathe})`}>
				{/* bicórnio: pontas altas e laterais, copa baixa */}
				<path d="M0 74 Q14 34 46 40 Q80 8 110 22 Q142 8 174 40 Q206 34 220 74 Q186 54 150 56 Q110 44 70 56 Q34 54 0 74 Z" fill={color} stroke={rim} strokeWidth={2.4} />
				{/* cabeça e pescoço */}
				<path d="M82 62 Q82 112 110 118 Q138 112 138 62 Z" fill={color} stroke={rim} strokeWidth={2.4} />
				<rect x={98} y={112} width={24} height={22} fill={color} />
				{/* ombros, ombreiras e casaca */}
				<path d="M40 150 Q56 128 98 130 L122 130 Q164 128 180 150 L192 168 L174 176 L170 270 L196 420 L128 420 L112 300 L108 300 L92 420 L24 420 L50 270 L46 176 L28 168 Z" fill={color} stroke={rim} strokeWidth={2.4} />
				{/* lapelas em V (mais claras) */}
				<path d="M98 132 L110 220 L122 132 L136 134 L118 240 L102 240 L84 134 Z" fill="#1c1410" />
				{/* mão no colete */}
				<path d="M96 214 Q124 208 142 224 L138 246 Q112 242 94 232 Z" fill={color} stroke={rim} strokeWidth={2} />
				{/* ombreiras com franjas */}
				<rect x={22} y={160} width={30} height={10} rx={4} fill="#2a1c12" stroke={rim} strokeWidth={1.4} />
				<rect x={168} y={160} width={30} height={10} rx={4} fill="#2a1c12" stroke={rim} strokeWidth={1.4} />
			</g>
		</g>
	);
};

/** Pássaros em V cruzando o céu. */
export const Birds: React.FC<{y: number; color?: string; n?: number}> = ({y, color = '#1a1410', n = 7}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			{Array.from({length: n}).map((_, i) => {
				const x = -80 + t * (W + 200) * (0.7 + random(`bs${i}`) * 0.4) + i * 60;
				const yy = y + Math.sin(frame / 30 + i) * 16 + i * 14;
				const f = Math.sin(frame / 4 + i * 2) * 7;
				return <path key={i} d={`M${x - 16} ${yy - f} Q${x - 6} ${yy - 6} ${x} ${yy} Q${x + 6} ${yy - 6} ${x + 16} ${yy - f}`} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />;
			})}
		</svg>
	);
};

/** Câmera simples para um grupo SVG/DIV: zoom e pan lentos. */
export const Cam: React.FC<{children: React.ReactNode; z0?: number; z1?: number; pan?: [number, number]; origin?: string}> = ({children, z0 = 1, z1 = 1.1, pan = [0, 0], origin = '50% 50%'}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	return <AbsoluteFill style={{transformOrigin: origin, scale: String(z0 + (z1 - z0) * t), translate: `${pan[0] * t}% ${pan[1] * t}%`}}>{children}</AbsoluteFill>;
};
