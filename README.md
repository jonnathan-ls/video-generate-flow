# ai-youtube-channel

Sistema para operar canais no YouTube com IA: estratégia, pesquisa, roteiro, produção, operação de plataforma e análise. O usuário valida e direciona; a IA executa.

- **Regras:** [CLAUDE.md](CLAUDE.md) (R1–R15)
- **Fluxo do vídeo:** [protocols/status-machine.md](protocols/status-machine.md) e o mapa completo em [protocols/production-pipeline.md](protocols/production-pipeline.md)
- **Laboratório (testes, separado da produção):** [lab/README.md](lab/README.md)
- **Quando o usuário é chamado:** [protocols/human-touchpoints.md](protocols/human-touchpoints.md)
- **Skills:** `/niche-research`, `/radar`, `/select`, `/video-research`, `/package`, `/video-structure`, `/script`, `/review`, `/postmortem`, `/weekly-review`

## Enforcement automático
- `.claude/hooks/guard.py` (PreToolUse) bloqueia:
  - mudança de status fora do gate;
  - aprovação sem a citação do usuário;
  - publicação/agendamento sem janela aprovada (shell e navegador);
  - modelos de licença não comercial.
- `pipeline/validate/`:
  - `status_gate.py`: a única forma de avançar o status;
  - `script_check.py`;
  - `packaging_check.py`.

## Estado da implementação
- [x] Governança: constituição, protocolos editoriais, rubricas, agentes, skills, hooks, validadores, knowledge.
- [ ] Fase 0: pesquisa de nicho PT-BR
- [ ] Setup do canal (runbooks do YouTube Studio escritos durante a execução real)
- [ ] Pipeline de produção + protocolos de produção (voz, cenas, renderers, montagem, QA de render, metadados, upload)
- [ ] Analytics (coleta → SQLite) + rotinas agendadas
- [ ] Integração dos kits do usuário como renderers
- [ ] Canal EN
