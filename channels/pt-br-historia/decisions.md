# Decisões
| Data | Decisão | Opções consideradas | Evidência | Quem decidiu | Resultado posterior |
|---|---|---|---|---|---|
| 2026-11-19 | Nicho do canal PT-BR: **História documental do Brasil** (séries: Tragédias brasileiras · Fortunas que sumiram · O Brasil que não te contaram) | História documental BR (6 breakouts) · Psicologia do cotidiano · IA e tecnologia por dentro | research/niche-pt-br-2026-11-19.md (v2): 6 canais pequenos distintos com breakout ≥10× e ≥100 mil views em 12 meses | Usuário ("História documental BR", no chat) | — |
| 2026-11-19 | Pasta provisória `channels/pt-br-historia/` (independe do nome final da marca) | — | — | IA (padrão) | — |
| 2026-11-19 | Nome do canal: **Lacre** (@lacre, livre em 19/11/2026; confirmar na criação) | 17 opções (Lacre, Âmbar, Fresta, Ampulheta, Rastro…) | Nome pesa pouco nas views (o líder se chama "Um Documentário"); marca curta universal + frase descritiva; mesmo arquétipo do canal-modelo Ampulheta, sem imitar (evitar nomes de relógio/tempo) | Usuário (escolheu Lacre) | — |
| 2026-11-19 | Posicionamento: **Mundo + Brasil**. Grandes temas mundiais contados por completo + pilar de histórias brasileiras. Substitui o Brasil-primeiro | Mundo + Brasil · Brasil-primeiro | @ampulheta_ac: 32 mil inscritos e 1,53 mi de views em 1 mês com temas mundiais amplos (mediana ~256 mil); 12 breakouts de temas BR no backlog | Usuário ("Mundo + Brasil") | — |
| 2026-11-19 | Estilos visuais: **não escolher um só agora**. Manter A, D e B como candidatos e **alternar por vídeo como experimento (E1)**, comparando retenção e atenção com análise de insights e vieses. Combinar estilos dentro de um vídeo só quando o roteiro pedir | A · D · B · combinar · rodízio | O usuário gostou dos três; as medições do teste (39 s, 1 tema) não distinguem estilos | Usuário | Experimento E1 em `experiments.md` |
| 2026-11-19 | Critério permanente de qualidade: som e efeitos com motivo narrativo, orçamento e validação (R16) | — | Feedback do usuário na rodada 2: excesso e descasamento prejudicam entendimento e atenção | Usuário | `rubrics/sound-fx.md`, `fx_check.py` |
| 2026-11-19 | Primeiro vídeo: **trocar o Napoleão** por tema com breakout. A estrutura segue o **modelo identificado** nas referências (forma), com **conteúdo, ângulo, roteiro e narração originais** | Napoleão (adiado) · cidades submersas (I01) · Matarazzo (I04) · 1967 (I02) | Napoleão sem breakout; I01 com 2 breakouts verificados por yt-dlp (Brasil de Outrora, 2.030 inscritos: 211 mil e 129 mil views) | Usuário ("trocar vídeo"; "buscar referências, modelagem e adaptação... sem desviar tanto da modelagem identificada") | — |
| 2026-11-19 | Identidade visual: família **Selo L** (selo de cera real do Flow, recortado, com "L" ornamentado e fita; nome em serifa em código). Selo desenhado em código descartado | Mundo · Selo L · Bússola e L (todas com selo real); famílias em código | Usuário: "Escolho a família Selo L". O selo em código foi rejeitado por parecer "uma borra, uma mancha" | Usuário | Arquivos finais em `media/pt-br-historia/brand/final/`; o canal ainda não foi criado |

## 2026-11-20: marcação de conteúdo sintético (R14) para as imagens do Flow do piloto S04
- **Critério (knowledge/policies-ai.md):** ilustração estilizada, claramente não realista, sem pessoa real identificável e sem lugar real retratado de forma falsa.
- **Decisão:** não marcar "altered or synthetic content" para as 4 imagens do S04, depois de remover a imagem com o mausoléu (anacronismo). Reavaliar a cada nova leva de imagens: se alguma ficar realista, ou mostrar pessoa/lugar real de forma enganosa, marcar.
- **Pendente:** conferir os termos de uso comercial do plano Plus do Flow (R13) antes de publicar qualquer vídeo com essas imagens.

## 2026-11-20: padrão visual do vídeo inteiro (usuário)
- **Decisão do usuário:** "Aprovado, produza o vídeo completo, todo o vídeo seguindo essa abordagem e aplicando esse padrão" (piloto S05: fundo do Flow + recortes animados no tempo da fala).
- **Aplicação:** R18 em CLAUDE.md; `protocols/scene-production.md`; V9/V10 e loop de revisão em `rubrics/visual.md`; produção em 10 lotes com revisor independente por lote.

