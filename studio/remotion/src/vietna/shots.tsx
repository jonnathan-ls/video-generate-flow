// Tomadas genéricas do vídeo "Vietnã": stat (número grande), typo (linhas de texto), timeline, chart (barras).
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, E, F, clamp} from '../lacre/tokens';
import {Particles, LightRays} from '../lacre/layers';
import {Desk} from '../lacre/components';
import {MapScene} from '../lacre/MapScene';

const FPS = 30;
const sec = (f: number) => f / FPS;
const fadeUp = (f: number, at: number, len = 14) => interpolate(f, [at * FPS, at * FPS + len], [0, 1], {...clamp, easing: E.out});

export type StatSpec = {top?: string; big: string; label: string; big_at_s: number; label_at_s: number; position?: 'bottom-left' | 'top-left'; big_size?: number; bar?: {frac: number; at_s: number}};
export const StatShot: React.FC<{d: StatSpec; t0: number; plate?: React.ReactNode}> = ({d, t0, plate}) => {
	const f = useCurrentFrame();
	const a = fadeUp(f, d.big_at_s - t0), b = fadeUp(f, d.label_at_s - t0);
	const topLeft = d.position === 'top-left';
	const push = interpolate(f, [0, 150], [1, 1.1], clamp);
	const bar = d.bar ? interpolate(f, [(d.bar.at_s - t0) * FPS, (d.bar.at_s - t0) * FPS + 40], [0, d.bar.frac], {...clamp, easing: E.inOut}) : 0;
	if (plate) {
		return (
			<AbsoluteFill>
				{plate}
				<AbsoluteFill style={{background: topLeft ? 'radial-gradient(ellipse 52% 50% at 20% 14%, rgba(8,6,5,0.62) 0%, rgba(8,6,5,0.3) 55%, rgba(8,6,5,0) 100%)' : 'radial-gradient(ellipse 52% 50% at 14% 86%, rgba(8,6,5,0.7) 0%, rgba(8,6,5,0.35) 55%, rgba(8,6,5,0) 100%)'}} />
				<AbsoluteFill style={{justifyContent: topLeft ? 'flex-start' : 'flex-end', alignItems: 'flex-start', padding: topLeft ? '80px 0 0 110px' : '0 0 210px 110px'}}>
					{d.top && <div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 34, letterSpacing: 8, color: C.paper, opacity: a, textTransform: 'uppercase', background: 'rgba(10,8,7,0.66)', padding: '5px 16px', borderLeft: `6px solid ${C.seal}`, textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>{d.top}</div>}
					<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: d.big_size ?? 170, lineHeight: 1.05, color: C.paper, opacity: a, translate: `${(1 - a) * -40}px 0px`, textShadow: '0 8px 40px rgba(0,0,0,0.8)'}}>{d.big}</div>
					{d.bar && (
						<div style={{width: 640, height: 20, background: 'rgba(233,223,200,0.2)', margin: '6px 0 12px', borderRadius: 3}}>
							<div style={{width: `${bar * 100}%`, height: '100%', background: '#c9483f', borderRadius: 3}} />
						</div>
					)}
					<div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 36, letterSpacing: 3, color: C.paper, opacity: b, maxWidth: 1500, textTransform: 'uppercase', background: 'rgba(10,8,7,0.62)', padding: '4px 14px', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>{d.label}</div>
				</AbsoluteFill>
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{background: '#0b1218'}}>
			<AbsoluteFill style={{opacity: 0.28, scale: String(1.2 + f * 0.001)}}>
				<MapScene theme="night" cam0={{center: [100, 18], scale: 700}} cam1={{center: [106, 16], scale: 900}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(11,18,24,0.2), rgba(11,18,24,0.88))'}} />
			<LightRays opacity={0.14} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', scale: String(push), paddingBottom: 60}}>
				{d.top && <div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 38, letterSpacing: 14, color: C.paper, opacity: a, textShadow: '0 3px 12px rgba(0,0,0,0.95)'}}>{d.top}</div>}
				<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: 260, lineHeight: 1.05, color: C.paper, opacity: a, translate: `0px ${(1 - a) * 36}px`, textShadow: '0 12px 50px rgba(0,0,0,0.7)'}}>{d.big}</div>
				{d.bar && (
					<div style={{width: 1000, height: 26, background: 'rgba(233,223,200,0.15)', margin: '6px 0 14px', borderRadius: 3}}>
						<div style={{width: `${bar * 100}%`, height: '100%', background: C.seal, borderRadius: 3}} />
					</div>
				)}
				<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 46, letterSpacing: 4, color: C.paper, opacity: b * 0.9, textAlign: 'center', maxWidth: 1400, textTransform: 'uppercase'}}>{d.label}</div>
			</AbsoluteFill>
			<Particles count={40} kind="dust" opacity={0.5} />
		</AbsoluteFill>
	);
};

