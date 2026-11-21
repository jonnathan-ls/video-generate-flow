# Pesquisa de mercado: motion graphics programático com IA, nível profissional (2026-11-19)

Pergunta: como criadores e estúdios estão chegando a qualidade profissional em vídeo feito por código, com Claude escrevendo o código, para documentários longos de história (mapas, linhas do tempo, fotos de arquivo, títulos, infográficos).

Método: cerca de 45 buscas e fetches em docs oficiais, GitHub e blogs de criadores. Onde não deu para confirmar algo, o texto diz **"não verificado"**. Estimativas próprias estão marcadas como **[estimativa]**. Nada aqui é aconselhamento jurídico sobre licenças.

---

## 1. Resumo executivo (≤12 linhas)

1. **Motor principal: Remotion** (React → headless Chrome → FFmpeg). Hoje é o ecossistema mais maduro para "Claude escreve o vídeo": tem skills oficiais de agente, incluindo `/remotion-maps` com MapLibre e Turf, além de render em chunks com `combineChunks()` e encode NVENC no Linux. A licença é gratuita para indivíduo ou empresa com até 3 pessoas ([license](https://remotion.dev/license), [FAQ](https://www.remotion.dev/docs/license/faq)).
2. **Plano B / complemento: HyperFrames (HeyGen)**, Apache-2.0, HTML+CSS+GSAP, com skills e plugin para Claude Code ([GitHub](https://github.com/heygen-com/hyperframes)). Passa a ser o principal se o canal virar empresa com mais de 3 pessoas ou se a licença do Remotion virar problema. Existe uma skill `remotion-to-hyperframes` que reduz o custo de migrar.
3. **O que tira a IA do "amador"** não é o motor, é a disciplina. Os pontos que funcionam: um design system escrito em CLAUDE.md (cores, escala tipográfica, springs, durações); uma biblioteca de componentes parametrizados por props/JSON; áudio primeiro e animação sincronizada depois; e revisão por stills/frames antes do render final ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics), [claudecodeformarketers](https://claudecodeformarketers.com/blog/motion-graphics-with-hyperframes/)).
4. **Mapas:** MapLibre GL (BSD-3) dentro do Remotion ou d3-geo em SVG/Canvas, alimentados por Natural Earth (domínio público), geoBoundaries (CC BY 4.0, exige crédito) e historical-basemaps (GPL-3.0, precisão limitada).
5. **Fotos de arquivo:** parallax 2.5D com Depth Anything V2 **Small** (Apache-2.0; os modelos maiores são NC) e um shader próprio em three.js, ou DepthFlow (AGPL-3.0). As fotos são pré-renderizadas como clipes e entram no Remotion como vídeo.
6. **Desempenho:** 50–75 min em 1080p30 dá 90k–135k frames. É viável na RTX 3060 com 15 GB de RAM se o vídeo for renderizado **por cena/capítulo**, com concorrência moderada (4–6), WebGL só nas cenas de mapa (`--gl=angle-egl`, concorrência 1), cache das cenas que não mudaram e concat com FFmpeg ou `combineChunks`. Ordem de grandeza **[estimativa]**: algumas horas por episódio, rodando à noite.

---

## 2. Tabela comparativa de motores

| Motor | Faz bem | Licença (verificada?) | Renderização | Maturidade | Uso com Claude/LLMs |
|---|---|---|---|---|---|
| **Remotion** | Vídeo como componentes React; dados→vídeo; legendas; mapas (MapLibre); áudio; Studio com timeline | Source-available. Grátis para indivíduos, empresas com fins lucrativos de até 3 funcionários e ONGs; acima disso, Company License. "Creators" a US$25/mês por seat; a contagem é do headcount total da empresa ([license](https://remotion.dev/license), [FAQ](https://www.remotion.dev/docs/license/faq), [pricing](https://remotion.dev/pricing)). Verificado via snippets oficiais | Headless Chromium, um screenshot por frame, depois FFmpeg. `--concurrency` ajustável, `npx remotion benchmark` ([performance](https://www.remotion.dev/docs/performance)). GPU via `--gl` (`angle-egl` sugerido no Linux) ([gl-options](https://www.remotion.dev/docs/gl-options)). NVENC H.264/H.265 no Linux a partir da v4.0.484 ([hardware-acceleration](https://www.remotion.dev/docs/hardware-acceleration)). Render em chunks com `combineChunks()` ([distributed-rendering](https://www.remotion.dev/docs/distributed-rendering)) | Alta (v4, Lambda, Cloud Run) | **Skills oficiais**: `npx skills add remotion-dev/skills` / `npx remotion skills add` (best-practices, create, markup, studio, render, **maps**, captions etc.) ([docs/ai/skills](https://www.remotion.dev/docs/ai/skills)). Vários relatos de criadores ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics), [digg: filme de 3 min "todo em código" com Claude+Remotion](https://digg.com/ai/w8kapzh5)) |
| **HyperFrames (HeyGen)** | HTML/CSS/GSAP→MP4, sem build step; bom para títulos, cards, social | **Apache-2.0** ([GitHub](https://github.com/heygen-com/hyperframes)). Verificado | Headless Chrome (Puppeteer) que busca cada frame, mais FFmpeg; determinístico; Node 22+ ([GitHub](https://github.com/heygen-com/hyperframes)). `--workers` 1–8, 4 costuma ser o ideal; `--gpu` para encoder em GPU; presets draft/looks (CRF 16)/high ([rendering](https://hyperframes.heygen.com/guides/rendering)) | Jovem (2026), mas muito ativo (~86k stars no fetch) | **Plugin e skills oficiais para Claude Code**: `claude plugin marketplace add heygen-com/hyperframes`; skills `hyperframes`, `style-sampling`, `reverse-any-video`, `remotion-to-hyperframes`, `media-use` etc. ([GitHub](https://github.com/heygen-com/hyperframes), [skills dir](https://github.com/heygen-com/hyperframes/tree/main/skills)) |
| **Motion Canvas** | Animação imperativa (generators) em Canvas; explicações técnicas | MIT ([GitHub](https://github.com/motion-canvas/motion-canvas)). Houve uma discussão sobre mudar para GPL ([#1015](https://github.com/orgs/motion-canvas/discussions/1015)); o repo ainda mostra MIT | Render pelo editor/UI. Segundo o README do Revideo, não tem render headless nativo ([Revideo](https://github.com/redotvideo/revideo)); a fonte é concorrente, então não verificado de forma independente | Média; atividade recente não verificada | Sem skill oficial encontrada |
| **Revideo** | Fork do Motion Canvas com `renderVideo()` headless, áudio/vídeo, Player React | MIT ([GitHub](https://github.com/redotvideo/revideo)) | Headless browser; render dividido entre workers | Média/baixa; mantido sob a org "midrender", data do último commit não verificada | O README diz que "Claude ou Codex" geram cenas; sem skill oficial verificada |
| **Manim (Community)** | Matemática/diagramas vetoriais, LaTeX | MIT ([fonte](https://nibble-app.com/blog/manim), não verificado no LICENSE) | Cairo (CPU, lento) ou OpenGL (GPU, mais rápido) ([fonte](https://codevideorenderer.readthedocs.io/en/latest/_sources/faq.rst.txt)). Sem benchmark confiável para vídeos longos | Alta no nicho de matemática | LLMs geram Manim com frequência; fraco para foto, mapa e tipografia editorial |
| **Canvas 2D puro / SVG** | Controle total, zero dependência | — (código próprio) | Precisa de um harness próprio (Puppeteer + FFmpeg) ou rodar dentro do Remotion/HyperFrames | — | Reinventa o que Remotion/HyperFrames já resolvem. Melhor usar Canvas dentro deles |
| **three.js / React Three Fiber** | 3D, câmera 2.5D, shaders (parallax de foto, globo) | MIT (conhecido; LICENSE não buscado nesta pesquisa) | WebGL, precisa de GPU. No Remotion: `@remotion/three` + `--gl=angle`/`angle-egl` ([gpu](https://www.remotion.dev/docs/gpu), [gl-options](https://www.remotion.dev/docs/gl-options)) | Alta | Funciona bem como camada dentro do Remotion |
| **GSAP** | Timelines e easing de altíssima qualidade; SplitText, MorphSVG | "Standard No Charge License" da Webflow. Grátis inclusive para uso comercial, **não é open source**; proíbe ferramentas visuais no-code que concorram com a Webflow; código gerado por IA não é uso proibido ([standard-license](https://gsap.com/standard-license)) | Engine de tempo; no HyperFrames é o padrão | Muito alta | As skills do HyperFrames ensinam GSAP |
| **Theatre.js** | Editor visual de keyframes para three.js/DOM | `@theatre/core` Apache-2.0; `@theatre/studio` **AGPL-3.0**; desenvolvimento público pausado ("temporarily moved to a private repo") ([GitHub](https://github.com/theatre-js/theatre)) | — | **Risco**: projeto parado | Não recomendado |
| **Lottie / Rive** | Animações vetoriais desenhadas em ferramenta (AE/Rive) e tocadas em runtime | Runtimes Rive: MIT ([Rive docs](https://help.rive.app/runtimes/overview)). lottie-web: MIT, **não verificado nesta pesquisa**. O editor Rive é comercial | Embutíveis no Remotion (`@remotion/lottie`) | Alta | Útil para ícones e elementos prontos; LLMs não "desenham" bem em Lottie JSON |
| **After Effects + scripting** | Padrão da indústria (GEOlayers, Plexus, plugins) | Adobe, proprietário/assinatura. Automação via ExtendScript/`aerender`/nexrender: licença do nexrender **não verificada** | CPU/GPU local, lento para automação em massa | Máxima | Claude escreve ExtendScript, mas o loop de iteração é pior (sem diff/preview web) |
| **FFmpeg (filtros)** | Concat, zoompan (Ken Burns simples), grão, LUTs, mix de áudio, encode final NVENC | LGPL/GPL conforme o build (não verificado aqui) | CPU/GPU, muito rápido | Máxima | Ótimo como "cola" final; ruim como motor de motion design |

---

## 3. Receita profissional: práticas objetivas

### 3.1 Processo com Claude (o que os workflows que deram certo fazem)
1. **Instalar as skills oficiais** (Remotion ou HyperFrames). Sem elas, o agente inventa APIs e erra convenções de timing ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics)).
2. **Design system escrito no CLAUDE.md**: paleta (hex), escala tipográfica, fontes, damping/stiffness padrão dos springs, durações padrão e margens/grid. Agentes "executam bem gosto articulado e inventam mal gosto de motion" ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics)). O HyperFrames tem o conceito `frame.md` (spec de design invertida para o frame) e uma skill `style-sampling` ([autoae](https://autoae.online/blog/claude-motion-graphics-skills), [skills](https://github.com/heygen-com/hyperframes/tree/main/skills)).
3. **Biblioteca de componentes parametrizados** (TitleCard, MapScene, TimelineScene, PhotoParallax, QuoteCard, LowerThird, DataBar), cada um recebendo props/JSON. Um episódio novo vira "dados novos", não animação nova. Comece com **um** template reutilizável antes de generalizar ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics)).
4. **Referência visual concreta no brief**: screenshots de referência, mood, trilha e palavras-chave. Isso deu "80–90%" já na primeira tentativa ([claudecodeformarketers](https://claudecodeformarketers.com/blog/motion-graphics-with-hyperframes/)).
5. **Áudio primeiro**: narração gravada/TTS antes, com cenas temporizadas pela duração medida. Fazer o visual antes obriga a esticar tudo depois ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics)).
6. **Planejar onde entram os gráficos no roteiro antes de escrever código** ([claudecodeformarketers](https://claudecodeformarketers.com/blog/motion-graphics-with-hyperframes/)).
7. **Revisão por frames**: `remotion still` / preview em pontos-chave (início, pico e fim de cada animação) e Claude lendo os PNGs. Correções pedidas em linguagem de motion ("barra cresce em ~1,2 s com ease-out"), não em pixels. Espere correção em mais ou menos 1 de cada 5 prompts: timing apressado, texto colidindo e fonte ilegível ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics)). Observação: os relatos não detalham um loop automatizado de screenshots; é prática recomendada aqui, **não verificada** como padrão de mercado.
8. **Gate de aprovação por bloco**: o criador do documentário de 17 min relata ter construído primeiro um "kit" reutilizável e depois animado nível por nível, com render aprovado antes de seguir ([search snippet / skool](https://www.skool.com/cliefnotes/recent-project-using-opus-55-gpt-61?p=b541d0e6); post truncado, detalhes **não verificados**).
9. **Git para tudo** (composições + props), para re-renderizar qualquer versão ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics)).
10. **Skills de "gosto"** como complemento: Claude Motion Studio (decisões de motion design) e a skill `motion-design` da LottieFiles (princípios Disney, "regra de 1/3", padrões de stagger) ([autoae](https://autoae.online/blog/claude-motion-graphics-skills), [skills.sh](https://skills.sh/LottieFiles/motion-design-skill/motion-design)). Conteúdo detalhado da skill da LottieFiles **não verificado** (404 no SKILL.md).

### 3.2 Técnica de motion (amador × profissional)
| Amador | Profissional | Fonte |
|---|---|---|
| Easing linear ou `ease` genérico | Curvas definidas como tokens: entrada desacelerando, saída acelerando, "standard" para movimento contínuo. Ex. IBM Carbon expressive: entrada `cubic-bezier(0,0,0.3,1)`, standard `cubic-bezier(0.4,0.14,0.3,1)`, saída `cubic-bezier(0.4,0.14,1,1)` | [Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) |
| Tudo com a mesma duração | Duração proporcional à distância/escala; tokens de 70 ms a 700 ms em UI. Em vídeo, títulos costumam ficar em 0,4–1,2 s **[estimativa]** | [Carbon](https://carbondesignsystem.com/elements/motion/overview/) |
| Tudo entra ao mesmo tempo | **Stagger** que conduz o olho; excesso de stagger deixa lento | [animation-craft](https://cdn.jsdelivr.net/npm/@memi-design/cli@2.6.2/notes/animation-craft/animation-craft.md), [Marvel/Disney](https://blog.marvelapp.com/disneys-motion-principles-in-designing-interface-animations/) |
| Bounce exagerado | **Overshoot sutil + settle** (spring com damping alto); antecipação de 2–4 frames | [animation-craft](https://cdn.jsdelivr.net/npm/@memi-design/cli@2.6.2/notes/animation-craft/animation-craft.md), [skills.lc](https://www.skills.lc/dylantarre/animation-principles/dylantarre-animation-principles-skills-01-by-domain-video-motion-graphics-skill-md) |
| Movimento "porque sim" | Movimento com propósito, discreto; reservar o expressivo para momentos importantes | [Carbon](https://carbondesignsystem.com/elements/motion/overview/) |
| Fontes aleatórias | Hierarquia tipográfica fixa (2 famílias no máximo, escala modular), grid de margens seguras | prática de design, **sem fonte específica nesta pesquisa** |
| Plano chapado | Profundidade: parallax de camadas, câmera 2.5D, sombras suaves, vinheta, **grão/textura** | parallax: [DepthFlow](https://github.com/BrokenSource/DepthFlow); grão/textura: **sem fonte específica** |
| Objetos rápidos "pulando" | **Motion blur** real (`<HtmlInCanvasMotionBlur>` no Remotion; `<CameraMotionBlur>`/`<Trail>` são legados) | [Remotion motion-blur](https://www.remotion.dev/docs/motion-blur) |
| Cortes no meio da frase / fora do ritmo | Cortes e entradas sincronizados com a narração/beat; transições motivadas (o mapa dá zoom no lugar citado, a foto entra pela borda do mapa) | áudio primeiro: [mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics); restante é prática de edição, **sem fonte específica** |
| Princípios ignorados | 12 princípios da Disney adaptados: slow in/out, arcs, follow-through, staging | [Marvel/Disney](https://blog.marvelapp.com/disneys-motion-principles-in-designing-interface-animations/), [UI wiki](https://mintlify.com/raphaelsalaja/userinterface-wiki/animation/12-principles-of-animation) |

---

## 4. Mapas animados: stack recomendada

**Como os canais fazem:** o padrão da indústria é After Effects + **GEOlayers**. Segundo a aescripts, o RealLifeLore faz "todas" as animações de mapa com GEOlayers ([aescripts](https://aescripts.com/learn/learn-how-to-animate-maps-for-youtube-using-after-effects/)), uma fonte secundária. Existem tutoriais de mapas históricos em GEOlayers que importam os dados do repo historical-basemaps ([aescripts historical](https://aescripts.com/learn/how-to-create-historical-maps-in-after-effects-using-geolayers)). O processo do Kings and Generals ficou **não verificado**.

**Replicando por código (recomendado):**
- **Renderização:**
  - (a) **MapLibre GL JS** (BSD-3, fork do Mapbox GL v1.13) ([geoapify](https://geoapify.com/mapbox-gl-new-license-and-6-free-alternatives)) dentro do Remotion, seguindo o guia oficial: `useDelayRender`, `interactive:false`, `fadeDuration:0`, câmera calculada por frame com `jumpTo` + espera de `idle`, Turf para rotas, `--gl=angle` e `--concurrency=1` ([Remotion maps](https://www.remotion.dev/docs/maps)). Existe a skill `/remotion-maps` ([skills](https://www.remotion.dev/docs/ai/skills)).
  - (b) Para o look "editorial/papel" (estilo Ampulheta/Kings and Generals), **d3-geo** (ISC, via notice do Mapbox, [gist](https://gist.github.com/stepankuzmin/be7cd3688840b3cdffc930cb1711d94a)) gerando SVG/Canvas. É determinístico, não precisa de tiles nem de GPU, e é mais leve para renderizar em paralelo. **Recomendação: d3-geo como padrão e MapLibre só para voos de câmera com relevo/satélite.**
- **Evitar Mapbox GL JS v2+** em pipeline offline: é proprietário e exige conta e ToS da Mapbox ([wptavern](https://wptavern.com/mapbox-gl-js-is-no-longer-open-source)).
- **Dados:**
  - **Natural Earth**: domínio público, crédito opcional ([termos](https://www.naturalearthdata.com/about/terms-of-use/)). Base física (costas, rios, relevo) e fronteiras atuais.
  - **geoBoundaries**: CC BY 4.0, **exige crédito** "geoBoundaries" + URL nos créditos do vídeo ([geoboundaries.org](https://www.geoboundaries.org/)). Divisões administrativas detalhadas (ex.: estados e municípios do Brasil).
  - **historical-basemaps (aourednik)**: **GPL-3.0**, GeoJSON WGS84 por ano (ex.: 1492, 1880, 1938), campo `BORDERPRECISION` 1–3. O autor avisa que é trabalho em andamento, que deve ser verificado contra outras fontes, que serve para escala mundo/continente e que costas e rios mudam ao longo do tempo ([GitHub](https://github.com/aourednik/historical-basemaps)). **Risco:** como a GPL se aplica a um vídeo derivado de dados GPL **não verificado**. Alternativa segura: usar o dataset como referência e redesenhar as fronteiras do episódio em GeoJSON próprio, citando as fontes historiográficas.
  - Fontes de mapas históricos raster: Wikimedia Commons, com licença verificada por arquivo (ver §5).
- **Receita visual:** base com relevo dessaturado + textura de papel; fronteiras animadas por `stroke-dashoffset`; preenchimento por território com crossfade entre anos; setas de campanha com Turf/curvas Bézier e cabeça de seta; rótulos com hierarquia (capital > cidade > região); câmera com ease-in-out e zoom motivado pela narração. **[recomendação própria]**

---

## 5. Fotos de arquivo: stack recomendada

- **Profundidade:**
  - **Depth Anything V2 Small**: **Apache-2.0**. Base, Large e Giant são **CC-BY-NC-4.0**, então não servem para canal monetizado ([GitHub](https://github.com/DepthAnything/Depth-Anything-V2)).
  - Depth Anything 3: código Apache-2.0, mas as licenças dos pesos são **conflitantes entre fontes** (Giant/Nested NC; Mono-Large disputado) → **não verificado**, conferir o model card oficial ([busca DA3](https://huggingface.co/SpatialHub/depth-anything-3-onnx)).
  - Video Depth Anything: licença não verificada.
- **Parallax 2.5D:**
  - **DepthFlow**: AGPL-3.0; shader GLSL de raymarching, "até 8k50fps em RTX 3060-class", com FFmpeg piping. O autor incentiva uso comercial ([GitHub](https://github.com/BrokenSource/DepthFlow)). Usar como ferramenta local para gerar MP4 é o caso comum. Os efeitos da AGPL sobre o vídeo gerado **não verificados** (normalmente a AGPL mira código modificado e servido em rede).
  - Alternativa: shader próprio em three.js dentro do Remotion (desloca UV pelo depth map; ex. [freefrontend](https://freefrontend.com/code/halloween-2-5d-parallax-shader-2026-05-07/)), ou corte manual de camadas (figura / fundo com inpainting) para fotos-chave.
  - Ken Burns simples: `zoompan` do FFmpeg ou `transform` no Remotion.
- **Restauração e colorização:**
  - **DeOldify**: MIT (código e pesos), mas **arquivado desde out/2024** ([GitHub](https://github.com/jantic/DeOldify)).
  - **Real-ESRGAN**: BSD-3 (upscale) ([license copy](https://huggingface.co/coding-alt/stable-diffusion-webui/blob/main/html/licenses.html)).
  - **CodeFormer** (rostos): NTU S-Lab License 1.0. Uso comercial provavelmente restrito, **termos não verificados** → evitar ([GitHub](https://github.com/sczhou/CodeFormer)).
  - Ética: rotular na tela "colorizado digitalmente" e não colorizar documentos usados como prova histórica **[recomendação editorial]**.
- **Fontes de domínio público:**
  - **Library of Congress, "Free to Use and Reuse"**: domínio público, sem copyright conhecido ou liberado. Mesmo assim, conferir o rights statement de cada item ([data.labs.loc.gov](https://data.labs.loc.gov/free-to-use/)).
  - **Wikimedia Commons**: licença por arquivo, sem garantia da WMF. CC BY/BY-SA exigem crédito; BY-SA tem ShareAlike para derivados; direitos de personalidade continuam valendo ([Commons reuse](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia)).
  - **Arquivo Nacional (BR)**: no Commons há um template "Arquivo Nacional PD license" com crédito "Domínio público / Acervo Arquivo Nacional" ([template](https://download.osmand.net/wiki/Template:Arquivo_Nacional_PD-license)). A política geral do SIAN **não verificada**; conferir item a item.
  - Brasiliana Fotográfica: diz que fotos antigas estão em domínio público pela Lei 9.610/98 (70 anos), mas cobra por alta resolução ou uso comercial em alguns casos (via [busca](https://tribunadonorte.com.br/?p=232698); **não verificado diretamente**).
- **Pipeline sugerido:** foto → upscale (Real-ESRGAN) → depth (DA-V2 Small) → parallax (DepthFlow ou shader) → clipe MP4 em cache → entra no Remotion como `<Video>` de `@remotion/media` (o `OffthreadVideo` não é otimizado, segundo a doc de [performance](https://www.remotion.dev/docs/performance)) → grão, vinheta e moldura por cima.

---

## 6. Desempenho e estratégia de render (RTX 3060 6GB, 20 threads, 15 GB RAM)

- **Volume:** 50–75 min × 30 fps = 90.000–135.000 frames (a 24 fps: 72k–108k).
- **Fatos verificados:**
  - Remotion e HyperFrames renderizam um screenshot de browser por frame, então o tempo cresce de forma linear com a duração ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics)).
  - O Remotion recomenda dividir renders longos em partes porque `angle` tem vazamento de memória ([gl-options](https://www.remotion.dev/docs/gl-options)).
  - Sombras, blur e gradientes CSS são caros sem GPU; a recomendação é pré-computar como imagem ([performance](https://www.remotion.dev/docs/performance)).
  - NVENC disponível ([hardware-acceleration](https://www.remotion.dev/docs/hardware-acceleration)).
  - No HyperFrames, 4 workers costuma ser o ideal ([rendering](https://hyperframes.heygen.com/guides/rendering)).
  - DepthFlow cita uma GPU classe RTX 3060 como referência ([GitHub](https://github.com/BrokenSource/DepthFlow)).
- **Benchmarks de vídeo de 1 h: não encontrados.** Rodar `npx remotion benchmark` nas nossas cenas ([benchmark](https://www.remotion.dev/docs/cli/benchmark)).
- **Estimativa [estimativa, não verificada]:** cenas DOM/SVG a ~10–30 fps agregados com concorrência 4–6 dão ~1,5–4 h para 75 min. Cenas WebGL (MapLibre/three) com concorrência 1 são bem mais lentas, por isso o peso delas deve ser limitado. A RAM (15 GB) é o gargalo provável: cada Chromium usa centenas de MB, então concorrência acima de ~6 tende a fazer swap.
- **Estratégia:**
  1. **Uma composição por cena/capítulo** (alvo de 30 s a 3 min), cada uma renderizada separadamente para `scenes/<hash>.mp4`. **Cache por hash** de (código do componente + props + assets): só re-renderiza o que mudou.
  2. **Fila local** (script Node) com 2 trilhas: CPU/DOM (concurrency 4–6, `--gl` padrão) e GPU/WebGL (concurrency 1, `--gl=angle-egl`). Pré-renderizar parallax de fotos (DepthFlow) e voos de mapa como clipes, para que o render final só faça composição.
  3. **Formato intermediário uniforme** (mesmo fps, resolução, pix_fmt e codec, ex. H.264 CRF baixo ou ProRes), assim o concat com FFmpeg sai sem re-encode (`-f concat -c copy`), ou usar `combineChunks()` com `h264-ts` e `forSeamlessAacConcatenation` ([distributed-rendering](https://www.remotion.dev/docs/distributed-rendering)).
  4. **Áudio separado**: mixar narração, trilha e efeitos no FFmpeg no final (o render de áudio já foi apontado como a parte lenta no Lambda, [faster-lambda](https://www.remotion.dev/blog/faster-lambda)).
  5. **Encode final NVENC** (h264_nvenc/hevc_nvenc), mais o grão aplicado uma vez só no master, se for via FFmpeg.
  6. **Previews em `--scale=0.5`** / preset draft e stills nos keyframes; render completo à noite.
- **Veredito:** viável em **Remotion** (ou HyperFrames) com essa arquitetura. **Manim e After Effects não são indicados** para esse volume com essa máquina e esse fluxo.

---

## 7. Riscos

1. **Licença do Remotion**: grátis só até 3 pessoas no total da empresa. Se o canal crescer, Company License ou migração para o HyperFrames (Apache-2.0). Os preços podem mudar ([license](https://remotion.dev/license)).
2. **GSAP** não é open source; os termos são da Webflow e revogáveis em caso de violação ([standard-license](https://gsap.com/standard-license)).
3. **Licenças de modelos**: Depth Anything V2 Base/Large/Giant, alguns DA3 e CodeFormer são não comerciais ou restritos; DeOldify está arquivado. Fixar versões e registrar a licença de cada peso.
4. **historical-basemaps (GPL-3.0)** e precisão histórica limitada: risco de erro factual e de licença. Validar contra atlas acadêmicos.
5. **Direitos de imagem**: "domínio público" varia por item e por país. CC BY-SA tem ShareAlike. Manter uma planilha de proveniência por asset e créditos na descrição/vídeo (geoBoundaries obrigatório).
6. **Homogeneidade e "cara de IA"**: sem design system e referências, a saída fica com look de template ([mejba](https://www.mejba.me/blog/claude-code-remotion-youtube-motion-graphics), [autoae](https://autoae.online/blog/claude-motion-graphics-skills)). Existe uma opinião publicada de que o tooling é confiável para 30 s mas não para documentários de 5 min (via [busca](https://aiproductivity.ai/news/claude-code-motion-graphics-jsx-youtube-workflow/); **não verificado**). Mitigar com componentes testados e revisão por frames.
7. **Bugs de render**: artefatos de blur intermitentes, resolvidos com `--workers 1` no HyperFrames ([claudecodeformarketers](https://claudecodeformarketers.com/blog/motion-graphics-with-hyperframes/)); vazamento de memória com `angle` ([gl-options](https://www.remotion.dev/docs/gl-options)); erros do Turf em segmentos de comprimento zero ([maps](https://www.remotion.dev/docs/maps)).
8. **Projetos parados**: Theatre.js (dev privado), DeOldify (arquivado); maturidade do Revideo e do Motion Canvas incerta.
9. **Hype e métricas infladas**: números virais (ex. "8,89M views") e contagens de stars variam entre fontes. As alegações de criadores são autorrelatos ([digg](https://digg.com/ai/w8kapzh5)).
