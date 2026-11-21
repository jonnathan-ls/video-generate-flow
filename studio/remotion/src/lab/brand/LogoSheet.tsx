// Laboratório: folha numerada de esboços de logotipo (comparação lado a lado).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from '../../lacre/tokens';

export const LogoSheet: React.FC<{from?: number; count?: number}> = ({from = 1, count = 16}) => (
	<AbsoluteFill style={{background: '#0b0a09', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: 10}}>
		{Array.from({length: count}).map((_, i) => {
			const n = from + i;
			return (
				<div key={n} style={{position: 'relative', background: '#000'}}>
					<Img src={staticFile(`lab/brand-sketches/${String(n).padStart(2, '0')}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					<div style={{position: 'absolute', left: 14, top: 12, width: 62, height: 62, borderRadius: 31, background: C.seal, color: C.paper, fontFamily: F.sans, fontWeight: 800, fontSize: 34, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.6)'}}>
						{n}
					</div>
				</div>
			);
		})}
	</AbsoluteFill>
);
