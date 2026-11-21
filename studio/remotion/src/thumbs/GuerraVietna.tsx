// Thumbnails 1280x720 do vídeo "Guerra do Vietnã" (ângulo Brasil). Mapas: Natural Earth 110m (domínio público).
// Regras: 1 foco, texto <= 4 palavras que complementa o título, canto inferior direito livre, legível a 160x90.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {geoInterpolate, geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import countries from 'world-atlas/countries-110m.json';
import land from 'world-atlas/land-110m.json';
import {C, F} from '../lacre/tokens';

const ALL = feature(countries as any, (countries as any).objects.countries) as any;
const LAND = feature(land as any, (land as any).objects.land) as any;
const pick = (id: string) => ALL.features.find((f: any) => String(f.id).padStart(3, '0') === id);
const VN = pick('704');
const BR = pick('076');

const txt = (size: number, color = C.paper): React.CSSProperties => ({
	fontFamily: F.sans, fontWeight: 800, fontSize: size, color, lineHeight: 0.98, textTransform: 'uppercase', letterSpacing: -2,
	textShadow: '0 4px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)',
});

// A: mapa com o arco entre o Vietnã e o Brasil (foco: a ligação). Texto: "E o Brasil foi?"
const MapBrasilVietna: React.FC = () => {
	const proj = geoMercator().center([24, 2]).scale(245).translate([640, 455]);
	const path = geoPath(proj);
	const f = geoInterpolate([106, 16], [-52, -10]);
	const dense = Array.from({length: 61}, (_, i) => f(i / 60));
	const arc = path({type: 'LineString', coordinates: dense} as any) as string;
	const bm = proj([-52, -10]) as [number, number];
	const vm = proj([106, 16]) as [number, number];
	return (
		<AbsoluteFill style={{background: '#0b1820'}}>
			<svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
				<path d={path(LAND) as string} fill="#1d3240" stroke="#2f4a5c" strokeWidth={1.2} />
				<path d={path(BR) as string} fill={C.brass} stroke={C.paper} strokeWidth={3} />
				<path d={path(VN) as string} fill={C.sealBright} stroke={C.paper} strokeWidth={3} />
				<path d={arc} fill="none" stroke={C.paper} strokeWidth={7} strokeDasharray="4 16" strokeLinecap="round" opacity={0.95} />
				<circle cx={bm[0]} cy={bm[1]} r={34} fill="none" stroke={C.paper} strokeWidth={8} />
				<circle cx={vm[0]} cy={vm[1]} r={34} fill="none" stroke={C.paper} strokeWidth={8} />
			</svg>
			<div style={{position: 'absolute', right: 50, top: 28, textAlign: 'right', ...txt(124)}}>E o Brasil<br /><span style={{color: C.brass}}>foi?</span></div>
			<div style={{position: 'absolute', left: 44, top: 34, background: C.sealBright, padding: '6px 28px', borderRadius: 10, ...txt(78)}}>1965</div>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
		</AbsoluteFill>
	);
};

// B: papel com selo e o ano (foco: o documento). Texto: "Pedido ao Brasil"
const PedidoSelo: React.FC = () => (
	<AbsoluteFill style={{background: '#120d0b'}}>
		<Img src={staticFile('brand/papel/p2.jpg')} style={{position: 'absolute', left: -120, top: -80, width: 1700, height: 949, objectFit: 'cover', transform: 'rotate(-3deg)'}} />
		<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(10,6,4,0.0) 0%, rgba(10,6,4,0.0) 38%, rgba(10,6,4,0.78) 100%)'}} />
		<div style={{position: 'absolute', left: 36, top: 46, fontFamily: F.serif, fontWeight: 900, fontSize: 330, color: '#2a1a14', lineHeight: 1, letterSpacing: -8, textShadow: '0 3px 0 rgba(255,250,235,0.5)'}}>1965</div>
		<Img src={staticFile('brand/selo-corpo.png')} style={{position: 'absolute', left: 190, top: 340, width: 350, filter: 'drop-shadow(0 14px 18px rgba(30,10,6,0.6))'}} />
		<div style={{position: 'absolute', right: 50, top: 150, width: 500, ...txt(138)}}>Pedido<br />ao <span style={{color: C.brass}}>Brasil</span></div>
	</AbsoluteFill>
);

// C: sonar com dois ataques e o "?" no segundo (foco: a dúvida). Texto: "Houve 2º ataque?"
const TonkinSonar: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(circle at 36% 54%, #12313f 0%, #071219 70%)'}}>
		<svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
			{[90, 180, 270, 360, 450].map((r) => <circle key={r} cx={460} cy={400} r={r} fill="none" stroke="#3E7A8C" strokeWidth={3} opacity={0.55 - r / 1500} />)}
			<line x1={460} y1={400} x2={700} y2={230} stroke="#7fd0e0" strokeWidth={5} opacity={0.8} />
			<circle cx={330} cy={330} r={26} fill={C.paper} />
			<circle cx={640} cy={470} r={26} fill={C.paper} />
			<circle cx={640} cy={470} r={78} fill="none" stroke={C.sealBright} strokeWidth={11} strokeDasharray="22 14" />
		</svg>
		<div style={{position: 'absolute', left: 300, top: 255, ...txt(46, '#9fd3df')}}>2 ago</div>
		<div style={{position: 'absolute', left: 540, top: 538, ...txt(46, C.paper)}}>4 ago</div>
		<div style={{position: 'absolute', right: 52, top: 52, width: 520, ...txt(116)}}>Houve<br /><span style={{color: C.sealBright}}>2º</span> ataque?</div>
		<div style={{position: 'absolute', left: 52, top: 40, ...txt(60, '#9fd3df')}}>Tonkin · 1964</div>
	</AbsoluteFill>
);

export const ThumbVietnaA = MapBrasilVietna;
export const ThumbVietnaB = PedidoSelo;
export const ThumbVietnaC = TonkinSonar;
