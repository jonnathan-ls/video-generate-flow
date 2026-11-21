// Elementos de ilustração cinematográfica em código (SVG procedural) para o vídeo do Vietnã. Nenhum asset externo.
import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {E} from '../lacre/tokens';
import {C, clamp} from '../lacre/tokens';

export const W = 1920;
export const H = 1080;
export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, ...style}}>
		{children}
	</svg>
);

/** Bandeira ondulando (fatias). kind: vn us fr br ca in pl */
export const Flag: React.FC<{x: number; y: number; w?: number; kind: string; pole?: number; phase?: number; amp?: number}> = ({x, y, w = 170, kind, pole = 0, phase = 0, amp = 9}) => {
	const f = useCurrentFrame();
	const h = w * 0.62;
	const N = 14;
	const id = `fl${kind}${Math.round(x)}${Math.round(y)}`;
	const art = (() => {
		switch (kind) {
			case 'vn':
				return (
					<>
						<rect width={w} height={h} fill="#da251d" />
						<polygon fill="#ffdd00" points={starPts(w / 2, h / 2, h * 0.3, h * 0.12)} />
					</>
				);
			case 'us':
				return (
					<>
						{Array.from({length: 7}).map((_, i) => <rect key={i} y={(i * h) / 7} width={w} height={h / 7} fill={i % 2 ? '#e9e6dd' : '#b22234'} />)}
						<rect width={w * 0.42} height={h * 0.54} fill="#3c3b6e" />
					</>
				);
			case 'ca':
				return (
					<>
						<rect width={w} height={h} fill="#b3262e" />
						<rect width={w * 0.5} height={h * 0.5} fill="#1f2f6a" />
						<path d={`M0 0 L${w * 0.5} ${h * 0.5} M${w * 0.5} 0 L0 ${h * 0.5}`} stroke="#e9e6dd" strokeWidth={h * 0.08} />
						<rect x={w * 0.2} width={w * 0.1} height={h * 0.5} fill="#e9e6dd" />
						<rect y={h * 0.2} width={w * 0.5} height={h * 0.1} fill="#e9e6dd" />
						<rect x={w * 0.22} width={w * 0.06} height={h * 0.5} fill="#c8372d" />
						<rect y={h * 0.22} width={w * 0.5} height={h * 0.06} fill="#c8372d" />
						<circle cx={w * 0.75} cy={h * 0.62} r={h * 0.14} fill="#e9e6dd" />
					</>
				);
			case 'svn':
				return (
					<>
						<rect width={w} height={h} fill="#f2c40f" />
						{[0.28, 0.5, 0.72].map((y, i) => <rect key={i} y={h * y - 3} width={w} height={6} fill="#c8372d" />)}
					</>
				);
			case 'gb':
				return (
					<>
						<rect width={w} height={h} fill="#1f2f6a" />
						<path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#e9e6dd" strokeWidth={h * 0.16} />
						<path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#c8372d" strokeWidth={h * 0.06} />
						<rect x={w * 0.4} width={w * 0.2} height={h} fill="#e9e6dd" />
						<rect y={h * 0.38} width={w} height={h * 0.24} fill="#e9e6dd" />
						<rect x={w * 0.44} width={w * 0.12} height={h} fill="#c8372d" />
						<rect y={h * 0.43} width={w} height={h * 0.14} fill="#c8372d" />
					</>
				);
			case 'fr':
				return (
					<>
						<rect width={w / 3} height={h} fill="#1f3a8a" />
						<rect x={w / 3} width={w / 3} height={h} fill="#e9e6dd" />
						<rect x={(2 * w) / 3} width={w / 3} height={h} fill="#c8372d" />
					</>
				);
			case 'br':
				return (
					<>
						<rect width={w} height={h} fill="#1c7a3c" />
						<polygon points={`${w / 2},${h * 0.1} ${w * 0.9},${h / 2} ${w / 2},${h * 0.9} ${w * 0.1},${h / 2}`} fill="#f2c40f" />
						<circle cx={w / 2} cy={h / 2} r={h * 0.22} fill="#27408b" />
					</>
				);
			case 'in':
				return (
					<>
						<rect width={w} height={h / 3} fill="#e8892c" />
						<rect y={h / 3} width={w} height={h / 3} fill="#e9e6dd" />
						<rect y={(2 * h) / 3} width={w} height={h / 3} fill="#2c8a4a" />
						<circle cx={w / 2} cy={h / 2} r={h * 0.1} fill="none" stroke="#27408b" strokeWidth={3} />
					</>
				);
			default:
				return (
					<>
						<rect width={w} height={h / 2} fill="#e9e6dd" />
						<rect y={h / 2} width={w} height={h / 2} fill="#c8372d" />
					</>
				);
		}
	})();
	return (
		<Svg><g transform={`translate(${x} ${y})`}>
			{pole > 0 && <rect x={-5} y={-4} width={7} height={pole} fill="#2a2118" />}
			<defs>
				{Array.from({length: N}).map((_, i) => (
					<clipPath id={`${id}${i}`} key={i}>
						<rect x={(i * w) / N} y={-30} width={w / N + 1.2} height={h + 60} />
					</clipPath>
				))}
			</defs>
			{Array.from({length: N}).map((_, i) => {
				const dy = Math.sin(f / 7 + i * 0.55 + phase) * amp * (i / N);
				const sh = 0.82 + 0.18 * Math.cos(f / 7 + i * 0.55 + phase);
				return (
					<g key={i} transform={`translate(0 ${dy})`} clipPath={`url(#${id}${i})`}>
						{art}
						<rect width={w} height={h} fill="#000" opacity={1 - sh} />
					</g>
				);
			})}
		</g></Svg>
	);
};
function starPts(cx: number, cy: number, R: number, r: number) {
	const p: string[] = [];
	for (let i = 0; i < 10; i++) {
		const a = -Math.PI / 2 + (i * Math.PI) / 5;
		const rr = i % 2 ? r : R;
		p.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
	}
	return p.join(' ');
}

