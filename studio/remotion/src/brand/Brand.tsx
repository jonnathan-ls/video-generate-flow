// Identidade visual do canal Lacre (avatar e banner). PRODUÇÃO: usa só os componentes da biblioteca.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../lacre/tokens';
import {Grain, Vignette, WaxSeal} from '../lacre/components';
import {MapScene} from '../lacre/MapScene';

/** Avatar 800×800 (o YouTube recorta em círculo: tudo importante fica dentro de ~560 px do centro). */
export const LacreAvatar: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, #3a1612 0%, ${C.ink} 72%)`, justifyContent: 'center', alignItems: 'center'}}>
		<div style={{position: 'absolute', width: 660, height: 660, borderRadius: '50%', border: `4px solid ${C.brass}`, opacity: 0.55}} />
		<WaxSeal size={470} letter="L" appearAt={-20} />
		<Grain opacity={0.1} />
	</AbsoluteFill>
);

/** Banner 2560×1440. Área segura de todos os dispositivos: 1546×423 no centro. */
export const LacreBanner: React.FC = () => (
	<AbsoluteFill style={{background: C.ink}}>
		<AbsoluteFill style={{opacity: 0.5}}>
			<MapScene theme="night" cam0={{center: [-20, 18], scale: 900}} cam1={{center: [-20, 18], scale: 900}} />
		</AbsoluteFill>
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(20,18,16,0.2) 0%, rgba(20,18,16,0.82) 62%, ${C.ink} 100%)`}} />
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 64}}>
				<WaxSeal size={250} letter="L" appearAt={-20} />
				<div>
					<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 180, letterSpacing: 36, color: C.paper, lineHeight: 1, textShadow: '0 8px 40px rgba(0,0,0,0.8)'}}>LACRE</div>
					<div style={{height: 3, width: '100%', background: C.brass, margin: '18px 0 20px'}} />
					<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 31, letterSpacing: 7, color: C.brass}}>A HISTÓRIA DO MUNDO E DO BRASIL,</div>
					<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 31, letterSpacing: 7, color: C.brass}}>ABERTA DO COMEÇO AO FIM.</div>
				</div>
			</div>
		</AbsoluteFill>
		<Vignette strength={0.6} />
		<Grain opacity={0.09} />
	</AbsoluteFill>
);
