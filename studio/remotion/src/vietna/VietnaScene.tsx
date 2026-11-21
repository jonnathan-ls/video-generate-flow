// Renderizador de cenas do vídeo "Vietnã" (estilo D: código puro). Dirigido por DADOS (scenes.json):
// cada cena tem um `spec` com `kind`. Esta primeira versão implementa `map`; os outros tipos entram por cena.
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, E, F, clamp} from '../lacre/tokens';
import {Particles, LightRays} from '../lacre/layers';
import {Desk} from '../lacre/components';
import {Plate} from './plates';
import {SceneView, SceneSpec2} from './scene';
import {PairShot, PairSpec, DominoShot, DominoSpec, StatShot, TypoShot, TimelineShot, ChartShot, StatSpec, TypoSpec, TimelineSpec, ChartSpec} from './shots';
import {Shell, FxEvent, FxWord} from '../lacre/fx';
import {MapScene} from '../lacre/MapScene';
import {Grain, PlaceLabel, Vignette} from '../lacre/components';

type LonLat = [number, number];
export type MapSpec = {
	kind: 'map';
	cam0: {center: LonLat; scale: number};
	cam1: {center: LonLat; scale: number};
	pins?: {at: LonLat; label: string; at_s: number; align?: 'left' | 'right'}[];
	route?: {pts: LonLat[]; from_s: number; to_s: number};
	title?: {text: string; sub?: string; at_s: number};
};
type Pin = {at: LonLat; label: string; at_s: number; align?: 'left' | 'right'};
export type Shot = {
	kind: 'date' | 'map-zoom' | 'doc' | 'stat' | 'typo' | 'timeline' | 'chart' | 'domino' | 'plate' | 'pair';
	pair?: PairSpec;
	plate?: {name: string; scale?: number; ox?: string; oy?: string; at_s?: number; v?: string};
	scene?: SceneSpec2;
	stat?: StatSpec;
	typo?: TypoSpec;
	timeline?: TimelineSpec;
	chart?: ChartSpec;
	domino?: DominoSpec;
	swap?: {from: string; to: string; at_s: number; swap_s: number; pos?: 'left'};
	cut?: boolean;
	hold?: boolean;
	names?: {text: string; sub: string; at_s: number; out_s: number; pos?: 'left' | 'right'}[];
	start_s: number;
	end_s: number;
	date?: {top: string; big: string};
	cam0?: {center: LonLat; scale: number};
	cam1?: {center: LonLat; scale: number};
	pins?: Pin[];
	route?: {pts: LonLat[]; from_s: number; to_s: number; band_km?: number; band_s?: number};
	detail?: '10m'; // mapa de perto com terra e fronteiras em 10m (lote 2)
	borders?: boolean;
	doc?: {head: string; sub: string; src: string; quote?: string; redact?: boolean; at_s?: number};
};
export type ShotsSpec = {kind: 'shots'; shots: Shot[]; vignette?: number};
export type SceneSpec = MapSpec | ShotsSpec;
export type VietnaProps = {spec: SceneSpec; words: FxWord[]; events: FxEvent[]; durationSec: number; fps?: number};

const FPS = 30;
const FADE = 6;

