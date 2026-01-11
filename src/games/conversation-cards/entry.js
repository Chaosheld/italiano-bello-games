import "./style.css";
import { ConversationCards } from "./game.js";

function boot() {
  document.querySelectorAll(".ib-conversation-cards").forEach((node) => {
    const level = node.dataset.level || "";
    const topic = node.dataset.topic || "";
    const game = new ConversationCards(node, { level, topic });
    game.init();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