/** Fumaça subindo (círculos que crescem e esmaecem). */
export const Smoke: React.FC<{x: number; y: number; n?: number; color?: string; w?: number; rise?: number; opacity?: number; speed?: number}> = ({x, y, n = 14, color = '#2a2624', w = 60, rise = 520, opacity = 0.55, speed = 1}) => {
	const f = useCurrentFrame();
	return (
		<Svg style={{filter: 'blur(14px)'}}>
			{Array.from({length: n}).map((_, i) => {
				const t = ((f * speed) / 90 + i / n) % 1;
				const cx = x + Math.sin(t * 5 + i) * w * 0.8 + t * w * 1.4;
				const cy = y - t * rise;
				const r = 22 + t * w * 1.6;
				return <circle key={i} cx={cx} cy={cy} r={r} fill={color} opacity={opacity * Math.sin(Math.PI * t) * 0.9} />;
			})}
		</Svg>
	);
};

/** Clarão de artilharia/explosão: brilha em instantes pseudo-aleatórios (a cada `every` quadros) ou em `at` (quadro local). */
export const Flash: React.FC<{x: number; y: number; r?: number; every?: number; seed?: number; color?: string; at?: number; len?: number}> = ({x, y, r = 260, every = 40, seed = 1, color = '255,190,110', at, len = 10}) => {
	const f = useCurrentFrame();
	let k = 0;
	if (at !== undefined) k = interpolate(f, [at, at + 2, at + len], [0, 1, 0], clamp);
	else {
		const slot = Math.floor(f / every);
		const start = slot * every + Math.floor(random(`fl${seed}${slot}`) * (every - len));
		const on = random(`fo${seed}${slot}`) > 0.35;
		k = on ? interpolate(f, [start, start + 2, start + len], [0, 1, 0], clamp) : 0;
	}
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: k}}>
			<div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, background: `radial-gradient(circle, rgba(${color},0.95) 0%, rgba(${color},0.35) 38%, rgba(${color},0) 70%)`}} />
		</AbsoluteFill>
	);
};