const DateShot: React.FC<{top: string; big: string; plate?: React.ReactNode}> = ({top, big, plate}) => {
	const f = useCurrentFrame();
	const a = interpolate(f, [0, 14], [0, 1], {...clamp, easing: E.out});
	const b = interpolate(f, [8, 30], [0, 1], {...clamp, easing: E.out});
	const rule = interpolate(f, [14, 40], [0, 1], {...clamp, easing: E.inOut});
	const push = interpolate(f, [0, 100], [1, 1.12], clamp);
	const {durationInFrames: dd} = useVideoConfig();
	const outT = interpolate(f, [dd - 32, dd - 16], [1, 0], clamp);
	if (plate) {
		const tt = interpolate(f, [dd - 14, dd - 2], [1, 0], clamp);
		return (
			<AbsoluteFill>
				{plate}
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 48% 36% at 14% 12%, rgba(8,6,5,0.7) 0%, rgba(8,6,5,0.3) 55%, rgba(8,6,5,0) 100%)'}} />
				<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'flex-start', padding: '80px 0 0 110px', opacity: tt}}>
					<div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.paper, opacity: a, textTransform: 'uppercase', background: 'rgba(10,8,7,0.74)', padding: '6px 18px', borderLeft: `6px solid ${C.seal}`, textShadow: '0 3px 10px rgba(0,0,0,0.95)'}}>{top}</div>
					<div style={{width: 420 * rule, height: 3, background: C.brass, margin: '10px 0 0'}} />
					<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: big.length > 8 ? 150 : 230, lineHeight: 1.05, color: C.paper, opacity: b, translate: `${(1 - b) * -40}px 0px`, textShadow: '0 8px 40px rgba(0,0,0,0.8)'}}>{big}</div>
				</AbsoluteFill>
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{background: '#0b1218'}}>
			<AbsoluteFill style={{opacity: 0.35, scale: String(1.25 + f * 0.0015)}}>
				<MapScene theme="night" cam0={{center: [10, 20], scale: 240}} cam1={{center: [30, 15], scale: 270}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(11,18,24,0.15), rgba(11,18,24,0.85))'}} />
			<LightRays opacity={0.18} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', scale: String(push), opacity: outT}}>
				<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 40, letterSpacing: 18 - 10 * a + 8, color: C.paper, opacity: a, textShadow: '0 3px 12px rgba(0,0,0,0.95)'}}>{top}</div>
				<div style={{width: 520 * rule, height: 3, background: C.brass, margin: '14px 0 6px'}} />
				<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: big.length > 8 ? 210 : 300, lineHeight: 1, color: C.paper, opacity: b, translate: `0px ${(1 - b) * 40}px`, textShadow: '0 12px 50px rgba(0,0,0,0.7)'}}>{big}</div>
			</AbsoluteFill>
			<Particles count={46} kind="dust" opacity={0.55} />
		</AbsoluteFill>
	);
};

const DocShot: React.FC<{d: NonNullable<Shot['doc']>; t0: number}> = ({d, t0}) => {
	const f = useCurrentFrame();
	const enter = interpolate(f, [0, 24], [0, 1], {...clamp, easing: E.out});
	const push = interpolate(f, [0, 150], [1, 1.32], {...clamp, easing: E.inOut});
	const st = ((d.at_s ?? t0 + 2) - t0) * FPS;
	const hl = interpolate(f, [st, st + 22], [0, 1], {...clamp, easing: E.out});
	const bar = (w: number, k: number) => <div key={k} style={{width: `${w}%`, height: 9, margin: '0 0 30px', background: C.ink, opacity: 0.5}} />;
	return (
		<AbsoluteFill>
			<Desk />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', scale: String(push), transformOrigin: '50% 58%'}}>
				<div style={{width: 1060, height: 880, background: '#e6dcc3', rotate: `${-1.6 + (1 - enter) * -3}deg`, translate: `0px ${(1 - enter) * 520}px`, boxShadow: '0 40px 90px rgba(0,0,0,0.75)', padding: '60px 84px', position: 'relative'}}>
					<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: d.head.length > 14 ? 40 : 58, letterSpacing: d.head.length > 14 ? 5 : 10, color: C.ink}}>{d.head}</div>
					<div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: C.seal, margin: '6px 0 4px'}}>{d.sub}</div>
					<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 28, letterSpacing: 1.2, color: C.ink, opacity: 0.7, margin: '0 0 34px'}}>{d.src}</div>
					{[88, 74, 92, 80].map(bar)}
					<div style={{position: 'relative', margin: '8px 0 36px'}}>
						{d.quote ? <div style={{fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: 40, lineHeight: 1.3, color: C.ink, position: 'relative', zIndex: 1}}>{d.quote}</div> : (d.redact ? <div style={{height: 96, background: '#141210'}} /> : <div>{[80, 66].map(bar)}</div>)}
						<div style={{position: 'absolute', left: -14, top: 0, height: '100%', width: `${108 * hl}%`, background: C.seal, opacity: 0.28, mixBlendMode: 'multiply'}} />
					</div>
					{[84, 70, 90, 62].map(bar)}
				</div>
			</AbsoluteFill>
			<LightRays opacity={0.14} angle={10} />
			<Particles count={30} kind="dust" opacity={0.4} />
		</AbsoluteFill>
	);
};

