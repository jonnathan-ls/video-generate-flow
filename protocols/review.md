# Protocolo: Revisão de roteiro (rubrica + fact-check + política)

**Agente:** reviewer (independente do scriptwriter: não reaproveite o raciocínio de quem escreveu) · **Status:** `scripted` → `reviewed` → (usuário) `script_approved`

## Passos
1. **Fact-check, linha a linha:** para cada afirmação factual, abrir a fonte em `sources.md` e confirmar que o trecho sustenta exatamente o que o roteiro diz (número, data, escopo). Classificar: `OK` / `AJUSTAR` (o roteiro exagera) / `SEM FONTE` (remover ou buscar). Zero pendências para passar.
2. **Contrato da embalagem:** o gancho entrega o que título + thumb prometem? O payoff entrega a promessa total? Se não → `REPROVADO`.
3. **Rubrica** (`rubrics/script-long.md` ou `script-short.md`): pontuar cada critério com a justificativa citando o trecho.
4. **Política** (`knowledge/policies-ai.md`): conteúdo inautêntico/repetitivo? Afirmações médicas, financeiras ou legais (YMYL) sem ressalva? Uso de pessoas reais? Precisa de marcação de conteúdo sintético?
5. **Originalidade:** rodar `python3 pipeline/validate/originality_check.py script.md <transcrições das referências>` (limite de 3% de sobreposição de sequências de 6 palavras) e comparar com os outliers de referência; o roteiro não pode seguir a mesma sequência de pontos nem reutilizar frases.
6. **Learnings:** cada regra OBRIGATÓRIA aplicável foi seguida? Listar.
7. Escrever `review.md`: nota, tabela de fact-check, problemas com a correção sugerida, veredito `APROVADO` / `REFAZER`.
8. `REFAZER` → devolve ao scriptwriter (máx. 2 ciclos — R6). `APROVADO` → apresentar ao usuário (B4) com um resumo de 5 linhas.

## Definition of Done
- [ ] Fact-check 100% `OK`.
- [ ] Nota ≥ mínima.
- [ ] Checklist de política sem bloqueios.
- [ ] Learnings obrigatórios verificados.