/** Picos de calcário (karst) em silhueta, com neblina na base. */
export const Karst: React.FC<{baseY: number; color: string; seed: number; amp?: number; fog?: string; speed?: number; step?: number}> = ({baseY, color, seed, amp = 240, fog = 'rgba(200,215,220,0.25)', speed = 0.06, step = 150}) => {
	const f = useCurrentFrame();
	const off = f * speed;
	const pts: string[] = [`-100,${H}`];
	for (let x = -150; x <= W + 150; x += step) {
		const i = Math.floor((x + off * 0) / step);
		const hh = amp * (0.35 + 0.65 * random(`k${seed}${i}`));
		const xx = x - (off % step);
		pts.push(`${xx - step * 0.5},${baseY - hh * 0.15}`, `${xx - step * 0.18},${baseY - hh * 0.8}`, `${xx},${baseY - hh}`, `${xx + step * 0.2},${baseY - hh * 0.7}`, `${xx + step * 0.55},${baseY - hh * 0.1}`);
	}
	pts.push(`${W + 100},${H}`);
	return (
		<Svg>
			<defs>
				<linearGradient id={`kg${seed}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={color} />
					<stop offset="0.75" stopColor={color} />
					<stop offset="1" stopColor={fog} />
				</linearGradient>
			</defs>
			<polygon points={pts.join(' ')} fill={`url(#kg${seed})`} />
		</Svg>
	);
};

/** Arrozais em terraços em perspectiva refletindo o céu. */
export const Paddy: React.FC<{y: number; sky: string; green: string; rows?: number}> = ({y, sky, green, rows = 9}) => {
	const f = useCurrentFrame();
	return (
		<Svg>
			<rect x={0} y={y} width={W} height={H - y} fill={green} />
			{Array.from({length: rows}).map((_, i) => {
				const t = i / rows;
				const yy = y + Math.pow(t, 1.5) * (H - y);
				const hh = 14 + t * 130;
				const wob = Math.sin(f / 40 + i) * 10;
				return (
					<g key={i}>
						<path d={`M0 ${yy + hh} Q ${W * 0.3} ${yy + wob} ${W * 0.6} ${yy + hh * 0.7} T ${W} ${yy + hh * 0.4} L${W} ${yy + hh} Z`} fill={sky} opacity={0.35} />
						<path d={`M0 ${yy + hh} Q ${W * 0.3} ${yy + wob} ${W * 0.6} ${yy + hh * 0.7} T ${W} ${yy + hh * 0.4}`} fill="none" stroke="#0c1a0f" strokeOpacity={0.5} strokeWidth={2 + t * 4} />
					</g>
				);
			})}
		</Svg>
	);
};

/** Helicóptero em silhueta cruzando a tela (progresso 0–1 em `t`). */
export const Heli: React.FC<{y: number; t: number; s?: number; color?: string; dir?: 1 | -1}> = ({y, t, s = 1, color = '#0d0b0a', dir = 1}) => {
	const f = useCurrentFrame();
	const x = dir === 1 ? -200 + t * (W + 400) : W + 200 - t * (W + 400);
	const yy = y + Math.sin(f / 18) * 8;
	const rot = Math.abs(Math.sin(f * 1.7)) * 150 + 40;
	return (
		<g transform={`translate(${x} ${yy}) scale(${s * dir} ${s})`}>
			<ellipse cx={0} cy={0} rx={62} ry={26} fill={color} />
			<polygon points="48,-8 190,-18 190,-8 52,12" fill={color} />
			<polygon points="180,-40 196,-40 196,0 184,0" fill={color} />
			<rect x={-8} y={-38} width={6} height={14} fill={color} />
			<ellipse cx={-5} cy={-40} rx={rot} ry={2.6} fill={color} opacity={0.75} />
			<path d="M-46 36 L46 36 M-30 36 L-24 22 M30 36 L24 22" stroke={color} strokeWidth={4} fill="none" />
			<ellipse cx={-34} cy={-4} rx={22} ry={13} fill="#9fb2b8" opacity={0.25} />
		</g>
	);
};

/** Torre de vigia com facho de luz. */
export const Tower: React.FC<{x: number; y: number; s?: number; color?: string; beam?: boolean; dir?: 1 | -1}> = ({x, y, s = 1, color = '#15110e', beam = true, dir = 1}) => {
	const f = useCurrentFrame();
	const a = Math.sin(f / 50) * 14;
	return (
		<Svg><g transform={`translate(${x} ${y}) scale(${s})`}>
			{beam && <polygon points={`0,-300 ${dir * 520},${-210 + a * 6} ${dir * 520},${-90 + a * 6}`} fill="rgba(255,236,190,0.16)" />}
			<path d="M-34 0 L-18 -250 M34 0 L18 -250 M-26 -110 L26 -110 M-22 -190 L22 -190 M-30 -50 L22 -190 M30 -50 L-22 -190" stroke={color} strokeWidth={7} fill="none" />
			<rect x={-44} y={-310} width={88} height={64} fill={color} />
			<polygon points="-56,-310 0,-352 56,-310" fill={color} />
			<rect x={-30} y={-298} width={60} height={20} fill="#ffd98a" opacity={0.7} />
		</g></Svg>
	);
};

/** Figura em silhueta. kind: soldier | hat | suit | reporter */
export const Fig: React.FC<{x: number; y: number; s?: number; kind?: string; color?: string; walk?: number; flip?: boolean}> = ({x, y, s = 1, kind = 'soldier', color = '#0f0c0b', walk = 0, flip}) => {
	const f = useCurrentFrame();
	const b = walk ? Math.abs(Math.sin(f / 5 + x)) * 4 : Math.sin(f / 30 + x) * 1.2;
	const leg = walk ? Math.sin(f / 5 + x) * 9 : 0;
	return (
		<g transform={`translate(${x} ${y + b}) scale(${flip ? -s : s} ${s})`}>
			<ellipse cx={0} cy={4} rx={28} ry={7} fill="rgba(0,0,0,0.35)" />
			<path d={`M-12 -2 L${-8 + leg} -52 L${8 - leg} -52 L12 -2 Z`} fill={color} />
			<rect x={-14} y={-118} width={28} height={70} rx={9} fill={color} />
			{kind === 'soldier' && <path d="M-18 -122 Q0 -150 18 -122 L18 -112 L-18 -112 Z" fill={color} />}
			{kind === 'soldier' && <path d="M-16 -100 L36 -62 M-16 -98 L40 -66" stroke={color} strokeWidth={4} />}
			{kind === 'hat' && <polygon points="-36,-122 0,-152 36,-122" fill={color} />}
			{kind === 'suit' && <rect x={-16} y={-126} width={32} height={9} rx={3} fill={color} />}
			<circle cx={0} cy={-128} r={12} fill={color} />
		</g>
	);
};

/** Foco de luz no chão/mesa (piscina de luz quente). */
export const LightPool: React.FC<{x: number; y: number; rx?: number; ry?: number; color?: string; opacity?: number; flicker?: number}> = ({x, y, rx = 520, ry = 260, color = '255,214,150', opacity = 0.55, flicker = 0}) => {
	const f = useCurrentFrame();
	const k = 1 - flicker * (0.5 + 0.5 * Math.sin(f / 3 + Math.sin(f / 7) * 3));
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: opacity * k}}>
			<div style={{position: 'absolute', left: x - rx, top: y - ry, width: rx * 2, height: ry * 2, background: `radial-gradient(ellipse, rgba(${color},0.9) 0%, rgba(${color},0.25) 45%, rgba(${color},0) 72%)`}} />
		</AbsoluteFill>
	);
};