// M1: letra ≥ 27 px em 1080p e texto claro sobre faixa escura translúcida (vale para todas as cenas).
const NameTag: React.FC<{text: string; sub: string; at: number; out: number; pos?: 'left' | 'right'}> = ({text, sub, at, out, pos}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [at, at + 14], [0, 1], {...clamp, easing: E.out}) * interpolate(f, [out - 8, out], [1, 0], clamp);
	const right = pos === 'right';
	return (
		<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: right ? 'flex-end' : 'flex-start', padding: right ? '90px 110px 0 0' : '90px 0 0 110px', opacity: p, translate: `${(1 - p) * (right ? 30 : -30)}px 0px`}}>
			<div style={{background: 'rgba(12,10,9,0.74)', padding: '14px 30px', borderLeft: right ? undefined : `8px solid ${C.seal}`, borderRight: right ? `8px solid ${C.seal}` : undefined, boxShadow: '0 12px 34px rgba(0,0,0,0.75)'}}>
				<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: 48, letterSpacing: 3, color: C.paper, textShadow: '0 3px 10px rgba(0,0,0,0.95)'}}>{text}</div>
				<div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 32, letterSpacing: 1.2, color: C.paper, opacity: 0.94, marginTop: 3, textShadow: '0 2px 8px rgba(0,0,0,0.95)', whiteSpace: sub.length <= 34 ? 'nowrap' : 'normal'}}>{sub}</div>
			</div>
		</AbsoluteFill>
	);
};

const Fog: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.22}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 40% 30% at 30% 40%, rgba(120,150,170,0.5), rgba(0,0,0,0))', translate: `${f * 1.1 - 120}px 0px`}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 35% 25% at 75% 65%, rgba(120,150,170,0.45), rgba(0,0,0,0))', translate: `${-f * 0.8 + 100}px 0px`}} />
		</AbsoluteFill>
	);
};

const SwapTag: React.FC<{s: NonNullable<Shot['swap']>; t0: number}> = ({s, t0}) => {
	const f = useCurrentFrame();
	const a = interpolate(f, [(s.at_s - t0) * FPS, (s.at_s - t0) * FPS + 14], [0, 1], {...clamp, easing: E.out});
	const strike = interpolate(f, [(s.swap_s - t0) * FPS - 14, (s.swap_s - t0) * FPS], [0, 1], {...clamp, easing: E.inOut});
	const b = interpolate(f, [(s.swap_s - t0) * FPS, (s.swap_s - t0) * FPS + 12], [0, 1], {...clamp, easing: E.out});
	return (
		<AbsoluteFill style={s.pos === 'left' ? {justifyContent: 'center', alignItems: 'flex-start', padding: '0 0 0 90px'} : {justifyContent: 'flex-start', alignItems: 'center', padding: '100px 0 0 0'}}>
			<div style={{background: C.paper, padding: '16px 44px', boxShadow: '0 10px 30px rgba(0,0,0,0.55)', opacity: a, position: 'relative'}}>
				<div style={{fontFamily: F.serif, fontWeight: 900, fontSize: 64, letterSpacing: 6, color: C.ink, opacity: 1 - b}}>{s.from}</div>
				<div style={{position: 'absolute', left: 36, top: '50%', height: 7, width: `calc(${strike * 100}% - 72px)`, background: C.seal, opacity: 1 - b}} />
				<div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: F.serif, fontWeight: 900, fontSize: 64, letterSpacing: 6, color: C.seal, opacity: b}}>{s.to}</div>
			</div>
		</AbsoluteFill>
	);
};

