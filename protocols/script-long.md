# Protocolo: Roteiro de vídeo longo

**Agente:** scriptwriter · **Status:** `structured` → `scripted` · **Depois:** `protocols/review.md`

## Leitura obrigatória
**`structure.md` (o beat sheet e o plano de retenção são o esqueleto; não reinvente a estrutura)**, `research.md`, `knowledge/hooks.md`, `knowledge/retention.md`, `rubrics/script-long.md`, `learnings.md` (gancho/ritmo/tema), `style-guide.md`, `packaging.md` (o título e a thumb escolhidos são o contrato).

## Parâmetros
- Duração alvo: definida no `brief.md` (padrão 8–12 min).
- Palavras alvo = duração (min) × WPM da voz (medir na voz escolhida; padrão inicial 150 WPM PT-BR / 155 EN, ajustar após o 1º vídeo).

## Passos
1. **Pesquisa:** reunir fatos com fonte em `sources.md` ANTES de escrever (R1). Mínimo 5 fontes independentes para vídeos explicativos.
2. **Esqueleto:** siga o beat sheet de `structure.md` (atos, viradas, loops, minutos-alvo). Estrutura-padrão, se o beat sheet pedir detalhe:
   - `GANCHO` (0–30 s): confirma a promessa do título/thumb nos primeiros 5–10 s, mostra o que está em jogo, abre um loop ("e o motivo disso vai mudar como você vê X").
   - `CONTEXTO` (≤ 60 s): só o mínimo para entender.
   - `ATOS` (3–5 blocos): cada um com mini-gancho de entrada, conteúdo, virada/revelação e ponte que abre o próximo loop.
   - `CLÍMAX/PAYOFF`: entrega a promessa máxima, o mais tarde possível sem parecer enrolação.
   - `FECHAMENTO` (≤ 20 s): conclusão + chamada para um vídeo específico do canal (não "se inscreva" genérico no início).
3. **Escrever** em blocos com marcação de cena:
   ```
   [CENA 03 | 00:45 | visual: code-chart "crescimento 2015-2025" | sfx: whoosh]
   Texto narrado…
   ```
4. **Ritmo:** mudança de padrão (visual, tom, pergunta, número, exemplo) a cada ≤ 45 s, indicada pelas marcações.
5. **Linguagem falada:** frases ≤ 20 palavras em média, voz ativa, 2ª pessoa, zero frase de enchimento (`pipeline/validate/banned_phrases_<idioma>.txt`).
6. **Autoavaliação** pela rubrica; corrigir até atingir a nota mínima (máx. 2 ciclos — R6).
7. Rodar `python3 pipeline/validate/script_check.py <pasta>`.
8. Escrever os **shorts derivados** (protocolo `script-short.md`) a partir dos melhores momentos.

## Definition of Done
- [ ] `script.md` com todas as cenas marcadas e a duração estimada dentro de ±10% do alvo.
- [ ] Gancho confirma título e thumb (citar a frase exata).
- [ ] Toda afirmação factual mapeada em `sources.md`.
- [ ] `script_check.py` sem erros.
- [ ] Nota na rubrica ≥ mínima.
