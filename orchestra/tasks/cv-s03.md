# cv-s03: refazer a cena S03 em motion graphic com a skill claude-video (teste comparativo)

Siga a skill em `~/.claude/skills/claude-video/SKILL.md`, só a etapa C (construir), passos 4 a 8. A etapa A já está feita (estilo `livro-pop-up`), a etapa B também, e o brief está pronto. Rode sem pedir aprovação: é um teste.

- **Brief:** `lab/claude-video-teste/BRIEF.md`. Leia inteiro.
- **Ficha do estilo:** `lab/claude-video-teste/deepseek/ESTILO.md`.
- **Projeto:** `lab/claude-video-teste/deepseek/`, já criado a partir do estilo, com `index.html`, `motor.js` e `hyperframes.json`. Troque a cena da peça de partida pela do brief (Hanói 1945 → Saigon 1975 → Brasil 1965) e ajuste `data-duration` para 9,91 s.

Passos:
1. Use um relógio só, sem `Math.random` nem `Date.now`, e faça cada batida cair no segundo que o brief manda.
2. Gere os frames: `bash ~/.claude/skills/claude-video/scripts/frames.sh lab/claude-video-teste/deepseek 3.9,7.2,9.6`. Olhe `frames/olhar.jpg` e corrija o que estiver feio.
3. Renderize: `bash ~/.claude/skills/claude-video/scripts/render.sh lab/claude-video-teste/deepseek lab/claude-video-teste/out/deepseek.mp4 draft`.
4. Rode as checagens: `python3 ~/.claude/skills/claude-video/scripts/ritmo.py lab/claude-video-teste/out/deepseek.mp4` e `python3 ~/.claude/skills/claude-video/scripts/pericia-movimento.py lab/claude-video-teste/out/deepseek.mp4 --contra ~/.claude/skills/claude-video/galeria/videos/livro-pop-up.mp4`.

Altere só arquivos dentro de `lab/claude-video-teste/deepseek/` e `lab/claude-video-teste/out/`.
Resultado: `orchestra/results/cv-s03.json`, com o caminho do mp4 e as checagens em `validators`.
