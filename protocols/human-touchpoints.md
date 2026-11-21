# Protocolo: Pontos de contato com o usuário

O usuário não executa operações. Ele é chamado **apenas** nestes casos. Ao chamar, use uma linha clara: *o que* fazer, *onde* (aba/URL já aberta), *por que só ele pode*.

## A. Reservados por segurança (a IA não pode fazer)
| # | Situação | Frequência | O que a IA faz antes | Instrução ao usuário (modelo) |
|---|---|---|---|---|
| A1 | Login / senha Google | 1x por navegador | Abre a página de login na aba | "Faça login na aba aberta; me avise com 'ok'." |
| A2 | Código 2FA / SMS / verificação de telefone | raro | Chega até a tela do código | "Digite o código que chegou no seu celular e me avise." |
| A3 | CAPTCHA / verificação de robô | raro | Para imediatamente | "Apareceu uma verificação de robô na aba; resolva e me avise." |
| A4 | Aceitar termos (ToS YouTube, Google Cloud, YPP, Flow) | 1x cada | Lê o resumo dos termos e explica em 2 linhas | "Revise e clique em 'Aceitar' na aba; resumo: …" |
| A5 | Criar conta (Google Cloud, Pexels, Pixabay, Freesound) | 1x cada | Preenche o que não for credencial e para antes de enviar | "Confira os dados e clique em criar; a senha é sua." |

## B. Decisões editoriais (validação)
| # | Momento | Formato da pergunta |
|---|---|---|
| B1 | Escolha de nicho (Fase 0) | Top 3 com matriz, recomendação primeiro |
| B2 | Ideias da semana (`selected`) | Lista com nota e outlier de referência; "aprovar todas / trocar X" |
| B3 | Embalagem (`packaged`) | 3 títulos finalistas + 3 thumbnails renderizadas |
| B4 | Roteiro (`script_approved`) | Link do `script.md` + resumo da rubrica |
| B5 | Vídeo final (`publish_approved`) | Link do vídeo privado + QA; "pode publicar/agendar para <data>?" |
| B6 | Revisão semanal / estratégia mensal | Resumo de 5 linhas + até 3 decisões pedidas |

## C. Escalonamentos (R7/R8)
Quando escalar, sempre: (1) o que estava fazendo, (2) o que deu errado, (3) o que já tentou, (4) opções com recomendação.

## Proibido
- Pedir ao usuário para "fazer manualmente" algo fora da lista A.
- Pedir aprovação em lote implícita ("vou publicar tudo, ok?"). Cada publicação é uma aprovação.
