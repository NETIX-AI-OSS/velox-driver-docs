"use strict";

// Documentation only: this script has no device connection or control API.
const frames = {
  reply08: ["02", "00", "28", "00", "01", "00", "29", "03"],
  reply48: ["02", "00", "68", "00", "01", "00", "69", "03"],
  request08: ["02", "00", "08", "00", "01", "00", "09", "03"],
  request48: ["02", "00", "48", "00", "01", "00", "49", "03"],
};
const byteNames = [
  "STX",
  "LENGTH",
  "FLAG",
  "ADDR H",
  "ADDR L",
  "SUM H",
  "SUM L",
  "ETX",
];
const byteDescriptions = [
  "Start of text. This unescaped byte begins a new frame.",
  "L = 0: an empty envelope, eight decoded bytes in total. No application records are present.",
  "The captured replies use 28 or 68. Host polls use 08 or 48. This distinguishes these replies from byte-identical request echoes; the implementation does not enforce these reply flags.",
  "The high address byte is zero in this captured address-1 session.",
  "The low address byte is 01, selecting panel address 1.",
  "High byte of the 16-bit additive checksum. The sum fits in one byte for these empty frames.",
  "Low byte of the additive sum of the length, flag, and two address bytes.",
  "End of text. An unescaped 03 completes the frame.",
];
let selectedByte = 2;
const choice = document.querySelector("#frame-choice");
const strip = document.querySelector("#byte-strip");
function renderFrame() {
  const values = frames[choice.value];
  strip.replaceChildren();
  values.forEach((value, index) => {
    const button = document.createElement("button");
    button.className = "byte";
    button.type = "button";
    button.setAttribute("aria-pressed", String(index === selectedByte));
    button.setAttribute(
      "aria-label",
      `Offset ${index}, ${byteNames[index]}, hex ${value}`,
    );
    const strong = document.createElement("strong");
    strong.textContent = value;
    const label = document.createElement("span");
    label.textContent = byteNames[index];
    button.append(strong, label);
    button.addEventListener("click", () => {
      selectedByte = index;
      renderFrame();
      strip.children[index].focus();
    });
    strip.append(button);
  });
  const heading = document.createElement("strong");
  heading.textContent = `Offset ${selectedByte} · ${byteNames[selectedByte]} · 0x${values[selectedByte]}`;
  const description = document.createElement("p");
  description.textContent = byteDescriptions[selectedByte];
  document.querySelector("#byte-detail").replaceChildren(heading, description);
  document.querySelector("#checksum-equation").textContent =
    `00 + ${values[2]} + 00 + 01 = 00${values[6]}`;
}
choice.addEventListener("change", renderFrame);
renderFrame();

