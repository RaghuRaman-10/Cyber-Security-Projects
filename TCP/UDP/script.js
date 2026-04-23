const messageInput = document.getElementById("messageInput");
const simulateTcpBtn = document.getElementById("simulateTcpBtn");
const simulateUdpBtn = document.getElementById("simulateUdpBtn");
const resetBtn = document.getElementById("resetBtn");
const logEl = document.getElementById("log");

const tcpStatusEl = document.getElementById("tcpStatus");
const udpStatusEl = document.getElementById("udpStatus");
const tcpSummaryEl = document.getElementById("tcpSummary");
const udpSummaryEl = document.getElementById("udpSummary");
const tcpOutputEl = document.getElementById("tcpOutput");
const udpOutputEl = document.getElementById("udpOutput");
const tcpDeliveryCheckEl = document.getElementById("tcpDeliveryCheck");
const udpDeliveryCheckEl = document.getElementById("udpDeliveryCheck");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeLog(line) {
  logEl.textContent += `${line}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function getPackets(message) {
  return message
    .split("")
    .map((char, index) => ({ id: index + 1, payload: char }));
}

function randomDrop(chance) {
  return Math.random() < chance;
}

function setButtonsDisabled(disabled) {
  simulateTcpBtn.disabled = disabled;
  simulateUdpBtn.disabled = disabled;
  messageInput.disabled = disabled;
}

async function simulateTCP() {
  const message = messageInput.value.trim();
  if (!message) {
    writeLog("TCP: Please enter a message first.");
    return;
  }

  setButtonsDisabled(true);
  tcpStatusEl.textContent = "Status: Connecting (3-way handshake)...";
  writeLog("TCP: SYN ->");
  await wait(400);
  writeLog("TCP: <- SYN-ACK");
  await wait(400);
  writeLog("TCP: ACK -> Connection established");

  const packets = getPackets(message);
  let delivered = 0;
  let retransmitted = 0;

  tcpStatusEl.textContent = "Status: Sending packets reliably...";

  for (const packet of packets) {
    let sent = false;
    while (!sent) {
      writeLog(`TCP: Sending packet ${packet.id} ('${packet.payload}')`);
      await wait(250);

      if (randomDrop(0.2)) {
        retransmitted += 1;
        writeLog(`TCP: Packet ${packet.id} lost, retransmitting...`);
        await wait(250);
      } else {
        delivered += 1;
        sent = true;
        writeLog(`TCP: ACK received for packet ${packet.id}`);
      }
    }
  }

  writeLog("TCP: FIN ->");
  await wait(300);
  writeLog("TCP: <- ACK");
  await wait(300);
  tcpStatusEl.textContent = "Status: Completed";
  tcpSummaryEl.textContent = `Packets delivered: ${delivered}/${packets.length} | Retransmissions: ${retransmitted}`;
  tcpOutputEl.textContent = `Final output: ${message}`;
  tcpDeliveryCheckEl.textContent =
    delivered === packets.length
      ? "Delivery check: All packets delivered"
      : "Delivery check: Some packets were lost";

  setButtonsDisabled(false);
}

async function simulateUDP() {
  const message = messageInput.value.trim();
  if (!message) {
    writeLog("UDP: Please enter a message first.");
    return;
  }

  setButtonsDisabled(true);
  udpStatusEl.textContent = "Status: Sending datagrams (no handshake)...";

  const packets = getPackets(message);
  let delivered = 0;
  let dropped = 0;
  let finalOutput = "";

  for (const packet of packets) {
    writeLog(`UDP: Sending datagram ${packet.id} ('${packet.payload}')`);
    await wait(120);

    if (randomDrop(0.35)) {
      dropped += 1;
      writeLog(`UDP: Datagram ${packet.id} dropped`);
      finalOutput += "_";
    } else {
      delivered += 1;
      writeLog(`UDP: Datagram ${packet.id} delivered`);
      finalOutput += packet.payload;
    }
  }

  udpStatusEl.textContent = "Status: Completed";
  udpSummaryEl.textContent = `Packets delivered: ${delivered}/${packets.length} | Dropped: ${dropped}`;
  udpOutputEl.textContent = `Final output: ${finalOutput}`;
  udpDeliveryCheckEl.textContent =
    delivered === packets.length
      ? "Delivery check: All packets delivered"
      : "Delivery check: Packet loss detected";

  setButtonsDisabled(false);
}

function resetUI() {
  logEl.textContent = "";
  tcpStatusEl.textContent = "Status: Waiting";
  udpStatusEl.textContent = "Status: Waiting";
  tcpSummaryEl.textContent = "Packets delivered: 0";
  udpSummaryEl.textContent = "Packets delivered: 0";
  tcpOutputEl.textContent = "Final output: -";
  udpOutputEl.textContent = "Final output: -";
  tcpDeliveryCheckEl.textContent = "Delivery check: -";
  udpDeliveryCheckEl.textContent = "Delivery check: -";
}

simulateTcpBtn.addEventListener("click", simulateTCP);
simulateUdpBtn.addEventListener("click", simulateUDP);
resetBtn.addEventListener("click", resetUI);
