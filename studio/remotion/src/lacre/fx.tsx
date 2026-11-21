// Camada de FX comum aos estilos. Dirigida por DADOS (eventos de som e palavras alinhadas):
// nada aqui importa arquivos de um vídeo específico. Quem monta o vídeo passa os dados ao <Shell>.
import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from './tokens';

export type FxEvent = {t: number; kind: string; reason?: string; visual?: boolean};
export type FxWord = {i: number; word: string; start: number; end: number};
type FxData = {events: FxEvent[]; words: FxWord[]};

const Ctx = React.createContext<FxData>({events: [], words: []});
const decay = (age: number, tau: number) => (age < 0 ? 0 : Math.exp(-age / tau));

/** Soma das contribuições de todos os eventos visuais no instante atual. */
function useFx() {
	const {events} = React.useContext(Ctx);
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	let punch = 0,
		shake = 0,
		flash = 0,
		smear = 0;
	for (const e of events) {
		if (e.visual === false) continue;
		const age = t - e.t;
		if (e.kind === 'impact') {
			punch += 0.045 * decay(age, 0.28);
			shake += 8 * decay(age, 0.2);
			flash += 0.35 * decay(age, 0.1);
		} else if (e.kind === 'boom') {
			punch += 0.03 * decay(age, 0.3);
			shake += 6 * decay(age, 0.2);
			flash += 0.2 * decay(age, 0.1);
		} else if (e.kind === 'hit') {
			punch += 0.012 * decay(age, 0.18);
			shake += 1.5 * decay(age, 0.12);
		} else if (e.kind === 'punch') {
			punch += 0.035 * decay(age, 0.6);
		} else if (e.kind === 'whoosh') {
			const lead = e.t - t; // desfoque ANTES do corte, para "vender" a transição
			if (lead > -0.08 && lead < 0.2) smear += Math.max(0, 1 - Math.abs(lead - 0.06) / 0.16);
		}
	}
	return {frame, t, punch, shake, flash: Math.min(flash, 0.7), smear: Math.min(smear, 1)};
}

/** Envolve a cena: zoom de impacto, tremor de câmera e desfoque de transição. */
export const CameraFx: React.FC<{children: React.ReactNode}> = ({children}) => {
	const {frame, punch, shake, smear} = useFx();
	const dx = (random(`sx${frame}`) - 0.5) * 2 * shake;
	const dy = (random(`sy${frame}`) - 0.5) * 2 * shake;
	return (
		<AbsoluteFill
			style={{
				scale: String(1 + punch + smear * 0.02),
				translate: `${dx + smear * 16}px ${dy}px`,
				filter: smear > 0.05 ? `blur(${smear * 4}px)` : undefined,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

/** Flash de impacto + queimadura de filme quente + pulso de vinheta. */
export const ImpactOverlay: React.FC = () => {
	const {flash, punch} = useFx();
	return (
		<>
			<AbsoluteFill style={{pointerEvents: 'none', background: '#fff3dc', opacity: flash * 0.9, mixBlendMode: 'screen'}} />
			<AbsoluteFill
				style={{
					pointerEvents: 'none',
					opacity: Math.min(1, flash * 1.4),
					background: 'radial-gradient(ellipse at 50% 50%, rgba(255,120,40,0) 30%, rgba(255,90,20,0.55) 100%)',
					mixBlendMode: 'screen',
				}}
			/>
			<AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) ${55 - punch * 150}%, rgba(8,6,4,0.8) 100%)`}} />
		</>
	);
};

/** Agrupa palavras em frases de até 5, quebrando em pontuação. */
function groupWords(words: FxWord[]): FxWord[][] {
	const g: FxWord[][] = [];
	let cur: FxWord[] = [];
	for (const w of words) {
		cur.push(w);
		if (cur.length >= 5 || /[.!?…]$/.test(w.word) || (cur.length >= 3 && /,$/.test(w.word))) {
			const punct = /[.!?…,]$/.test(w.word);
			const weak = /^(de|do|da|dos|das|ao|aos|à|o|a|os|as|um|uma|para|e|que|em|no|na|nos|nas|com|por|pelo|pela|ou|se|mas)$/i;
			let carry: FxWord[] = [];
			if (!punct) {
				while (cur.length > 2 && weak.test(cur[cur.length - 1].word)) carry.unshift(cur.pop() as FxWord);
			}
			g.push(cur);
			cur = carry;
		}
	}
	if (cur.length) g.push(cur);
	return g;
}

/** Legendas palavra a palavra: a palavra falada acende. O texto vem SEMPRE do roteiro alinhado. */
export const Captions: React.FC<{hide?: [number, number][]}> = ({hide = []}) => {
	const {words} = React.useContext(Ctx);
	const groups = React.useMemo(() => groupWords(words), [words]);
	const {t} = useFx();
	const g = groups.find((grp) => t >= grp[0].start - 0.05 && t <= grp[grp.length - 1].end + 0.35);
	if (!g || hide.some(([a, b]) => t >= a && t <= b)) return null;
	const inT = Math.min(1, (t - (g[0].start - 0.05)) / 0.12);
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 64, pointerEvents: 'none'}}>
			<div
				style={{
					opacity: inT,
					translate: `0px ${(1 - inT) * 12}px`,
					padding: '10px 34px 12px',
					background: 'rgba(12,10,8,0.62)',
					borderRadius: 6,
					fontFamily: F.sans,
					fontWeight: 800,
					fontSize: 46,
					letterSpacing: 1.2,
					textTransform: 'uppercase',
					textShadow: '0 3px 14px rgba(0,0,0,0.8)',
				}}
			>
				{g.map((w, i) => {
					const active = t >= w.start && t < w.end + 0.05;
					const past = t >= w.end + 0.05;
					return (
						<span key={w.i} style={{color: active ? C.brass : past ? C.paper : 'rgba(233,223,200,0.55)', marginRight: i < g.length - 1 ? 14 : 0}}>
							{w.word}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/** Barras de cinema. */
export const Letterbox: React.FC<{amount?: number}> = ({amount = 70}) => (
	<>
		<AbsoluteFill style={{pointerEvents: 'none', height: amount, background: '#000', bottom: 'auto'}} />
		<AbsoluteFill style={{pointerEvents: 'none', height: amount, background: '#000', top: 'auto'}} />
	</>
);

/** Shell comum: câmera + legendas + overlay de impacto. Recebe os dados do vídeo por parâmetro. */
export const Shell: React.FC<{
	events: FxEvent[];
	words: FxWord[];
	hideCaptions?: [number, number][];
	children: React.ReactNode;
}> = ({events, words, hideCaptions = [], children}) => (
	<Ctx.Provider value={{events, words}}>
		<AbsoluteFill style={{background: C.ink}}>
			<CameraFx>{children}</CameraFx>
			<ImpactOverlay />
			<Captions hide={hideCaptions} />
		</AbsoluteFill>
	</Ctx.Provider>
);
