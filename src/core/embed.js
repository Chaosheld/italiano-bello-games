import { mountGame } from "./router.js";

export function autoMount() {
  const nodes = document.querySelectorAll("[data-game]");
  nodes.forEach((node) => {
    const gameId = node.getAttribute("data-game");
    const opts = {
      level: node.getAttribute("data-level") || null,
      topic: node.getAttribute("data-topic") || null
    };
    mountGame(node, gameId, opts);
  });
}
