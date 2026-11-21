// Candidato D: 100% por código. Nenhuma imagem de IA, de arquivo ou de banco. Só SVG/CSS procedural.
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';
import scenes from './data/scenes.json';
import {C, E, clamp} from '../../lacre/tokens';
import {Grain, ImpactText, PlaceLabel, Stamp, TitleCard, Vignette, WaxSeal} from '../../lacre/components';
import {Grade, LightRays, Particles} from '../../lacre/layers';
import {MapScene} from '../../lacre/MapScene';
import {BelemTower, Birds, Cam, Colonial, Crates, Crowd, NapoleonSilhouette, Palm, Ridge, Sea, Ship, Skyline, Sky, Sun} from '../../lacre/draw';

const LISBOA: [number, number] = [-9.14, 38.71];
const SALVADOR: [number, number] = [-38.5, -12.97];
const XFADE = 8;
const SVG = ({children}: {children: React.ReactNode}) => (
	<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);

const Fader: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const o = interpolate(frame, [0, XFADE, durationInFrames - XFADE, durationInFrames], [0, 1, 1, 0], {...clamp, easing: E.inOut});
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const Scene: React.FC<{id: string; fps: number; start: number}> = ({id, fps, start}) => {
	const s = scenes.scenes.find((x) => x.id === id)!;
	const rel = (sec: number) => Math.round((sec - start) * fps);
	switch (id) {
		case 'S01': // Lisboa ao amanhecer
			return (
				<Cam z0={1.02} z1={1.14} origin="78% 50%" pan={[-2, 0]}>
					<Sky stops={[['#1d2431', 0], ['#5a3a3a', 38], ['#d89a5b', 62], ['#f3d79a', 72]]} />
					<Sun x={1180} y={560} r={80} />
					<Ridge seed={1} baseY={620} amp={90} color="#4a3a44" speed={0.05} />
					<Ridge seed={2} baseY={660} amp={80} color="#2e2530" speed={0.08} />
					<Skyline y={690} color="#1d1820" seed={3} density={0.05} />
					<Sea y={690} top="#6b4a4a" bottom="#1a1620" />
					<SVG>
						<BelemTower x={1560} y={720} s={1.05} color="#cdb27d" light="#f5dfae" />
						<Ship x={420} y={760} s={1.15} />
						<Ship x={900} y={730} s={0.8} phase={1.3} sail="#d9c49a" />
						<Ship x={1180} y={745} s={0.62} phase={2.1} sail="#cdb78b" />
					</SVG>
					<Birds y={190} />
					<LightRays opacity={0.18} />
					<Particles count={26} kind="dust" opacity={0.4} />
					<PlaceLabel text={s.label!} at={14} />
				</Cam>
			);
		case 'S02': // multidão no cais
			return (
				<Cam z0={1.06} z1={1.28} origin="30% 80%" pan={[2, 0]}>
					<Sky stops={[['#3b4252', 0], ['#a2706a', 55], ['#f0c88e', 76]]} />
					<Sun x={1500} y={520} r={60} color="#ffe9c0" />
					<Sea y={560} top="#8a6a66" bottom="#241c24" />
					<SVG>
						<Ship x={1320} y={560} s={0.9} phase={0.4} />
						<Ship x={420} y={540} s={0.55} phase={1.9} dx={0} />
					</SVG>
					<SVG>
						<polygon points="0,720 1920,640 1920,1080 0,1080" fill="#6a5238" />
						<polygon points="0,720 1920,640 1920,656 0,736" fill="#8a6c48" />
					</SVG>
					<Crowd count={26} seed={5} baseY={830} scale={1.55} x0={80} x1={1840} hats={0.55} />
					<Crowd count={16} seed={9} baseY={1010} scale={2.1} x0={-40} x1={1900} hats={0.4} colors={['#0c0807', '#140d0b', '#1a1012']} />
					<SVG>
						<Crates x={150} y={990} s={1.6} />
						<Crates x={1560} y={1010} s={1.9} />
					</SVG>
					<Particles count={30} kind="dust" opacity={0.35} />
					<Grade color="#b08d57" opacity={0.18} />
				</Cam>
			);
		case 'S03': // a corte embarca
			return (
				<Cam z0={1.02} z1={1.1} origin="50% 70%" pan={[1, 0]}>
					<Sky stops={[['#2a303f', 0], ['#8b5d5a', 52], ['#e6b87d', 78]]} />
					<Sun x={1420} y={540} r={70} />
					<Sea y={600} top="#7e5e5c" bottom="#1c161c" />
					<SVG>
						<Ship x={1380} y={640} s={1.25} phase={0.8} />
						<polygon points="0,760 1920,560 1920,1080 0,1080" fill="#5e4833" />
						<polygon points="0,760 1920,560 1920,578 0,778" fill="#8a6c48" />
					</SVG>
					<Crowd count={11} seed={21} baseY={960} x0={120} x1={1500} scale={2.2} hats={0.7} slope={0.14} colors={['#140f0d', '#3a1a1c', '#1c1d2a', '#2b1a28']} />
					<LightRays opacity={0.14} />
					<Stamp text="FUGINDO" at={rel(s.impact!.at ?? s.start)} />
				</Cam>
			);
		case 'S04':
			return (
				<MapScene
					theme="night"
					cam0={{center: [-4, 41.5], scale: 2600}}
					cam1={{center: [-6.5, 40.2], scale: 3300}}
					route={[[-1.47, 43.49], [-5.66, 40.97], [-8.2, 39.46], LISBOA]}
					routeFrom={6}
					routeTo={110}
					routeColor="#ff8a4a"
					pins={[
						{at: LISBOA, label: 'LISBOA', appear: 4, align: 'left'},
						{at: [-1.47, 43.49], label: 'JUNOT', appear: 10},
					]}
				/>
			);
		case 'S05': // porto vazio sob chuva
			return (
				<Cam z0={1.03} z1={1.18} origin="85% 60%" pan={[-2, 0]}>
					<Sky stops={[['#20262e', 0], ['#4a5560', 50], ['#7d8a93', 72]]} />
					<Ridge seed={4} baseY={560} amp={60} color="#39434d" speed={0.04} />
					<Skyline y={600} color="#2a323a" seed={8} density={0.02} win="#9fb2bf" />
					<Sea y={600} top="#4c5a65" bottom="#161c22" line="rgba(210,225,235,0.2)" />
					<SVG>
						<Ship x={300} y={612} s={0.35} phase={0.5} hull="#1c232a" sail="#7d8a93" flag="#52606b" />
						<polygon points="0,820 1500,720 1920,720 1920,1080 0,1080" fill="#252b31" />
						<polygon points="0,820 1500,720 1920,720 1920,736 1500,736 0,836" fill="#3b444c" />
					</SVG>
					<Crowd count={5} seed={33} baseY={870} x0={1200} x1={1700} scale={0.9} hats={1} colors={['#1b2a46', '#223457']} />
					<Particles count={110} kind="rain" opacity={0.55} />
					<Grade color="#3E5566" opacity={0.3} mode="multiply" />
					<PlaceLabel text={s.label!} at={14} />
				</Cam>
			);
		case 'S06':
			return (
				<MapScene
					theme="night"
					cam0={{center: [-20, 20], scale: 520}}
					cam1={{center: [-24, 12], scale: 560}}
					route={[LISBOA, [-17, 28], [-25, 5], SALVADOR]}
					routeFrom={10}
					routeTo={190}
					ship
					routeColor="#ff8a4a"
					pins={[
						{at: LISBOA, label: 'LISBOA', appear: 2},
						{at: SALVADOR, label: 'SALVADOR', appear: 175, align: 'left'},
					]}
				/>
			);
		case 'S07': // Baía de Todos os Santos
			return (
				<Cam z0={1.05} z1={1.2} origin="70% 55%" pan={[-3, 0]}>
					<Sky stops={[['#3a4a6a', 0], ['#c9825a', 46], ['#f6d58f', 72]]} />
					<Sun x={600} y={470} r={70} />
					<Ridge seed={6} baseY={600} amp={110} color="#2f6b5a" speed={0.06} fog="#7aa68a" />
					<Ridge seed={7} baseY={680} amp={90} color="#1f4d41" speed={0.1} />
					<Sea y={650} top="#3f8c8a" bottom="#123238" line="rgba(255,240,200,0.28)" />
					<SVG>
						<Colonial x={1180} y={640} n={7} seed={2} s={1.1} />
						<polygon points="1100,640 1920,600 1920,1080 1100,1080" fill="#1f3b2c" opacity={0.95} />
						<Colonial x={1260} y={700} n={6} seed={9} s={1.35} />
						<Palm x={1100} y={760} s={1.1} />
						<Palm x={1750} y={820} s={1.4} color="#0b2019" lean={-1} />
						<Ship x={540} y={700} s={1.0} phase={0.2} />
						<Ship x={900} y={690} s={0.7} phase={1.6} />
						<Ship x={270} y={720} s={0.55} phase={2.4} />
					</SVG>
					<LightRays opacity={0.24} angle={-14} />
					<Particles count={28} kind="dust" opacity={0.4} />
					<PlaceLabel text={s.label!} at={18} />
				</Cam>
			);
		case 'S08':
			return <ImpactText text={s.impact!.text} accent={s.impact!.accent} />;
		case 'S09': // Napoleão
			return (
				<>
					<AbsoluteFill style={{background: `radial-gradient(ellipse at 30% 55%, #7a1f16 0%, #2a0d0a 45%, ${C.ink} 80%)`}} />
					<Particles count={60} kind="embers" opacity={0.75} />
					<Cam z0={1.0} z1={1.07} origin="28% 60%">
						<SVG>
							<NapoleonSilhouette x={560} y={1100} h={860} />
						</SVG>
					</Cam>
					<Vignette strength={0.85} />
					<AbsoluteFill style={{left: 380}}>
						<Sequence from={36} layout="none">
							<TitleCard title={s.title!} kicker="O HOMEM QUE PROVOCOU A FUGA" />
						</Sequence>
					</AbsoluteFill>
					<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'flex-end', padding: 70}}>
						<Sequence from={70} layout="none">
							<WaxSeal size={110} appearAt={0} />
						</Sequence>
					</AbsoluteFill>
				</>
			);
		default:
			return null;
	}
};

export const StyleD: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: C.ink}}>
			{scenes.scenes.map((s, i) => {
				const from = Math.round(s.start * fps);
				const extra = i < scenes.scenes.length - 1 ? XFADE : 0;
				return (
					<Sequence key={s.id} name={s.id} from={from} durationInFrames={Math.round((s.end - s.start) * fps) + extra}>
						<Fader>
							<Scene id={s.id} fps={fps} start={s.start} />
						</Fader>
					</Sequence>
				);
			})}
			<Vignette strength={0.5} />
			<Grain opacity={0.08} />
			<Audio src={staticFile('lab/bakeoff/mix.wav')} />
		</AbsoluteFill>
	);
};
