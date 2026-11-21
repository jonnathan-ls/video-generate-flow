# Embalagem: Guerra do Vietnã (ângulo A, PT-BR)

**Promessa central:** Depois de assistir, você vai entender a Guerra do Vietnã do começo ao fim em cerca de 22 minutos e saber o que o Brasil fez, pediu ou recusou em cada etapa, com documentos.
**Emoção dominante:** surpresa ("isso eu não sabia") com curiosidade pelo papel do Brasil.
**Palavras a evitar:** "por que os EUA perderam" (9 de 11 títulos do tema; saturado).

## Títulos
- T01: Vietnã: o dia em que os EUA pediram soldados ao Brasil
- T02: A Guerra do Vietnã em 22 minutos, com o Brasil no meio
- T03: O papel do Brasil no Vietnã, segundo os documentos
- T04: Vietnã: por que nenhum soldado brasileiro foi à guerra?
- T05: Vietnã: o ataque que talvez nunca tenha acontecido
- T06: Vietnã: de 58 mil mortos, só 41 mil morreram em combate
- T07: A carta de Castelo Branco que apoiou a Guerra do Vietnã
- T08: O que a imprensa brasileira dizia sobre o Vietnã
- T09: A Guerra do Vietnã em que o Brasil não entrou
- T10: Resolução de Tonkin: o texto que levou à guerra
- T11: Vietnã em 3 documentos: Tonkin, Pentágono e Paris
- T12: O que acontece quando os EUA pedem tropas ao Brasil
- T13: Guerra do Vietnã: o capítulo brasileiro
- T14: De Dien Bien Phu a Saigon: a guerra em 22 minutos
- T15: 1965: os EUA pedem soldados ao Brasil para o Vietnã

Todos os 15 passam em `packaging_check.py` (comprimento, caixa alta, palavras proibidas, similaridade < 70% com os títulos do panorama). Estruturas usadas: história/personagem (T01, T07, T15), explicação definitiva (T02, T14), pergunta com lacuna (T04), contraste/inversão (T09), número (T06, T11), consequência (T12), segredo/bastidor (T05), documento (T03, T10, T13), imprensa (T08).

## Notas dos títulos (rubrica: clareza, curiosidade, estaca, verdade; 0 a 5 cada; mínimo 16/20)
| T | Cl | Cu | Es | Ve | Total |
|---|---|---|---|---|---|
| T01 | 5 | 5 | 4 | 5 | **19** |
| T02 | 5 | 3 | 5 | 5 | **18** |
| T15 | 4 | 5 | 4 | 5 | 18 |
| T04 | 4 | 5 | 3 | 5 | 17 |
| T06 | 4 | 4 | 4 | 5 | 17 |
| T09 | 5 | 4 | 3 | 5 | 17 |
| T12 | 5 | 4 | 3 | 5 | 17 |
| T14 | 4 | 3 | 5 | 5 | 17 |
| T05 | 4 | 5 | 3 | 4 | **16** |
| T07 | 4 | 4 | 3 | 5 | 16 |
| T10 | 4 | 3 | 4 | 5 | 16 |
| T11 | 4 | 3 | 4 | 5 | 16 |
| T03 | 4 | 3 | 3 | 5 | 15 (reprova) |
| T08 | 4 | 3 | 3 | 5 | 15 (reprova) |
| T13 | 3 | 3 | 3 | 5 | 14 (reprova) |

**Verdade (o roteiro precisa cumprir):** T01/T15 pedido de tropas ao Brasil em dez/1965 (FRUS, fonte 7); T05 estudo da NSA sobre o 2º ataque (fonte 5, "talvez" porque há controvérsia); T06 58.220 registros, 40.934 em combate (NARA, fonte 3); T02 cronologia completa em ~22 min com o fio do Brasil.

## Finalistas
1. **T01** Vietnã: o dia em que os EUA pediram soldados ao Brasil (54 caracteres; 19/20)
2. **T02** A Guerra do Vietnã em 22 minutos, com o Brasil no meio (54; 18/20)
3. **T05** Vietnã: o ataque que talvez nunca tenha acontecido (50; 16/20)

## Conceitos de thumbnail (1280×720, em `thumbs/`, JPG < 200 KB, legíveis a 160×90)
- **A.jpg, "E o Brasil foi?"**: mapa-múndi escuro com o Brasil em latão e o Vietnã em vermelho, ligados por um arco pontilhado; selo "1965". Foco: a ligação. Complementa T01 e T02 (faz a pergunta que o título pede). Nota 18/20 (foco 4, legibilidade 4, contraste 5, complemento 5).
- **B.jpg, "1965 Pedido ao Brasil"**: papel de carta, o ano grande e o selo de cera do Lacre. Foco: o documento. Repete parte do texto de T01 (complemento 3). Nota 17/20.
- **C.jpg, "Houve 2º ataque?"**: sonar com os dois pontos (2 e 4 de agosto) e o segundo marcado em vermelho tracejado. Para T05. Complemento 3 (repete "ataque"). Nota 17/20.
Aviso: elementos feitos em código (mapas Natural Earth, domínio público); sem pessoas, sem imagens de vítimas, sem imagem de IA realista (sem marcação R14 por thumbnail).

## Par recomendado
**T01 + A.** A thumb pergunta "E o Brasil foi?" e o título diz que os EUA pediram soldados ao Brasil: quem vê entende que o vídeo responde, e a resposta tem documento. Variantes para o Test & Compare: B (com T01) e C (com T05).

ESCOLHA_USUARIO: "Vietnã: o dia em que os EUA pediram soldados ao Brasil + thumbnail A (E o Brasil foi?)"

Escolha registrada a partir da mensagem do usuário no chat: "T01 a" (2026-11-19). Variantes para o Test & Compare: B com T01; C com T05.
