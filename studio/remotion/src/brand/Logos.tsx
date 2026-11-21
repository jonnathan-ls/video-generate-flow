// Três famílias de logotipo do Lacre, desenhadas em código (vetor). Derivadas dos favoritos do usuário
// (lab/brand-sketches-2026-11): Mundo (9, 30, 18), Selo L (15, 31, 32) e Nome (5, 14).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {geoGraticule10, geoOrthographic, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import countries from 'world-atlas/countries-110m.json';
import {C, F} from '../lacre/tokens';
import {Grain, Vignette} from '../lacre/components';
import {MapScene} from '../lacre/MapScene';

export type Variant = 'world' | 'l' | 'word';

const SEAL_D =
	'M50 4 C62 6 70 2 78 12 C88 16 94 26 94 38 C99 48 96 60 92 68 C90 80 80 90 68 92 C58 98 44 98 34 94 C22 92 12 84 8 72 C2 62 4 48 6 38 C8 24 18 12 30 8 C38 4 44 4 50 4 Z';
const GOLD = '#E3C07A';

/** Base do selo: cera com brilho, sulco interno e sombra. `ribbon` acrescenta a fita cremosa abaixo. */
const SealBase: React.FC<{id: string; ribbon?: boolean; children?: React.ReactNode}> = ({id, ribbon, children}) => (
	<svg viewBox={`0 0 100 ${ribbon ? 132 : 100}`} width="100%" height="100%" style={{overflow: 'visible'}}>
		<defs>
			<radialGradient id={`${id}g`} cx="38%" cy="32%" r="80%">
				<stop offset="0%" stopColor="#D2402F" />
				<stop offset="55%" stopColor={C.seal} />
				<stop offset="100%" stopColor="#4d0d0d" />
			</radialGradient>
			<filter id={`${id}s`} x="-20%" y="-20%" width="140%" height="150%">
				<feDropShadow dx="0" dy="2.2" stdDeviation="2.2" floodColor="#000" floodOpacity="0.55" />
			</filter>
		</defs>
		{ribbon && (
			<g filter={`url(#${id}s)`}>
				<path d="M36 78 L28 128 L41 119 L48 130 L53 84 Z" fill="#E9DFC8" />
				<path d="M64 78 L72 128 L59 119 L52 130 L47 84 Z" fill="#CBBE9F" />
			</g>
		)}
		<path d={SEAL_D} fill={`url(#${id}g)`} filter={`url(#${id}s)`} />
		<path d={SEAL_D} transform="translate(50 50) scale(0.82) translate(-50 -50)" fill="none" stroke="#3b0a0a" strokeOpacity={0.45} strokeWidth={1.2} />
		<path d="M22 30 C28 18 42 12 58 12" fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={2.4} strokeLinecap="round" />
		{children}
	</svg>
);

const worldFeatures = (feature(countries as any, (countries as any).objects.countries) as any).features as any[];

/** Selo com rosa dos ventos e globo; o Brasil em ouro vivo (famílias "Mundo"). */
export const MarkWorld: React.FC<{id?: string}> = ({id = 'mw'}) => {
	const proj = geoOrthographic().rotate([30, 12]).scale(19.5).translate([50, 50]).clipAngle(90);
	const path = geoPath(proj);
	const pts: string[] = [];
	for (let i = 0; i < 16; i++) {
		const a = (i * 22.5 * Math.PI) / 180;
		const r = i % 2 === 1 ? 15 : i % 4 === 0 ? 42 : 32;
		pts.push(`${(50 + r * Math.sin(a)).toFixed(2)},${(50 - r * Math.cos(a)).toFixed(2)}`);
	}
	const brazil = worldFeatures.find((f) => String(f.id) === '076');
	return (
		<SealBase id={id}>
			<polygon points={pts.join(' ')} fill={C.brass} stroke="#6b4f23" strokeWidth={0.5} />
			<circle cx={50} cy={50} r={22.5} fill="#E9DFC8" stroke="#6b4f23" strokeWidth={0.8} />
			<path d={path(geoGraticule10()) ?? ''} fill="none" stroke="#B08D57" strokeOpacity={0.55} strokeWidth={0.25} />
			{worldFeatures.map((f, i) => (
				<path key={i} d={path(f) ?? ''} fill={String(f.id) === '076' ? '#F0B429' : '#B08D57'} stroke="#6b4f23" strokeWidth={0.18} />
			))}
			{brazil && <path d={path(brazil) ?? ''} fill="#F0B429" stroke="#7a4a0a" strokeWidth={0.45} />}
			<circle cx={50} cy={50} r={22.5} fill="none" stroke="#6b4f23" strokeWidth={0.8} />
		</SealBase>
	);
};

/** Selo clássico com "L" dourado, anel duplo e fita (família "Selo L"). */
export const MarkL: React.FC<{id?: string; ribbon?: boolean}> = ({id = 'ml', ribbon = true}) => (
	<SealBase id={id} ribbon={ribbon}>
		<circle cx={50} cy={50} r={33} fill="none" stroke={GOLD} strokeWidth={1.3} strokeOpacity={0.9} />
		<circle cx={50} cy={50} r={29.5} fill="none" stroke="#3b0a0a" strokeWidth={0.8} strokeOpacity={0.55} />
		<text x={50} y={65} textAnchor="middle" fontFamily={F.serif} fontWeight={900} fontSize={46} fill="#2a0707" fillOpacity={0.55} transform="translate(0.8 1)">
			L
		</text>
		<text x={50} y={65} textAnchor="middle" fontFamily={F.serif} fontWeight={900} fontSize={46} fill={GOLD} stroke="#7a5a22" strokeWidth={0.5}>
			L
		</text>
	</SealBase>
);

