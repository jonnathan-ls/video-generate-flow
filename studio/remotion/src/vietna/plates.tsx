// Plates: cenas ilustradas em código (estilo D do Lacre), com câmera, parallax e atmosfera.
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, E, clamp} from '../lacre/tokens';
import {Birds, Colonial, Crowd, Crates, Palm, Ridge, Sea, Ship, Skyline, Sky, Sun} from '../lacre/draw';
import {Grade, LightRays, Particles} from '../lacre/layers';
import {Cam2 as Cam, L, Steam, Barbed, BallotBox, CameraFlashes, Congress, Fig, Flag, Flash, Heli, Jeep, Karst, Lamp, LightPool, Obelisk, Paddy, Plant, Podium, Scroll, Smoke, Svg, Tower, W, H} from './cine';

export type PlateProps = {at_s?: number; t0?: number; v?: string};
const useT = () => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return {f, k: interpolate(f, [0, durationInFrames], [0, 1], clamp)};
};

const Floor: React.FC<{y: number; top: string; bottom: string}> = ({y, top, bottom}) => (
	<Svg>
		<defs>
			<linearGradient id={`fl${y}`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={top} />
				<stop offset="1" stopColor={bottom} />
			</linearGradient>
		</defs>
		<rect x={0} y={y} width={W} height={H - y} fill={`url(#fl${y})`} />
	</Svg>
);

export const PLATES: Record<string, React.FC<PlateProps>> = {
	// Washington à noite: janela, obelisco, mesa com abajur e papéis
	'office-night': () => (
		<Cam z0={1.02} z1={1.12} origin="60% 55%" pan={[-1.5, 0]}>
			<L d={0.06}><Sky stops={[['#070b14', 0], ['#14213a', 55], ['#2b3c5f', 80]]} /></L>
			<L d={0.25}>
			<Svg>
				{Array.from({length: 40}).map((_, i) => <circle key={i} cx={(i * 197) % 1500} cy={(i * 83) % 420} r={1.5} fill="#cfd8ea" opacity={0.6} />)}
				<Obelisk x={760} y={700} s={1.2} color="#223048" />
				<rect x={0} y={690} width={W} height={60} fill="#0a0f19" />
				<rect x={380} y={90} width={1180} height={640} fill="none" stroke="#06080d" strokeWidth={26} />
				<line x1={970} y1={90} x2={970} y2={730} stroke="#06080d" strokeWidth={16} />
				<line x1={380} y1={410} x2={1560} y2={410} stroke="#06080d" strokeWidth={12} />
				<rect x={0} y={0} width={380} height={H} fill="#07090e" />
				<rect x={1560} y={0} width={360} height={H} fill="#07090e" />
				<rect x={0} y={720} width={W} height={360} fill="#150f0b" />
				<rect x={0} y={720} width={W} height={14} fill="#2a1d14" />
			</Svg>
			</L>
			<L d={0.9}><Flag x={1650} y={170} w={230} kind="us" pole={520} amp={7} /></L>
			<LightPool x={1250} y={820} rx={700} ry={260} flicker={0.04} />
			<L d={1.0}>
			<Svg>
				<Lamp x={1500} y={760} s={1.3} />
			</Svg>
			</L>
			<Particles count={30} kind="dust" opacity={0.4} />
			<Grade color="#1b2d4d" opacity={0.3} mode="soft-light" />
		</Cam>
	),
	// Brasília ao entardecer
	'brasilia-dusk': () => (
		<Cam z0={1.03} z1={1.16} origin="50% 70%" pan={[0, -1]}>
			<L d={0.06}><Sky stops={[['#2a2a5c', 0], ['#8a4a6a', 40], ['#e58f58', 68], ['#f6d490', 80]]} /></L>
			<L d={0.08}><Sun x={1340} y={620} r={70} /></L>
			<L d={0.5}>
			<Svg>
				<rect x={0} y={740} width={W} height={340} fill="#1a121a" />
				<rect x={0} y={740} width={W} height={4} fill="#f0b070" opacity={0.5} />
			</Svg>
			</L>
			<L d={0.5}>
			<Svg>
				<Congress x={760} y={742} s={1.35} />
				<rect x={0} y={786} width={W} height={294} fill="#241a28" opacity={0.0} />
			</Svg>
			</L>
			<L d={0.5}>
			<Svg>
				<rect x={0} y={820} width={W} height={260} fill="#2e2030" opacity={0.7} />
				<g transform="translate(760 820) scale(1 -0.35)" opacity={0.28}>
					<rect x={-38} y={0} width={30} height={334} fill="#ffb070" />
					<rect x={8} y={0} width={30} height={334} fill="#ffb070" />
				</g>
			</Svg>
			</L>
			<L d={0.9}><Flag x={1560} y={300} w={190} kind="br" pole={460} amp={8} /></L>
			<L d={0.1}><Birds y={210} /></L>
			<LightRays opacity={0.15} />
			<Particles count={28} kind="dust" opacity={0.35} />
			<Grade color="#b0603a" opacity={0.18} />
		</Cam>
	),
	// sala de reunião: mesa longa, duas cadeiras, bandeiras
	'meeting-table': ({v}) => (
		<Cam z0={1.02} z1={1.14} origin="50% 65%" pan={[1, 0]}>
			<L d={0.06}><Sky stops={[['#0d0a09', 0], ['#201713', 100]]} /></L>
			<L d={0.5}>
			<Svg>
				<rect x={0} y={0} width={W} height={720} fill="#17110e" />
				{Array.from({length: 14}).map((_, i) => <rect key={i} x={80 + i * 130} y={40} width={36} height={620} fill="#f2d9a0" opacity={0.05} />)}
			</Svg>
			</L>
			{v !== 'plain' && <Flag x={440} y={150} w={230} kind="us" pole={520} amp={4} />}
			{v !== 'plain' && <Flag x={1250} y={150} w={230} kind="br" pole={520} amp={4} />}
			<Floor y={700} top="#20160f" bottom="#080605" />
			<L d={1.25}>
			<Svg>
				<polygon points="260,780 1660,780 1860,1000 60,1000" fill="#3a2418" />
				<polygon points="260,780 1660,780 1680,800 240,800" fill="#6a4630" />
				<Fig x={760} y={760} s={2.1} kind="suit" color="#07060a" />
				<Fig x={1180} y={760} s={2.1} kind="suit" color="#07060a" flip />
				<rect x={940} y={800} width={44} height={30} fill="#e6dcc3" transform="rotate(-8 960 815)" />
				<rect x={1000} y={812} width={60} height={34} fill="#d9cfb2" transform="rotate(5 1030 830)" />
			</Svg>
			</L>
			<LightPool x={960} y={850} rx={620} ry={200} opacity={0.5} flicker={0.03} />
			<LightRays opacity={0.12} angle={8} />
			<Particles count={34} kind="dust" opacity={0.4} />
		</Cam>
	),
	// alvorecer em Hanói: casario colonial, bandeiras, pássaros
	'hanoi-dawn': () => (
		<Cam z0={1.03} z1={1.16} origin="40% 70%" pan={[-1.5, 0]}>
			<L d={0.06}><Sky stops={[['#1d2a4a', 0], ['#7a5a7a', 38], ['#e8a368', 66], ['#fbe0a0', 78]]} /></L>
			<L d={0.08}><Sun x={1120} y={600} r={78} /></L>
			<L d={0.3}><Ridge seed={11} baseY={640} amp={60} color="#5a4a5a" speed={0.04} /></L>
			<L d={0.6}>
			<Svg>
				<Colonial x={90} y={760} n={9} seed={4} s={1.45} />
				<rect x={0} y={760} width={W} height={320} fill="#2a1d1a" />
				<rect x={0} y={760} width={W} height={10} fill="#4a3228" />
			</Svg>
			</L>
			<L d={1.7}>
			<Svg>
				<Palm x={1560} y={800} s={2.1} lean={-1} />
				<Palm x={1740} y={820} s={1.6} lean={1} />
				<Palm x={160} y={820} s={1.8} lean={1} color="#0c1f1a" />
			</Svg>
			</L>
			<L d={0.9}><Flag x={560} y={330} w={230} kind="vn" pole={420} amp={10} phase={1} /></L>
			<L d={0.9}><Flag x={1130} y={310} w={260} kind="vn" pole={450} amp={11} /></L>
			<L d={0.1}><Birds y={170} /></L>
			<LightRays opacity={0.2} />
			<Particles count={30} kind="dust" opacity={0.45} />
			<Grade color="#d08040" opacity={0.15} />
		</Cam>
	),
	// praça de Ba Dinh: multidão com chapéus cônicos e bandeiras, palanque
	'ba-dinh-crowd': () => (
		<Cam z0={1.05} z1={1.24} origin="42% 85%" pan={[1.5, 0]}>
			<L d={0.06}><Sky stops={[['#6a86a6', 0], ['#b8c8cc', 45], ['#f0e0b4', 70]]} /></L>
			<L d={0.08}><Sun x={1500} y={300} r={60} color="#fff2cf" glow="rgba(255,240,200,0.5)" /></L>
			<L d={0.6}>
			<Svg>
				<Colonial x={140} y={600} n={10} seed={9} s={1.2} />
				<rect x={0} y={600} width={W} height={480} fill="#8a7a62" />
			</Svg>
			</L>
			<L d={1.25}>
			<Svg>
				<rect x={520} y={420} width={620} height={30} fill="#3a2a22" />
				<rect x={540} y={450} width={580} height={150} fill="#5a3a2a" />
				<Podium x={830} y={450} s={0.9} mics={2} />
				<Fig x={830} y={452} s={1.1} kind="suit" color="#14100e" />
			</Svg>
			</L>
			{[0, 1, 2, 3, 4, 5].map((i) => <Flag key={i} x={240 + i * 300} y={250 + (i % 2) * 40} w={150} kind="vn" pole={330} amp={9} phase={i} />)}
			<L d={1.25}>
			<Svg>
				{Array.from({length: 36}).map((_, i) => <Fig key={`a${i}`} x={30 + i * 54 + (i % 3) * 12} y={700 + (i % 4) * 18} s={0.55} kind="hat" color="#241c18" />)}
			</Svg>
			</L>
			<L d={1.25}>
			<Svg>
				{Array.from({length: 26}).map((_, i) => <Fig key={`b${i}`} x={50 + i * 76 + (i % 2) * 20} y={820 + (i % 3) * 16} s={0.8} kind={i % 4 ? 'hat' : 'suit'} color="#18120f" />)}
			</Svg>
			</L>
			<L d={1.25}>
			<Svg>
				{Array.from({length: 16}).map((_, i) => <Fig key={`c${i}`} x={20 + i * 122 + (i % 2) * 30} y={990 + (i % 2) * 12} s={1.25} kind="hat" color="#0c0807" />)}
			</Svg>
			</L>
			<Particles count={36} kind="dust" opacity={0.4} />
			<Grade color="#e0b070" opacity={0.14} />
		</Cam>
	),
	// pergaminhos de duas declarações, à luz de vela
	parchments: () => (
		<Cam z0={1.03} z1={1.14} origin="50% 60%">
			<L d={0.06}><Sky stops={[['#0a0706', 0], ['#1e140e', 100]]} /></L>
			<L d={0.9}>
			<Svg>
				<rect x={0} y={620} width={W} height={460} fill="#1c120d" />
				<Scroll x={560} y={600} w={560} rot={-4} seal="#2b4a8a" />
				<Scroll x={1380} y={620} w={560} rot={3} seal="#2b4a8a" />
			</Svg>
			</L>
			<L d={0.9}><Flag x={360} y={120} w={160} kind="us" pole={260} amp={3} /></L>
			<L d={0.9}><Flag x={1240} y={120} w={160} kind="fr" pole={260} amp={3} /></L>
			<LightPool x={560} y={620} rx={460} ry={300} flicker={0.2} />
			<LightPool x={1380} y={640} rx={460} ry={300} flicker={0.2} />
			<Particles count={36} kind="embers" opacity={0.5} />
			<Grade color="#8a4a20" opacity={0.2} />
		</Cam>
	),
	// frota ao amanhecer, botões de desembarque com soldados
	'fleet-dawn': ({v}) => (
		<Cam z0={1.02} z1={1.14} origin="60% 60%" pan={[-2, 0]}>
			<L d={0.06}><Sky stops={[['#26304a', 0], ['#8a6a78', 40], ['#eba86e', 66], ['#fbe0a0', 74]]} /></L>
			<L d={0.08}><Sun x={1400} y={560} r={72} /></L>
			<L d={0.3}><Ridge seed={21} baseY={600} amp={70} color="#4a3f52" speed={0.04} /></L>
			<L d={0.5}><Sea y={610} top="#8a6a70" bottom="#1c1620" /></L>
			<L d={1.25}>
			<Svg>
				<Steam x={430} y={720} s={1.35} flag={v === 'gb' ? '#c8372d' : '#2b3f8a'} />
				<Steam x={1010} y={670} s={0.85} flag={v === 'gb' ? '#c8372d' : '#2b3f8a'} />
				<Steam x={1530} y={655} s={0.6} flag={v === 'gb' ? '#c8372d' : '#2b3f8a'} />
				<g transform="translate(1180 880)">
					<polygon points="-210,0 210,0 170,50 -170,50" fill="#0f0c0a" />
					{Array.from({length: 7}).map((_, i) => <Fig key={i} x={-150 + i * 50} y={4} s={0.5} kind="soldier" color="#0b0908" />)}
				</g>
			</Svg>
			</L>
			<L d={0.1}><Birds y={190} n={5} /></L>
			<LightRays opacity={0.15} />
			<Particles count={24} kind="dust" opacity={0.35} />
		</Cam>
	),
	// rua de Saigon ao entardecer, caminhão e soldados em marcha
	'saigon-street': ({v}) => {
		const {f} = useT();
		return (
			<Cam z0={1.03} z1={1.16} origin="45% 75%" pan={[-1.5, 0]}>
				<L d={0.06}><Sky stops={[['#30284a', 0], ['#a2585a', 44], ['#f09858', 70], ['#f8d08a', 80]]} /></L>
				<L d={0.08}><Sun x={1480} y={600} r={66} /></L>
				<L d={0.6}>
				<Svg>
					<Colonial x={40} y={700} n={9} seed={31} s={1.55} />
					<rect x={0} y={700} width={W} height={380} fill="#2a1f22" />
				</Svg>
				</L>
				<L d={1.7}>
				<Svg>
					<Palm x={230} y={760} s={2.4} lean={1} color="#0e1f1c" />
					<Palm x={1700} y={770} s={2.2} lean={-1} color="#0e1f1c" />
					<polygon points={`0,820 ${W},780 ${W},1080 0,1080`} fill="#3a2c2e" />
				</Svg>
				</L>
				<L d={1.25}>
				<Svg>
					<Jeep x={((f * 3.2) % 2600) - 300} y={900} s={1.5} truck />
					{Array.from({length: 8}).map((_, i) => <Fig key={i} x={((f * 1.6 + i * 150) % 2400) - 200} y={990 + (i % 2) * 14} s={1.3} kind="soldier" walk={1} color="#0b0809" />)}
				</Svg>
				</L>
				<L d={0.9}><Flag x={1100} y={260} w={220} kind={v === 'svn' ? 'svn' : 'fr'} pole={420} amp={9} /></L>
				<Particles count={30} kind="dust" opacity={0.4} />
				<LightRays opacity={0.14} />
				<Grade color="#c06030" opacity={0.16} />
			</Cam>
		);
	},
	// usina de Hanói à noite; luzes caem e clarão no instante do ataque
	'blackout-hanoi': ({at_s = 2}) => {
		const {f} = useT();
		const hit = f > at_s * 30;
		const lights = hit ? interpolate(f, [at_s * 30, at_s * 30 + 6], [1, 0], clamp) : 1;
		return (
			<Cam z0={1.02} z1={1.16} origin="52% 70%" pan={[0, 0]}>
				<L d={0.06}><Sky stops={[['#05070d', 0], ['#101a2c', 60], ['#1d2a40', 80]]} /></L>
				<Svg>{Array.from({length: 50}).map((_, i) => <circle key={i} cx={(i * 233) % W} cy={(i * 71) % 420} r={1.4} fill="#cfd8ea" opacity={0.55} />)}</Svg>
				<L d={0.45}><Skyline y={760} color="#0d1119" seed={13} density={0.1 * lights} win="#ffcf7a" /></L>
				<L d={0.5}>
				<Svg>
					<Plant x={980} y={800} s={1.6} lights={lights} />
					<rect x={0} y={800} width={W} height={280} fill="#07090d" />
				</Svg>
				</L>
				<L d={0.6}><Smoke x={1180} y={380} n={14} color="#0b0c10" w={90} rise={380} opacity={0.65} /></L>
				<Flash x={1000} y={640} r={560} at={Math.round(at_s * 30)} len={16} />
				<Flash x={1160} y={560} r={360} at={Math.round(at_s * 30) + 8} len={12} color="255,120,60" />
				<LightPool x={1000} y={700} rx={900} ry={300} color="255,150,70" opacity={hit ? 0.5 * interpolate(f, [at_s * 30, at_s * 30 + 20], [0, 1], clamp) : 0} flicker={0.2} />
				<Particles count={40} kind="embers" opacity={hit ? 0.7 : 0.1} />
				<Grade color="#10203a" opacity={0.3} />
			</Cam>
		);
	},
	// ruas em guerra: barricada, fumaça, luz de incêndio
	'war-streets': () => (
		<Cam z0={1.02} z1={1.15} origin="50% 70%">
			<L d={0.06}><Sky stops={[['#1a1210', 0], ['#4a2a1c', 50], ['#c0602a', 80]]} /></L>
			<L d={0.45}><Skyline y={700} color="#120d0c" seed={17} density={0.03} win="#ff9a4a" /></L>
			<L d={0.6}><Smoke x={500} y={720} n={16} color="#0e0b0a" w={120} rise={620} opacity={0.7} /></L>
			<L d={0.6}><Smoke x={1450} y={720} n={16} color="#0e0b0a" w={110} rise={560} opacity={0.7} speed={0.8} /></L>
			<Flash x={520} y={640} r={420} every={46} seed={4} color="255,130,60" />
			<Flash x={1480} y={660} r={380} every={52} seed={9} color="255,150,70" />
			<L d={1.25}>
			<Svg>
				<rect x={0} y={800} width={W} height={280} fill="#0b0807" />
				{Array.from({length: 12}).map((_, i) => <rect key={i} x={360 + i * 90} y={850 - (i % 3) * 22} width={96} height={70} rx={20} fill="#1b140f" stroke="#2a1d14" strokeWidth={3} />)}
				<Fig x={760} y={850} s={1.5} kind="soldier" color="#050403" />
				<Fig x={1210} y={860} s={1.6} kind="hat" color="#050403" />
			</Svg>
			</L>
			<LightPool x={960} y={780} rx={1100} ry={320} color="255,120,50" opacity={0.35} flicker={0.25} />
			<Particles count={50} kind="embers" opacity={0.75} />
			<Grade color="#a03a1a" opacity={0.22} />
		</Cam>
	),
	// doca com caixas de ajuda e navio
	'dock-crates': () => (
		<Cam z0={1.05} z1={1.22} origin="30% 80%" pan={[2, 0]}>
			<L d={0.06}><Sky stops={[['#3b4252', 0], ['#a2706a', 55], ['#f0c88e', 76]]} /></L>
			<L d={0.08}><Sun x={1500} y={520} r={60} color="#ffe9c0" /></L>
			<L d={0.5}><Sea y={560} top="#8a6a66" bottom="#241c24" /></L>
			<L d={0.7}>
			<Svg>
				<Steam x={1340} y={600} s={1.0} flag="#2b3f8a" />
				<polygon points="0,720 1920,640 1920,1080 0,1080" fill="#6a5238" />
				<polygon points="0,720 1920,640 1920,656 0,736" fill="#8a6c48" />
			</Svg>
			</L>
			<L d={1.25}><Crowd count={14} seed={5} baseY={830} scale={1.5} x0={80} x1={1100} hats={0.4} /></L>
			<L d={0.5}>
			<Svg>
				<Crates x={200} y={960} s={2.2} />
				<Crates x={520} y={1000} s={1.9} />
				<Crates x={1560} y={1010} s={2.3} />
				<Crates x={1200} y={900} s={1.4} />
			</Svg>
			</L>
			<L d={0.9}><Flag x={880} y={380} w={180} kind="us" amp={8} /></L>
			<Particles count={30} kind="dust" opacity={0.35} />
			<Grade color="#b08d57" opacity={0.18} />
		</Cam>
	),
	// sala de imprensa: palanque, microfones, flashes
	'press-room': () => (
		<Cam z0={1.02} z1={1.14} origin="50% 70%">
			<L d={0.06}><Sky stops={[['#08090d', 0], ['#171a22', 100]]} /></L>
			<L d={0.5}>
			<Svg>
				<rect x={380} y={80} width={1160} height={540} fill="#1a2030" />
				<rect x={430} y={120} width={1060} height={460} fill="#232a3c" />
			</Svg>
			</L>
			<L d={0.9}><Flag x={700} y={170} w={230} kind="us" pole={500} amp={4} /></L>
			<L d={0.9}><Flag x={1250} y={170} w={230} kind="us" pole={500} amp={4} /></L>
			<Floor y={700} top="#14101a" bottom="#050407" />
			<L d={0.9}>
			<Svg>
				<Podium x={960} y={800} s={1.7} mics={4} />
			</Svg>
			</L>
			<LightPool x={960} y={560} rx={520} ry={340} color="255,240,210" opacity={0.4} />
			<L d={1.25}>
			<Svg>
				{Array.from({length: 14}).map((_, i) => <Fig key={i} x={40 + i * 140 + (i % 2) * 30} y={1030 + (i % 2) * 10} s={1.5 + (i % 3) * 0.2} kind={i % 3 ? 'suit' : 'hat'} color="#030204" />)}
			</Svg>
			</L>
			<CameraFlashes seed={3} n={6} />
			<Particles count={30} kind="dust" opacity={0.35} />
		</Cam>
	),
	// vale de Dien Bien Phu: picos, neblina, fumaça, clarões de artilharia, arame farpado
	'valley-dbp': ({v}) => (
		<Cam z0={1.02} z1={1.15} origin="45% 65%" pan={[-1, 0]}>
			<L d={0.06}><Sky stops={[['#26303a', 0], ['#6a7a82', 45], ['#c8b890', 74]]} /></L>
			<L d={0.3}><Karst baseY={640} color="#4a5a60" seed={1} amp={300} fog="rgba(190,200,200,0.4)" step={170} /></L>
			<L d={0.3}><Karst baseY={720} color="#2f3d42" seed={2} amp={260} fog="rgba(160,175,175,0.5)" step={140} /></L>
			<L d={0.3}><Karst baseY={800} color="#1c2a2e" seed={3} amp={180} fog="rgba(140,155,155,0.5)" step={120} /></L>
			{v !== 'calm' && <Smoke x={620} y={720} n={14} color="#2a2826" w={100} rise={540} opacity={0.5} />}
			{v !== 'calm' && <Smoke x={1380} y={700} n={14} color="#2a2826" w={90} rise={500} opacity={0.5} speed={0.7} />}
			{v !== 'calm' && <Flash x={900} y={640} r={380} every={52} seed={3} color="255,180,90" />}
			{v !== 'calm' && <Flash x={1500} y={600} r={300} every={66} seed={6} color="255,170,80" />}
			<L d={1.4}>
			<Svg>
				<rect x={0} y={880} width={W} height={200} fill="#0e0f0e" />
				<Barbed y={960} s={1.4} />
			</Svg>
			</L>
			<Svg>{Array.from({length: 5}).map((_, i) => <Fig key={i} x={260 + i * 330} y={990} s={1.4} kind="soldier" color="#040504" />)}</Svg>
			<Particles count={36} kind="dust" opacity={0.4} />
			<Grade color="#6a7a60" opacity={0.2} />
		</Cam>
	),
	// lago de Genebra, Alpes e mastros de bandeiras
	'geneva-lake': () => (
		<Cam z0={1.02} z1={1.12} origin="50% 60%" pan={[1, 0]}>
			<L d={0.06}><Sky stops={[['#4a6a9a', 0], ['#a8c0d8', 45], ['#f4e4c0', 68]]} /></L>
			<L d={0.08}><Sun x={1320} y={470} r={58} color="#fff4d0" /></L>
			<L d={0.3}><Ridge seed={41} baseY={500} amp={220} color="#c8d4e0" speed={0.03} /></L>
			<L d={0.3}><Ridge seed={43} baseY={560} amp={160} color="#7a8aa0" speed={0.05} /></L>
			<L d={0.5}><Sea y={600} top="#7a9ab8" bottom="#1c2c44" line="rgba(255,255,255,0.28)" /></L>
			<L d={0.5}>
			<Svg>
				<rect x={0} y={800} width={W} height={280} fill="#23262c" />
				<rect x={0} y={800} width={W} height={10} fill="#4a4e58" />
				<rect x={160} y={560} width={760} height={240} fill="#d8d0bc" />
				<polygon points="140,560 540,480 940,560" fill="#8a7a62" />
				{Array.from({length: 9}).map((_, i) => <rect key={i} x={200 + i * 80} y={620} width={36} height={70} fill="#4a3a2a" />)}
			</Svg>
			</L>
			<L d={0.1}><Birds y={200} n={5} color="#3a4252" /></L>
			<Particles count={22} kind="dust" opacity={0.3} />
		</Cam>
	),
	// zona desmilitarizada: rio, margens, torres de vigia, névoa
	'dmz-river': () => (
		<Cam z0={1.03} z1={1.16} origin="50% 70%" pan={[0, 0]}>
			<L d={0.06}><Sky stops={[['#3a4a5a', 0], ['#8a9aa0', 48], ['#d8cfae', 74]]} /></L>
			<L d={0.3}><Karst baseY={600} color="#58666a" seed={7} amp={170} fog="rgba(200,210,205,0.45)" step={190} /></L>
			<L d={0.5}>
			<Svg>
				<rect x={0} y={640} width={W} height={440} fill="#2a3a3a" />
				<path d="M700 640 Q900 760 760 1080 L1180 1080 Q1010 780 1060 640 Z" fill="#6a8a98" />
				<path d="M700 640 Q900 760 760 1080 L860 1080 Q1000 780 800 640 Z" fill="#aac0c8" opacity={0.25} />
			</Svg>
			</L>
			<L d={0.9}><Tower x={420} y={760} s={1.3} dir={1} /></L>
			<L d={0.9}><Tower x={1500} y={740} s={1.3} dir={-1} /></L>
			<L d={1.4}>
			<Svg>
				<Barbed y={860} x0={-50} x1={640} s={1.1} />
				<Barbed y={850} x0={1180} x1={1980} s={1.1} />
			</Svg>
			</L>
			<L d={1.7}>
			<Svg>
				<Palm x={160} y={900} s={2.2} lean={1} color="#0b1a16" />
				<Palm x={1780} y={900} s={2.2} lean={-1} color="#0b1a16" />
			</Svg>
			</L>
			<LightRays opacity={0.12} />
			<L d={0.6}><Smoke x={960} y={720} n={10} color="#c8d0cc" w={160} rise={180} opacity={0.35} speed={0.5} /></L>
			<Particles count={30} kind="dust" opacity={0.35} />
		</Cam>
	),
	// urna e cédulas sob um holofote
	'ballot-box': () => (
		<Cam z0={1.03} z1={1.16} origin="50% 65%">
			<L d={0.06}><Sky stops={[['#06070a', 0], ['#14171f', 100]]} /></L>
			<L d={0.5}>
			<Svg>
				<rect x={0} y={760} width={W} height={320} fill="#0c0b0e" />
				<polygon points="760,0 1160,0 1500,1080 420,1080" fill="rgba(255,240,205,0.07)" />
			</Svg>
			</L>
			<LightPool x={960} y={820} rx={560} ry={220} color="255,236,190" opacity={0.6} />
			<L d={0.5}>
			<Svg>
				<BallotBox x={960} y={850} s={2.2} />
			</Svg>
			</L>
			<Particles count={46} kind="dust" opacity={0.5} />
		</Cam>
	),
	// helicópteros sobre arrozais ao nascer do sol
	'heli-paddies': () => {
		const {k} = useT();
		return (
			<Cam z0={1.02} z1={1.12} origin="40% 60%" pan={[-1, 0]}>
				<L d={0.06}><Sky stops={[['#3a4a6a', 0], ['#c07a6a', 40], ['#f6b878', 62], ['#fbe6a8', 72]]} /></L>
				<L d={0.08}><Sun x={1300} y={560} r={84} /></L>
				<L d={0.3}><Karst baseY={650} color="#5a5a6a" seed={9} amp={210} fog="rgba(240,200,170,0.4)" step={200} /></L>
				<L d={0.7}><Paddy y={680} sky="#f6c890" green="#2a4a2a" rows={8} /></L>
				<L d={0.5}>
				<Svg>
					<Heli y={300} t={k * 0.9 + 0.05} s={1.4} />
					<Heli y={380} t={k * 0.9 - 0.12} s={1.0} />
					<Heli y={250} t={k * 0.9 - 0.3} s={0.7} />
				</Svg>
				</L>
				<L d={1.7}>
				<Svg>
					<Palm x={240} y={900} s={2.4} lean={1} color="#0c1e16" />
					<Palm x={1740} y={930} s={2.6} lean={-1} color="#0c1e16" />
				</Svg>
				</L>
				<L d={0.1}><Birds y={180} n={4} /></L>
				<LightRays opacity={0.2} />
				<Particles count={26} kind="dust" opacity={0.4} />
				<Grade color="#d08040" opacity={0.14} />
			</Cam>
		);
	},
	// fila de assessores americanos, jipe e bandeira ao amanhecer
	'advisors-line': () => (
		<Cam z0={1.03} z1={1.16} origin="45% 80%" pan={[1, 0]}>
			<L d={0.06}><Sky stops={[['#3a4262', 0], ['#a2707a', 42], ['#f0a870', 66], ['#fadc9c', 76]]} /></L>
			<L d={0.08}><Sun x={1500} y={600} r={70} /></L>
			<L d={0.3}><Karst baseY={660} color="#4a4a5a" seed={5} amp={170} fog="rgba(240,200,170,0.4)" step={210} /></L>
			<L d={1.7}><Palm x={140} y={760} s={2.2} lean={1} color="#0d1d17" /></L>
			<L d={1.25}>
			<Svg>
				<rect x={0} y={760} width={W} height={320} fill="#2a2216" />
				<rect x={0} y={760} width={W} height={8} fill="#4a3a26" />
				{Array.from({length: 11}).map((_, i) => <Fig key={i} x={200 + i * 120} y={930} s={1.5} kind="soldier" color="#080706" />)}
				<Jeep x={1620} y={860} s={1.5} />
			</Svg>
			</L>
			<L d={0.9}><Flag x={880} y={250} w={260} kind="us" pole={520} amp={9} /></L>
			<LightRays opacity={0.18} />
			<Particles count={28} kind="dust" opacity={0.4} />
			<Grade color="#c08040" opacity={0.14} />
		</Cam>
	),
	// sala de comando: mesa com mapa, abajures, silhuetas
	'command-room': ({v}) => (
		<Cam z0={1.02} z1={1.14} origin="50% 70%">
			<L d={0.06}><Sky stops={[['#07080b', 0], ['#14161c', 100]]} /></L>
			<L d={1.25}>
			<Svg>
				<rect x={0} y={0} width={W} height={720} fill="#101319" />
				{Array.from({length: 6}).map((_, i) => <rect key={i} x={140 + i * 300} y={90} width={200} height={300} fill="#1c2430" stroke="#2c3646" strokeWidth={6} />)}
				<polygon points="200,780 1720,780 1860,1020 60,1020" fill="#2a2a22" />
				<polygon points="320,800 1600,800 1700,980 220,980" fill="#3c4a3a" />
				<path d="M520 860 Q760 820 940 880 T1380 900" stroke="#c8b890" strokeWidth={5} fill="none" opacity={0.7} />
				<circle cx={820} cy={880} r={12} fill="#c9483f" />
				<circle cx={1200} cy={900} r={12} fill="#c9483f" />
				<Fig x={560} y={780} s={2.2} kind="suit" color="#050507" />
				<Fig x={1360} y={780} s={2.3} kind="soldier" color="#050507" flip />
			</Svg>
			</L>
			<Svg><Lamp x={960} y={760} s={1.4} /></Svg>
			<LightPool x={960} y={880} rx={780} ry={220} opacity={0.55} flicker={0.03} />
			<L d={0.9}><Flag x={1620} y={170} w={190} kind={v === 'svn' ? 'svn' : 'us'} pole={420} amp={3} /></L>
			<Particles count={30} kind="dust" opacity={0.35} />
			<Grade color="#203040" opacity={0.2} />
		</Cam>
	),
	// três bandeiras (Canadá, Índia, Polônia) em contraluz
	'three-flags': () => (
		<Cam z0={1.03} z1={1.14} origin="50% 55%">
			<L d={0.06}><Sky stops={[['#2a3a5a', 0], ['#a07a7a', 45], ['#f0c088', 72]]} /></L>
			<L d={0.08}><Sun x={960} y={640} r={90} /></L>
			<L d={0.5}>
			<Svg>
				<rect x={0} y={820} width={W} height={260} fill="#1a1612" />
			</Svg>
			</L>
			<L d={0.9}><Flag x={420} y={280} w={330} kind="ca" pole={560} amp={14} /></L>
			<L d={0.9}><Flag x={880} y={250} w={340} kind="in" pole={600} amp={15} phase={1.5} /></L>
			<L d={0.9}><Flag x={1340} y={280} w={330} kind="pl" pole={560} amp={14} phase={3} /></L>
			<LightRays opacity={0.2} />
			<Particles count={26} kind="dust" opacity={0.4} />
		</Cam>
	),
};

export const Plate: React.FC<{name: string; at_s?: number; t0?: number; v?: string}> = ({name, at_s, t0, v}) => {
	const P = PLATES[name];
	if (!P) return <AbsoluteFill style={{background: '#12100e'}} />;
	return (
		<AbsoluteFill>
			<P v={v} at_s={at_s !== undefined && t0 !== undefined ? at_s - t0 : undefined} />
		</AbsoluteFill>
	);
};


/** Imagem do Flow com movimento: câmera + ondulação animada (bandeiras, multidão, ar) + nitidez + poeira/raios. Sem camadas duplicadas. */
export const ImgPlate: React.FC<{src: string; z0?: number; z1?: number; ox?: string; oy?: string; dx?: number; wave?: number; rays?: number}> = ({src, z0 = 1.03, z1 = 1.14, ox = '50%', oy = '60%', dx = -1.5, wave = 9, rays = 0.18}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(f, [0, durationInFrames], [0, 1], {...clamp, easing: E.inOut});
	const z = z0 + (z1 - z0) * t;
	const id = `wv${src.replace(/[^a-z0-9]/gi, '')}`;
	return (
		<AbsoluteFill style={{background: '#0d0a08'}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<filter id={id} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
					<feTurbulence type="fractalNoise" baseFrequency={`${0.004 + Math.sin(f / 90) * 0.0008} ${0.011 + Math.cos(f / 70) * 0.0015}`} numOctaves={2} seed={4} result="n" />
					<feOffset in="n" dx={f * 3} dy={f * 1.2} result="n2" />
					<feDisplacementMap in="SourceGraphic" in2="n2" scale={wave} xChannelSelector="R" yChannelSelector="G" result="d" />
					<feConvolveMatrix in="d" order={3} kernelMatrix="0 -0.35 0 -0.35 2.4 -0.35 0 -0.35 0" divisor={1} preserveAlpha="true" />
				</filter>
			</svg>
			<AbsoluteFill style={{transformOrigin: `${ox} ${oy}`, scale: String(z), translate: `${dx * t}% 0%`}}>
				<Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: `url(#${id})`}} />
			</AbsoluteFill>
			<LightRays opacity={rays} angle={14} />
			<Particles count={30} kind="dust" opacity={0.4} />
		</AbsoluteFill>
	);
};
PLATES['img-hanoi-a'] = () => <ImgPlate src="vietna/hanoi_a.jpg" z0={1.03} z1={1.14} ox="50%" oy="58%" dx={-1.5} />;
PLATES['img-hanoi-b'] = () => <ImgPlate src="vietna/hanoi_b.jpg" z0={1.03} z1={1.14} ox="35%" oy="60%" dx={1.5} />;
PLATES['img-crowd-a'] = () => <ImgPlate src="vietna/crowd_a.jpg" z0={1.03} z1={1.14} ox="50%" oy="75%" dx={-1} wave={12} />;
PLATES['img-crowd-b'] = () => <ImgPlate src="vietna/crowd_b.jpg" z0={1.04} z1={1.15} ox="62%" oy="70%" dx={1} wave={12} />;
PLATES['img-crowd-c'] = () => <ImgPlate src="vietna/crowd_c.jpg" z0={1.04} z1={1.15} ox="55%" oy="70%" dx={1} wave={12} />;
PLATES['img-flag-a'] = () => <ImgPlate src="vietna/flag_a.jpg" z0={1.03} z1={1.14} ox="50%" oy="40%" dx={0} wave={14} />;
