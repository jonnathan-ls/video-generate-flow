# Prompts do Flow, lote 1 (S02, S03, S04, S06 + acabamento S05), 2026-11-20
Modelo Nano Banana 2.1, 16:9, raciocínio Alto, x2, 0 créditos (runbooks/flow-generate-image.md).

Prefixo fixo (igual a `lab/flow-prompts-s04.md`), chamado PFX abaixo:
"Cinematic stylized illustration for a history documentary, painterly flat vector shapes with rich atmospheric depth and volumetric light, limited palette of oxblood red, parchment beige, charcoal, muted brass gold and slate blue, subtle paper grain, no text, no letters, no logos, no watermark."

Sufixo de objeto (OBJ): "isolated on a solid pure green background (#00FF00), full object visible, side view, flat even lighting, no ground shadow, no other objects."
Sufixo de fogo (FX): "isolated on a pure black background, nothing else in the frame."

## Fundos (chão livre para os atores)
| ID | Uso | Prompt (depois do PFX) |
|---|---|---|
| desk_top | S02 t1, t5 | Top-down view of a dark polished wooden office desk in 1965, a green leather blotter, a brass desk lamp in the upper corner, an ashtray and a fountain pen at the edges, large empty area in the center of the desk, warm lamp light, no papers in the center. |
| desk_top2 | S02 t7, S06 t2 | Top-down view of an old government office desk in the 1960s, dark wood with a worn burgundy leather inlay, a brass inkwell and a desk telephone near the top edge, large empty area in the center, soft window light from the left, no papers in the center. |
| office_65 | S02 t3, t8 | Interior of a 1960s government office in Rio de Janeiro, tall wooden windows open to a tropical garden, polished wooden floor in the foreground with wide empty floor space, a heavy desk and two leather armchairs on the right, an open double door on the left, a plain wall area for a wall calendar, afternoon light, no people. no monuments, no modern buildings. |
| quartel_65 | S02 t4 | A Brazilian army barracks parade ground in Rio de Janeiro in 1965, wide empty packed-earth ground in the foreground, long white colonial barracks building with arched windows in the background, imperial palm trees, mountains in the far distance, morning light, no people, no flags. |
| typewriter_65 | S02 t6 | Straight-on front view close-up of a 1960s manual office typewriter on a desk at night in an embassy office, a blank white sheet of paper rolled in the typewriter facing the camera, desk lamp light, dark background, the paper is clean and empty. |
| hanoi_45b | S03 t1 | Hanoi in 1945, a wide tree-lined avenue with low French colonial villas with yellow walls and shutters, tamarind trees, morning haze, a wide empty paved street in the foreground, no people, no monuments, no mausoleum, no modern buildings. |
| saigon_75 | S03 t2 | Saigon rooftops in April 1975 seen from a high building, low flat roofs, water tanks, old colonial buildings and 1960s concrete apartment blocks, wide open hazy sky in the upper half, late afternoon light, no skyscrapers, no modern glass towers, no people. |
| rio_65 | S03 t3 | Rio de Janeiro bay in 1965 seen from a seaside promenade, Sugarloaf mountain in the distance, calm water, a few 1960s buildings along the shore, a tall empty white flagpole standing on the left third of the frame, wide open sky, morning light, no flag on the pole, no people. |
| palanque_45 | S04 t2 | Ba Dinh Square in Hanoi on September 2 1945, seen from behind a vast crowd at eye level, a simple wooden speaker platform decorated with red cloth far in the distance with a tiny distant figure at a microphone, tropical trees and low French colonial buildings around, bright morning light, the lowest fifth of the image is the backs of heads only, no monuments, no mausoleum, no modern buildings. |
| desk_45 | S04 t5, t6 | A dark wooden writing desk in a dim room in 1945, top-down three-quarter view, an oil lamp casting warm light, a fountain pen and an ink bottle at the edge, large empty desk surface in the center, no papers. |
| port_50 | S06 t1, t3 | Saigon river port around 1950, a long concrete quay with a tall cargo crane on rails, wooden crates stacked at the back of the quay, warehouses with tile roofs, calm brown river water occupying the left half of the frame, an empty berth at the quay, hazy tropical light, no people, no modern buildings, no containers. |
| vale_54 | S06 t4, t5 | A wide valley in northern Vietnam in 1954 surrounded by green jungle hills, a French army fortified camp with trenches, sandbag bunkers, tents and a pierced steel plank airstrip, a dirt road crossing the foreground from left to right, open sky in the upper half, dramatic clouds, no people. |
| imprensa_54 | S06 t6 | A 1954 press conference room in Washington seen from behind rows of seated reporters in suits and hats, several press photographers holding large flash cameras, a wooden podium far away with a small distant figure from behind, wood paneled walls, warm light, no flags with text, no faces visible. |
| mesa_54 | S06 t7 | A dark green felt table top under a single hanging lamp, three-quarter view from slightly above, the table is empty and long, dark room around, dramatic pool of light in the center. |
| haiphong_46 | S05 t3 | Haiphong harbor in northern Vietnam in March 1946, a stone quay in the foreground right with warehouses and two cargo cranes, an empty berth, calm grey-green water on the left half, misty hills and a few moored steamships in the far distance, cool overcast morning light, no people, no modern buildings, no containers. |

