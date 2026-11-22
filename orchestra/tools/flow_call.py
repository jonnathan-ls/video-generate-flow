#!/usr/bin/env python3
"""Chama uma ferramenta do flow-mcp direto, sem LLM no meio (2026-11-22).
Motivo: o Flow era operado por um executor (OpenCode/Claude) só para repassar argumentos ao MCP, o que custava
cota e minutos de modelo. Aqui o maestro monta o JSON e o script fala com o servidor MCP por stdio.
Uso: python3 orchestra/tools/flow_call.py <ferramenta> <args.json | '{"...": ...}'>
Ex.:  python3 orchestra/tools/flow_call.py flow_agent_images lab/flow-l2-poses.json
Regras (AGENTS.md): 0 crédito, projeto lacre-vietna, uma chamada por lote, nunca imagem por imagem."""
import json, os, pathlib, subprocess, sys, time

SERVER = ["node", str(pathlib.Path.home() / "flow-mcp/dist/index.js")]


def call(tool, args, timeout=3600):
    p = subprocess.Popen(SERVER, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=sys.stderr, text=True, bufsize=1)
    n = 0

    def send(method, params=None, notify=False):
        nonlocal n
        msg = {"jsonrpc": "2.0", "method": method}
        if params is not None:
            msg["params"] = params
        if not notify:
            n += 1; msg["id"] = n
        p.stdin.write(json.dumps(msg) + "\n"); p.stdin.flush()
        if notify:
            return None
        t0 = time.time()
        while time.time() - t0 < timeout:
            line = p.stdout.readline()
            if not line:
                raise RuntimeError("flow-mcp encerrou sem resposta")
            try:
                r = json.loads(line)
            except json.JSONDecodeError:
                continue
            if r.get("id") == n:
                if "error" in r:
                    raise RuntimeError(json.dumps(r["error"], ensure_ascii=False))
                return r["result"]
        raise TimeoutError(f"{method} sem resposta em {timeout}s")

    try:
        send("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "orchestra", "version": "1"}})
        send("notifications/initialized", notify=True)
        res = send("tools/call", {"name": tool, "arguments": args})
        text = "\n".join(c.get("text", "") for c in res.get("content", []) if c.get("type") == "text")
        # Trabalho na fila vive DENTRO deste processo do servidor: esperar aqui mesmo com flow_wait até terminar.
        try:
            ids = [j["id"] for j in json.loads(text).get("jobs", []) if j.get("status") in ("queued", "running")]
        except (json.JSONDecodeError, AttributeError):
            ids = []
        while ids:
            w = send("tools/call", {"name": "flow_wait", "arguments": {"job_ids": ids, "timeout_seconds": 40}})
            text = "\n".join(c.get("text", "") for c in w.get("content", []) if c.get("type") == "text")
            try:
                d = json.loads(text)
            except json.JSONDecodeError:
                break
            if d.get("finished") or all(j.get("status") not in ("queued", "running") for j in d.get("jobs", [])):
                break
            print(f"[flow_call] esperando {len(ids)} job(s)...", file=sys.stderr)
        return text, bool(res.get("isError"))
    finally:
        p.terminate()


if __name__ == "__main__":
    tool, a = sys.argv[1], sys.argv[2]
    args = json.loads(pathlib.Path(a).read_text() if os.path.exists(a) else a)
    t0 = time.time()
    text, err = call(tool, args)
    print(text)
    print(f"[flow_call] {tool} {'ERRO' if err else 'ok'} em {time.time() - t0:.0f}s", file=sys.stderr)
    sys.exit(1 if err else 0)
