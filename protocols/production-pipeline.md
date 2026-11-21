# Fluxo completo de produção: da ideia ao agendamento

Mapa do que existe, do que falta e da ordem. Cada etapa produz um artefato, tem um validador (script, nunca opinião) e só avança pelo `status_gate.py`.
**Legenda:** ✅ pronto e testado · 🟡 prova de conceito (funciona em 40 s, falta escalar) · ⬜ falta.
**Testes não entram aqui:** tudo que é experimento fica em `lab/` (ver `lab/README.md`).

## Etapas de um vídeo
| # | Etapa | Status do vídeo | O que faz | Estado | Validador | Você |
|---|---|---|---|---|---|---|
| 1 | Radar e backlog | idea | Outliers, notas, ideias | ✅ | rubrica de ideia | — |
| 2 | Seleção | selected | Escolhe o vídeo | ✅ | `status_gate` | **aprova** |
| 3 | **Pesquisa do vídeo** | researched | Tendência do tema, referências estruturais (com heatmap), lacunas, dossiê de fontes | ✅ protocolo + gate; ⬜ ainda não rodada | `status_gate` (6 seções, ≥ 8 URLs) | — |
| 4 | Embalagem | packaged | 15 títulos + 3 thumbnails | 🟡 protocolo e `packaging_check`; falta compor thumbnails (`remotion still` 1280×720 com os componentes do Lacre) | `packaging_check --thumbs` | **escolhe** |
| 5 | **Estrutura e retenção** | structured | Beat sheet, abertura, plano de retenção, previsões de métrica, shorts | ✅ protocolo + rubrica + gate; ⬜ ainda não rodada | rubrica `structure-retention` + `status_gate` | — |
| 6 | Roteiro | scripted | Roteiro com cenas marcadas, seguindo o beat sheet, + fontes | ✅ protocolo; ⬜ não rodado em vídeo real | `script_check` | — |
| 7 | Revisão | reviewed | Fact-check linha a linha, rubrica, política | ✅ protocolo | rubrica + fontes | — |
| 8 | Aprovação do roteiro | script_approved | Você lê e aprova | ✅ | `approval.md` com sua citação | **aprova** |
| 9 | Voz | produced | Narração por parágrafo, léxico de pronúncia (números, datas, nomes), velocidade 0,88, nivelamento | 🟡 `kokoro_tts.py` + checagem por Whisper; ⬜ léxico e escala para 60 min | WER do Whisper ≤ 5% | **escolhe a voz** (ouvir 2–3) |
| 10 | Planejamento de cenas | produced | Roteiro → `scenes.json` (tipo, componente, prompt, motivo de som) | ⬜ hoje à mão; precisa de um compilador | schema + cobertura de 100% do texto | — |
| 11 | Imagens | produced | Prompts → Flow → download → recorte → `media/` | 🟡 funciona (runbook, via Claude in Chrome); ⬜ em lote e com consistência de personagem | tamanho, proporção, licença registrada | login se cair |
| 12 | Montagem | produced | Cena a cena no Remotion + legendas + mapa + título; render em paralelo e concat | 🟡 componentes e 3 estilos; ⬜ render por cena para 60 min | sem trechos parados, resolução, fps | — |
| 13 | Som e FX | produced | Trilha, ambiente, SFX com motivo, som de movimento, voz nivelada | 🟡 `sound_design.py` + `fx_check` (R16, F1–F11) | `fx_check` PASS | **ouve** e aprova |
| 14 | QA do render | qa_passed | −14 LUFS, paradas, legendas, rubrica visual V1–V8 | 🟡 partes à mão; ⬜ `qa_render.py` único | `qa.md` todo PASS | **assiste** |
| 15 | Metadados | uploaded_private | Título, descrição, capítulos (das cenas), tags, SRT, marcação de conteúdo sintético | ⬜ | `metadata.json` completo | — |
| 16 | Upload privado | uploaded_private | Vídeo, thumbnail, legendas, capítulos, **sempre privado** | ⬜ via Chrome (Studio) ou API | leitura da tela de conteúdo | — |
| 17 | Aprovação de publicação | publish_approved | Você assiste o privado e autoriza | ✅ hook bloqueia sem isso | `approval.md` | **autoriza cada publicação** |
| 18 | Agendamento | scheduled | Data e hora, teste A/B de thumbnail | ⬜ runbook | tela de conteúdo | — |
| 19 | Análise | analyzed | Checkpoints 24 h/72 h/7 d/28 d; post-mortem **compara com as previsões da etapa 5** | ✅ protocolo; ⬜ coleta da API | — | lê o resumo |

## Duas faixas em paralelo
- **Faixa A, editorial (por vídeo):** etapas 2 a 14. É o que transforma uma ideia em um vídeo bom e com retenção.
- **Faixa B, plataforma (uma vez):** criar o canal "Lacre" no YouTube (nome, @, banner, avatar, descrição, playlists), escrever os runbooks do Studio, testar upload privado e agendamento. Não depende do vídeo, só da sua autorização (criação de canal, login e termos).

## Onde estamos
- **Faixa A:** o vídeo **Napoleão e 1808** (`channels/pt-br-historia/videos/2026-11-19-napoleao-1808/`) tem o brief preenchido e está em `idea`. **Próxima etapa: a sua aprovação da seleção (etapa 2).**
- **Faixa B:** canal ainda não criado; aguarda sua autorização.

## O que acontece depois da aprovação (Faixa A, nesta ordem)
1. **Pesquisa** (etapa 3): panorama do tema, 3 a 5 referências com heatmap, lacunas, dossiê de fontes. Coleta pesada em subagentes; só o resumo volta.
2. **Embalagem** (etapa 4): 15 títulos e 3 thumbnails; você escolhe.
3. **Estrutura** (etapa 5): beat sheet, abertura, plano de retenção e **previsões numéricas**, que o post-mortem vai conferir.
4. **Roteiro, revisão e a sua aprovação** (etapas 6 a 8): o roteiro completo de ~60 min, com fontes em cada afirmação.
5. **Produção** (etapas 9 a 14): voz, cenas, imagens, montagem, som e QA.

## O que eu preciso de você em cada ponto
- **Uma vez:** autorizar a criação do canal, fazer login/2FA se pedir e aceitar os termos do YouTube.
- **Por vídeo:** aprovar a seleção, escolher título e thumbnail, aprovar o roteiro, escolher a voz, ouvir o mix, assistir o vídeo privado e autorizar a publicação.
- **Nunca** que eu publique algo sem a sua autorização explícita, vídeo a vídeo (R12; o hook bloqueia).