const phases = [
  {
    label: "Startup",
    title: "Open is not yet online.",
    text: "The port opens and a receiver starts. No status snapshot is acquired. Points exist only if configured by the application; any initial value is a local assumption.",
    states: ["online: false", "point: not observed", "faults: not observed"],
  },
  {
    label: "Poll reply",
    title: "A response establishes reachability.",
    text: "A matching non-echo reply completes the transaction and sets online. Empty replies contain no events and say nothing about whether the panel has an active alarm.",
    states: ["online: true", "point: unchanged", "records: 0"],
  },
  {
    label: "Prealarm",
    title: "An active event changes one point.",
    text: "Illustrative event: occurrence 1 for a configured loop/device with detector type 6 or 7 sets prealarm. An unsolicited event can do this without changing the online flag.",
    states: ["occurrence: 1 active", "point: prealarm", "evidence: simulated"],
  },
  {
    label: "Fire",
    title: "Fire may arrive directly.",
    text: "Illustrative event: active occurrence 2 changes the configured point to alarm. The single status slot overwrites its prior value; there is no requirement for a preceding prealarm.",
    states: ["occurrence: 2 active", "point: alarm", "evidence: simulated"],
  },
  {
    label: "Silence",
    title: "Silence leaves the alarm cached.",
    text: "An explicit command waits for a correlated reply. Outcome 2 is accepted; other outcomes raise a rejection. No sounder state is tracked, and this physical command exchange remains unverified.",
    states: [
      "point: alarm (unchanged)",
      "sounder: untracked",
      "auto-retry: none",
    ],
  },
  {
    label: "Restore / reset",
    title: "A local clear needs context.",
    text: "An inactive supported point event returns its status to normal. Accepted reset, or button indication code 5, clears local points and faults. That does not prove the physical condition cleared; later events can reassert it.",
    states: [
      "point: normal (local)",
      "faults: cleared on reset",
      "evidence: simulated",
    ],
  },
  {
    label: "Power fault",
    title: "Panel faults have separate flags.",
    text: "Illustrative active occurrence 19 sets battery-missing. A reset followed by this event ends with that fault active, matching the order in the JACE application-log transcription. Supply fault is occurrence 18.",
    states: ["fault[19]: true", "point: unchanged", "evidence: model / log"],
  },
  {
    label: "Offline / recover",
    title: "Reachability and state age diverge.",
    text: "A poll timeout marks the panel offline while cached values remain. Read failure additionally triggers reconnect. A new response can re-establish online, but no missed-event history or complete status snapshot is recovered.",
    states: [
      "online: false → true",
      "cached values: may be stale",
      "event catch-up: absent",
    ],
  },
];
const phaseButtons = document.querySelector("#phase-buttons");
function setPhase(index) {
  [...phaseButtons.children].forEach((b, i) =>
    b.setAttribute("aria-pressed", String(i === index)),
  );
  const phase = phases[index];
  const title = document.createElement("h3");
  title.textContent = phase.title;
  const text = document.createElement("p");
  text.textContent = phase.text;
  const chips = document.createElement("div");
  chips.className = "state-chips";
  phase.states.forEach((value) => {
    const span = document.createElement("span");
    span.textContent = value;
    chips.append(span);
  });
  document.querySelector("#phase-detail").replaceChildren(title, text, chips);
}
phases.forEach((phase, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = phase.label;
  button.addEventListener("click", () => setPhase(index));
  phaseButtons.append(button);
});
setPhase(0);

function wireRow(label, bytes) {
  const row = document.createElement("div");
  row.className = `wire-row ${label.toLowerCase()}`;
  const key = document.createElement("span");
  key.textContent = label;
  const code = document.createElement("code");
  code.textContent = bytes.toUpperCase();
  row.append(key, code);
  return row;
}
async function loadReplies() {
  try {
    const response = await fetch("evidence/poll-replies.json");
    if (!response.ok) throw new Error(`Capture fetch: ${response.status}`);
    const capture = await response.json();
    const grid = document.querySelector("#reply-grid");
    grid.replaceChildren();
    capture.records
      .filter((record) => record.featured)
      .forEach((record) => {
        const card = document.createElement("article");
        card.className = "reply-card";
        const header = document.createElement("header");
        const heading = document.createElement("h3");
        heading.textContent = `REPLY 0${record.id}`;
        const badge = document.createElement("span");
        badge.className = "tag live";
        badge.textContent = "PHYSICAL CAPTURE";
        header.append(heading, badge);
        const source = document.createElement("p");
        source.className = "reply-source";
        source.textContent =
          record.source === "python_driver"
            ? "Python driver · bus transaction"
            : "Original-JAR bytes · direct replay";
        const verdict = document.createElement("p");
        verdict.className = "verdict";
        verdict.textContent =
          "Address 1 · checksum valid · 0 application records";
        const time = document.createElement("time");
        if (record.rx_logged_at_utc) {
          time.dateTime = record.rx_logged_at_utc;
          time.textContent = `${record.rx_logged_at_utc.replace("T", " · ").replace("Z", " UTC")}`;
        } else {
          time.textContent = `23 OCT 2026 · RX at +${record.rx_offset_seconds.toFixed(6)} s · ${record.response_delay_ms.toFixed(3)} ms after TX`;
        }
        card.append(
          header,
          source,
          wireRow("TX", record.tx),
          wireRow("RX", record.rx),
          verdict,
          time,
        );
        grid.append(card);
      });
  } catch (error) {
    // Keep the initial direct download link available if fetch is unavailable.
    console.error("Unable to render captured replies", error);
  }
}
loadReplies();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (!visible.length) return;
      const current = visible[0].target.id;
      document.querySelectorAll(".sidebar nav a").forEach((link) => {
        if (link.getAttribute("href") === `#${current}`)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-18% 0px -65% 0px" },
  );
  document
    .querySelectorAll("main section")
    .forEach((section) => observer.observe(section));
}
