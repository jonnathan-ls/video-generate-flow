# Fonte: `source pipeline/env.sh` antes de rodar ferramentas Python do pipeline (habilita CUDA para faster-whisper).
REPO="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
SP="$("$REPO/.venv/bin/python" -c 'import site;print(site.getsitepackages()[0])')"
export LD_LIBRARY_PATH="$SP/nvidia/cublas/lib:$SP/nvidia/cudnn/lib:${LD_LIBRARY_PATH:-}"
