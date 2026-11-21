// Candidato A: ilustração flat em camadas (Flow) + câmera, parallax e atmosfera por código.
import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import scenes from './data/scenes.json';
import {C, E, clamp} from '../../lacre/tokens';
import {Grain, ImpactText, PlaceLabel, Stamp, TitleCard, Vignette, WaxSeal} from '../../lacre/components';
import {Cutout, Grade, LightRays, Particles, Plate} from '../../lacre/layers';
import {MapScene} from '../../lacre/MapScene';

const LISBOA: [number, number] = [-9.14, 38.71];
const SALVADOR: [number, number] = [-38.5, -12.97];
const XFADE = 8;

const Fader: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const o = interpolate(frame, [0, XFADE, durationInFrames - XFADE, durationInFrames], [0, 1, 1, 0], {...clamp, easing: E.inOut});
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** Grupo recortado em largura total: desliza e ganha leve zoom, mantendo parallax com o fundo. */
const GroupCut: React.FC<{src: string}> = ({src}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	const enter = interpolate(frame, [4, 20], [0, 1], {...clamp, easing: E.out});
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img
				src={staticFile(src)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transformOrigin: '30% 70%',
					scale: String(1.02 + t * 0.12),
					translate: `${-6 + t * 4 - (1 - enter) * 6}% ${2 - t * 2}%`,
					opacity: enter,
					filter: 'drop-shadow(0 18px 26px rgba(0,0,0,0.55))',
				}}
			/>
		</AbsoluteFill>
	);
};

export const Scene: React.FC<{id: string; fps: number; start: number}> = ({id, fps, start}) => {
	const s = scenes.scenes.find((x) => x.id === id)!;
	const rel = (sec: number) => Math.round((sec - start) * fps);
	switch (id) {
		case 'S01':
			return (
				<>
					<Plate src="lab/bakeoff/a/A1-1.jpg" z0={1.04} z1={1.2} pan={[-3, 0]} focus={[78, 40]} />
					<LightRays opacity={0.2} />
					<Particles count={34} kind="dust" opacity={0.45} />
					<Grade color="#b08d57" opacity={0.16} />
					<PlaceLabel text={s.label!} at={14} />
				</>
			);
		case 'S02':
			return (
				<>
					<Plate src="lab/bakeoff/a/A2-1.jpg" z0={1.08} z1={1.3} pan={[2, 0]} focus={[28, 70]} />
					<Particles count={26} kind="dust" opacity={0.35} />
				</>
			);
		case 'S03':
			return (
				<>
					<Plate src="lab/bakeoff/a/A7-2.jpg" z0={1.02} z1={1.1} pan={[2, 0]} />
					<GroupCut src="lab/bakeoff/a/A3-1.png" />
					<LightRays opacity={0.14} />
					<Stamp text="FUGINDO" at={rel(s.impact!.at ?? s.start)} />
				</>
			);
		case 'S04':
			return (
				<MapScene
					cam0={{center: [-4, 41.5], scale: 2600}}
					cam1={{center: [-6.5, 40.2], scale: 3300}}
					route={[[-1.47, 43.49], [-5.66, 40.97], [-8.2, 39.46], LISBOA]}
					routeFrom={6}
					routeTo={110}
					routeColor={C.ink}
					pins={[
						{at: LISBOA, label: 'LISBOA', appear: 4, align: 'left'},
						{at: [-1.47, 43.49], label: 'JUNOT', appear: 10},
					]}
				/>
			);
		case 'S05':
			return (
				<>
					<Plate src="lab/bakeoff/a/A4-1.jpg" z0={1.04} z1={1.22} pan={[-2, 0]} focus={[85, 55]} />
					<Particles count={80} kind="rain" opacity={0.5} />
					<Grade color="#3E5566" opacity={0.28} mode="multiply" />
					<PlaceLabel text={s.label!} at={14} />
				</>
			);
		case 'S06':
			return (
				<MapScene
					cam0={{center: [-20, 20], scale: 520}}
					cam1={{center: [-24, 12], scale: 560}}
					route={[LISBOA, [-17, 28], [-25, 5], SALVADOR]}
					routeFrom={10}
					routeTo={190}
					ship
					pins={[
						{at: LISBOA, label: 'LISBOA', appear: 2},
						{at: SALVADOR, label: 'SALVADOR', appear: 175, align: 'left'},
					]}
				/>
			);
		case 'S07':
			return (
				<>
					<Plate src="lab/bakeoff/a/A5-1.jpg" z0={1.06} z1={1.24} pan={[-3, 0]} focus={[70, 55]} />
					<LightRays opacity={0.26} angle={-14} />
					<Particles count={30} kind="dust" opacity={0.4} />
					<Grade color="#b08d57" opacity={0.2} />
					<PlaceLabel text={s.label!} at={18} />
				</>
			);
		case 'S08':
			return <ImpactText text={s.impact!.text} accent={s.impact!.accent} />;
		case 'S09':
			return (
				<>
					<AbsoluteFill style={{background: `radial-gradient(ellipse at 28% 55%, #5a1a14 0%, ${C.ink} 62%)`}} />
					<Particles count={46} kind="embers" opacity={0.7} />
					<Cutout src="lab/bakeoff/a/A6-1.png" x={[27, 25]} y={104} height={104} enterAt={4} bob={3} />
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

export const StyleA: React.FC = () => {
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
