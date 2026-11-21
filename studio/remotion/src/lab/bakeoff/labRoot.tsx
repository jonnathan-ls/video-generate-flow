// Composições do teste de estilos (2026-11). Laboratório: não alimenta a produção.
import React from 'react';
import {Composition, Still} from 'remotion';
import {LogoSheet} from '../brand/LogoSheet';
import scenes from './data/scenes.json';
import fx from './data/fx.json';
import words from './data/words.json';
import {Shell} from '../../lacre/fx';
import {StyleA} from './StyleA';
import {StyleB} from './StyleB';
import {StyleD} from './StyleD';

const wrap = (Inner: React.FC): React.FC => () => (
	<Shell events={fx.events} words={words.words} hideCaptions={[[30.2, 33.6]]}>
		<Inner />
	</Shell>
);
const A2 = wrap(StyleA);
const B2 = wrap(StyleB);
const D2 = wrap(StyleD);

const common = {
	durationInFrames: Math.round(scenes.duration * scenes.fps),
	fps: scenes.fps,
	width: scenes.width,
	height: scenes.height,
};

export const LabBakeoffCompositions: React.FC = () => (
	<>
		<Composition id="A2" component={A2} {...common} />
		<Composition id="B2" component={B2} {...common} />
		<Composition id="D2" component={D2} {...common} />
		<Still id="LogoSheet" component={LogoSheet} width={2000} height={2000} />
		<Still id="LogoSheet2" component={LogoSheet} width={2000} height={2000} defaultProps={{from: 17, count: 16}} />
	</>
);