## 2026-11-20: maestro + executores grátis (usuário)
- **Problema:** produtor + revisor Opus consumiram ~740 mil tokens num lote e estouraram o limite de 5 h.
- **Decisão do usuário:** Claude só como cérebro/orquestrador; execução no OpenCode (modelos grátis, escolhidos por teste comparativo) e Gemini CLI (chave grátis do AI Studio, gemini-3.5-flash).
- **Achados:** Gemini CLI com login grátis da conta Google foi descontinuado ("migrar para Antigravity"), e gemini-3.1-pro tem cota 0 no free tier; GLM-5.3-Flash Free indisponível em 2026-11-20; flow-mcp funciona no Linux (1 imagem a 0 crédito).
- **Pendente:** vencedor do teste comparativo (MiMo-V2.6-Flash, DeepSeek-V4.1-Flash, Big Pickle) na tarefa bake-s03.

## 2026-11-20: calibração dos revisores grátis (gabarito = defeitos do revisor Opus no qa-lote-01)
- **Todos os 6 reprovaram as 3 cenas ruins**, mas nenhum achou todos os defeitos do gabarito. O placar de acerto dos 6 defeitos-chave ficou assim:
  - MiMo-V2.6-Flash: 5;
  - Hy4-Flash: 4;
  - LongCat-2.5: 4;
  - DeepSeek-V4.1-Flash: 3;
  - Gemini 3.5 Flash: 2;
  - Nemotron-VL: 2 (JSON inválido em 2 de 3).
- **Falhas comuns:**
  - ninguém pegou com clareza o cabo do guindaste;
  - há falsos positivos (quadro preto da transição; "explosão ausente" por amostrar 0,05 s antes).
- **Decisão:** revisão em painel de 2 modelos (MiMo + Hy4 ou LongCat), juntando os defeitos. Os defeitos de prioridade alta são conferidos pelo maestro na folha de contato antes de virar correção. O `review.sh` passou a evitar quadros de transição.
- **Limite:** o revisor grátis faz triagem; a nota final continua com o maestro (R6/R18).

## 2026-11-20: resultado do teste de executores (bake-s03) e OpenCode v2
- **MiMo-V2.6-Flash (26 min):** bandeira contínua sem emendas, presa ao mastro; CH-53 em oliva; validadores PASS. É o **vencedor** em qualidade. O maestro conferiu o recorte ampliado da bandeira. A versão dele foi adotada na produção (motor + S03).
- **Big Pickle (6 min):** validadores PASS, CH-53 oliva, mas a bandeira ficou quase sem ondulação. Fica como **reserva** para tarefa simples.
- **DeepSeek-V4.1-Flash:** o teste foi invalidado por erro do maestro (editou `run.sh` durante o job).
- **OpenCode:**
  - trocado do pacote antigo `opencode-ai` 1.19.6 para `@opencode/cli` 2.3.2, que exige `run --auto`;
  - o MCP `flow` segue conectado.
- **Limite dos modelos grátis:** no mesmo dia, MiMo e DeepSeek bateram "Free usage limit reached", e o GLM-5.3-Flash continua indisponível. Ainda estão abertos Big Pickle, Hy4 e LongCat.
- **Conclusão:** modelo grátis não garante continuidade. O fluxo precisa de um provedor barato e estável (chave da API DeepSeek, via `dsh` ou como provedor do OpenCode). Depende do usuário.

## 2026-11-20 — Limpeza do repositório (OK do usuário: "Sim, limpar")
- Para a lixeira (recuperável): `.tmp_spec/` (151 MB), 26 quadros de depuração e prévias antigas em `media/pt-br-historia/vietna/render/`, pastas `teste-agent*`/`teste-grid` do `~/flow-mcp-out`.
- `pipeline/assembly/vietna_spec_*.py` (só deste vídeo) movidos para `videos/2026-11-19-guerra-do-vietna/_work/specgen/`. Regra: código de um vídeo só fica na pasta do vídeo; `pipeline/` é para o que serve a qualquer vídeo.
- Mantidos: `media/lab/bakeoff-2026-11` (citado em `rubrics/visual.md`), `lab/bakeoff-saigon` (testes em curso), `_work` do vídeo.

## 2026-11-20 — Estilo da produção: colagem do repositório (decisão do usuário)
- **Contexto:** lab Saigon, 3 rodadas, 9 estilos (`lab/bakeoff-saigon/out/comparativo_saigon_r3.mp4`).
- **Decisão:** o Vietnã termina na colagem da produção, com todo o protocolo (`protocols/scene-production.md`, gates, revisão com nota). Motivo do usuário: a colagem da produção saiu melhor que a do lab justamente pelo protocolo e pelo fluxo, e trocar de estilo agora perderia a produção em curso.
- **Para depois:** Ink and Toon (3) e Low-Poly (5) acertaram de primeira; ficam como candidatos para outros temas/canais. Nada do lab entra na produção sem nova decisão.