/** Abajur de mesa com cone de luz. */
export const Lamp: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<polygon points="-10,-30 -150,150 150,150 10,-30" fill="rgba(255,226,170,0.12)" />
		<ellipse cx={0} cy={0} rx={50} ry={10} fill="#1b1612" />
		<rect x={-4} y={-150} width={8} height={150} fill="#1b1612" />
		<path d="M-52 -150 Q0 -210 52 -150 Z" fill="#2c4a3c" />
		<ellipse cx={0} cy={-148} rx={50} ry={7} fill="#ffe2a8" />
	</g>
);

/** Holofote de uma mesa/escrivaninha: papéis, caneta, telefone. */
export const DeskProps: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={80} y={760} width={300} height={190} rx={6} fill="#d9cfb2" transform="rotate(-6 230 855)" />
		<rect x={120} y={780} width={300} height={190} rx={6} fill="#e6dcc3" transform="rotate(4 270 875)" />
		<rect x={1500} y={800} width={190} height={110} rx={8} fill="#0d0b0a" />
		<circle cx={1595} cy={855} r={34} fill="#1d1916" />
		<rect x={1420} y={930} width={260} height={10} rx={5} fill="#b08d57" transform="rotate(-14 1550 935)" />
		<circle cx={1380} cy={880} r={34} fill="none" stroke="#b08d57" strokeWidth={5} />
		<circle cx={1450} cy={880} r={34} fill="none" stroke="#b08d57" strokeWidth={5} />
	</g>
);

