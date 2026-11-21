# Marca: Lacre

- **Nome:** Lacre
- **Handle:** @lacre (livre em 2026-11-19; confirmar na criação. Alternativas: @lacredoc, @lacrehistoria)
- **Idioma/mercado:** português do Brasil
- **Nicho:** documentários de história, mundo + Brasil
- **Frase descritiva** (banner e descrição): **"A história do mundo e do Brasil, aberta do começo ao fim."**
- **Promessa:** "Aqui você entende de verdade os grandes acontecimentos da história, e os do Brasil que ninguém te contou, como um documentário: do começo ao fim, com fato separado de lenda."
- **Para quem:** adulto curioso de 20 a 55 anos que assiste documentário longo (TV ou ouvindo); ver `audience.md`.
- **Séries (pilares):**
  1. **Grandes temas do mundo**: impérios, guerras, revoluções e personagens, contados por completo (25 a 60 min). Puxa audiência.
  2. **Brasil**: tragédias, fortunas que sumiram e o Brasil que não te contaram (backlog I01 a I37). É o diferencial.
  3. **Recortes**: episódios curtos e surpreendentes (12 a 20 min), derivados dos grandes temas, para testar embalagem.
- **O que NÃO fazemos:**
  - política partidária atual;
  - teorias da conspiração e pseudo-história (astronautas antigos etc.);
  - imagens de vítimas;
  - copiar títulos, visual ou sequência de temas do Ampulheta ou de qualquer concorrente.
- **Tom de voz:** sério, envolvente, preciso.
- **Narração:** Kokoro PT-BR ou a voz clonada do usuário (Chatterbox), decidida por teste A/B na produção.

## Identidade visual (DECIDIDA em 2026-11-19: família "Selo L")
- **Marca:** selo de cera **real** (imagem fotorrealista gerada no Flow e recortada) com um "L" ornamentado e fita de seda, sobre o nome **LACRE** em serifa. Escolha do usuário entre 3 famílias ("Escolho a família Selo L").
- **Por quê selo real e não desenhado em código:** o selo em código foi rejeitado ("parece uma borra, uma mancha"). O usuário quer a textura e o relevo de lacre de verdade. Regra: o que depende de realismo vem do Flow; código faz tipografia, mapas e layout.
- **Arquivos finais** (`media/pt-br-historia/brand/final/`):
  | Arquivo | Uso | Tamanho |
  |---|---|---|
  | `avatar-800.png` | Foto do perfil do canal | 800×800 (mínimo do YouTube: 98×98) |
  | `banner-2560x1440.png` | Banner do canal | 2560×1440, 2,4 MB (limite: 6 MB); conteúdo dentro da área segura 1546×423 (medido) |
  | `marca-dagua-150.png` | Marca d'água dos vídeos | 150×150, PNG transparente |
  | `assinatura-1600x700.png` | Assinatura (para capas, descrições, material) | 1600×700 |
  | `selo-corpo.png`, `selo-com-fita.png` | Selo recortado, fundo transparente | 716×638 e 720×906 |
- **Selo nos vídeos:** o componente `WaxSeal` (`studio/remotion/src/lacre/components.tsx`) usa o selo real (`public/brand/selos/selo-7-corpo.png`).
- **Paleta:** cera real ≈ `#6B2524` (medida na imagem do selo); papel `#E9DFC8`; tinta `#141210`; latão `#B08D57`; apoio frio `#3E5566`. O vermelho antigo `#8E1B1B` dos tokens é mais vivo que a cera real: ajustar os tokens se for preciso casar com o selo.
- **Tipografia:** Playfair Display (nome e títulos) e Inter (frase e dados), ambas livres (OFL).
- **Banner:** o nome, o selo e a frase ficam centrados sobre um mapa-múndi escuro bem discreto.
- **Vinheta de abertura (futuro):** o selo se rompe e revela o mapa (ideia do esboço 12), com este mesmo selo.
- **Histórico das alternativas:** `lab/brand-sketches-2026-11/README.md`.

## Playlists iniciais
1. Grandes temas do mundo
2. Brasil: tragédias
3. Brasil: fortunas que sumiram
4. O Brasil que não te contaram
