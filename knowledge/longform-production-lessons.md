# Lições de produção de vídeos longos

Origem: `kits/kit-desconhecido/docs/motion-2d.md` e seção 4 de `research/kit-triage/triage-report.md` (repositório antigo kit-flow-generate, só leitura). Cada lição vem de um fato registrado nas tentativas anteriores e vira uma regra para o Lacre.

## O que aconteceu antes
- O 3D em código (Titanic, 298 cenas, 1.346 s de voz) não chegou a um render final aprovado. Ficou com problemas abertos de material e de ação humana.
- O Titanic teve produção v1 a v4, storyboards v2 a v4 e abertura de 30 s até a v11. Foram 20 GB e quase 110 mil arquivos, e a v11 não ficou melhor que as anteriores.
- A colagem v1 apoiou a imagem em cartões de texto, diagramas e grafismos de código. A v2 passou o Flow a fonte principal e deixou o código só com recorte, profundidade, câmera e textura.
- A rota 2D entregou um vídeo de 15 min (9 capítulos, 58 cenas, render único de 900 s). Ficaram pendentes cenas de 19 a 24 s, legenda proporcional ao grupo, voz a 0,90× e 0,4 s de quadro parado no início.

## Regras
1. **Voz primeiro.** Gere e meça a narração antes de desenhar cena. A voz é o relógio e a cena segue a fala.
2. **Parar a iteração.** Cada bloco ou cena tem no máximo 2 ciclos de correção (R6, R8). No segundo ciclo sem nota mínima, escale com o diagnóstico. Versões novas de storyboard ou abertura só nascem de um defeito nomeado.
3. **Imagem do Flow é a base; código faz recorte, câmera, profundidade e textura.** Mapa e texto ficam em até 20% das tomadas (R18). Cartão de texto não substitui acontecimento.
4. **Cenas por fala, não por parágrafo.** O número de cenas vem das frases e das ações. Para 15 min, 58 cenas é o mínimo para não virar apresentação de slides, e 75 a 90 é o alvo. Cena de 15 s ou mais pede sub-beats: outro enquadramento, outra camada em ação ou um inserto motivado.
5. **Corte no fim da frase ou da ação.** Nunca no meio da frase para cumprir cota de cenas ou de tempo.
6. **Blocos de cerca de 90 s com gate.** O próximo bloco só começa depois que o anterior passa em `protocols/scene-production.md`. O master só renderiza com todos os blocos aprovados.
7. **Gancho antes da técnica.** Um bom render não salva uma abertura sem situação concreta. Revise o gancho com `rubrics/render-qa.md` (Q1) antes de produzir o resto.
8. **Ritmo da voz.** Pausa de 0,25 a 0,45 s entre frases, 0,8 a 1,2 s entre parágrafos, 1,2 a 2 s entre capítulos. Velocidade do TTS entre 0,95 e 1,05× no longo. Se não couber, corte texto em vez de acelerar.
9. **Legenda alinhada por palavra**, a partir de `pipeline/captions/align_words.py`. Legenda proporcional ao grupo fica fora.
10. **Primeiro quadro com imagem e som.** Sem quadro parado ou mudo no início; confira à mão, porque o `render_check.py` não mede isso.
11. **Reaproveitar o que passou.** Cada tomada aprovada entra em `protocols/scene-templates.md`. Reescrever do zero o que já tem modelo custa tempo e traz defeito de volta.
12. **Medir antes de culpar o render.** Nas tentativas antigas o gargalo era decidir quantas cenas cada fala pede, e o render não pesava. Meça onde o tempo vai antes de mudar a ferramenta.
13. **Limite de tempo.** Se o próximo passo não produz fala, imagem ou som, é planejamento e deve ser cortado.
14. **Texto gerado dentro de imagem não se usa.** O Flow não gera texto legível. Rótulo, data e legenda entram como camada de texto do renderizador.
15. **Reconstrução avisada.** Imagem gerada de pessoa, lugar ou evento real conta como reencenação e segue R14 e `knowledge/policies-ai.md`. Nunca se apresenta como arquivo.
16. **Peso fora do git.** Dependências pesadas e cópias de render por versão ficam fora do git. Uma pasta por produção, sem subpasta por lote (`AGENTS.md`).