/** Palanque com microfones. */
export const Podium: React.FC<{x: number; y: number; s?: number; mics?: number}> = ({x, y, s = 1, mics = 3}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<polygon points="-110,0 -90,-170 90,-170 110,0" fill="#1b1410" />
		<polygon points="-100,-170 100,-170 112,-196 -112,-196" fill="#2c2018" />
		{Array.from({length: mics}).map((_, i) => (
			<g key={i} transform={`translate(${(i - (mics - 1) / 2) * 52} -196)`}>
				<rect x={-2} y={-90} width={4} height={90} fill="#0d0b0a" />
				<ellipse cx={0} cy={-98} rx={11} ry={15} fill="#0d0b0a" />
			</g>
		))}
	</g>
);

/** Linha de arame farpado. */
export const Barbed: React.FC<{y: number; x0?: number; x1?: number; color?: string; s?: number}> = ({y, x0 = -50, x1 = W + 50, color = '#0b0907', s = 1}) => {
	const n = Math.floor((x1 - x0) / (60 * s));
	return (
		<g>
			{Array.from({length: n + 1}).map((_, i) => (
				<rect key={i} x={x0 + i * 60 * s - 4} y={y - 150 * s} width={8} height={150 * s + 40} fill={color} />
			))}
			{[0, 1, 2].map((k) => (
				<path key={k} d={`M${x0} ${y - 130 * s + k * 38 * s} ` + Array.from({length: n * 3 + 1}).map((_, i) => `L${x0 + i * 20 * s} ${y - 130 * s + k * 38 * s + (i % 2 ? -7 : 7) * s}`).join(' ')} fill="none" stroke={color} strokeWidth={3 * s} />
			))}
		</g>
	);
};

/** Fachada modernista do Congresso (Brasília): torres gêmeas, cúpula e tigela. */
export const Congress: React.FC<{x: number; y: number; s?: number; color?: string; win?: string}> = ({x, y, s = 1, color = '#1a1218', win = '#ffd98a'}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-420} y={-46} width={840} height={46} fill={color} />
		<path d="M-330 -46 A120 120 0 0 1 -90 -46 Z" fill={color} />
		<path d="M110 -166 A120 120 0 0 0 350 -166 L330 -46 L130 -46 Z" fill={color} />
		<rect x={-38} y={-380} width={30} height={334} fill={color} />
		<rect x={8} y={-380} width={30} height={334} fill={color} />
		<rect x={-70} y={-130} width={140} height={84} fill={color} />
		{Array.from({length: 14}).map((_, i) => (
			<g key={i}>
				<rect x={-34} y={-366 + i * 22} width={22} height={9} fill={win} opacity={0.55} />
				<rect x={12} y={-366 + i * 22} width={22} height={9} fill={win} opacity={0.4} />
			</g>
		))}
	</g>
);

/** Obelisco (Washington) em silhueta com luz de aviso piscando. */
export const Obelisk: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#0f1620'}) => {
	const f = useCurrentFrame();
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<polygon points="-26,0 -14,-520 14,-520 26,0" fill={color} />
			<polygon points="-14,-520 0,-570 14,-520" fill={color} />
			<circle cx={0} cy={-572} r={6} fill="#ff4a3a" opacity={Math.sin(f / 14) > 0.2 ? 1 : 0.15} />
		</g>
	);
};

