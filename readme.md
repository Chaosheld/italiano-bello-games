# Italiano Bello – Mini-Games für Italienisch als Fremdsprache 🇮🇹🎮

Dieses Repository enthält eine wachsende Sammlung von **interaktiven Mini-Games zum spielerischen Erlernen von Italienisch als Fremdsprache (A1–B2)**.

Die Spiele werden auf der Lernplattform **Italiano Bello** eingesetzt und richten sich sowohl an **Lernende** als auch an **Lehrkräfte**, insbesondere für den Einsatz im Unterricht.

---

## 🎯 Ziel des Projekts

Ziel dieses Projekts ist es, eine **modulare, erweiterbare Sammlung von Lernspielen** zu entwickeln, die:

- spielerisch verschiedene sprachliche Kompetenzen trainieren  
  (z. B. Konversation, Wortschatz, Grammatik)
- **didaktisch sinnvoll** aufgebaut sind
- ihre Inhalte vollständig über **JSON-Dateien** beziehen
- kostenlos nutzbar sind
- **ohne externe Dienste** oder kostenpflichtige Abhängigkeiten auskommen
- über ein **WordPress-Plugin** deployt werden
- flexibel per **Shortcode** in Beiträge und Seiten eingebunden werden können

Langfristig soll dieses Repository mehrere unterschiedliche Spiele enthalten, die alle einer gemeinsamen technischen und gestalterischen Struktur folgen.

---

## 🧩 Enthaltene Spiele

### Conversation Cards – Konversationskarten

Ein Spiel zur Förderung des **freien Sprechens auf Italienisch**, besonders geeignet für den Unterricht sowie für selbstständiges Lernen.

**Funktionen:**
- Auswahl eines **Niveaus** (z. B. Anfänger, Fortgeschrittene)
- Auswahl eines **Themenbereichs** (z. B. Urlaub, Alltag, Zuhause)
- Ein gemischter Kartenstapel mit offenen Fragen auf Italienisch
- Karten werden einzeln gezogen und aufgedeckt
- Optionaler **Hilfebereich** mit:
  - Satzanfängen
  - typischen Strukturen
  - Wortschatzimpulsen
- Abschlussbildschirm nach der letzten Karte

**Didaktischer Fokus:**  
Freies Sprechen, Aktivierung von Wortschatz, Gesprächsimpulse ohne festen Dialog.

---

## 🗂 Projektstruktur (vereinfacht)

```text
/
├─ src/
│  ├─ core/                    # gemeinsame Utilities
│  └─ games/
│     └─ conversation-cards/
│        ├─ game.js            # Spiellogik
│        ├─ style.css          # Spiel-spezifisches Styling
│        ├─ content.json       # Inhalte (Fragen, Hilfen, Themen)
│        └─ assets/            # Kartenrückseite, Sounds, etc.
│
├─ wordpress/
│  └─ italiano-bello-games/    # WordPress-Plugin
│
├─ vite.config.js
└─ README.md
```

---

## 🔌 WordPress-Integration

Alle Spiele werden über ein WordPress-Plugin eingebunden.

### Shortcode-Prinzip

Beispiel für das Konversationsspiel:

<code>[ib_conversation_cards]</code>

Optional: Vorselektierung

<code>[ib_conversation_cards level="beginner" topic="vacanze"]</code>


So können gezielt thematische Unterrichtsbeiträge oder Lernseiten erstellt werden.