export type TypoSpec = {lines: {text: string; at_s: number; size?: 'xl' | 'l' | 'm'; color?: 'brass' | 'paper' | 'seal'}[]};
export const TypoShot: React.FC<{d: TypoSpec; t0: number; plate?: React.ReactNode}> = ({d, t0, plate}) => {
	const f = useCurrentFrame();
	const push = interpolate(f, [0, 180], [1, 1.08], clamp);
	const col = {brass: C.brass, paper: C.paper, seal: '#c9483f'} as const;
	const size = {xl: 170, l: 104, m: 62} as const;
	if (plate) {
		const cs = {xl: 112, l: 74, m: 44} as const;
		return (
			<AbsoluteFill>
				{plate}
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 52% 50% at 14% 86%, rgba(8,6,5,0.7) 0%, rgba(8,6,5,0.35) 55%, rgba(8,6,5,0) 100%)'}} />
				<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 0 210px 110px'}}>
					{d.lines.map((l, i) => {
						const p = fadeUp(f, l.at_s - t0);
						return (
							<div key={i} style={{fontFamily: l.size === 'm' ? F.sans : F.serif, fontWeight: l.size === 'm' ? 700 : 900, fontSize: cs[l.size ?? 'l'], letterSpacing: l.size === 'm' ? 6 : 1, lineHeight: 1.1, color: col[l.color ?? 'paper'], opacity: p, translate: `${(1 - p) * -40}px 0px`, margin: '6px 0', textTransform: l.size === 'm' ? 'uppercase' : 'none', maxWidth: l.size === 'xl' ? 1600 : 1000, whiteSpace: l.size === 'xl' ? 'nowrap' : 'normal', textShadow: '0 6px 30px rgba(0,0,0,0.85)'}}>{l.text}</div>
						);
					})}
				</AbsoluteFill>
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill>
			<Desk />
			<AbsoluteFill style={{opacity: 0.22, scale: String(1.3 - f * 0.0008)}}>
				<MapScene theme="night" cam0={{center: [20, 20], scale: 260}} cam1={{center: [40, 18], scale: 300}} />
			</AbsoluteFill>
			<LightRays opacity={0.16} angle={14} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', scale: String(push), padding: '0 160px 80px'}}>
				{d.lines.map((l, i) => {
					const p = fadeUp(f, l.at_s - t0);
					return (
						<div key={i} style={{fontFamily: l.size === 'm' ? F.sans : F.serif, fontWeight: l.size === 'm' ? 700 : 900, fontSize: size[l.size ?? 'l'], letterSpacing: l.size === 'm' ? 6 : 2, lineHeight: 1.12, color: col[l.color ?? 'paper'], opacity: p, translate: `0px ${(1 - p) * 30}px`, textAlign: 'center', margin: '10px 0', textTransform: l.size === 'm' ? 'uppercase' : 'none', textShadow: '0 8px 40px rgba(0,0,0,0.7)'}}>
							{l.text}
						</div>
					);
				})}
			</AbsoluteFill>
			<Particles count={36} kind="dust" opacity={0.45} />
		</AbsoluteFill>
	);
};