/** Chaminé de usina com janelas. */
export const Plant: React.FC<{x: number; y: number; s?: number; color?: string; lights?: number}> = ({x, y, s = 1, color = '#15151a', lights = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-260} y={-190} width={520} height={190} fill={color} />
		<rect x={-300} y={-110} width={90} height={110} fill={color} />
		<polygon points="90,-190 110,-520 150,-520 170,-190" fill={color} />
		<polygon points="-110,-190 -94,-440 -62,-440 -46,-190" fill={color} />
		{Array.from({length: 10}).map((_, i) => <rect key={i} x={-230 + i * 48} y={-150} width={26} height={44} fill="#ffcf7a" opacity={0.75 * lights} />)}
		<rect x={-200} y={-176} width={400} height={10} fill="#ffcf7a" opacity={0.5 * lights} />
	</g>
);

/** Jipe/caminhão simples em silhueta. */
export const Jeep: React.FC<{x: number; y: number; s?: number; color?: string; truck?: boolean}> = ({x, y, s = 1, color = '#0e0d0b', truck}) => {
	const f = useCurrentFrame();
	const b = Math.sin(f / 4) * 1.5;
	return (
		<g transform={`translate(${x} ${y + b}) scale(${s})`}>
			<ellipse cx={0} cy={6} rx={120} ry={9} fill="rgba(0,0,0,0.4)" />
			<rect x={-110} y={-58} width={220} height={40} rx={6} fill={color} />
			{truck ? <rect x={-110} y={-110} width={150} height={56} fill={color} /> : <path d="M-50 -58 L-36 -96 L40 -96 L56 -58 Z" fill={color} />}
			<rect x={50} y={-84} width={50} height={30} fill={color} />
			<circle cx={-66} cy={-14} r={26} fill={color} />
			<circle cx={66} cy={-14} r={26} fill={color} />
			<circle cx={-66} cy={-14} r={10} fill="#3a3430" />
			<circle cx={66} cy={-14} r={10} fill="#3a3430" />
			<polygon points="112,-48 330,-26 330,-70" fill="rgba(255,230,170,0.16)" />
		</g>
	);
};

/** Urna com cédulas caindo. */
export const BallotBox: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
	const f = useCurrentFrame();
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			{Array.from({length: 6}).map((_, i) => {
				const t = ((f / 50 + i / 6) % 1);
				return <rect key={i} x={-34 + (i % 3) * 8} y={-420 + t * 330} width={70} height={92} fill="#efe6d0" opacity={Math.sin(Math.PI * t)} transform={`rotate(${(i - 3) * 9 + t * 20} 0 ${-420 + t * 330})`} />;
			})}
			<rect x={-150} y={-160} width={300} height={160} rx={8} fill="#2a1d14" />
			<rect x={-150} y={-160} width={300} height={20} rx={6} fill="#4a3322" />
			<rect x={-62} y={-150} width={124} height={7} fill="#050403" />
			<rect x={-120} y={-100} width={240} height={56} fill="#b08d57" opacity={0.35} />
		</g>
	);
};

