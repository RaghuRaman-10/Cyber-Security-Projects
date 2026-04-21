/**
 * Caesar cipher in the browser — mirrors the Python lab logic.
 *
 * Core idea: map A–Z and a–z to 0..25, add the shift, use % 26 to wrap.
 */

"use strict";

/** Read shift from the input; treat empty as 0. */
function readShift() {
  const raw = document.querySelector("#shift").value.trim();
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Shift one character if it is A–Z or a–z; otherwise return unchanged.
 * @param {string} ch - single character
 * @param {number} shift - key (encrypt forward)
 * @param {boolean} encrypt - true encrypt, false decrypt
 */
function shiftLetter(ch, shift, encrypt) {
  const code = ch.codePointAt(0);
  let base;
  const alphabetSize = 26;

  if (code >= 65 && code <= 90) base = 65; // 'A'
  else if (code >= 97 && code <= 122) base = 97; // 'a'
  else return ch;

  const k = ((shift % alphabetSize) + alphabetSize) % alphabetSize;
  const step = encrypt ? k : (-k + alphabetSize) % alphabetSize;
  const pos = code - base;
  const newPos = (pos + step) % alphabetSize;
  return String.fromCodePoint(base + newPos);
}

/** Encrypt whole string. */
function encrypt(text, shift) {
  let out = "";
  for (const ch of text) {
    out += shiftLetter(ch, shift, true);
  }
  return out;
}

/** Decrypt with same shift used for encryption. */
function decrypt(text, shift) {
  let out = "";
  for (const ch of text) {
    out += shiftLetter(ch, shift, false);
  }
  return out;
}

/** All 26 Caesar decryptions (educational: tiny key space). */
function bruteForceLines(ciphertext) {
  const lines = [];
  for (let s = 0; s < 26; s++) {
    lines.push(`shift=${String(s).padStart(2, " ")}  ${decrypt(ciphertext, s)}`);
  }
  return lines.join("\n");
}

function setResult(text) {
  document.querySelector("#result").textContent = text;
}

function wireButtons() {
  const msgEl = document.querySelector("#message");

  document.querySelector("#btn-encrypt").addEventListener("click", () => {
    const text = msgEl.value;
    const shift = readShift();
    const cipher = encrypt(text, shift);
    msgEl.value = cipher;
    setResult("Encrypted text is now in the message box above.\n\n" + cipher);
  });

  document.querySelector("#btn-decrypt").addEventListener("click", () => {
    const text = msgEl.value;
    const shift = readShift();
    const plain = decrypt(text, shift);
    msgEl.value = plain;
    setResult("Decrypted text is now in the message box above.\n\n" + plain);
  });

  document.querySelector("#btn-crack").addEventListener("click", () => {
    const text = msgEl.value;
    setResult(bruteForceLines(text));
  });
}

wireButtons();