## Edições de imagem no Flow (mesmo fundo, outro estado)
| ID | Fonte | Pedido |
|---|---|---|
| plant_off | bg_plant (Hanói, usina, noite) | Same image, same framing, but the city power is cut: every window of the power plant and of the houses is completely dark, no lights anywhere, only faint moonlight. Keep everything else identical. |
| flag_pole | flag_a (praça com bandeira) | Same image, same framing, remove the flag from the flagpole, leave the tall empty flagpole and everything else identical. |

## Objetos sobre verde (OBJ)
| ID | Uso | Prompt (PFX + texto + OBJ) |
|---|---|---|
| pasta | S02, S06 | A closed beige manila file folder lying flat, seen from directly above, slightly worn edges, a red string tie. |
| diplomata | S02 t3 | A man in a dark 1960s business suit and tie with short hair walking from left to right, seen from the side, full body including feet, face not detailed. |
| soldados_br65 | S02 t4 | A column of 6 Brazilian army soldiers of 1965 walking left to right, side view, olive green fatigue uniforms, olive green US M1 style steel helmets, rifles slung on the shoulder, black boots, full body including feet, evenly spaced, not overlapping. |
| civis_45 | S03 t1, S04 t1 | A column of 6 Vietnamese civilians of 1945 walking left to right, side view, light white and brown clothes, several conical hats, two of them carrying small red flags with a yellow star on short sticks, full body including feet, evenly spaced, not overlapping. |
| ch53 | S03 t2 | A US Marine Corps CH-53 Sea Stallion heavy transport helicopter of the 1970s, olive drab, flying left to right, side view, main rotor blades shown as a thin blurred disc. |
| bandeira_br | S03 t3 | The national flag of Brazil, flat rectangular fabric seen straight on, green field, yellow rhombus, blue globe with white stars and a white band, no pole. |
| multidao_costas | S04 t2, t3, t7 | A wide row of Vietnamese people of 1945 seen from behind, from the waist up, conical hats and white shirts, several raising their right arms and fists, a horizontal strip filling the width of the image. |
| bandeira_vn | S04 t4 | A red flag with a single large yellow five-pointed star in the center, flat rectangular fabric seen straight on, no pole. |
| cargueiro | S06 t1 | A 1940s cargo freighter ship with a grey hull, a single funnel, cargo booms and masts, moving left to right, side view, the whole hull visible. |
| caixotes | S06 t3 | A bundle of six wooden cargo crates hanging in a rope cargo net from a steel crane hook, side view. |
| c47 | S06 t4 | A C-47 Dakota twin-engine propeller transport plane of the French Air Force in the early 1950s, natural metal and olive finish, flying left to right, side view, propellers as blurred discs. |
| paraquedas | S06 t4 | A military supply crate hanging under an open round white cargo parachute, side view. |
| jipe | S06 t5 | A Willys MB jeep of the French army in Indochina, olive drab, canvas top down, a soldier with a bush hat driving, moving left to right, side view, wheels fully visible. |

## Fogo e explosão (FX)
| ID | Uso | Prompt (PFX + texto + FX) |
|---|---|---|
| explosao | S05 t4 | A large night explosion fireball with orange and yellow flames rising into a dark smoke column, debris sparks. |
| chamas | S05 t4, t5 | A row of tall flickering flames of a burning roof, bright orange and yellow, soft glow, wide horizontal shape. |

## Regras deste lote
- Hanói 1945: sempre "no monuments, no mausoleum, no modern buildings" (mistakes.md, S04).
- Saigon 1975: "no skyscrapers, no modern glass towers".
- Bandeiras com texto (Brasil: "ORDEM E PROGRESSO") podem sair com letras deformadas: conferir; se deformar, desenhar por código.