/** Pergaminho enrolado com selo. */
export const Scroll: React.FC<{x: number; y: number; w?: number; rot?: number; seal?: string}> = ({x, y, w = 560, rot = 0, seal = '#8E1B1B'}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot})`}>
		<rect x={-w / 2} y={-170} width={w} height={340} rx={6} fill="#e6dcc3" />
		{Array.from({length: 9}).map((_, i) => <rect key={i} x={-w / 2 + 50} y={-125 + i * 24} width={(w - 100) * (0.65 + 0.3 * random(`sc${x}${i}`))} height={6} fill="#141210" opacity={0.5} />)}
		<rect x={-w / 2 - 18} y={-182} width={w + 36} height={26} rx={13} fill="#b89d6a" />
		<rect x={-w / 2 - 18} y={156} width={w + 36} height={26} rx={13} fill="#b89d6a" />
		<circle cx={w / 2 - 80} cy={110} r={34} fill={seal} />
		<circle cx={w / 2 - 80} cy={110} r={22} fill="none" stroke="#c9483f" strokeWidth={3} />
	</g>
);

/** Piscadas de flash de câmera (imprensa). */
export const CameraFlashes: React.FC<{seed?: number; n?: number}> = ({seed = 1, n = 5}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			{Array.from({length: n}).map((_, i) => {
				const ff = f + i * 17;
				const slot = Math.floor(ff / 36);
				const st = slot * 36 + Math.floor(random(`cf${seed}${i}${slot}`) * 28);
				const k = interpolate(ff, [st, st + 1, st + 5], [0, 1, 0], clamp);
				const x = 200 + random(`cx${seed}${i}${slot}`) * 1500;
				const y = 640 + random(`cy${seed}${i}${slot}`) * 260;
				return <div key={i} style={{position: 'absolute', left: x - 150, top: y - 150, width: 300, height: 300, opacity: k, background: 'radial-gradient(circle, rgba(255,255,245,0.95) 0%, rgba(255,255,245,0.25) 35%, rgba(255,255,245,0) 70%)'}} />;
			})}
		</AbsoluteFill>
	);
};

const CamCtx = React.createContext<{z: number; origin: string}>({z: 1, origin: '50% 50%'});
/** Câmera com parallax por camada: o quadro todo dá zoom/pan; cada <L d> compensa para andar mais ou menos. */
export const Cam2: React.FC<{children: React.ReactNode; z0?: number; z1?: number; pan?: [number, number]; origin?: string}> = ({children, z0 = 1, z1 = 1.1, pan = [0, 0], origin = '50% 50%'}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	const z = z0 + (z1 - z0) * t;
	return (
		<CamCtx.Provider value={{z, origin}}>
			<AbsoluteFill style={{transformOrigin: origin, scale: String(z), translate: `${pan[0] * t}% ${pan[1] * t}%`}}>{children}</AbsoluteFill>
		</CamCtx.Provider>
	);
};
/** Camada de profundidade: d < 1 é longe (anda menos), d > 1 é perto (anda mais). */
export const L: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
	const {z, origin} = React.useContext(CamCtx);
	const s = (1 + (z - 1) * d) / z;
	return <AbsoluteFill style={{transformOrigin: origin, scale: String(s)}}>{children}</AbsoluteFill>;
};

/** Navio a vapor (cargueiro/transporte de tropas): casco cinza, superestrutura, chaminé com fumaça. */
export const Steam: React.FC<{x: number; y: number; s?: number; flag?: string; hull?: string; smoke?: boolean}> = ({x, y, s = 1, flag = '#c8372d', hull = '#262c33', smoke = true}) => {
	const f = useCurrentFrame();
	const rot = Math.sin(f / 40 + x) * 0.8;
	return (
		<g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
			<polygon points="-230,-20 230,-20 260,-70 -250,-70" fill={hull} />
			<polygon points="-250,-70 260,-70 262,-80 -252,-80" fill="#7a2a22" />
			<rect x={-120} y={-130} width={180} height={50} fill="#d8d4c8" />
			<rect x={-90} y={-170} width={110} height={40} fill="#c8c4b6" />
			<rect x={-70} y={-160} width={14} height={14} fill="#1a2028" />
			<rect x={-40} y={-160} width={14} height={14} fill="#1a2028" />
			<rect x={30} y={-205} width={40} height={78} fill="#15110e" />
			<rect x={30} y={-188} width={40} height={14} fill="#c8372d" />
			<rect x={-200} y={-140} width={6} height={72} fill="#15110e" />
			<rect x={150} y={-150} width={6} height={80} fill="#15110e" />
			<polygon points="-200,-140 -150,-132 -200,-124" fill={flag} />
			{Array.from({length: 18}).map((_, i) => <circle key={i} cx={-210 + i * 25} cy={-48} r={4} fill="#ffcf7a" opacity={0.5} />)}
			{smoke && (
				<g>
					{Array.from({length: 7}).map((_, i) => {
						const t = ((f / 80) + i / 7) % 1;
						return <circle key={i} cx={50 + t * 160} cy={-210 - t * 150} r={18 + t * 46} fill="#1b1a1a" opacity={0.5 * Math.sin(Math.PI * t)} />;
					})}
				</g>
			)}
		</g>
	);
};
