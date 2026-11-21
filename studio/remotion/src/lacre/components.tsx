// Biblioteca de componentes do Lacre. Cada componente é parametrizado; nada de asset "solto" por vídeo.
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, E, F, clamp} from './tokens';

/** Grão de filme animado (SVG feTurbulence; muda a semente a cada 2 quadros). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(frame / 2) % 50;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
			<svg width="100%" height="100%">
				<filter id={`g${seed}`}>
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter={`url(#g${seed})`} />
			</svg>
		</AbsoluteFill>
	);
};

export const Vignette: React.FC<{strength?: number; soft?: boolean}> = ({strength = 0.75, soft = false}) => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			background: `radial-gradient(ellipse at center, rgba(0,0,0,0) ${soft ? 62 : 45}%, rgba(10,8,6,${strength}) 100%)`,
		}}
	/>
);

/** Fundo de mesa escura com textura de papel envelhecido nas bordas. */
export const Desk: React.FC = () => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at 50% 40%, #2a221b 0%, #15110d 70%, #0b0907 100%)`,
		}}
	/>
);

/**
 * Gravura/foto como "prova impressa": moldura de papel, sombra, leve rotação e movimento de câmera
 * (Ken Burns) com recorte focal. focus = [x%, y%] do ponto de interesse; zoom de z0 para z1.
 */
