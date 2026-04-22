function isLetterAtoZ(code) {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function normalizeKey(keyRaw) {
  const onlyLetters = (keyRaw ?? "").replace(/[^a-z]/gi, "").toUpperCase();
  return onlyLetters;
}

function shiftChar(code, keyShift, isDecrypt) {
  const base = code >= 97 ? 97 : 65;
  const alphaIndex = code - base;
  const shift = isDecrypt ? (26 - keyShift) % 26 : keyShift;
  return base + ((alphaIndex + shift) % 26);
}

function vigenereTransform(text, key, mode) {
  const isDecrypt = mode === "decrypt";
  const keyUpper = normalizeKey(key);
  if (!keyUpper) {
    return { ok: false, value: "", error: "Key is required (letters A–Z only)." };
  }

  const out = [];
  let j = 0;

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (!isLetterAtoZ(code)) {
      out.push(text[i]);
      continue;
    }

    const keyCode = keyUpper.charCodeAt(j % keyUpper.length); // 65..90
    const keyShift = keyCode - 65;
    const outCode = shiftChar(code, keyShift, isDecrypt);
    out.push(String.fromCharCode(outCode));
    j += 1;
  }

  return { ok: true, value: out.join(""), error: "" };
}

function setStatus(el, message, kind) {
  el.textContent = message;
  el.classList.remove("is-error", "is-ok");
  if (kind === "error") el.classList.add("is-error");
  if (kind === "ok") el.classList.add("is-ok");
}

function main() {
  const modeEncryptBtn = document.getElementById("modeEncrypt");
  const modeDecryptBtn = document.getElementById("modeDecrypt");
  const keyEl = document.getElementById("key");
  const inputEl = document.getElementById("inputText");
  const outputEl = document.getElementById("outputText");
  const statusEl = document.getElementById("status");

  const runBtn = document.getElementById("runBtn");
  const copyBtn = document.getElementById("copyBtn");
  const swapBtn = document.getElementById("swapBtn");
  const clearBtn = document.getElementById("clearBtn");

  let mode = "encrypt";

  function setMode(nextMode) {
    mode = nextMode;
    const encryptActive = mode === "encrypt";
    modeEncryptBtn.classList.toggle("is-active", encryptActive);
    modeDecryptBtn.classList.toggle("is-active", !encryptActive);
    runBtn.textContent = encryptActive ? "Encrypt" : "Decrypt";
    setStatus(statusEl, "", "");
  }

  function run() {
    const text = inputEl.value ?? "";
    const key = keyEl.value ?? "";
    const result = vigenereTransform(text, key, mode);

    outputEl.value = result.value;
    if (!text.trim()) {
      setStatus(statusEl, "Enter some input text.", "error");
      return;
    }
    if (!result.ok) {
      setStatus(statusEl, result.error, "error");
      return;
    }
    setStatus(statusEl, "Done.", "ok");
  }

  modeEncryptBtn.addEventListener("click", () => setMode("encrypt"));
  modeDecryptBtn.addEventListener("click", () => setMode("decrypt"));

  runBtn.addEventListener("click", run);

  inputEl.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run();
  });

  keyEl.addEventListener("input", () => {
    const normalized = normalizeKey(keyEl.value);
    if (keyEl.value !== normalized) {
      const pos = keyEl.selectionStart ?? keyEl.value.length;
      keyEl.value = normalized;
      keyEl.setSelectionRange(Math.min(pos, normalized.length), Math.min(pos, normalized.length));
    }
    setStatus(statusEl, "", "");
  });

  copyBtn.addEventListener("click", async () => {
    const value = outputEl.value ?? "";
    if (!value) {
      setStatus(statusEl, "Nothing to copy yet.", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setStatus(statusEl, "Copied to clipboard.", "ok");
    } catch {
      outputEl.focus();
      outputEl.select();
      const ok = document.execCommand("copy");
      setStatus(statusEl, ok ? "Copied to clipboard." : "Copy failed.", ok ? "ok" : "error");
    }
  });

  swapBtn.addEventListener("click", () => {
    const out = outputEl.value ?? "";
    if (!out) {
      setStatus(statusEl, "Nothing to swap yet.", "error");
      return;
    }
    inputEl.value = out;
    outputEl.value = "";
    setStatus(statusEl, "Moved output to input.", "ok");
    inputEl.focus();
  });

  clearBtn.addEventListener("click", () => {
    inputEl.value = "";
    outputEl.value = "";
    setStatus(statusEl, "Cleared.", "ok");
    inputEl.focus();
  });

  setMode("encrypt");
}

document.addEventListener("DOMContentLoaded", main);
