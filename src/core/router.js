import { ConversationCards } from "../games/conversation-cards/game.js";

const registry = {
  "conversation-cards": ConversationCards
};

export function mountGame(rootEl, gameId, opts = {}) {
  const Game = registry[gameId];
  if (!Game) {
    rootEl.innerHTML = `<div style="padding:12px;border:1px solid #ccc;">Unknown game: ${gameId}</div>`;
    return;
  }
  const game = new Game(rootEl, opts);
  game.init();
}
