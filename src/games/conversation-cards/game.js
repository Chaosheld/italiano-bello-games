import { el, clear } from "../../core/ui.js";

/**
 * Base-URL für Assets & Content:
 * - WordPress Plugin setzt window.__IB_CC_BASE__ auf die Plugin-Asset-URL
 * - Lokal (Vite) fällt es auf /games/conversation-cards/ zurück
 *
 * Wichtig: BASE endet immer mit einem Slash.
 */
const PUBLIC_BASE = (window.__IB_PUBLIC_BASE__ || "/").replace(/\/?$/, "/");
const BASE = PUBLIC_BASE + "games/conversation-cards/";

const CARD_BACK_SRC = BASE + "assets/card_back_01.svg";
const CARD_SFX_SRC = BASE + "assets/sfx/card-flip.mp3";
const CONTENT_URL = BASE + "content.json";

const LEVEL_ICON = { beginner: "🌱", advanced: "🚀" };
const TOPIC_ICON = {
  casa: "🏠",
  vacanze: "🏖️",
  giornata: "🕒",
  cibo: "🍝",
  lavoro: "💼",
  viaggi: "✈️",
  relazioni: "👥",
  tecnologia: "👥",
  cultura: "🎭",
  scuola: "🎓",
  salute: "🧘",
  citta: "🏙️",
  routine: "🗓️",
  opinioni: "💬"
};

export class ConversationCards {
  constructor(rootEl, opts = {}) {
    this.root = rootEl;
    this.opts = opts;

    this.state = {
      content: null,
      levelId: null,
      topicId: null,
      deck: [],
      discard: [],
      showHelp: false
    };

    this.jitter = this.makeJitter(20);
    this.isAnimating = false;

    // Real SFX (local file)
    this.sfx = null;
  }

  async init() {
    this.root.classList.add("cc-wrap");
    await this.loadContent();

    if (this.opts.level) this.state.levelId = this.opts.level;
    if (this.opts.topic) this.state.topicId = this.opts.topic;

    // Preload SFX (won't autoplay; only plays after user gesture)
    this.initSfx();

    if (this.state.levelId && this.state.topicId) {
      this.startDeck();
      this.renderBoard();
    } else if (this.state.levelId) {
      this.renderTopicSelect();
    } else {
      this.renderHome();
    }
  }

  initSfx() {
    try {
      const a = new Audio(CARD_SFX_SRC);
      a.preload = "auto";
      a.volume = 0.65;
      this.sfx = a;
    } catch {
      this.sfx = null;
    }
  }

  playSfx() {
    if (!this.sfx) return;
    try {
      this.sfx.currentTime = 0;
      // play() may reject if browser blocks; we ignore silently
      this.sfx.play().catch(() => {});
    } catch {}
  }