export const Print: React.FC<{
	src: string;
	focus?: [number, number];
	z0?: number;
	z1?: number;
	pan?: [number, number]; // deslocamento final em % (x, y)
	tilt?: number;
	width?: number; // largura da moldura em px
	height?: number;
	tone?: 'sepia' | 'cold' | 'none';
	dim?: number; // 0..1 escurecimento extra
}> = ({src, focus = [50, 50], z0 = 1.08, z1 = 1.22, pan = [0, 0], tilt = -1.2, width = 1560, height = 900, tone = 'sepia', dim = 0}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	const enter = interpolate(frame, [0, 14], [0, 1], {...clamp, easing: E.out});
	const filter =
		tone === 'sepia'
			? `sepia(0.55) contrast(1.08) brightness(${0.92 - dim * 0.5})`
			: tone === 'cold'
				? `grayscale(0.6) contrast(1.1) brightness(${0.78 - dim * 0.5}) hue-rotate(185deg) saturate(0.35)`
				: `brightness(${1 - dim * 0.5})`;
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<div
				style={{
					width,
					height,
					padding: 22,
					background: C.paper,
					boxShadow: '0 40px 80px rgba(0,0,0,0.65), 0 6px 18px rgba(0,0,0,0.45)',
					rotate: `${tilt + (1 - enter) * 2}deg`,
					scale: String(0.96 + enter * 0.04),
					opacity: enter,
				}}
			>
				<div style={{width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: C.ink}}>
					<Img
						src={staticFile(src)}
						style={{
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							objectPosition: `${focus[0]}% ${focus[1]}%`,
							transformOrigin: `${focus[0]}% ${focus[1]}%`,
							scale: String(z0 + (z1 - z0) * t),
							translate: `${pan[0] * t}% ${pan[1] * t}%`,
							filter,
						}}
					/>
					<div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 120px rgba(40,25,10,0.55)'}} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** Selo de cera do Lacre: IMAGEM REAL (cera fotorrealista do Flow, recortada). O parâmetro `letter` é mantido por compatibilidade e ignorado. */
export const WaxSeal: React.FC<{size?: number; letter?: string; appearAt?: number}> = ({size = 120, appearAt = 0}) => {
	const frame = useCurrentFrame();
	const s = interpolate(frame, [appearAt, appearAt + 8], [1.6, 1], {...clamp, easing: E.out});
	const o = interpolate(frame, [appearAt, appearAt + 4], [0, 1], clamp);
	return (
		<Img
			src={staticFile('brand/selos/selo-7-corpo.png')}
			style={{width: size, height: 'auto', scale: String(s), opacity: o, display: 'block', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))'}}
		/>
	);
};

/** Rótulo de lugar/data: tira de papel com selo, canto inferior esquerdo. */
export const PlaceLabel: React.FC<{text: string; sub?: string; at?: number; pos?: 'top' | 'bottom'}> = ({text, sub, at = 6, pos = 'top'}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [at, at + 16], [0, 1], {...clamp, easing: E.out});
	const [line1, line2] = text.split(' · ');
	return (
		<AbsoluteFill style={{justifyContent: pos === 'top' ? 'flex-start' : 'flex-end', alignItems: 'flex-start', padding: pos === 'top' ? '86px 0 0 110px' : '0 0 90px 110px'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 18, opacity: p, translate: `${(1 - p) * -30}px 0px`}}>
				<WaxSeal size={64} appearAt={at} />
				<div
					style={{
						background: C.paper,
						padding: '12px 26px 12px 22px',
						clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
						boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
					}}
				>
					<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: C.ink}}>{line1}</div>
					{(line2 || sub) && (
						<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 19, letterSpacing: 3.5, color: C.seal, marginTop: 2}}>
							{line2 ?? sub}
						</div>
					)}
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** Palavra de impacto carimbada sobre a cena (ex.: "FUGINDO"). */
export const Stamp: React.FC<{text: string; at: number}> = ({text, at}) => {
	const frame = useCurrentFrame();
	const s = interpolate(frame, [at, at + 6], [2.2, 1], {...clamp, easing: E.out});
	const o = interpolate(frame, [at, at + 3], [0, 1], clamp);
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<div
				style={{
					fontFamily: F.serif,
					fontWeight: 900,
					fontSize: 150,
					letterSpacing: 18,
					color: C.sealBright,
					border: `10px solid ${C.sealBright}`,
					padding: '6px 40px 0',
					rotate: '-6deg',
					scale: String(s),
					opacity: o * 0.92,
					mixBlendMode: 'screen',
					textShadow: '0 0 30px rgba(0,0,0,0.4)',
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

/** Frase de impacto em tipografia sobre fundo escuro; a palavra de destaque aparece em vermelho. */
export const ImpactText: React.FC<{text: string; accent?: string}> = ({text, accent}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const words = text.split(' ');
	const accentWords = new Set((accent ?? '').split(' '));
	// deriva lenta contínua: evita quadro parado (rubrica V3) depois que as palavras entram
	const drift = interpolate(frame, [0, durationInFrames], [1, 1.07], clamp);
	return (
		<AbsoluteFill style={{background: C.ink, justifyContent: 'center', alignItems: 'center'}}>
			<div style={{maxWidth: 1300, textAlign: 'center', lineHeight: 1.12, scale: String(drift)}}>
				{words.map((w, i) => {
					const at = 2 + i * 3;
					const p = interpolate(frame, [at, at + 10], [0, 1], {...clamp, easing: E.out});
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								margin: '0 14px',
								fontFamily: F.serif,
								fontWeight: 900,
								fontSize: 104,
								letterSpacing: 3,
								color: accentWords.has(w) ? C.sealBright : C.paper,
								opacity: p,
								translate: `0px ${(1 - p) * 28}px`,
							}}
						>
							{w}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/** Cartela de título: nome do tema com espaçamento largo, fio de latão e selo. */
export const TitleCard: React.FC<{title: string; kicker?: string; at?: number}> = ({title, kicker, at = 0}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [at, at + 24], [0, 1], {...clamp, easing: E.out});
	const line = interpolate(frame, [at + 8, at + 34], [0, 1], {...clamp, easing: E.inOut});
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<div style={{textAlign: 'center'}}>
				{kicker && (
					<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 24, letterSpacing: 10, color: C.brass, opacity: p, marginBottom: 18}}>
						{kicker}
					</div>
				)}
				<div
					style={{
						fontFamily: F.serif,
						fontWeight: 700,
						fontSize: 150,
						letterSpacing: interpolate(p, [0, 1], [40, 22]),
						color: C.paper,
						opacity: p,
						textShadow: '0 8px 40px rgba(0,0,0,0.8)',
					}}
				>
					{title}
				</div>
				<div style={{height: 3, width: 760 * line, background: C.brass, margin: '14px auto 0'}} />
			</div>
		</AbsoluteFill>
	);
};
