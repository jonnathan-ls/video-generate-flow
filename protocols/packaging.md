# Protocolo: Embalagem (título + thumbnail) — ANTES do roteiro

**Agente:** packager · **Status:** `researched` → `packaged` · **Usuário:** B3

## Leitura obrigatória
`research.md` (hipóteses de embalagem), `knowledge/packaging.md`, `rubrics/packaging.md`, `learnings.md` (tipo embalagem), `style-guide.md` (thumbnail).

## Passos
1. Escrever a **promessa central** em 1 frase: "Depois de assistir, você vai <saber/ver/entender> <X>".
2. Escrever o **desejo/emoção** dominante: curiosidade, medo de perder, ganho, surpresa, indignação, admiração.
3. Gerar **15 títulos** usando pelo menos 5 estruturas diferentes de `knowledge/packaging.md`. Cada título deve ter ≤ 60 caracteres (ideal 40–55) e entregar o assunto nas primeiras 4–5 palavras.
4. Rodar `python3 pipeline/validate/packaging_check.py <pasta>`, que barra comprimento, caixa alta excessiva, palavras proibidas e **título ≥ 70% parecido com um título de referência do `research.md`**. Do título de referência só se aproveita o **padrão** (estrutura e tamanho), nunca as palavras (`knowledge/modeling.md`).
5. Pontuar todos os títulos com a rubrica. Selecionar os 3 melhores.
6. Criar **3 conceitos de thumbnail**, cada um com: elemento focal único, emoção, até 4 palavras de texto que **complementam** o título (nunca repetem), cores de contraste com a paleta, composição (regra dos terços / foco à direita para não colidir com o timestamp).
7. Gerar os conceitos (Google Flow para imagem base + composição por código) em 1280x720. Validar a legibilidade reduzindo para 160x90 (`packaging_check.py --thumbs`).
8. Montar o **par título + thumbnail**: thumbnail e título devem contar a história juntos; testar a frase "vejo a thumb + leio o título → entendo o que ganho e fico curioso?".
9. Apresentar ao usuário: 3 títulos finalistas + 3 thumbnails (imagens), com a recomendação de par. Registrar a escolha em `packaging.md` (`ESCOLHA_USUARIO:`). Os 2 outros conceitos ficam como variantes para o *Test & Compare*.

## Saída `packaging.md`
Promessa, emoção, 15 títulos com nota, 3 finalistas, 3 conceitos (descrição + caminho das imagens), escolha do usuário, variantes A/B.

Formato obrigatório (lido pelo validador):
```
## Títulos
- T01: <título>        ← um por linha, numerado T01..T15
...
ESCOLHA_USUARIO: "<título escolhido> + <thumb escolhida>"
```
Thumbnails ficam em `<pasta-do-vídeo>/thumbs/` (A.jpg, B.jpg, C.jpg). Valide com `packaging_check.py <pasta> --thumbs`.

## Definition of Done
- [ ] 15 títulos, ≥ 5 estruturas, todos aprovados no `packaging_check.py`.
- [ ] Nota dos finalistas ≥ mínima da rubrica.
- [ ] 3 thumbnails em 1280x720, < 2 MB, legíveis em 160x90.
- [ ] `ESCOLHA_USUARIO:` preenchida a partir do chat.

## Erros comuns → ação
| Erro | Ação |
|---|---|
| Título clickbait que o vídeo não cumpre | Reescrever: a promessa precisa ser entregue no roteiro (o reviewer confere) |
| Texto da thumb repete o título | Trocar por um complemento (número, reação, pergunta) |
| Thumb poluída | Reduzir a 1 foco + no máximo 2 apoios |
| Pessoa real gerada por IA de forma realista | Evitar; se indispensável, aplicar R14 |
