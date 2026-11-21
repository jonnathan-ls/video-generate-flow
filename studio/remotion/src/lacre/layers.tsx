// Componentes do estilo A (ilustração flat em camadas): câmera, parallax e atmosfera.
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, E, clamp} from './tokens';

/** Plano de fundo ilustrado com câmera lenta (zoom + pan) e leve deriva de parallax. */
export const Plate: React.FC<{
	src: string;
	z0?: number;
	z1?: number;
	pan?: [number, number]; // % do deslocamento final
	focus?: [number, number];
	tint?: string; // cor de grade sobreposta (ex.: azul frio)
	tintOpacity?: number;
}> = ({src, z0 = 1.05, z1 = 1.18, pan = [0, 0], focus = [50, 50], tint, tintOpacity = 0}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: C.ink}}>
			<Img
				src={staticFile(src)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transformOrigin: `${focus[0]}% ${focus[1]}%`,
					scale: String(z0 + (z1 - z0) * t),
					translate: `${pan[0] * t}% ${pan[1] * t}%`,
				}}
			/>
			{tint && <AbsoluteFill style={{background: tint, opacity: tintOpacity, mixBlendMode: 'multiply'}} />}
		</AbsoluteFill>
	);
};

/** Personagem recortado (PNG com alfa) que entra, cruza e respira, com sombra no chão. */
export const Cutout: React.FC<{
	src: string;
	x: [number, number]; // % horizontal: de, para
	y?: number; // % vertical do pé
	height?: number; // % da altura do quadro
	enterAt?: number;
	flip?: boolean;
	shadow?: boolean;
	bob?: number; // amplitude do balanço em px
}> = ({src, x, y = 96, height = 78, enterAt = 0, flip = false, shadow = true, bob = 4}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(frame, [enterAt, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	const enter = interpolate(frame, [enterAt, enterAt + 14], [0, 1], {...clamp, easing: E.out});
	const px = x[0] + (x[1] - x[0]) * t;
	const sway = Math.sin(frame / 9) * bob;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{shadow && (
				<div
					style={{
						position: 'absolute',
						left: `${px}%`,
						top: `${y - 1.5}%`,
						width: `${height * 0.5}%`,
						height: '4%',
						translate: '-50% 0',
						background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)',
						opacity: enter,
					}}
				/>
			)}
			<Img
				src={staticFile(src)}
				style={{
					position: 'absolute',
					left: `${px}%`,
					top: `${y}%`,
					height: `${height}%`,
					translate: `-50% calc(-100% + ${sway}px)`,
					scale: `${flip ? -1 : 1} 1`,
					opacity: enter,
					filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.5))',
				}}
			/>
		</AbsoluteFill>
	);
};

/** Partículas (brasas, poeira, chuva) com deriva determinística. */
export const Particles: React.FC<{
	count?: number;
	kind?: 'dust' | 'embers' | 'rain';
	opacity?: number;
}> = ({count = 40, kind = 'dust', opacity = 0.5}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: kind === 'dust' ? 'screen' : 'normal'}}>
			<svg width={width} height={height}>
				{Array.from({length: count}).map((_, i) => {
					const r1 = random(`x${i}`), r2 = random(`y${i}`), r3 = random(`s${i}`), r4 = random(`v${i}`);
					const speed = 0.3 + r4 * 1.2;
					if (kind === 'rain') {
						const x = (r1 * width + frame * 6 * speed) % (width + 100) - 50;
						const y = ((r2 * height + frame * 28 * speed) % (height + 80)) - 40;
						return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 38} stroke={C.paper} strokeOpacity={opacity * 0.5} strokeWidth={1.6} />;
					}
					const x = (r1 * width + Math.sin(frame / 40 + i) * 30 + frame * 0.4 * speed) % width;
					const y = kind === 'embers' ? height - ((r2 * height + frame * 1.6 * speed) % height) : (r2 * height + frame * 0.3 * speed) % height;
					const rad = 1.2 + r3 * (kind === 'embers' ? 3.2 : 2.4);
					return <circle key={i} cx={x} cy={y} r={rad} fill={kind === 'embers' ? '#ffb15a' : C.paper} fillOpacity={opacity * (0.35 + r3 * 0.65)} />;
				})}
			</svg>
		</AbsoluteFill>
	);
};

/** Raios de luz diagonais suaves (atmosfera). */
export const LightRays: React.FC<{opacity?: number; angle?: number}> = ({opacity = 0.22, angle = 18}) => {
	const frame = useCurrentFrame();
	const shift = Math.sin(frame / 70) * 4;
	return (
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
				mixBlendMode: 'screen',
				opacity,
				background: `repeating-linear-gradient(${90 + angle + shift}deg, rgba(255,226,170,0) 0px, rgba(255,226,170,0.55) 60px, rgba(255,226,170,0) 150px, rgba(255,226,170,0) 320px)`,
				maskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
			}}
		/>
	);
};

/** Faixas de cor (color grading) por cena: aplica um tom sobre tudo. */
export const Grade: React.FC<{color: string; opacity?: number; mode?: 'multiply' | 'soft-light' | 'overlay'}> = ({color, opacity = 0.25, mode = 'soft-light'}) => (
	<AbsoluteFill style={{pointerEvents: 'none', background: color, opacity, mixBlendMode: mode}} />
);