/** Monograma tipográfico (família "Nome"): "L" em serifa sobre círculo de cera, sem fita. */
export const MarkMono: React.FC = () => (
	<svg viewBox="0 0 100 100" width="100%" height="100%">
		<defs>
			<radialGradient id="mmg" cx="40%" cy="34%" r="80%">
				<stop offset="0%" stopColor="#C23A2E" />
				<stop offset="100%" stopColor="#5a1010" />
			</radialGradient>
		</defs>
		<circle cx={50} cy={50} r={46} fill="url(#mmg)" />
		<circle cx={50} cy={50} r={41} fill="none" stroke={GOLD} strokeWidth={1.2} />
		<text x={50} y={68} textAnchor="middle" fontFamily={F.serif} fontWeight={700} fontSize={58} fill={C.paper}>
			L
		</text>
	</svg>
);

const Tagline: React.FC<{size: number; align?: 'left' | 'center'}> = ({size, align = 'left'}) => (
	<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: size, letterSpacing: size * 0.22, color: C.brass, textAlign: align, lineHeight: 1.2}}>HISTÓRIA DO MUNDO E DO BRASIL</div>
);

/** Assinatura (lockup): horizontal para Mundo, vertical para Selo L, centrada para Nome. */
export const Lockup: React.FC<{variant: Variant; scale?: number}> = ({variant, scale = 1}) => {
	const s = (n: number) => n * scale;
	if (variant === 'world') {
		return (
			<div style={{display: 'flex', alignItems: 'center', gap: s(56)}}>
				<div style={{width: s(300), height: s(300)}}>
					<MarkWorld />
				</div>
				<div>
					<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: s(190), letterSpacing: s(20), color: C.paper, lineHeight: 1}}>LACRE</div>
					<div style={{height: s(3), background: C.brass, margin: `${s(16)}px 0 ${s(18)}px`}} />
					<Tagline size={s(30)} />
				</div>
			</div>
		);
	}
	if (variant === 'l') {
		return (
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(10)}}>
				<div style={{width: s(230), height: s(230 * 1.32)}}>
					<MarkL />
				</div>
				<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: s(190), letterSpacing: s(22), color: GOLD, lineHeight: 1, marginTop: s(6), paddingLeft: s(22)}}>LACRE</div>
				<div style={{display: 'flex', alignItems: 'center', gap: s(14), width: '100%'}}>
					<div style={{flex: 1, height: s(2), background: C.brass}} />
					<div style={{width: s(10), height: s(10), transform: 'rotate(45deg)', background: C.brass}} />
					<div style={{flex: 1, height: s(2), background: C.brass}} />
				</div>
				<Tagline size={s(28)} align="center" />
			</div>
		);
	}
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(14)}}>
			<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: s(220), letterSpacing: s(34), color: C.paper, lineHeight: 1, paddingLeft: s(34)}}>LACRE</div>
			<div style={{display: 'flex', alignItems: 'center', gap: s(18), width: '100%'}}>
				<div style={{flex: 1, height: s(2), background: C.brass}} />
				<div style={{width: s(46), height: s(46)}}>
					<MarkMono />
				</div>
				<div style={{flex: 1, height: s(2), background: C.brass}} />
			</div>
			<Tagline size={s(28)} align="center" />
		</div>
	);
};

const bg = (extra?: React.ReactNode) => (
	<>
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #2c1410 0%, ${C.ink} 72%)`}} />
		{extra}
	</>
);

export const LogoAvatar: React.FC<{variant: Variant}> = ({variant}) => (
	<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
		{bg()}
		<div style={{position: 'absolute', width: 690, height: 690, borderRadius: '50%', border: `4px solid ${C.brass}`, opacity: 0.5}} />
		<div style={{position: 'relative', width: variant === 'l' ? 440 : 520, height: variant === 'l' ? 440 * 1.32 : 520, marginTop: variant === 'l' ? 40 : 0}}>
			{variant === 'world' && <MarkWorld />}
			{variant === 'l' && <MarkL />}
			{variant === 'word' && <MarkMono />}
		</div>
		<Grain opacity={0.08} />
	</AbsoluteFill>
);

export const LogoLockup: React.FC<{variant: Variant}> = ({variant}) => (
	<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
		{bg()}
		<div style={{position: 'relative'}}>
			<Lockup variant={variant} scale={variant === 'world' ? 0.9 : 0.8} />
		</div>
		<Grain opacity={0.08} />
	</AbsoluteFill>
);

export const LogoBanner: React.FC<{variant: Variant}> = ({variant}) => (
	<AbsoluteFill style={{background: C.ink}}>
		<AbsoluteFill style={{opacity: 0.45}}>
			<MapScene theme="night" cam0={{center: [-20, 18], scale: 900}} cam1={{center: [-20, 18], scale: 900}} />
		</AbsoluteFill>
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(20,18,16,0.15) 0%, rgba(20,18,16,0.84) 62%, ${C.ink} 100%)`}} />
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<Lockup variant={variant} scale={variant === 'world' ? 1.05 : variant === 'l' ? 0.62 : 1.05} />
		</AbsoluteFill>
		<Vignette strength={0.55} />
		<Grain opacity={0.08} />
	</AbsoluteFill>
);
