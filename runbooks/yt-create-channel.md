# Runbook: criar canal e configurar o perfil (validado em 2026-11-19, Chrome + Claude in Chrome, interface em português)

1. Conferir a conta: menu da conta > Trocar de conta. Usar a conta pessoal do usuário (não a do canal Curta Mente).
2. `youtube.com/channel_switcher` > "Crie um canal" abre "Seu ícone e nome na plataforma". Preencher Nome e Identificador (@). O campo mostra ✓ verde quando o @ está livre e vermelho + sugestão quando ocupado. **Testar o @ no próprio formulário** (busca na web não vale).
3. "Criar canal" aceita os Termos do YouTube: só com autorização explícita do usuário no chat.
4. Abrir `studio.youtube.com/channel/<ID>/editing/profile` (o ID aparece na URL após criar).
5. Foto e banner: usar `file_upload` no input oculto (find "file input"), nunca clicar em "Enviar". Só aceita arquivos em pasta lida pela sessão (ex.: `media/.../papel/out/`). Confirmar com "Pronto" em cada diálogo de corte; o banner mostra as zonas "TVs / computadores / todos os dispositivos".
6. Descrição: `scroll_to` na caixa, clicar dentro dela, Ctrl+A, digitar. Conferir por zoom: um clique fora da caixa seleciona a página inteira e não digita nada.
7. Salvar: botão preto "Publicar" no topo. O guard só libera se o resumo da ação disser "perfil do canal" e não citar vídeo/upload/agendamento.
8. Verificar: recarregar o Studio (foto/banner aparecem) e abrir `youtube.com/@<handle>` (a página pública pode demorar minutos para mostrar foto e banner).

**Pendências conhecidas:** playlists só depois dos primeiros vídeos (vazias não ajudam); e-mail de contato e links: decisão do usuário.
