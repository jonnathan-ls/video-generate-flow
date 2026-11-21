// Candidato C: híbrido. Reencenações ilustradas (A) + documentos reais como "prova" (B) + mapas por código.
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import scenes from './data/scenes.json';
import {C, E, clamp} from '../../lacre/tokens';
import {Desk, Grain, PlaceLabel, Print, Vignette} from '../../lacre/components';
import {Grade, LightRays, Particles, Plate} from '../../lacre/layers';
import {Scene as SceneA} from './StyleA';
import {Scene as SceneB} from './StyleB';

const XFADE = 8;
// Escolha de estilo por cena: A = ilustração, B = documento/gravura
const PICK: Record<string, 'A' | 'B'> = {S01: 'A', S02: 'B', S03: 'A', S04: 'B', S05: 'A', S06: 'B', S07: 'A', S08: 'A', S09: 'A'};

const Fader: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const o = interpolate(frame, [0, XFADE, durationInFrames - XFADE, durationInFrames], [0, 1, 1, 0], {...clamp, easing: E.inOut});
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const StyleC: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: C.ink}}>
			{scenes.scenes.map((s, i) => {
				const from = Math.round(s.start * fps);
				const extra = i < scenes.scenes.length - 1 ? XFADE : 0;
				const Pick = PICK[s.id] === 'A' ? SceneA : SceneB;
				return (
					<Sequence key={s.id} name={s.id} from={from} durationInFrames={Math.round((s.end - s.start) * fps) + extra}>
						<Fader>
							<Pick id={s.id} fps={fps} start={s.start} />
						</Fader>
					</Sequence>
				);
			})}
			<Vignette strength={0.55} />
			<Grain opacity={0.09} />
			<Audio src={staticFile('lab/bakeoff/narration.wav')} />
		</AbsoluteFill>
	);
};