const ShotView: React.FC<{sh: Shot}> = ({sh}) => {
	const f = useCurrentFrame();
	const {durationInFrames: dur} = useVideoConfig();
	const fadeIn = sh.cut ? 1 : interpolate(f, [0, FADE], [0, 1], clamp);
	const fadeOut = sh.hold ? 1 : interpolate(f, [dur - FADE, dur], [1, 0], clamp);
	const fade = Math.min(fadeIn, fadeOut);
	const t0 = sh.start_s;
	const pl = sh.scene ? <SceneView s={sh.scene} t0={t0} /> : sh.plate ? (
		<AbsoluteFill style={{scale: String(sh.plate.scale ?? 1), transformOrigin: `${sh.plate.ox ?? '50%'} ${sh.plate.oy ?? '60%'}`}}>
			<Plate name={sh.plate.name} at_s={sh.plate.at_s} t0={t0} v={sh.plate.v} />
		</AbsoluteFill>
	) : null;
	return (
		<AbsoluteFill style={{opacity: fade}}>
			{sh.kind === 'date' && sh.date && <DateShot {...sh.date} plate={pl} />}
			{sh.kind === 'doc' && sh.doc && <DocShot d={sh.doc} t0={t0} />}
			{sh.kind === 'stat' && sh.stat && <StatShot d={sh.stat} t0={t0} plate={pl} />}
			{sh.kind === 'typo' && sh.typo && <TypoShot d={sh.typo} t0={t0} plate={pl} />}
			{sh.kind === 'plate' && pl}
			{sh.kind !== 'map-zoom' && (sh.names ?? []).map((n, k) => <NameTag key={`n${k}`} text={n.text} sub={n.sub} at={Math.round((n.at_s - t0) * FPS)} out={Math.round((n.out_s - t0) * FPS)} pos={n.pos} />)}
			{sh.kind === 'timeline' && sh.timeline && <TimelineShot d={sh.timeline} t0={t0} />}
			{sh.kind === 'chart' && sh.chart && <ChartShot d={sh.chart} t0={t0} />}
			{sh.kind === 'domino' && sh.domino && <DominoShot d={sh.domino} t0={t0} />}
			{sh.kind === 'pair' && sh.pair && <PairShot d={sh.pair} t0={t0} />}
			{sh.kind === 'map-zoom' && sh.cam0 && sh.cam1 && (
				<AbsoluteFill>
					<MapScene
						theme="night"
						cam0={sh.cam0}
						cam1={sh.cam1}
						route={sh.route?.pts}
						routeFrom={sh.route ? Math.round((sh.route.from_s - t0) * FPS) : 0}
						routeTo={sh.route ? Math.round((sh.route.to_s - t0) * FPS) : 60}
						pins={(sh.pins ?? []).map((p) => ({at: p.at, label: p.label, appear: Math.round((p.at_s - t0) * FPS), align: p.align}))}
						detail={sh.detail}
						borders={sh.borders}
						band={sh.route?.band_km ? {km: sh.route.band_km, from: Math.round(((sh.route.band_s ?? sh.route.to_s) - t0) * FPS)} : undefined}
					/>
					{sh.swap && <SwapTag s={sh.swap} t0={t0} />}
					<Fog />
					<Particles count={34} kind="dust" opacity={0.4} />
					{(sh.names ?? []).map((n, k) => (
						<NameTag key={k} text={n.text} sub={n.sub} at={Math.round((n.at_s - t0) * FPS)} out={Math.round((n.out_s - t0) * FPS)} pos={n.pos} />
					))}
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

export const VietnaScene: React.FC<VietnaProps> = ({spec, words, events}) => {
	if (spec.kind === 'shots') {
		return (
			<Shell events={events} words={words}>
				<AbsoluteFill style={{background: '#0b1218'}}>
					{spec.shots.map((sh, i) => (
						<Sequence key={i} from={Math.round(sh.start_s * FPS)} durationInFrames={Math.round((sh.end_s - sh.start_s) * FPS)}>
							<ShotView sh={sh} />
						</Sequence>
					))}
					<Vignette strength={Math.min(spec.vignette ?? 0.15, 0.2)} soft />  {/* usuário 2026-11-20: borda escura forte estranha → teto 0,2 */}
					<Grain opacity={0.08} />
				</AbsoluteFill>
			</Shell>
		);
	}
	if (spec.kind === 'map') {
		return (
			<Shell events={events} words={words}>
				<AbsoluteFill>
					<MapScene
						theme="night"
						cam0={spec.cam0}
						cam1={spec.cam1}
						route={spec.route?.pts}
						routeFrom={spec.route ? Math.round(spec.route.from_s * FPS) : 0}
						routeTo={spec.route ? Math.round(spec.route.to_s * FPS) : 60}
						pins={(spec.pins ?? []).map((p) => ({at: p.at, label: p.label, appear: Math.round(p.at_s * FPS), align: p.align}))}
					/>
					{spec.title && <PlaceLabel text={spec.title.text} sub={spec.title.sub} at={Math.round(spec.title.at_s * FPS)} pos="top" />}
					<Vignette strength={0.8} />
					<Grain opacity={0.08} />
				</AbsoluteFill>
			</Shell>
		);
	}
	return null;
};
