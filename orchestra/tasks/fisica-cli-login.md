# fisica-cli-login: usar login do Gemini CLI sem ler `.env`
Leia `orchestra/fisica.sh` e a regra 2 de `AGENTS.md`. Não leia `.env`.

Permita que `GEMINI_CLI_LOGIN=1` habilite a chamada ao Gemini CLI já autenticado mesmo sem `GEMINI_API_KEY`; com `NOGEMINI=1`, não tente ler `.env`. Preserve o fluxo atual por chave quando `NOGEMINI` não estiver definido.

Edite só `orchestra/fisica.sh`. Valide `bash -n orchestra/fisica.sh` e rode um probe de `fisica.sh` com `NOGEMINI=1`, `GEMINI_CLI_LOGIN=1`, `GEMINI_MODEL=gemini-3.5-flash-lite`, `FISICA_VOTOS=1`, sem ler `.env`; grave a saída do probe em `orchestra/review/fisica/S02/fisica-oauth-probe.json`.

Saída obrigatória: `orchestra/results/fisica-cli-login.json`, com status e validators, preservando o resultado se o modelo estiver indisponível.
