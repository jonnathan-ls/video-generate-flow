# Runbook: chave da YouTube Data API v3 (validado em 2026-11-19, Chrome + Claude in Chrome, console em português)

1. Conta: a pessoal do usuário (conferir no menu do avatar). Abrir `console.cloud.google.com/projectcreate`, nome `lacre-pesquisa`, "Criar". (O painel que abre depois pode ser de outro projeto: conferir em `cloud-resource-manager`, expandir "No organization".)
2. `console.cloud.google.com/apis/library/youtube.googleapis.com?project=lacre-pesquisa` > "Ativar".
3. `apis/credentials?project=lacre-pesquisa` > "Criar credenciais" > "Chave de API". Nome `lacre-pesquisa-youtube`; em "Selecionar restrições da API" filtrar "YouTube Data" e marcar só **YouTube Data API v3**; "Criar".
4. A chave aparece num campo do painel lateral; ler por `javascript_tool` (input com valor `AIza...`), gravar em `.env` (`YOUTUBE_API_KEY=`, modo 600, no `.gitignore`). **Nunca colar a chave no chat, em commits ou em arquivos versionados.**
5. Teste: `videos.list` de 2 ids conhecidos (custo 1 unidade).

**Cota gratuita:** 10.000 unidades/dia. `videos.list`, `channels.list`, `playlistItems.list` custam 1 (até 50 itens); `search.list` custa 100 (não usar; a busca usa `yt-dlp --flat-playlist`). Cliente: `pipeline/research/ytapi.py` (cache de 12 h em `data/cache/yt/`).
**Se a chave vazar:** apagar a chave no console e criar outra.