export type TimelineSpec = {from: number; to: number; draw: {from_s: number; to_s: number}; marks: {year: number; label: string; at_s: number; accent?: boolean}[]};
export const TimelineShot: React.FC<{d: TimelineSpec; t0: number}> = ({d, t0}) => {
	const f = useCurrentFrame();
	const {width} = useVideoConfig();
	const x0 = 180, x1 = width - 180, y = 560;
	const prog = interpolate(f, [(d.draw.from_s - t0) * FPS, (d.draw.to_s - t0) * FPS], [0, 1], {...clamp, easing: E.inOut});
	const X = (yr: number) => x0 + ((yr - d.from) / (d.to - d.from)) * (x1 - x0);
	const ticks: number[] = [];
	for (let yr = d.from; yr <= d.to; yr += 5) ticks.push(yr);
	return (
		<AbsoluteFill style={{background: '#0b1218'}}>
			<AbsoluteFill style={{opacity: 0.25, scale: String(1.2 + f * 0.001)}}>
				<MapScene theme="night" cam0={{center: [60, 25], scale: 300}} cam1={{center: [90, 20], scale: 340}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(11,18,24,0.3), rgba(11,18,24,0.9))'}} />
			<svg width={width} height={1080} style={{position: 'absolute'}}>
				<line x1={x0} y1={y} x2={x0 + (x1 - x0) * prog} y2={y} stroke={C.brass} strokeWidth={5} strokeLinecap="round" />
				{ticks.map((yr) => {
					const on = X(yr) <= x0 + (x1 - x0) * prog + 1;
					return (
						<g key={yr} opacity={on ? 1 : 0.15}>
							<line x1={X(yr)} y1={y - 14} x2={X(yr)} y2={y + 14} stroke={C.paper} strokeWidth={3} />
							<text x={X(yr)} y={y + 62} textAnchor="middle" fontFamily={F.sans} fontWeight={700} fontSize={34} letterSpacing={2} fill={C.paper}>{yr}</text>
						</g>
					);
				})}
				{d.marks.map((m, i) => {
					const p = fadeUp(f, m.at_s - t0, 12);
					const up = i % 2 === 0;
					const ty = up ? y - 190 : y + 170;
					return (
						<g key={i} opacity={p}>
							<line x1={X(m.year)} y1={y} x2={X(m.year)} y2={up ? y - 150 : y + 140} stroke={m.accent ? '#c9483f' : C.brass} strokeWidth={4} />
							<circle cx={X(m.year)} cy={y} r={m.accent ? 18 : 13} fill={m.accent ? '#c9483f' : C.brass} stroke={C.paper} strokeWidth={4} />
							<text x={X(m.year)} y={ty + (up ? 0 : 30)} textAnchor="middle" fontFamily={F.serif} fontWeight={900} fontSize={m.accent ? 64 : 54} fill={m.accent ? '#e6a39d' : C.paper} stroke="#0b1218" strokeWidth={8} paintOrder="stroke">{m.label}</text>
						</g>
					);
				})}
			</svg>
			<Particles count={30} kind="dust" opacity={0.4} />
		</AbsoluteFill>
	);
};

export type ChartSpec = {title: string; src: string; bars: {label: string; value: number; display: string; at_s: number}[]};
export const ChartShot: React.FC<{d: ChartSpec; t0: number}> = ({d, t0}) => {
	const f = useCurrentFrame();
	const {width} = useVideoConfig();
	const max = Math.max(...d.bars.map((b) => b.value));
	const base = 840, H = 520, bw = 360, gap = 260;
	const total = d.bars.length * bw + (d.bars.length - 1) * gap;
	const xs = (i: number) => (width - total) / 2 + i * (bw + gap);
	const head = Math.max(0.01, fadeUp(f, 0.1));
	return (
		<AbsoluteFill>
			<Desk />
			<LightRays opacity={0.12} angle={12} />
			<AbsoluteFill style={{padding: '90px 0 0 130px'}}>
				<div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.paper, opacity: head, textTransform: 'uppercase', background: 'rgba(10,8,7,0.72)', padding: '6px 18px', borderLeft: `6px solid ${C.seal}`, textShadow: '0 3px 10px rgba(0,0,0,0.95)'}}>{d.title}</div>
				<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 28, letterSpacing: 1.5, color: C.paper, opacity: head * 0.85, marginTop: 10, textShadow: '0 2px 10px rgba(0,0,0,0.95)'}}>{d.src}</div>
			</AbsoluteFill>
			<svg width={width} height={1080} style={{position: 'absolute'}}>
				<line x1={xs(0) - 80} y1={base} x2={xs(d.bars.length - 1) + bw + 80} y2={base} stroke={C.paper} strokeOpacity={0.5} strokeWidth={3} />
				{d.bars.map((b, i) => {
					const p = interpolate(f, [(b.at_s - t0) * FPS, (b.at_s - t0) * FPS + 34], [0, 1], {...clamp, easing: E.out});
					const h = Math.max(6, (b.value / max) * H) * p;
					return (
						<g key={i}>
							<rect x={xs(i)} y={base - h} width={bw} height={h} fill={i === d.bars.length - 1 ? '#a8332f' : C.brass} />
							<text x={xs(i) + bw / 2} y={base - h - 26} textAnchor="middle" fontFamily={F.serif} fontWeight={900} fontSize={96} fill={C.paper} opacity={p} stroke="#15110d" strokeWidth={8} paintOrder="stroke">{b.display}</text>
							<text x={xs(i) + bw / 2} y={base + 62} textAnchor="middle" fontFamily={F.sans} fontWeight={700} fontSize={34} letterSpacing={2} fill={C.paper} opacity={p} style={{textTransform: 'uppercase'}}>{b.label}</text>
						</g>
					);
				})}
			</svg>
			<Particles count={26} kind="dust" opacity={0.35} />
		</AbsoluteFill>
	);
};

