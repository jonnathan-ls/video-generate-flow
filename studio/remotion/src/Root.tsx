// Raiz do Remotion. PRODUÇÃO: identidade do canal e vídeos reais (src/videos/<id>/).
// LABORATÓRIO: testes ficam em src/lab/ e nunca são importados por código de produção.
import React from 'react';
import {Composition, Still} from 'remotion';
import {LacreAvatar, LacreBanner} from './brand/Brand';
import {LogoAvatar, LogoBanner, LogoLockup} from './brand/Logos';
import {RealAvatar, RealBanner, RealLockupStill} from './brand/RealLogos';
import {PaperAvatar, PaperBanner} from './brand/PaperLogos';
import {VietnaScene} from './vietna/VietnaScene';
import {Plate} from './vietna/plates';
import {ThumbVietnaA, ThumbVietnaB, ThumbVietnaC} from './thumbs/GuerraVietna';
import {LabBakeoffCompositions} from './lab/bakeoff/labRoot';

export const RemotionRoot: React.FC = () => (
	<>
		{/* produção */}
		<Still id="LacreAvatar" component={LacreAvatar} width={800} height={800} />
		<Still id="LacreBanner" component={LacreBanner} width={2560} height={1440} />
		<Still id="LogoWorldAvatar" component={LogoAvatar} width={800} height={800} defaultProps={{variant: 'world' as const}} />
		<Still id="LogoWorldLockup" component={LogoLockup} width={1600} height={700} defaultProps={{variant: 'world' as const}} />
		<Still id="LogoWorldBanner" component={LogoBanner} width={2560} height={1440} defaultProps={{variant: 'world' as const}} />
		<Still id="LogoLAvatar" component={LogoAvatar} width={800} height={800} defaultProps={{variant: 'l' as const}} />
		<Still id="LogoLLockup" component={LogoLockup} width={1600} height={700} defaultProps={{variant: 'l' as const}} />
		<Still id="LogoLBanner" component={LogoBanner} width={2560} height={1440} defaultProps={{variant: 'l' as const}} />
		<Still id="LogoWordAvatar" component={LogoAvatar} width={800} height={800} defaultProps={{variant: 'word' as const}} />
		<Still id="LogoWordLockup" component={LogoLockup} width={1600} height={700} defaultProps={{variant: 'word' as const}} />
		<Still id="LogoWordBanner" component={LogoBanner} width={2560} height={1440} defaultProps={{variant: 'word' as const}} />
		<Composition
			id="VietnaScene"
			component={VietnaScene}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={300}
			defaultProps={{spec: {kind: 'map' as const, cam0: {center: [24, 10] as [number, number], scale: 330}, cam1: {center: [24, 10] as [number, number], scale: 380}}, words: [], events: [], durationSec: 10}}
			calculateMetadata={({props}) => ({durationInFrames: Math.max(30, Math.ceil(props.durationSec * 30))})}
		/>
		<Composition id="PlateLab" component={Plate} width={1920} height={1080} fps={30} durationInFrames={150} defaultProps={{name: 'hanoi-dawn'}} />
		<Still id="ThumbVietnaA" component={ThumbVietnaA} width={1280} height={720} />
		<Still id="ThumbVietnaB" component={ThumbVietnaB} width={1280} height={720} />
		<Still id="ThumbVietnaC" component={ThumbVietnaC} width={1280} height={720} />
		<Still id="PaperAvatar" component={PaperAvatar} width={800} height={800} />
		<Still id="PaperAvatarSemFita" component={PaperAvatar} width={800} height={800} defaultProps={{ribbon: false}} />
		<Still id="PaperBanner" component={PaperBanner} width={2560} height={1440} />
		<Still id="RealMundoAvatar" component={RealAvatar} width={800} height={800} defaultProps={{seal: 5, layout: 'h' as const, ratio: 0.977}} />
		<Still id="RealMundoLockup" component={RealLockupStill} width={1600} height={700} defaultProps={{seal: 5, layout: 'h' as const, ratio: 0.977}} />
		<Still id="RealMundoBanner" component={RealBanner} width={2560} height={1440} defaultProps={{seal: 5, layout: 'h' as const, ratio: 0.977}} />
		<Still id="RealSeloLAvatar" component={RealAvatar} width={800} height={800} defaultProps={{seal: 7, layout: 'v' as const, ratio: 0.795}} />
		<Still id="RealSeloLLockup" component={RealLockupStill} width={1600} height={700} defaultProps={{seal: 7, layout: 'v' as const, ratio: 0.795}} />
		<Still id="RealSeloLBanner" component={RealBanner} width={2560} height={1440} defaultProps={{seal: 7, layout: 'v' as const, ratio: 0.795}} />
		<Still id="RealBussolaAvatar" component={RealAvatar} width={800} height={800} defaultProps={{seal: 3, layout: 'h' as const, ratio: 1.021}} />
		<Still id="RealBussolaLockup" component={RealLockupStill} width={1600} height={700} defaultProps={{seal: 3, layout: 'h' as const, ratio: 1.021}} />
		<Still id="RealBussolaBanner" component={RealBanner} width={2560} height={1440} defaultProps={{seal: 3, layout: 'h' as const, ratio: 1.021}} />
		{/* laboratório */}
		<LabBakeoffCompositions />
	</>
);
