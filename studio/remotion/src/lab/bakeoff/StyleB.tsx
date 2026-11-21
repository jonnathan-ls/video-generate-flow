// Candidato B: colagem documental. Mesma narração e roteiro de cenas de todos os candidatos.
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import scenes from './data/scenes.json';
import {C, E, clamp} from '../../lacre/tokens';
import {Desk, Grain, ImpactText, PlaceLabel, Print, Stamp, TitleCard, Vignette, WaxSeal} from '../../lacre/components';
import {MapScene} from '../../lacre/MapScene';

const LISBOA: [number, number] = [-9.14, 38.71];
const SALVADOR: [number, number] = [-38.5, -12.97];
const XFADE = 8; // quadros de sobreposição entre cenas

/** Dissolve de entrada/saída aplicado a cada cena. */
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
		case 'S01':
			return (
				<>
					<Desk />
					<Print src="lab/bakeoff/b/gianni-embarque.jpg" focus={[50, 22]} z0={1.25} z1={1.55} pan={[0, 3]} tilt={-1} />
					<PlaceLabel text={s.label!} at={10} />
				</>
			);
		case 'S02':
			return (
				<>
					<Desk />
					<Print src="lab/bakeoff/b/bartolozzi-embarque.jpg" focus={[22, 74]} z0={1.6} z1={1.85} pan={[4, 0]} tilt={1.2} />
				</>
			);
		case 'S03':
			return (
				<>
					<Desk />
					<Print src="lab/bakeoff/b/gianni-embarque.jpg" focus={[55, 62]} z0={1.5} z1={2.0} tilt={-0.8} />
					<Stamp text="FUGINDO" at={rel(s.impact!.at ?? s.start)} />
				</>
			);
		case 'S04':
			return (
				<MapScene
					theme="engraved"
					texture="lab/bakeoff/b/portolan-atlantic.jpg"
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
					<Desk />
					<Print src="lab/bakeoff/b/bartolozzi-embarque.jpg" focus={[18, 62]} z0={1.5} z1={1.7} pan={[-3, 0]} tone="cold" dim={0.3} tilt={-1.4} />
					<PlaceLabel text={s.label!} at={14} />
				</>
			);
		case 'S06':
			return (
				<MapScene
					theme="engraved"
					texture="lab/bakeoff/b/portolan-atlantic.jpg"
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
					<MapScene
						theme="engraved"
						texture="lab/bakeoff/b/portolan-atlantic.jpg"
						cam0={{center: [-26, 0], scale: 620}}
						cam1={{center: [-38.5, -12.97], scale: 5200}}
						route={[LISBOA, [-17, 28], [-25, 5], SALVADOR]}
						routeFrom={-1}
						routeTo={0}
						pins={[{at: SALVADOR, label: 'SALVADOR', appear: 0, align: 'left'}]}
					/>
					<PlaceLabel text={s.label!} at={18} />
				</>
			);
		case 'S08':
			return <ImpactText text={s.impact!.text} accent={s.impact!.accent} />;
		case 'S09':
			return (
				<>
					<Desk />
					<Print src="lab/bakeoff/b/napoleon-david.jpg" focus={[50, 18]} z0={1.35} z1={1.6} width={1700} height={980} tilt={0} dim={0.55} />
					<Vignette strength={0.9} />
					<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(10,8,6,0.92) 82%)'}} />
					<AbsoluteFill style={{top: 300}}>
						<Sequence from={45} layout="none">
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

export const StyleB: React.FC = () => {
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
			<Vignette strength={0.55} />
			<Grain opacity={0.1} />
			<Audio src={staticFile('lab/bakeoff/mix.wav')} />
		</AbsoluteFill>
	);
};