  async loadContent() {
    const res = await fetch(CONTENT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Impossibile caricare content.json");
    this.state.content = await res.json();
  }

  renderShell(innerNode) {
    clear(this.root);

    const title = this.state.content.title || "Carte di conversazione";
    const topbar = el(
      "div",
      { class: "cc-topbar" },
      el(
        "div",
        { class: "cc-topbar-left" },
        el("h1", { class: "cc-title" }, title),
        el("div", { class: "cc-subtitle" }, "Conversazione")
      )
    );

    const body = el("div", { class: "cc-body" }, innerNode);
    this.root.append(topbar, body);
  }

  // ---------- Menus ----------
  renderHome() {
    const wrap = el(
      "div",
      {},
      el("h2", { class: "cc-h2" }, "Scegli il livello"),
      el("p", { class: "cc-sub" }, "Seleziona un livello e un tema. Poi pesca le carte dal mazzo.")
    );

    const grid = el("div", { class: "cc-grid" });

    this.state.content.levels.forEach((lvl) => {
      const icon = LEVEL_ICON[lvl.id] || "🎯";
      const btn = el(
        "button",
        { class: "cc-choice", type: "button" },
        el(
          "div",
          { class: "cc-choice-row" },
          el("div", { class: "cc-choice-title" }, `${icon} ${lvl.label}`),
          el("div", { class: "cc-choice-meta" }, `${lvl.topics.length} temi`)
        )
      );

      btn.addEventListener("click", () => {
        this.state.levelId = lvl.id;
        this.state.topicId = null;
        this.renderTopicSelect();
      });

      grid.append(btn);
    });

    wrap.append(grid);
    this.renderShell(wrap);
  }

  renderTopicSelect() {
    const lvl = this.getLevel();

    const back = el("button", { class: "cc-btn", type: "button" }, "← Menu");
    back.addEventListener("click", () => this.renderHome());

    const wrap = el(
      "div",
      {},
      back,
      el("h2", { class: "cc-h2", style: "margin-top:12px;" }, "Scegli un tema"),
      el("p", { class: "cc-sub" }, "Le carte sono mescolate automaticamente.")
    );

    const grid = el("div", { class: "cc-grid" });

    lvl.topics.forEach((t) => {
      const icon = TOPIC_ICON[t.id] || "🗂️";
      const btn = el(
        "button",
        { class: "cc-choice", type: "button" },
        el(
          "div",
          { class: "cc-choice-row" },
          el("div", { class: "cc-choice-title" }, `${icon} ${t.label}`),
          el("div", { class: "cc-choice-meta" }, `${t.cards.length} carte`)
        )
      );

      btn.addEventListener("click", () => {
        this.state.topicId = t.id;
        this.startDeck();
        this.renderBoard();
      });

      grid.append(btn);
    });

    wrap.append(grid);
    this.renderShell(wrap);
  }

  // ---------- Board ----------
  renderBoard() {
    const lvl = this.getLevel();
    const topic = this.getTopic();

    const headerRow = el(
      "div",
      { class: "cc-headerrow" },
      el("div", { class: "cc-kickerline" }, `${lvl.label} · ${topic.label}`),
      el(
        "div",
        { class: "cc-head-actions" },
        this.headBtn("← Temi", () => this.renderTopicSelect()),
        this.headBtn("↻ Ricomincia", () => {
          this.startDeck();
          this.renderBoard();
        }),
        this.headBtn("☰ Menu", () => this.renderHome())
      )
    );

    const slots = el("div", { class: "cc-slots" });

    const drawVisible = Math.min(this.state.deck.length, 20);
    const discardVisible = Math.min(this.state.discard.length, 20);

    // LEFT
    const leftSlot = el("div", { class: "cc-slot" });
    const deckBtn = el("button", { class: "cc-slotbtn", type: "button" });
    deckBtn.addEventListener("click", () => this.drawNextAnimated());

    const deckStack = el("div", { class: "cc-stack", "data-stack": "left" }, ...this.buildBackStack(drawVisible));
    const leftMeta = el(
      "div",
      { class: "cc-slotmeta" },
      el("div", { class: "cc-slotlabel" }, "Mazzo"),
      el("div", { class: "cc-slotsub" }, this.state.deck.length ? "Clicca sul mazzo per pescare" : "Mazzo finito"),
      el("div", { class: "cc-slotcount" }, `Rimaste: ${this.state.deck.length}`)
    );

    deckBtn.append(deckStack);
    leftSlot.append(deckBtn, leftMeta);

    // RIGHT
    const rightSlot = el("div", { class: "cc-slot" });
    const discardWrap = el("div", { class: "cc-slotbtn cc-slotbtn-passive" });
    const discardStack = el("div", { class: "cc-stack", "data-stack": "right" }, ...this.buildFaceStack(discardVisible));

    const top = this.state.discard[0] || null;
    const rightMeta = el(
      "div",
      { class: "cc-slotmeta" },
      el("div", { class: "cc-slotlabel" }, "Carte pescate"),
      el("div", { class: "cc-slotsub" }, top ? "Carta attuale" : "In attesa della prima carta"),
      el("div", { class: "cc-slotcount" }, `Viste: ${this.state.discard.length}`)
    );

    discardWrap.append(discardStack);
    rightSlot.append(discardWrap, rightMeta);

    slots.append(leftSlot, rightSlot);

    // BELOW
    const below = el("div", { class: "cc-below" });

    const helpBtn = el(
      "button",
      { class: "cc-helpbtn", type: "button" },
      this.state.showHelp ? "Nascondi aiuto" : "Aiuto linguistico"
    );
    helpBtn.disabled = !top;
    helpBtn.addEventListener("click", () => {
      this.state.showHelp = !this.state.showHelp;
      this.renderBoard();
    });

    //const stats = el("div", { class: "cc-progress" }, `Rimaste: ${this.state.deck.length} · Viste: ${this.state.discard.length}`);
    //below.append(helpBtn, stats);
    below.append(helpBtn);

    const wrap = el("div", {}, headerRow, slots, below);
    if (this.state.showHelp && top && top.help) wrap.append(this.helpPanel(top.help));

    this.renderShell(wrap);
    this.applyStackTransforms();
  }

  // ---------- Animated draw: fly + real flip (back->front text) ----------
  async drawNextAnimated() {
    if (this.isAnimating) return;

    if (this.state.deck.length === 0) {
      this.renderEnd();
      return;
    }

    this.isAnimating = true;

    const nextCard = this.state.deck[0];
    this.playSfx();

    const leftStack = this.root.querySelector('[data-stack="left"]');
    const rightStack = this.root.querySelector('[data-stack="right"]');

    if (!leftStack || !rightStack || !nextCard) {
      this.drawNextImmediate();
      return;
    }

    const startRect = leftStack.getBoundingClientRect();
    const endRect = rightStack.getBoundingClientRect();

    const w = Math.min(startRect.width, endRect.width);
    const h = Math.min(startRect.height, endRect.height);

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    const fly = el("div", { class: "cc-flycard" },
      el("div", { class: "cc-flyinner" },
        el("div", { class: "cc-flyface cc-flyback" },
          el("img", { class: "cc-cardimg", src: CARD_BACK_SRC, alt: "" })
        ),
        el("div", { class: "cc-flyface cc-flyfront" },
          el("div", { class: "cc-cardface" },
            el("div", { class: "cc-cardcontent" },
              el("div", { class: "cc-q" }, nextCard.q)
            )
          )
        )
      )
    );
    document.body.appendChild(fly);

    fly.style.width = `${w}px`;
    fly.style.height = `${h}px`;
    fly.style.left = `${startX - w / 2}px`;
    fly.style.top = `${startY - h / 2}px`;

    fly.getBoundingClientRect();

    fly.classList.add("is-flying");
    fly.style.left = `${endX - w / 2}px`;
    fly.style.top = `${endY - h / 2}px`;

    await this.sleep(190);
    fly.classList.add("is-flipped");

    await this.sleep(210);
    const next = this.state.deck.shift();
    this.state.discard.unshift(next);
    this.state.showHelp = false;
    this.renderBoard();

    await this.sleep(120);
    fly.classList.add("is-fading");
    await this.sleep(120);
    fly.remove();

    this.isAnimating = false;
  }

  drawNextImmediate() {
    const next = this.state.deck.shift();
    this.state.discard.unshift(next);
    this.state.showHelp = false;
    this.renderBoard();
    this.isAnimating = false;
  }

  // ---------- stacks ----------
  buildBackStack(n) {
    if (n === 0) {
      return [
        el("div", { class: "cc-dropzone" },
          el("div", { class: "cc-dropzone-title" }, "Mazzo vuoto"),
          el("div", { class: "cc-dropzone-sub" }, "Clicca per vedere il riepilogo.")
        )
      ];
    }

    const cards = [];
    for (let depth = n - 1; depth >= 0; depth--) {
      const layer = Math.min(depth, 19);
      cards.push(
        el("div", { class: "cc-layer", "data-layer": String(layer) },
          el("img", { class: "cc-cardimg", src: CARD_BACK_SRC, alt: "" })
        )
      );
    }
    return cards;
  }

  buildFaceStack(n) {
    const top = this.state.discard[0] || null;

    if (!top) {
      return [
        el("div", { class: "cc-dropzone" },
          el("div", { class: "cc-dropzone-title" }, "Carta pescata"),
          el("div", { class: "cc-dropzone-sub" }, "Qui apparirà la carta.")
        )
      ];
    }

    const cards = [];
    const count = Math.max(1, n);

    for (let depth = count - 1; depth >= 0; depth--) {
      const layer = Math.min(depth, 19);

      if (depth === 0) {
        cards.push(
          el("div", { class: "cc-layer", "data-layer": String(layer), "data-top": "1" },
            el("div", { class: "cc-cardface" },
              el("div", { class: "cc-cardcontent" },
                el("div", { class: "cc-q" }, top.q)
              )
            )
          )
        );
      } else {
        cards.push(
          el("div", { class: "cc-layer", "data-layer": String(layer) },
            el("div", { class: "cc-cardface cc-blank" }, "")
          )
        );
      }
    }

    return cards;
  }

  // ---------- transforms ----------
  makeJitter(n) {
    const out = [];
    const rand = (min, max) => min + Math.random() * (max - min);

    for (let depth = 0; depth < n; depth++) {
      const side = depth % 2 === 0 ? -1 : 1;
      const baseY = depth * 2.6;
      const baseX = side * (depth * 0.18);

      const rot = side * rand(0.35, 1.2);
      const x = baseX + side * rand(0.3, 1.6);
      const y = baseY + rand(0.2, 1.2);

      out.push({ rot, x, y });
    }

    out[0] = { rot: 0, x: 0, y: 0 };
    return out;
  }

  applyStackTransforms() {
    const nodes = this.root.querySelectorAll(".cc-layer[data-layer]");
    nodes.forEach((node) => {
      const depth = parseInt(node.getAttribute("data-layer"), 10);
      const j = this.jitter[depth] || { rot: 0, x: 0, y: 0 };

      node.style.zIndex = String(1000 - depth);

      if (node.getAttribute("data-top") === "1") {
        node.style.setProperty("--jx", `0px`);
        node.style.setProperty("--jy", `0px`);
        node.style.setProperty("--jrot", `0deg`);
        return;
      }

      node.style.setProperty("--jx", `${j.x}px`);
      node.style.setProperty("--jy", `${j.y}px`);
      node.style.setProperty("--jrot", `${j.rot}deg`);
    });
  }

  // ---------- help panel ----------
  helpPanel(help) {
    return el("div", { class: "cc-help" },
      el("div", { class: "cc-help-title" }, "Aiuto linguistico"),
      el("div", { class: "cc-help-grid" },
        this.helpBlock("Frasi utili", help.starter),
        this.helpBlock("Strutture", help.structures),
        this.helpBlock("Parole chiave", help.lexicon)
      )
    );
  }

  helpBlock(title, items = []) {
    const listItems = (items || []).filter(Boolean);
    return el("div", { class: "cc-help-block" },
      el("h4", {}, title),
      listItems.length
        ? el("ul", {}, ...listItems.map((s) => el("li", {}, s)))
        : el("div", { class: "cc-muted" }, "—")
    );
  }

  headBtn(label, onClick) {
    const b = el("button", { class: "cc-headbtn", type: "button" }, label);
    b.addEventListener("click", onClick);
    return b;
  }

  // ---------- End screen ----------
  renderEnd() {
    const lvl = this.getLevel();
    const topic = this.getTopic();

    const again = el("button", { class: "cc-btn primary", type: "button" }, "Ricomincia (mescola) ↻");
    again.addEventListener("click", () => {
      this.startDeck();
      this.renderBoard();
    });

    const topics = el("button", { class: "cc-btn", type: "button" }, "Cambia tema");
    topics.addEventListener("click", () => this.renderTopicSelect());

    const home = el("button", { class: "cc-btn", type: "button" }, "Menu iniziale");
    home.addEventListener("click", () => this.renderHome());

    const node = el(
      "div",
      { class: "cc-end" },
      el("div", { class: "cc-stars" }, "⭐⭐⭐"),
      el("h2", { class: "cc-h2" }, "Ottimo lavoro!"),
      el("p", { class: "cc-sub" }, `Hai completato tutte le carte: ${lvl.label} · ${topic.label}`),
      el("div", { class: "cc-controls", style: "justify-content:center;" }, again, topics, home)
    );

    this.renderShell(node);
  }

  // ---------- State ----------
  startDeck() {
    const topic = this.getTopic();
    this.state.deck = shuffle([...topic.cards]);
    this.state.discard = [];
    this.state.showHelp = false;
  }

  getLevel() {
    const lvl = this.state.content.levels.find((l) => l.id === this.state.levelId);
    if (!lvl) throw new Error("Livello non trovato");
    return lvl;
  }

  getTopic() {
    const lvl = this.getLevel();
    const topic = lvl.topics.find((t) => t.id === this.state.topicId);
    if (!topic) throw new Error("Tema non trovato");
    return topic;
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