export type DominoSpec = {top: string; sub: string; fall_s: number};
export const DominoShot: React.FC<{d: DominoSpec; t0: number}> = ({d, t0}) => {
	const f = useCurrentFrame();
	const {width} = useVideoConfig();
	const n = 8, tw = 110, th = 280, gap = 70, base = 800;
	const total = n * tw + (n - 1) * gap;
	const x0 = (width - total) / 2;
	const head = fadeUp(f, 0.1);
	return (
		<AbsoluteFill>
			<Desk />
			<LightRays opacity={0.12} angle={12} />
			<AbsoluteFill style={{padding: '90px 0 0 130px'}}>
				<div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.paper, opacity: head, textTransform: 'uppercase', background: 'rgba(10,8,7,0.72)', padding: '6px 18px', borderLeft: `6px solid ${C.seal}`, textShadow: '0 3px 10px rgba(0,0,0,0.95)'}}>{d.top}</div>
				<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: C.paper, opacity: head * 0.88, marginTop: 10, textShadow: '0 2px 10px rgba(0,0,0,0.95)'}}>{d.sub}</div>
			</AbsoluteFill>
			<svg width={width} height={1080} style={{position: 'absolute'}}>
				<line x1={x0 - 80} y1={base} x2={x0 + total + 220} y2={base} stroke={C.paper} strokeOpacity={0.45} strokeWidth={3} />
				{Array.from({length: n}).map((_, i) => {
					const t = (f - (d.fall_s - t0) * FPS - i * 11) / 16;
					const a = interpolate(t, [0, 1], [0, 78], {...clamp, easing: Easing.in(Easing.quad)});
					const x = x0 + i * (tw + gap);
					return (
						<g key={i} transform={`rotate(${a} ${x + tw} ${base})`}>
							<rect x={x} y={base - th} width={tw} height={th} rx={8} fill={i === 0 ? '#a8332f' : C.paper} stroke="#15110d" strokeWidth={4} />
							{[0, 1, 2].map((k) => <circle key={k} cx={x + tw / 2} cy={base - th + 70 + k * 70} r={13} fill="#15110d" />)}
						</g>
					);
				})}
			</svg>
			<Particles count={24} kind="dust" opacity={0.35} />
		</AbsoluteFill>
	);
};

export type PairSpec = {a: {src: string; label: string; sub: string; at_s: number}; b: {src: string; label: string; sub: string; at_s: number}};
/** Dois documentos reais (domínio público) sobre a mesa, entrando um de cada vez, com legenda e foco de luz. */
export const PairShot: React.FC<{d: PairSpec; t0: number}> = ({d, t0}) => {
	const f = useCurrentFrame();
	const {width} = useVideoConfig();
	const push = interpolate(f, [0, 200], [1, 1.07], clamp);
	const card = (x: number, c: PairSpec['a'], rot: number) => {
		const p = interpolate(f, [(c.at_s - t0) * FPS, (c.at_s - t0) * FPS + 22], [0, 1], {...clamp, easing: E.out});
		return (
			<div style={{position: 'absolute', left: x, top: 60, width: 560, height: 700, opacity: p, translate: `0px ${(1 - p) * 120}px`, rotate: `${rot + (1 - p) * -4}deg`, boxShadow: '0 40px 80px rgba(0,0,0,0.75)', background: '#e6dcc3'}}>
				<Img src={staticFile(c.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 12%'}} />
				<div style={{position: 'absolute', left: 0, right: 0, bottom: -108, textAlign: 'center'}}>
					<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: 42, color: C.paper, textShadow: '0 4px 24px rgba(0,0,0,0.95)'}}>{c.label}</div>
					<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: C.paper, textTransform: 'uppercase', marginTop: 4, textShadow: '0 3px 14px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.9)'}}>{c.sub}</div>
				</div>
			</div>
		);
	};
	return (
		<AbsoluteFill>
			<Desk />
			<AbsoluteFill style={{opacity: 0.2, scale: String(1.3 - f * 0.0008)}}>
				<MapScene theme="night" cam0={{center: [20, 20], scale: 260}} cam1={{center: [40, 18], scale: 300}} />
			</AbsoluteFill>
			<AbsoluteFill style={{scale: String(push), transformOrigin: '50% 45%'}}>
				{card(width / 2 - 640, d.a, -3)}
				{card(width / 2 + 80, d.b, 2.5)}
			</AbsoluteFill>
			<LightRays opacity={0.14} angle={10} />
			<Particles count={30} kind="embers" opacity={0.35} />
		</AbsoluteFill>
	);
};
