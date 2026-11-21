# Configuração do canal (levantamento de 2026-11-19)
Fontes: leitura direta do Studio do canal Lacre (configurações, personalização, padrões de envio), YouTube Help (YPP, layout do canal: https://support.google.com/youtube/answer/72851 e https://support.google.com/youtube/answer/3219384), blog oficial https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/ (10/08/2026) e guias de terceiros (subscribr.ai, vidIQ; peso baixo). Mudar configuração da conta exige o aval do usuário.

| # | Item | Onde no Studio | Estado hoje (Lacre) | Recomendação | Quem |
|---|---|---|---|---|---|
| 1 | Nome, @, foto, banner, descrição | Personalização > Perfil | feito | manter | feito |
| 2 | País de residência | Configurações > Canal > Informações básicas | **Brasil (feito 2026-11-19)** | Brasil (exigido para monetização) | feito |
| 3 | Palavras-chave do canal | idem | **6 palavras-chave (feito)** | história, documentário, história do Brasil, história do mundo, documentário histórico, mapas históricos | feito |
| 4 | Público ("para crianças?") | Canal > Configurações avançadas | **"não é para crianças" (feito)** | já decidido; evita erro por vídeo | feito |
| 5 | Recursos intermediários (vídeos > 15 min, miniaturas personalizadas) | Canal > Qualificação para recursos | "Qualificado" (não "Ativado"): falta verificação | **verificação por telefone (código SMS)**: obrigatória antes do 1º vídeo longo com thumbnail | **usuário** |
| 6 | Padrões de envio: visibilidade | Padrões de envio > básicas | **Privado (feito)** | alinhado à R12 | feito |
| 7 | Padrões de envio: categoria, idioma do vídeo e do título/descrição | > avançadas | **Educação; Português (Brasil) nos dois idiomas (feito)** | | feito |
| 8 | Padrões de envio: título, descrição, tags padrão | > básicas | vazio | deixar vazio (cada vídeo tem `metadata.json`; texto repetido pesa como "inautêntico") | n/a |
| 9 | Capítulos automáticos | > avançadas | ligado | manter; os capítulos do roteiro sobrescrevem | n/a |
| 10 | Comentários e moderação | Padrões de envio e Moderação da comunidade | ativados, moderação básica; **reter comentários com hashtags e URLs para revisão (feito)** | lista de palavras bloqueadas: pendente (decisão do usuário) | parcial |
| 11 | Marca d'água | Personalização > Perfil (fim da página) | **selo de cera, exibição "todo o vídeo" (feito)** | PNG 150×150, até 1 MB, canto inferior direito; `marca-dagua-150.png` | feito |
| 12 | E-mail de contato | Perfil > Dados de contato | vazio | decisão do usuário (fica público); sugestão: e-mail só do canal | **usuário** |
| 13 | Guia "Início" | Personalização > Guia Início | desligada | ligar quando houver vídeos: trailer para não inscritos, vídeo em destaque para inscritos, "Vídeos" e "Playlists" | IA, depois do 1º vídeo |
| 14 | Playlists | Conteúdo > Playlists | nenhuma | criar quando houver vídeos | IA, depois |
| 15 | Permissões | Configurações > Permissões | só o proprietário | manter | n/a |
| 16 | Verificação em duas etapas + AdSense | Conta Google / Ganhos | n/v | exigidos para monetizar; conta de AdSense é só do usuário | **usuário** |
| 17 | Aceite dos novos termos do YPP | Ganhos | n/v | até 31/01/2027 | **usuário** |
| 18 | Marcação de conteúdo sintético | por vídeo (upload) | n/a | regra R14: marcar se parecer foto real | IA, por vídeo |
| 19 | Analytics do próprio canal | API do YouTube Analytics (OAuth) | não ligado | criar cliente OAuth no projeto `lacre-pesquisa` depois do 1º vídeo | usuário consente |

## Monetização: mudança que afeta o plano
- Regras publicadas hoje (Help): 1.000 inscritos e 4.000 horas públicas em 12 meses (ou 10 milhões de views de Shorts em 90 dias), 2 etapas, AdSense, sem avisos ativos.
- **Anunciado para 01/02/2027 (blog oficial, 10/08/2026):** novos candidatos precisarão de **8.000 horas** em 365 dias ou 20 milhões de views de Shorts em 90 dias; quem já está no programa não é afetado; os limites de apoio de fãs e Shopping "permanecem". A página de Help ainda mostra os números antigos (divergência): tratar o blog como regra para depois de 01/02/2027. Se a regra antiga ainda valer para quem se qualificar antes disso é **n/v**.
- Implicação: um canal criado em 11/2026 que acerte um ou dois breakouts cedo pode chegar a 4.000 horas antes do corte, o que reforça a estratégia de entrar em ondas e produzir com frequência. Não é garantia.
- Monetização pode ser desligada após 6 meses sem upload ou post na aba Posts.
