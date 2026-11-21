# Resultado do teste comparativo (2026-11-19)

Mesma narração (39 s, Kokoro pm_santa @0.88), mesmo roteiro de cenas, mesma música (nenhuma ainda). Vídeos em `media/lab/bakeoff-2026-11/render/`, folhas de contato em `media/lab/bakeoff-2026-11/stills/`.

## Candidatos
| | Estilo | Motor | Imagens |
|---|---|---|---|
| **A** | Ilustração flat em camadas | Remotion | Flow (7 prompts × 2, 0 créditos) + mapas por código |
| **B** | Colagem documental | Remotion | 4 gravuras de domínio público (Commons) + mapas |
| **C** | Híbrido: ilustração + gravura como "prova" + mapas | Remotion | As de A e B |
| **A-HF** | O mesmo visual de A | HyperFrames | As de A; **os 2 mapas entram como clipes do Remotion** |

## Medições objetivas
| | Render | Pico de RAM | Volume final | Trechos parados > 2 s | Movimento médio¹ | Iterações |
|---|---|---|---|---|---|---|
| A | 36 s | 1,1 GB | −14,5 LUFS | 0 | 14,1 | 1 |
| B | 48 s | 1,1 GB | −14,5 LUFS | 0 (após correção) | 11,1 | 2 |
| C | ~40 s | ~1,1 GB | −14,5 LUFS | 0 | 12,7 | 1 |
| A-HF | 32 s² | 0,85 GB | −14,5 LUFS | 0 (após correção) | 14,3 | 3 |

¹ Diferença média de luminância entre quadros (0–255), a 2 quadros/s. É um indicador, não uma nota. ² O HyperFrames usou o Chrome do sistema em modo de captura por imagem, mais lento que o modo otimizado (que exige o `chrome-headless-shell`, ainda não instalado).

Projeção de render para 75 min (a partir do ritmo do A): cerca de 1h10 no Remotion. **Não medida** para o HyperFrames.

## Motor: Remotion vs HyperFrames
| Critério | Remotion | HyperFrames |
|---|---|---|
| Erros até ficar correto | 0 no A; 2 correções no B (feitas por mim, não do motor) | 2 problemas de contrato apontados pelo `check` (camadas de quadro inteiro; texto encoberto). **Um aviso (`text_occluded` no carimbo) continuou aparecendo no último check**, embora o render tenha saído correto |
| Mapas | d3-geo dentro do próprio motor, com câmera e rota animada | Sem equivalente pronto; usei clipes pré-renderizados |
| Reuso de componentes | Componentes React parametrizados | HTML gerado por script; menos natural para reutilizar |
| Licença | Gratuita para você (até 3 pessoas) | Apache-2.0 |
| Cuidados | — | Telemetria vinculada à conta (desliguei); o `doctor` sugere instalar MusicGen (**não comercial, proibido**); a skill pede um "beacon" de uso (não rodei) |
| Tamanho do arquivo | 19–34 MB | 41 MB |

**Viés a declarar:** construí primeiro os componentes no Remotion (estilo B) e reaproveitei no A e no C. Isso favorece o Remotion. O HyperFrames foi feito depois, com a mesma carga de assets, e ainda assim funcionou: é uma alternativa viável, não uma opção ruim.

## Estilo: minha leitura (V8, a nota decisiva, é sua)
Rubrica `research/visual-reference-ampulheta.md`, nota 0–5, **avaliação preliminar minha sobre os quadros e as medições**; não substitui a sua.

| Critério | A | B | C |
|---|---|---|---|
| V1 Consistência de estilo | 5 | 4 | 4 |
| V2 Profundidade (camadas) | 4 | 3 | 4 |
| V3 Movimento contínuo | 5 | 4 | 4 |
| V5 Tipografia disciplinada | 4 | 4 | 4 |
| V6 Atmosfera | 4 | 3 | 4 |
| V7 Rótulos de lugar e data | 5 | 5 | 5 |
| **Pontos** | 27 | 23 | 25 |

(V4 ritmo de corte não se aplica a 39 s com dissolvidos; V8 depende de você.)

- **A** é o mais próximo da referência em linguagem, e o movimento é o mais constante. Maior risco: parecer com o Ampulheta (traço flat em camadas), mitigado pela paleta e pelos rótulos do Lacre.
- **B** é o mais diferente do Ampulheta e o mais "documento", mas o menos dinâmico. Depende de achar gravuras boas para cada tema, e nem todo tema tem.
- **C** mistura os dois. A gravura como "prova" dá identidade ao Lacre e custa pouco, porque só entra onde existe documento bom.

## Recomendação
**Estilo C como base do Lacre, com A como padrão e B só onde houver documento forte. Motor: Remotion**, com o HyperFrames como plano B.

Motivo em uma linha: C herda a consistência e o movimento de A e acrescenta a assinatura de "documento lacrado" do Lacre; o Remotion dá mapas e componentes reutilizáveis no mesmo lugar.

## Limites deste teste
- 39 s, **um único tema**. Não prova que o estilo se sustenta em 60 minutos, nem com temas sem imagem iconográfica (ex.: economia, ciência).
- Não medi o corpo longo do Ampulheta (só as aberturas).
- Sem música e sem efeitos sonoros.
- Personagens recortados do Flow têm um único pose; para 60 min será preciso variar poses ou usar cenas sem personagem.
- Avaliação visual minha é preliminar; a decisão é sua.
