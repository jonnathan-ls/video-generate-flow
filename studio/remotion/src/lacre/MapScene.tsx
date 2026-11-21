// Mapa editorial do Lacre: d3-geo + Natural Earth 110m (domínio público, via world-atlas/ISC).
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoGraticule10, geoInterpolate, geoMercator, geoPath} from 'd3-geo';
import {feature, mesh} from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import countries10 from 'world-atlas/countries-10m.json';
import {C, E, F, clamp} from './tokens';

const LAND = feature(land110 as any, (land110 as any).objects.land) as any;
const GRAT = geoGraticule10();
// Detalhe opcional (lote 2 do Vietnã, 2026-11-20): terra e fronteiras em 10m para mapas de perto (ex.: linha de Genebra, 1954).
let D10: {land: any; borders: any} | null = null;
const detail10 = () => {
	if (!D10) {
		const c = countries10 as any;
		D10 = {land: feature(c, c.objects.countries), borders: mesh(c, c.objects.countries, (a: any, b: any) => a !== b)};
	}
	return D10;
};
type LonLat = [number, number];

export type MapTheme = {bg: string; land: string; landOpacity: number; stroke: string; strokeOpacity: number; grat: string; gratOpacity: number; text: string; halo: string; texOpacity: number};
export const THEMES: Record<'paper' | 'engraved' | 'night', MapTheme> = {
	paper: {bg: C.paper, land: C.paperDark, landOpacity: 0.85, stroke: C.ink, strokeOpacity: 0.75, grat: C.slate, gratOpacity: 0.18, text: C.ink, halo: C.paper, texOpacity: 0.16},
	engraved: {bg: '#d8c7a0', land: '#b9a375', landOpacity: 0.9, stroke: '#3b2a17', strokeOpacity: 0.9, grat: '#6b5330', gratOpacity: 0.3, text: '#2a1c0d', halo: '#d8c7a0', texOpacity: 0.55},
	night: {bg: '#0e1a22', land: '#1b2d38', landOpacity: 1, stroke: '#B08D57', strokeOpacity: 0.9, grat: '#3E5566', gratOpacity: 0.35, text: '#E9DFC8', halo: '#0e1a22', texOpacity: 0},
};

export type MapCamera = {center: LonLat; scale: number};
export type MapPin = {at: LonLat; label: string; appear: number; align?: 'left' | 'right'};

