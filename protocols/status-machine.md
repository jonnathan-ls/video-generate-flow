# Protocolo: Máquina de estados do vídeo

O campo `status:` no frontmatter de `brief.md` é a única fonte da verdade sobre a etapa do vídeo. O validador `pipeline/validate/status_gate.py` confere se os artefatos exigidos existem antes de permitir o avanço.

| Status | Significa | Artefatos exigidos para ENTRAR neste status | Quem avança |
|---|---|---|---|
| `idea` | Ideia no backlog | linha em `backlog.md` | trend-researcher |
| `selected` | Ideia escolhida para produção | `brief.md` com promessa, ângulo e outlier de referência (com URL) | **usuário aprova** |
| `researched` | Pesquisa do vídeo concluída | `research.md` com 6 seções e ≥ 8 URLs (`protocols/video-research.md`) | trend-researcher |
| `packaged` | Título e thumbnail definidos | `packaging.md` com nota ≥ mínima e `ESCOLHA_USUARIO:` preenchida | **usuário escolhe** |
| `structured` | Narrativa e plano de retenção definidos | `structure.md` com 7 seções, beat sheet ≥ 5 atos e previsões quantificadas (`protocols/video-structure.md`) | strategist |
| `scripted` | Roteiro escrito | `script.md`, `sources.md` | scriptwriter |
| `reviewed` | Revisado por rubrica + fact-check | `review.md` com nota ≥ mínima e fact-check sem pendências | reviewer |
| `script_approved` | Usuário aprovou o roteiro | `approval.md` com `APROVADO_ROTEIRO: sim` | **usuário** |
| `produced` | Vídeo montado | `scenes.json` válido, `media/<id>/render/final.mp4` | producer |
| `qa_passed` | QA automático e humano-IA ok | `qa.md` com todos os checks `PASS` (inclui `fx_check`) | reviewer |
| `uploaded_private` | No YouTube como privado | `metadata.json` com `video_id` | operator |
| `publish_approved` | Usuário autorizou publicar | `approval.md` com `APROVADO_PUBLICACAO: sim` | **usuário** |
| `scheduled` / `published` | Agendado / no ar | `metadata.json` com `publish_at` ou `published_at` | operator |
| `analyzed` | Post-mortem 28d feito | `postmortem.md` completo, learnings atualizados | analyst |

## Por que pesquisa e estrutura entram antes do roteiro
A pesquisa decide **o que prometer e como diferenciar**; a estrutura decide **a forma da narrativa e o plano de retenção**, com previsões que o post-mortem confere. Escrever o roteiro antes disso é o caminho para repetir o que já existe ou perder a atenção no meio.

## Regras
1. Nunca pule status. Nunca retroceda sem registrar o motivo em `brief.md` (seção `## Histórico`).
2. Para avançar: rode `python3 pipeline/validate/status_gate.py channels/<canal>/videos/<id> --to <status>`. Se falhar, corrija o que ele apontar; não edite o status manualmente para contornar.
3. `approval.md` só é escrito com base em mensagem explícita do usuário no chat; registre a citação literal e a data.
