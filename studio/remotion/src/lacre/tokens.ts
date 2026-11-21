// Design tokens do Lacre (channels/pt-br-historia/brand.md). Única fonte de cor, fonte e movimento.
import {Easing} from 'remotion';
import {loadFont as loadSerif} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadSans} from '@remotion/google-fonts/Inter';

const serif = loadSerif('normal', {weights: ['500', '700', '900'], subsets: ['latin']});
const sans = loadSans('normal', {weights: ['500', '700', '800'], subsets: ['latin']});

export const C = {
	seal: '#8E1B1B', // vermelho-cera (destaque)
	sealBright: '#B3261E',
	paper: '#E9DFC8', // pergaminho
	paperDark: '#CBBE9F',
	ink: '#141210', // preto-carvão
	brass: '#B08D57', // latão (detalhe)
	slate: '#3E5566', // apoio frio (mapas)
	sea: '#1E2A33',
} as const;

export const F = {serif: serif.fontFamily, sans: sans.fontFamily} as const;

// Curvas de movimento: nunca linear para objetos; linear só para câmera lenta contínua.
export const E = {
	out: Easing.bezier(0.16, 1, 0.3, 1), // entrada decidida, assentamento suave
	inOut: Easing.bezier(0.65, 0, 0.35, 1), // câmera e transições
	soft: Easing.bezier(0.33, 1, 0.68, 1),
} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
