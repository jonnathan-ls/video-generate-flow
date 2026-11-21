// Avatar e banner do Lacre sobre PAPEL DE CARTA real (textura gerada no Flow) com o selo real em cima.
// Regra do avatar: o CORPO do selo fica no centro do círculo; a fita pende para baixo dentro do círculo.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../lacre/tokens';

const INK = '#2a1a14';
const BRASS = '#7a5a2b';
const seal = 'drop-shadow(0 10px 12px rgba(40,15,10,0.45)) drop-shadow(0 2px 3px rgba(40,15,10,0.5))';

export const PaperAvatar: React.FC<{ribbon?: boolean}> = ({ribbon = true}) => {
	const s = ribbon ? 0.57 : 0.6;
	const W = 720, H = 906, cx = 360, cy = 324;
	return (
		<AbsoluteFill style={{background: '#e9dfc8'}}>
			<Img src={staticFile('brand/papel/p1.jpg')} style={{position: 'absolute', width: 1750, height: 977, left: -480, top: -110, objectFit: 'cover'}} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(255,250,235,0.0) 55%, rgba(120,80,40,0.18) 100%)'}} />
			{ribbon ? (
				<Img src={staticFile('brand/selo-com-fita.png')} style={{position: 'absolute', width: W * s, height: H * s, left: 400 - cx * s, top: 400 - cy * s, filter: seal}} />
			) : (
				<Img src={staticFile('brand/selo-corpo.png')} style={{position: 'absolute', width: 716 * s, height: 638 * s, left: 400 - 358 * s, top: 400 - 319 * s, filter: seal}} />
			)}
		</AbsoluteFill>
	);
};

export const PaperBanner: React.FC = () => (
	<AbsoluteFill style={{background: '#e9dfc8'}}>
		<Img src={staticFile('brand/papel/p2.jpg')} style={{position: 'absolute', width: 2800, height: 1563, left: -120, top: -62, objectFit: 'cover'}} />
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(255,250,235,0.0) 50%, rgba(120,80,40,0.20) 100%)'}} />
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 70}}>
				<Img src={staticFile('brand/selo-corpo.png')} style={{width: 395, height: 352, filter: seal}} />
				<div>
					<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 190, letterSpacing: 22, color: INK, lineHeight: 1}}>LACRE</div>
					<div style={{height: 3, background: BRASS, margin: '16px 0 18px'}} />
					<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 31, letterSpacing: 7, color: BRASS, lineHeight: 1.2}}>HISTÓRIA DO MUNDO E DO BRASIL</div>
				</div>
			</div>
		</AbsoluteFill>
	</AbsoluteFill>
);
