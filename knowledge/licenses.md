# Licenças: o que pode e o que não pode (R13)

Antes de adotar qualquer modelo, ferramenta ou banco de assets, confira a licença **dos pesos/arquivos**, não só do código. Registre a decisão aqui.

## Aprovados (uso comercial OK — verificar a versão ao instalar)
| Item | Uso | Licença | Observação |
|---|---|---|---|
| Kokoro (82M) | TTS PT-BR/EN | Apache-2.0 | Leve, roda na GPU de 6 GB ou na CPU |
| Chatterbox / Chatterbox Multilingual (Resemble AI) | TTS com clonagem de voz | MIT | Clonar **só a voz do próprio usuário**, com o consentimento dele registrado |
| Piper | TTS leve | MIT (código); vozes variam | Checar a licença de cada voz |
| faster-whisper / Whisper | Transcrição e legendas | MIT | — |
| FFmpeg | Montagem | LGPL/GPL | Uso como ferramenta é ok |
| MoviePy | Montagem Python | MIT | — |
| Motion Canvas | Motion graphics por código | MIT | — |
| Manim (Community) | Animações matemáticas e diagramas | MIT | — |
| Remotion | Vídeo por React | Licença própria | Grátis para indivíduos e empresas de até 3 pessoas: o usuário se enquadra. Rever se a operação crescer |
| HyperFrames | Vídeo por HTML/CSS (composições renderizadas) | Open source (confirmar o tipo de licença na instalação) | Candidato a motor de composição; registrar a versão e a licença ao adotar |
| Pexels / Pixabay | Fotos e vídeos stock | Licenças próprias, uso comercial livre | Sem revenda do asset puro; evitar pessoas identificáveis em contexto sensível |
| Biblioteca de áudio do YouTube | Música e SFX | Uso no YouTube | Algumas faixas exigem atribuição na descrição |
| Freesound (filtro CC0) | SFX | CC0 | Filtrar só CC0 para evitar atribuições/NC |
| Google Flow (plano do usuário) | Imagens e vídeos IA | Termos Google | Verificar os termos de uso comercial do plano e as marcas d'água (SynthID) |

### Adicionados pela pesquisa de motion (research/motion-market-2026-11-19.md)
| Item | Uso | Licença | Observação |
|---|---|---|---|
| HyperFrames (HeyGen) | Vídeo por HTML/CSS/GSAP | **Apache-2.0** (verificado no GitHub) | Tem plugin e skills oficiais para Claude Code |
| GSAP | Animação web | Gratuita, inclusive para uso comercial, mas **não open source** (termos da Webflow, revogáveis) | Aceitável; preferir APIs nativas do motor quando der |
| MapLibre GL | Mapas com câmera 3D | BSD-3 | Usar no lugar do Mapbox v2+, que é proprietário |
| d3-geo | Mapas editoriais | ISC | Padrão para o visual dos mapas |
| Natural Earth | Base cartográfica | Domínio público | — |
| geoBoundaries | Fronteiras atuais | CC BY 4.0 | **Exige crédito** na descrição ou no vídeo |
| Depth Anything V2 **Small** | Profundidade para parallax de fotos | Apache-2.0 | Base, Large e Giant são **CC-BY-NC: proibidos** |
| Real-ESRGAN | Upscale/restauração | BSD-3 | — |
| DeOldify | Colorização | MIT | Projeto arquivado |
| Library of Congress ("Free to Use") e Wikimedia Commons | Fotos de arquivo | Por item | Registrar a licença de **cada** arquivo em sources.md |

## Restritos (usar só com análise caso a caso)
| Item | Motivo |
|---|---|
| historical-basemaps (fronteiras históricas) | GPL-3.0, e o próprio autor diz que a precisão é limitada. Preferir redesenhar as fronteiras em GeoJSON próprio, com fonte histórica |
| DepthFlow | AGPL-3.0. Preferir um shader de parallax próprio |
| CodeFormer | Licença S-Lab, provavelmente restritiva. Evitar |
| Theatre.js studio | AGPL; desenvolvimento pausado |
| Remotion acima de 3 pessoas | Passa a exigir Company License paga |

## Proibidos
| Item | Motivo |
|---|---|
| XTTS-v2 / Coqui TTS models | Coqui Public Model License: não comercial |
| F5-TTS (pesos oficiais) | CC-BY-NC |
| MusicGen / AudioCraft (pesos) | CC-BY-NC |
| Freesound com licença NC | Não comercial |
| Qualquer asset sem licença clara | Risco de Content ID e strike |
