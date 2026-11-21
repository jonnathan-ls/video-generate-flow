// Render sempre na GPU (usuário, 2026-11-20). Teste no S05, 150 quadros: vulkan 6,3 s; CPU (swangle) 11,0 s; imagem idêntica.
import {Config} from '@remotion/cli/config';
Config.setChromiumOpenGlRenderer('vulkan');
