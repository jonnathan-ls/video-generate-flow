// Logotipos do Lacre com SELO REAL (cera fotorrealista gerada no Flow e recortada) e tipografia em código.
// O selo é imagem com transparência (public/brand/selos); o nome, a frase e o banner são vetor/texto.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from '../lacre/tokens';
import {Grain, Vignette} from '../lacre/components';
import {MapScene} from '../lacre/MapScene';

export type Real = {seal: number; layout: 'h' | 'v'; ratio: number}; // ratio = largura/altura do selo recortado

const shadow = 'drop-shadow(0 14px 22px rgba(0,0,0,0.6)) drop-shadow(0 3px 5px rgba(0,0,0,0.5))';
const Seal: React.FC<{n: number; height: number; ratio: number}> = ({n, height, ratio}) => (
	<Img src={staticFile(`brand/selos/selo-${n}.png`)} style={{height, width: height * ratio, filter: shadow, display: 'block'}} />
);
const Tagline: React.FC<{size: number; align?: 'left' | 'center'}> = ({size, align = 'left'}) => (
	<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: size, letterSpacing: size * 0.22, color: C.brass, textAlign: align, lineHeight: 1.2}}>HISTÓRIA DO MUNDO E DO BRASIL</div>
);

export const RealLockup: React.FC<Real & {scale?: number}> = ({seal, layout, ratio, scale = 1}) => {
	const s = (n: number) => n * scale;
	if (layout === 'h') {
		return (
			<div style={{display: 'flex', alignItems: 'center', gap: s(56)}}>
				<Seal n={seal} height={s(300)} ratio={ratio} />
				<div>
					<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: s(190), letterSpacing: s(20), color: C.paper, lineHeight: 1}}>LACRE</div>
					<div style={{height: s(3), background: C.brass, margin: `${s(16)}px 0 ${s(18)}px`}} />
					<Tagline size={s(30)} />
				</div>
			</div>
		);
	}
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(10)}}>
			<Seal n={seal} height={s(300)} ratio={ratio} />
			<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: s(180), letterSpacing: s(22), color: C.paper, lineHeight: 1, marginTop: s(8), paddingLeft: s(22)}}>LACRE</div>
			<div style={{display: 'flex', alignItems: 'center', gap: s(14), width: '100%'}}>
				<div style={{flex: 1, height: s(2), background: C.brass}} />
				<div style={{width: s(10), height: s(10), transform: 'rotate(45deg)', background: C.brass}} />
				<div style={{flex: 1, height: s(2), background: C.brass}} />
			</div>
			<Tagline size={s(28)} align="center" />
		</div>
	);
};

const bg = (
	<AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #2c1410 0%, ${C.ink} 72%)`}} />
);

export const RealAvatar: React.FC<Real> = ({seal, ratio}) => (
	<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
		{bg}
		<div style={{position: 'absolute', width: 690, height: 690, borderRadius: '50%', border: `4px solid ${C.brass}`, opacity: 0.45}} />
		<div style={{position: 'relative'}}>
			<Seal n={seal} height={Math.min(560, 560 / Math.max(ratio, 0.01) > 560 ? 560 : 560)} ratio={ratio} />
		</div>
		<Grain opacity={0.07} />
	</AbsoluteFill>
);

export const RealLockupStill: React.FC<Real> = (p) => (
	<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
		{bg}
		<div style={{position: 'relative'}}>
			<RealLockup {...p} scale={p.layout === 'h' ? 0.9 : 0.8} />
		</div>
		<Grain opacity={0.07} />
	</AbsoluteFill>
);

export const RealBanner: React.FC<Real> = (p) => (
	<AbsoluteFill style={{background: C.ink}}>
		<AbsoluteFill style={{opacity: 0.45}}>
			<MapScene theme="night" cam0={{center: [-20, 18], scale: 900}} cam1={{center: [-20, 18], scale: 900}} />
		</AbsoluteFill>
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(20,18,16,0.15) 0%, rgba(20,18,16,0.84) 62%, ${C.ink} 100%)`}} />
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<RealLockup {...p} scale={p.layout === 'h' ? 1.0 : 0.63} />
		</AbsoluteFill>
		<Vignette strength={0.55} />
		<Grain opacity={0.07} />
	</AbsoluteFill>
);