export const MapScene: React.FC<{
	cam0: MapCamera;
	cam1: MapCamera;
	route?: LonLat[]; // linha animada (traçada entre routeFrom e routeTo, em quadros)
	routeFrom?: number;
	routeTo?: number;
	routeColor?: string;
	ship?: boolean;
	pins?: MapPin[];
	texture?: string; // carta antiga ao fundo
	theme?: 'paper' | 'engraved' | 'night';
	detail?: '10m'; // terra em 10m (mapas de perto); padrão 110m
	borders?: boolean; // fronteiras entre países (10m)
	band?: {km: number; from: number}; // faixa de largura real (km, total) ao longo da rota, aparece a partir do quadro `from`
}> = ({cam0, cam1, route, routeFrom = 0, routeTo = 60, routeColor = C.seal, ship, pins = [], texture, theme = 'paper', detail, borders, band}) => {
	const th = THEMES[theme];
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const t = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	const lerp = (a: number, b: number) => a + (b - a) * t;
	const proj = geoMercator()
		.center([lerp(cam0.center[0], cam1.center[0]), lerp(cam0.center[1], cam1.center[1])])
		.scale(Math.exp(lerp(Math.log(cam0.scale), Math.log(cam1.scale))))
		.translate([width / 2, height / 2]);
	const path = geoPath(proj);

	// rota: pontos densos ao longo dos segmentos (círculo máximo), cortados pelo progresso
	let routeD: string | null = null;
	let shipPt: [number, number] | null = null;
	if (route && route.length > 1 && frame >= routeFrom) {
		const dense: LonLat[] = [];
		for (let i = 0; i < route.length - 1; i++) {
			const f = geoInterpolate(route[i], route[i + 1]);
			for (let k = 0; k <= 40; k++) dense.push(f(k / 40) as LonLat);
		}
		const prog = interpolate(frame, [routeFrom, routeTo], [0, 1], {...clamp, easing: E.inOut});
		const n = Math.max(2, Math.round(dense.length * prog));
		routeD = path({type: 'LineString', coordinates: dense.slice(0, n)} as any);
		if (ship && prog > 0 && prog < 1) shipPt = proj(dense[n - 1]) as [number, number];
	}

	return (
		<AbsoluteFill style={{background: th.bg}}>
			{texture && (
				<Img
					src={staticFile(texture)}
					style={{position: 'absolute', inset: -60, width: 'calc(100% + 120px)', height: 'calc(100% + 120px)', objectFit: 'cover', opacity: th.texOpacity, filter: 'sepia(0.8) blur(2px) contrast(0.9)', scale: String(1 + t * 0.06)}}
				/>
			)}
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<defs>
					<filter id="inkBlur">
						<feGaussianBlur stdDeviation="0.6" />
					</filter>
				</defs>
				<path d={path(GRAT) ?? ''} fill="none" stroke={th.grat} strokeOpacity={th.gratOpacity} strokeWidth={1} />
				<path d={path(detail === '10m' ? detail10().land : LAND) ?? ''} fill={th.land} fillOpacity={th.landOpacity} stroke={th.stroke} strokeOpacity={th.strokeOpacity} strokeWidth={1.6} filter="url(#inkBlur)" />
				{borders && <path d={path(detail10().borders) ?? ''} fill="none" stroke={th.stroke} strokeOpacity={th.strokeOpacity * 0.7} strokeWidth={2} strokeDasharray="10 6" />}
				{band && route && route.length > 1 && frame >= band.from && (() => {
					const k = proj.scale() / 6371; // px por km no equador (Mercator): multiplicar por 1/cos(lat)
					const lat = route.reduce((a, p) => a + p[1], 0) / route.length;
					const w = (band.km * k) / Math.cos((lat * Math.PI) / 180);
					return <path d={path({type: 'LineString', coordinates: route} as any) ?? ''} fill="none" stroke={routeColor} strokeOpacity={0.32 * interpolate(frame, [band.from, band.from + 15], [0, 1], clamp)} strokeWidth={w} strokeLinejoin="round" strokeLinecap="butt" />;
				})()}
				{routeD && (
					<>
						<path d={routeD} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={9} strokeLinecap="round" />
						<path d={routeD} fill="none" stroke={routeColor} strokeWidth={6} strokeLinecap="round" strokeDasharray="18 10" />
					</>
				)}
				{shipPt && (
					<g transform={`translate(${shipPt[0]},${shipPt[1]})`}>
						<circle r={16} fill={C.seal} stroke={C.paper} strokeWidth={4} />
					</g>
				)}
				{pins.map((p, i) => {
					const [x, y] = proj(p.at) as [number, number];
					const o = interpolate(frame, [p.appear, p.appear + 10], [0, 1], {...clamp, easing: E.out});
					const right = p.align !== 'left';
					return (
						<g key={i} opacity={o}>
							<circle cx={x} cy={y} r={10 + (1 - o) * 14} fill="none" stroke={C.seal} strokeWidth={3} />
							<circle cx={x} cy={y} r={7} fill={C.seal} />
							<text
								x={x + (right ? 22 : -22)}
								y={y + 11}
								textAnchor={right ? 'start' : 'end'}
								fontFamily={F.serif}
								fontWeight={700}
								fontSize={40}
								letterSpacing={4}
								fill={th.text}
								stroke={th.halo}
								strokeWidth={6}
								paintOrder="stroke"
							>
								{p.label}
							</text>
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};
