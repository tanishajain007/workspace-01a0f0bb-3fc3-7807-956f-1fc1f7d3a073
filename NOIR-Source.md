# NOIR — Complete source code

The four required runtime files are reproduced below, in full and without minification. Save them together using the exact filenames shown, then open **index.html** in a modern browser. No installation, build step, server, or internet connection is required.

## Playing

Click/tap a piece and a marked square, or drag it. Tab into the board and use the arrow keys and Enter/Space to play by keyboard. Escape cancels a selection or promotion. New game confirms before clearing an active game; Undo restores the entire previous state; Flip changes only the view. Threefold repetition and the fifty-move rule use the verified **Claim a draw** control.


## index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f6f6f4">
  <meta name="description" content="An elegant, offline chess game for two players. Standard rules, full-state undo, and no distractions.">
  <title>NOIR — The chess room</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Cpath fill=%27%23242424%27 d=%27M2 2h19v19H2z%27/%3E%3Cpath fill=%27white%27 stroke=%27%23242424%27 d=%27M12 12h19v19H12z%27/%3E%3C/svg%3E">
  <link rel="stylesheet" href="styles.css">
  <script src="engine.js" defer></script>
  <script src="app.js" defer></script>
</head>
<body>
  <svg class="icon-definitions" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <symbol id="icon-undo" viewBox="0 0 24 24"><path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12"/></symbol>
      <symbol id="icon-flip" viewBox="0 0 24 24"><path d="M5 7h14l-4-4M19 17H5l4 4M19 7l-4 4M5 17l4-4"/></symbol>
      <symbol id="icon-new" viewBox="0 0 24 24"><path d="M19 8a8 8 0 1 0 1 8M19 3v5h-5"/></symbol>
      <symbol id="icon-book" viewBox="0 0 24 24"><path d="M12 6c-3-3-6-3-9-2v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 2Zm0 0v15"/></symbol>
      <symbol id="icon-close" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></symbol>
      <symbol id="icon-arrow" viewBox="0 0 24 24"><path d="M4 12h16m-6-6 6 6-6 6"/></symbol>
      <symbol id="icon-hand" viewBox="0 0 24 24"><path d="m9 13-2-2c-2-2-4 0-2 2l5 7h7l4-8c1-2-2-3-3-1V9c0-2-3-2-3 0V7c0-2-3-2-3 0v5-8c0-2-3-2-3 0v9Z"/></symbol>
    </defs>
  </svg>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#main" aria-label="NOIR, the chess room — skip to the game">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i></span>
        <span class="brand-name">NOIR<span class="brand-subtitle">THE CHESS ROOM</span></span>
      </a>
      <div class="header-right">
        <span class="local-label"><span class="two-player-icon" aria-hidden="true">◐</span> TWO PLAYERS. ONE BOARD.</span>
        <button class="help-button" id="helpButton" type="button" aria-label="How to play"><svg class="icon"><use href="#icon-book"/></svg><span>How to play</span></button>
      </div>
    </div>
  </header>

  <main id="main" tabindex="-1">
    <section class="intro" aria-labelledby="pageTitle">
      <div><p class="eyebrow">THE ORIGINAL GAME OF STRATEGY</p><h1 id="pageTitle">Your next move.</h1><p class="intro-copy">A classic game. A worthy opponent. Just across the board.</p></div>
      <div class="intro-aside"><span class="small-rule"></span><p>Leave the rush behind.<br><em>Let the game unfold.</em></p></div>
    </section>

    <div class="workspace">
      <section class="board-panel" aria-label="Chessboard and players">
        <div class="player-strip" id="topPlayer"></div>
        <div class="board-frame">
          <div class="rank-labels" id="rankLabels" aria-hidden="true"></div>
          <div class="board" id="board" role="grid" aria-label="Chessboard, White at the bottom" aria-rowcount="8" aria-colcount="8" aria-describedby="boardInstructions"></div>
          <span class="axis-corner" aria-hidden="true">◇</span>
          <div class="file-labels" id="fileLabels" aria-hidden="true"></div>
        </div>
        <div class="player-strip" id="bottomPlayer"></div>
        <div class="board-note"><svg class="icon"><use href="#icon-hand"/></svg><span id="boardHint">Choose a piece, then a destination.</span><span class="keyboard-hint"><kbd>↵</kbd> to select</span></div>
        <p id="boardInstructions" class="sr-only">Select a piece, then a legal destination, or drag a piece. Use arrow keys to navigate, Enter or Space to select, and Escape to clear your selection. Only the player whose turn it is may move. Legal destinations are marked with dots or capture rings.</p>
      </section>

      <section class="position-card" aria-label="Current game status">
        <div class="card-eyebrow"><span class="phase-label" id="phaseLabel"><span class="status-dot"></span> IN PROGRESS</span><span class="turn-number" id="turnNumber" aria-label="Move number 1">01</span></div>
        <div class="position-title"><span id="turnSymbol" aria-hidden="true"></span><h2 id="positionHeading">White to move</h2></div>
        <p class="status-copy" id="statusText">The board is set. Make the first move.</p>
        <div class="position-detail"><span class="detail-label" id="detailLabel">LAST MOVE</span><span id="statusDetail">—</span></div>
        <button class="claim-button" id="claimDraw" type="button" hidden>Claim a draw <svg class="icon"><use href="#icon-arrow"/></svg></button>
      </section>

      <section class="history-card" aria-labelledby="historyTitle">
        <div class="history-header"><h2 id="historyTitle">The score sheet</h2><span class="history-count" id="moveCount" aria-label="No moves played">0</span></div>
        <div class="history-scroll" id="historyScroll" tabindex="0" aria-label="Move history; scroll to review earlier moves">
          <table class="move-table" aria-label="Move history in standard algebraic notation">
            <thead><tr><th scope="col">№</th><th scope="col">WHITE</th><th scope="col">BLACK</th></tr></thead>
            <tbody id="moveBody"></tbody>
          </table>
          <div class="history-empty" id="historyEmpty"><span id="emptyPiece" aria-hidden="true"></span><p>The opening is yours.</p><span>Every move tells a story.<br>Yours will be recorded here.</span></div>
        </div>
        <div class="score-footer"><span class="notation-label" id="notationLabel">STANDARD ALGEBRAIC NOTATION</span><span id="gameScore" class="game-score" aria-label="Game result"></span></div>
      </section>

      <section class="game-controls" aria-label="Game controls">
        <div class="utility-controls">
          <button class="secondary-button" id="undoMove" type="button" disabled title="Restore the full previous game state"><svg class="icon"><use href="#icon-undo"/></svg><span>Undo move</span></button>
          <button class="secondary-button" id="flipBoard" type="button" aria-pressed="false" title="Change the view without changing the position"><svg class="icon"><use href="#icon-flip"/></svg><span>Flip board</span></button>
        </div>
        <button class="primary-button new-game-button" id="newGame" type="button"><svg class="icon"><use href="#icon-new"/></svg><span>New game</span><span class="button-end" aria-hidden="true">↗</span></button>
        <p class="controls-note">No clocks. No distractions. Just chess.</p>
      </section>
    </div>

    <footer class="page-footer"><span>A BOARD FOR TWO.</span><p>Click, tap, or drag. <em>Take your time.</em></p><span class="footer-square" aria-hidden="true">◆</span></footer>
  </main>

  <div class="sr-only" id="announcement" role="status" aria-live="polite" aria-atomic="true"></div>
  <div class="drag-ghost" id="dragGhost" aria-hidden="true" hidden></div>

  <dialog class="game-dialog promotion-dialog" id="promotionDialog" aria-labelledby="promotionTitle" aria-describedby="promotionDescription">
    <button class="dialog-close" id="promotionClose" type="button" aria-label="Cancel promotion"><svg class="icon"><use href="#icon-close"/></svg></button>
    <p class="eyebrow">A PAWN'S NEW CHAPTER</p><h2 id="promotionTitle">Choose your piece.</h2><p id="promotionDescription">Your pawn has reached the final rank. Promote it to one of these four pieces.</p>
    <div class="promotion-options" id="promotionOptions"></div>
    <p class="dialog-footnote">The move is not made until you choose. <kbd>Esc</kbd> cancels.</p>
  </dialog>

  <dialog class="game-dialog" id="newGameDialog" aria-labelledby="newGameTitle" aria-describedby="newGameDescription">
    <button class="dialog-close" id="newGameClose" type="button" aria-label="Keep playing"><svg class="icon"><use href="#icon-close"/></svg></button>
    <p class="eyebrow">A FRESH START</p><h2 id="newGameTitle">Begin again?</h2><p id="newGameDescription">This game is still in progress. Starting a new one will clear the board, captures, and score sheet.</p>
    <div class="dialog-actions"><button class="secondary-button" id="keepPlaying" type="button">Keep playing</button><button class="primary-button" id="confirmNewGame" type="button">New game</button></div>
  </dialog>

  <dialog class="game-dialog help-dialog" id="helpDialog" aria-labelledby="helpTitle">
    <button class="dialog-close" id="helpClose" type="button" aria-label="Close instructions"><svg class="icon"><use href="#icon-close"/></svg></button>
    <p class="eyebrow">MAKE YOURSELF AT HOME</p><h2 id="helpTitle">Pick. Place. Play.</h2><p>A standard game of chess for two people sharing this device. White moves first.</p>
    <ol class="help-list">
      <li><span>01</span><div><h3>Find your next move</h3><p>Click or tap your piece, then a marked square. You can also drag and drop. Dots mark moves; rings mark captures. A dashed king outline and “!” mean check.</p></div></li>
      <li><span>02</span><div><h3>At your fingertips</h3><p>Tab into the board. <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> navigate; <kbd>Enter</kbd> or <kbd>Space</kbd> select. <kbd>Home</kbd>/<kbd>End</kbd> reach the row edges; add <kbd>Ctrl</kbd> for the board edges. <kbd>Esc</kbd> cancels.</p></div></li>
      <li><span>03</span><div><h3>The complete game</h3><p>Castling, en passant, and all four promotions are included. Illegal moves never change the position. Undo restores everything, including special-move rights and draw counters. Flip only changes your view.</p></div></li>
      <li><span>04</span><div><h3>When the game is drawn</h3><p>Stalemate and insufficient material end the game automatically. Threefold repetition and fifty moves by each player without a pawn move or capture allow a draw claim. The claim button also supports a declared next move. Fivefold repetition and seventy-five such moves are automatic draws; checkmate takes precedence.</p></div></li>
    </ol>
    <button class="primary-button full-width" id="helpDone" type="button">Back to the board <svg class="icon"><use href="#icon-arrow"/></svg></button>
  </dialog>

  <dialog class="game-dialog claim-dialog" id="claimDialog" aria-labelledby="claimTitle" aria-describedby="claimDescription">
    <button class="dialog-close" id="claimClose" type="button" aria-label="Cancel draw claim"><svg class="icon"><use href="#icon-close"/></svg></button>
    <p class="eyebrow">AN HONOURABLE FINISH</p><h2 id="claimTitle">Claim a draw.</h2><p id="claimDescription"></p>
    <button class="primary-button full-width" id="claimCurrent" type="button" hidden>Claim this position</button>
    <div id="intendedClaimSection" hidden><h3 class="claim-section-title" id="claimMoveTitle">Or declare a move</h3><div class="claim-options" id="claimOptions"></div><p class="dialog-footnote">A declared move ends the game before it is played. The position and score sheet stay unchanged.</p></div>
  </dialog>
  <noscript><div class="noscript-message">This chess game needs JavaScript. Please enable it in your browser to play.</div></noscript>
</body>
</html>

```


## styles.css

```css
/* NOIR — a deliberately monochrome, responsive chess room. */
:root {
  --ink: #242424;
  --muted: #6c6c6c;
  --paper: #f5f5f5;
  --card: #ffffff;
  --line: #dfdfdf;
  --light-square: #e8e8e8;
  --dark-square: #858585;
  --serif: Georgia, 'Times New Roman', serif;
  --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--sans); font-size: 14px; -webkit-font-smoothing: antialiased; }
button, a, input { -webkit-tap-highlight-color: transparent; }
button { font: inherit; cursor: pointer; }
button:disabled { cursor: not-allowed; }
button, dialog { color: var(--ink); }
button:focus-visible, a:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; }
[hidden] { display: none !important; }
.icon-definitions { position: absolute; width: 0; height: 0; overflow: hidden; }
.icon { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; flex: 0 0 auto; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.site-header { background: var(--card); border-bottom: 1px solid var(--line); }
.header-inner { max-width: 1240px; min-height: 78px; padding: 15px 40px; margin: auto; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
.brand { display: inline-flex; align-items: center; gap: 13px; color: var(--ink); text-decoration: none; }
.brand-mark { position: relative; width: 29px; height: 30px; display: block; }
.brand-mark i { position: absolute; width: 19px; height: 19px; background: var(--ink); top: 0; left: 0; }
.brand-mark i + i { top: 10px; left: 10px; border: 1.5px solid var(--ink); background: white; }
.brand-name { font-family: var(--serif); font-size: 25px; letter-spacing: .12em; line-height: 1; }
.brand-subtitle { display: block; font-family: var(--sans); font-size: 8px; letter-spacing: .21em; line-height: 1; margin-top: 7px; }
.header-right { display: flex; align-items: center; gap: 29px; }
.local-label { display: inline-flex; align-items: center; gap: 9px; font-size: 9px; font-weight: 600; letter-spacing: .12em; color: #6c6c6c; }
.two-player-icon { font-size: 19px; color: var(--ink); }
.help-button { min-height: 40px; display: flex; align-items: center; gap: 8px; background: transparent; border: 0; border-left: 1px solid var(--line); padding: 0 0 0 25px; font-size: 12px; }
.help-button:hover { color: black; text-decoration: underline; text-underline-offset: 5px; }
main { max-width: 1000px; margin: auto; padding: 30px 32px 0; }
main:focus { outline: none; }
.intro { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; gap: 20px; }
.eyebrow { font-size: 9px; font-weight: 600; letter-spacing: .17em; margin: 0 0 10px; color: #656565; }
h1 { font-family: var(--serif); font-weight: 400; font-size: 46px; line-height: 1.1; letter-spacing: -.035em; margin: 0 0 9px; }
.intro-copy { margin: 0; font-size: 12px; color: var(--muted); line-height: 1.5; }
.intro-aside { display: flex; align-items: center; gap: 14px; text-align: right; }
.small-rule { width: 36px; height: 1px; background: #a3a3a3; }
.intro-aside p { color: #6f6f6f; font-size: 11px; line-height: 1.8; margin: 0; }
.intro-aside em { color: #414141; font-family: var(--serif); font-size: 15px; }
.workspace { display: grid; grid-template-columns: minmax(0, 1fr) 310px; grid-template-rows: auto minmax(190px, 1fr) auto; gap: 18px 28px; align-items: stretch; }
.board-panel { grid-column: 1; grid-row: 1 / 4; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.player-strip { border: 1px solid var(--line); border-radius: 5px; background: var(--card); min-height: 54px; padding: 8px 12px; display: flex; align-items: center; gap: 11px; position: relative; }
.player-strip.active-player::before { content: ''; position: absolute; left: -1px; top: 11px; bottom: 11px; width: 3px; background: var(--ink); border-radius: 0 2px 2px 0; }
.player-avatar { width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; border-radius: 50%; background: #f0f0f0; border: 1px solid #dedede; }
.player-avatar .chess-piece { width: 29px; height: 29px; }
.player-info { min-width: 76px; }
.player-name { display: flex; align-items: center; gap: 9px; font-family: var(--serif); font-size: 18px; line-height: 1.15; }
.player-caption { font-size: 9px; color: #757575; margin-top: 4px; }
.turn-tag { font-family: var(--sans); font-size: 7px; font-weight: 600; letter-spacing: .07em; background: #eeeeee; border: 1px solid #e4e4e4; padding: 3px 5px; white-space: nowrap; }
.captured-tray { display: flex; align-items: center; justify-content: flex-end; gap: 1px; margin-left: auto; flex-wrap: wrap; max-width: 56%; min-height: 25px; }
.captured-tray .chess-piece { width: 20px; height: 24px; margin-left: -5px; filter: none; }
.no-captures { color: #757575; font-size: 9px; }
.material-gain { font-size: 10px; font-weight: 600; padding-left: 6px; }
.board-frame { display: grid; grid-template-columns: 20px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 20px; background: #292929; padding: 10px 10px 0 2px; border: 1px solid #292929; border-radius: 4px; box-shadow: 0 5px 14px #0000000c; }
.rank-labels { display: grid; grid-template-rows: repeat(8, 1fr); }
.file-labels { display: grid; grid-template-columns: repeat(8, 1fr); }
.rank-labels span, .file-labels span { display: grid; place-items: center; color: #d4d4d4; font-size: 9px; font-weight: 500; user-select: none; }
.axis-corner { display: grid; place-items: center; font-size: 10px; color: #757575; user-select: none; }
.board { display: grid; grid-template-rows: repeat(8, minmax(0, 1fr)); aspect-ratio: 1; width: 100%; touch-action: none; user-select: none; -webkit-user-select: none; isolation: isolate; }
.board-row { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); min-height: 0; }
.square { border: 0; border-radius: 0; padding: 0; display: grid; place-items: center; width: 100%; height: 100%; min-width: 0; min-height: 0; position: relative; background: var(--light-square); cursor: default; touch-action: none; -webkit-user-select: none; user-select: none; }
.square.dark { background: var(--dark-square); }
.square.movable, .square.legal { cursor: pointer; }
.square:hover { box-shadow: inset 0 0 0 2px #ffffff80; }
.square.selected::before { content: ''; position: absolute; inset: 4px; border: 2px solid #fff; box-shadow: 0 0 0 2px #222; pointer-events: none; z-index: 4; }
.square:focus-visible { outline: 2px solid #111; outline-offset: -5px; box-shadow: inset 0 0 0 5px #fff; z-index: 6; }
.chess-piece { width: 83%; height: 83%; display: block; position: relative; z-index: 2; overflow: visible; pointer-events: none; filter: drop-shadow(0 1px 1px #0000001c); }
.piece-white { fill: #fcfcfc; stroke: #252525; stroke-width: 1.65; stroke-linejoin: round; stroke-linecap: round; }
.piece-black { fill: #272727; stroke: #f1f1f1; stroke-width: 1.45; stroke-linejoin: round; stroke-linecap: round; }
.piece-detail { fill: none; }
.piece-eye { stroke: none; }
.piece-white .piece-eye { fill: #252525; }
.piece-black .piece-eye { fill: #f1f1f1; }
.last-marker { position: absolute; inset: 3px; pointer-events: none; z-index: 1; background: #ffffff1c; }
.last-marker::before, .last-marker::after { content: ''; position: absolute; width: 9px; height: 9px; border-color: #303030; border-style: solid; }
.last-marker::before { top: 1px; left: 1px; border-width: 2px 0 0 2px; }
.last-marker::after { bottom: 1px; right: 1px; border-width: 0 2px 2px 0; }
.dark .last-marker::before, .dark .last-marker::after { border-color: #f3f3f3; }
.legal-dot { position: absolute; width: 22%; height: 22%; background: #30303080; border: 1px solid #ffffff90; border-radius: 50%; z-index: 3; pointer-events: none; }
.dark .legal-dot { background: #f3f3f3b0; border-color: #30303070; }
.capture-ring { position: absolute; inset: 4px; border: 3px solid #333; border-radius: 50%; box-shadow: 0 0 0 1px #ffffffc0; z-index: 3; pointer-events: none; }
.dark .capture-ring { border-color: #fafafa; box-shadow: 0 0 0 1px #33333390; }
.square.in-check::after { content: ''; position: absolute; inset: 5px; border: 2px dashed #202020; box-shadow: 0 0 0 1px #ffffffb0; pointer-events: none; z-index: 3; }
.check-badge { position: absolute; top: 3px; right: 3px; display: grid; place-items: center; width: 17px; height: 17px; background: #242424; color: white; border: 1px solid white; border-radius: 50%; font-size: 11px; font-weight: 700; z-index: 5; pointer-events: none; }
.drag-source .chess-piece { opacity: .22; }
.drag-ghost { position: fixed; left: 0; top: 0; pointer-events: none; z-index: 100; transform: translate(-50%, -50%); }
.drag-ghost .chess-piece { width: 100%; height: 100%; filter: drop-shadow(0 5px 4px #00000035); }
.board-note { display: flex; align-items: center; gap: 7px; padding: 2px 2px 0; font-size: 10px; color: #6f6f6f; line-height: 1.6; min-height: 22px; }
.board-note .icon { width: 14px; height: 14px; }
.keyboard-hint { margin-left: auto; white-space: nowrap; font-size: 9px; }
kbd { font-family: var(--sans); font-size: .88em; background: #f3f3f3; border: 1px solid #d7d7d7; border-bottom-width: 2px; border-radius: 3px; padding: 1px 4px; white-space: nowrap; }
.position-card, .history-card { background: var(--card); border: 1px solid var(--line); border-radius: 6px; min-width: 0; }
.position-card { grid-column: 2; grid-row: 1; padding: 20px; }
.card-eyebrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.phase-label { font-size: 8px; letter-spacing: .13em; font-weight: 600; display: flex; align-items: center; gap: 6px; color: #656565; }
.status-dot { width: 5px; height: 5px; background: var(--ink); border-radius: 50%; display: inline-block; }
.phase-label.complete .status-dot { border-radius: 0; background: transparent; border: 1px solid var(--ink); width: 7px; height: 7px; }
.turn-number { font-family: var(--serif); font-size: 15px; color: #757575; }
.position-title { display: flex; gap: 9px; align-items: center; }
.position-title h2 { font: 400 26px/1.2 var(--serif); letter-spacing: -.025em; margin: 0; }
#turnSymbol { display: block; width: 16px; height: 16px; border: 1.5px solid #242424; background: #fafafa; border-radius: 50%; flex: 0 0 16px; }
#turnSymbol.black { background: #242424; }
#turnSymbol.drawn { background: linear-gradient(90deg, #242424 50%, #fafafa 50%); }
.status-copy { margin: 11px 0 18px; color: #727272; font-size: 11px; line-height: 1.75; min-height: 37px; }
.position-detail { border-top: 1px solid #ededed; display: flex; justify-content: space-between; align-items: center; gap: 10px; padding-top: 13px; }
.detail-label { font-size: 8px; letter-spacing: .12em; color: #757575; }
#statusDetail { font-size: 11px; font-weight: 500; line-height: 1.4; text-align: right; }
.claim-button { margin-top: 14px; display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 40px; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; background: #f6f6f6; font-size: 11px; }
.claim-button:hover { background: #ededed; border-color: #757575; }
.history-card { grid-column: 2; grid-row: 2; display: flex; flex-direction: column; min-height: 0; }
.history-header { display: flex; justify-content: space-between; align-items: center; padding: 19px 20px 15px; }
.history-header h2 { font: 400 21px/1.2 var(--serif); margin: 0; letter-spacing: -.02em; }
.history-count { font-size: 9px; min-width: 25px; height: 22px; border: 1px solid #e4e4e4; border-radius: 3px; display: grid; place-items: center; color: #757575; }
.history-scroll { position: relative; overflow-y: auto; overscroll-behavior: contain; flex: 1 1 0; min-height: 190px; scrollbar-width: thin; scrollbar-color: #d0d0d0 transparent; }
.history-scroll:focus-visible { outline-offset: -3px; }
.move-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; }
.move-table th { position: sticky; top: 0; background: #f6f6f6; z-index: 1; font-size: 8px; font-weight: 500; letter-spacing: .13em; color: #757575; text-align: left; padding: 10px 12px; border-bottom: 1px solid #eaeaea; }
.move-table th:first-child { width: 22%; padding-left: 20px; }
.move-table td { padding: 7px 12px; height: 34px; border-bottom: 1px solid #f1f1f1; }
.move-table td:first-child { color: #757575; padding-left: 20px; font-size: 10px; font-variant-numeric: tabular-nums; }
.move-table tbody tr:nth-child(even) { background: #fafafa; }
.move-notation { display: inline-block; padding: 3px 5px; margin: -3px -5px; line-height: 1.2; }
.move-notation.latest { background: #292929; color: #fff; border-radius: 3px; }
.move-placeholder { color: #bbb; }
.history-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 35px 18px 25px; color: #757575; }
#emptyPiece { display: block; width: 48px; height: 48px; opacity: .26; margin-bottom: 8px; }
#emptyPiece .chess-piece { width: 100%; height: 100%; filter: none; }
.history-empty p { font: 400 17px/1.4 var(--serif); color: #626262; margin: 0 0 6px; }
.history-empty > span:last-child { font-size: 10px; line-height: 1.8; }
.score-footer { display: flex; align-items: center; justify-content: space-between; min-height: 36px; padding: 10px 20px; border-top: 1px solid #ededed; gap: 5px; }
.notation-label { font-size: 7px; letter-spacing: .08em; color: #757575; }
.game-score { font: 600 13px/1 var(--serif); white-space: nowrap; }
.game-controls { grid-column: 2; grid-row: 3; }
.utility-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.secondary-button, .primary-button { border: 1px solid var(--line); min-height: 43px; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; font-size: 11px; font-weight: 500; }
.secondary-button { background: #fff; }
.secondary-button:hover:not(:disabled) { background: #eeeeee; border-color: #a3a3a3; }
.secondary-button:disabled { background: #f7f7f7; color: #aaa; border-color: #e4e4e4; }
.secondary-button[aria-pressed="true"] { border-color: #9b9b9b; background: #ececec; }
.primary-button { background: #252525; border-color: #252525; color: #fff; }
.primary-button:hover { background: #080808; border-color: #080808; }
.primary-button:focus-visible { outline-color: #222; }
.new-game-button { width: 100%; justify-content: flex-start; min-height: 47px; padding: 12px 16px; }
.button-end { margin-left: auto; color: #cacaca; font-size: 18px; font-weight: 400; }
.controls-note { text-align: center; margin: 12px 0 0; font-size: 9px; color: #6f6f6f; }
.page-footer { display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--line); padding: 20px 0 23px; margin-top: 27px; color: #6f6f6f; }
.page-footer > span:first-child { font-size: 8px; letter-spacing: .13em; }
.page-footer p { margin: 0 0 0 auto; font-size: 10px; }
.page-footer em { font-family: var(--serif); font-size: 12px; color: #555; }
.footer-square { font-size: 9px; color: #555; margin-left: 5px; }
.game-dialog { width: min(490px, calc(100vw - 32px)); max-height: calc(100dvh - 48px); overflow-y: auto; border: 1px solid #bcbcbc; padding: 34px; border-radius: 7px; background: #fff; box-shadow: 0 18px 75px #00000035; }
.game-dialog::backdrop { background: #15151565; backdrop-filter: blur(2px); }
.game-dialog h2 { font: 400 33px/1.2 var(--serif); letter-spacing: -.03em; margin: 0 0 14px; }
.game-dialog > p:not(.eyebrow):not(.dialog-footnote) { color: #6f6f6f; font-size: 12px; line-height: 1.8; margin: 0 0 24px; }
.dialog-close { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; display: grid; place-items: center; background: transparent; border: 0; border-radius: 4px; }
.dialog-close:hover { background: #eee; }
.dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 26px; }
.dialog-actions button { min-width: 125px; }
.dialog-footnote { font-size: 10px; color: #6f6f6f; line-height: 1.7; margin: 20px 0 0; }
.promotion-options { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.promotion-option { background: #f3f3f3; border: 1px solid #dedede; border-radius: 4px; padding: 10px 5px; display: flex; align-items: center; flex-direction: column; gap: 7px; font-size: 10px; }
.promotion-option .chess-piece { width: 60px; max-width: 100%; height: 65px; }
.promotion-option:hover { background: #e4e4e4; border-color: #555; }
.help-dialog { width: min(550px, calc(100vw - 32px)); }
.help-list { list-style: none; margin: 0 0 27px; padding: 0; }
.help-list li { display: flex; gap: 15px; border-top: 1px solid #e8e8e8; padding: 17px 0 0; margin-top: 17px; }
.help-list li > span { font: 400 15px/1.5 var(--serif); color: #a3a3a3; }
.help-list h3 { font: 400 18px/1.3 var(--serif); margin: 0 0 7px; }
.help-list p { margin: 0; font-size: 11px; line-height: 1.9; color: #737373; }
.full-width { width: 100%; }
.claim-section-title { font: 400 18px/1.4 var(--serif); margin: 22px 0 10px; }
.claim-options { max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 7px; }
.claim-option { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; min-height: 44px; border: 1px solid #ddd; border-radius: 4px; background: #f8f8f8; text-align: left; }
.claim-option:hover { background: #eee; border-color: #757575; }
.claim-option strong { font-size: 13px; font-weight: 600; }
.claim-option span { color: #757575; font-size: 10px; }
.noscript-message { position: fixed; inset: auto 16px 16px; padding: 20px; border: 2px solid #222; background: #fff; text-align: center; z-index: 200; }
@media (min-width: 861px) and (max-height: 900px) {
  .header-inner { min-height: 67px; padding-top: 11px; padding-bottom: 11px; }
  main { max-width: 940px; padding-top: 22px; }
  .intro { margin-bottom: 22px; }
  h1 { font-size: 40px; }
  .player-strip { min-height: 49px; padding-top: 6px; padding-bottom: 6px; }
}
@media (max-width: 860px) {
  .header-inner { min-height: 68px; padding: 13px 26px; }
  .header-right { gap: 18px; }
  .local-label { font-size: 8px; }
  .help-button { padding-left: 18px; }
  main { max-width: 640px; padding: 27px 24px 0; }
  .intro-aside { display: none; }
  h1 { font-size: 39px; }
  .intro { margin-bottom: 24px; }
  .workspace { display: flex; flex-direction: column; gap: 17px; }
  .position-card { order: 1; padding: 15px 18px; }
  .card-eyebrow { margin-bottom: 9px; }
  .position-title h2 { font-size: 24px; }
  .status-copy { min-height: 0; margin: 7px 0 0; }
  .position-detail { display: none; }
  .board-panel { order: 2; }
  .game-controls { order: 3; }
  .history-card { order: 4; }
  .history-scroll { flex-basis: auto; height: 235px; min-height: 235px; }
  .history-empty { padding-top: 28px; }
  .controls-note { margin: 10px 0 0; }
  .page-footer { margin-top: 25px; }
}
@media (max-width: 520px) {
  .header-inner { padding: 13px 19px; min-height: 66px; }
  .brand { gap: 10px; }
  .brand-name { font-size: 22px; }
  .brand-subtitle { font-size: 7px; }
  .brand-mark { transform: scale(.86); transform-origin: left center; width: 25px; }
  .local-label { display: none; }
  .help-button { border: 1px solid #ddd; padding: 0; width: 38px; min-height: 38px; justify-content: center; border-radius: 4px; }
  .help-button span { display: none; }
  .help-button::after { content: ''; }
  main { padding: 23px 16px 0; }
  .eyebrow { font-size: 8px; }
  h1 { font-size: 36px; }
  .intro-copy { font-size: 11px; max-width: 310px; }
  .intro { margin-bottom: 20px; }
  .board-frame { grid-template-columns: 17px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 18px; padding: 6px 6px 0 1px; }
  .rank-labels span, .file-labels span { font-size: 8px; }
  .player-strip { min-height: 49px; padding: 7px 9px; gap: 9px; }
  .player-avatar { width: 30px; height: 30px; flex-basis: 30px; }
  .player-avatar .chess-piece { width: 26px; height: 26px; }
  .player-name { font-size: 17px; gap: 6px; }
  .player-caption { font-size: 8px; }
  .turn-tag { font-size: 6px; padding: 2px 3px; }
  .captured-tray { max-width: 46%; }
  .captured-tray .chess-piece { width: 17px; height: 20px; margin-left: -6px; }
  .no-captures { font-size: 8px; }
  .keyboard-hint { display: none; }
  .board-note { font-size: 9px; }
  .square.selected::before { inset: 3px; border-width: 1.5px; box-shadow: 0 0 0 1.5px #222; }
  .capture-ring { inset: 3px; border-width: 2px; }
  .square.in-check::after { inset: 3px; }
  .check-badge { width: 13px; height: 13px; font-size: 9px; top: 1px; right: 1px; }
  .last-marker::before, .last-marker::after { width: 6px; height: 6px; }
  .position-card { padding: 14px 16px; }
  .page-footer { padding-top: 18px; padding-bottom: 19px; }
  .page-footer > span:first-child { font-size: 7px; }
  .page-footer p { font-size: 9px; }
  .page-footer em { font-size: 10px; }
  .footer-square { display: none; }
  .game-dialog { padding: 29px 23px; }
  .game-dialog h2 { font-size: 29px; }
  .promotion-options { gap: 6px; }
  .promotion-option { padding: 9px 3px; }
  .promotion-option .chess-piece { height: 55px; }
  .dialog-actions { gap: 8px; }
  .dialog-actions button { min-width: 0; flex: 1; }
}
@media (max-width: 350px) {
  main { padding-left: 12px; padding-right: 12px; }
  .intro-copy { font-size: 10px; }
  .player-caption { display: none; }
  .player-info { min-width: 65px; }
  .player-name { flex-wrap: wrap; gap: 3px 5px; }
  .position-title h2 { font-size: 23px; }
  .page-footer p { font-size: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
@media (forced-colors: active) {
  .square { border: 1px solid CanvasText; }
  .square.dark { background: GrayText; }
  .square.selected::before { border: 3px solid Highlight; }
  .legal-dot { background: Highlight; border-color: CanvasText; forced-color-adjust: none; }
  .capture-ring { border-color: Highlight; }
  .chess-piece { forced-color-adjust: none; }
}

```


## engine.js

```javascript
/* NOIR Chess — independent rules engine. No DOM, dependencies, or network calls.
 * Board indices run from a8 (0) to h1 (63). Uppercase pieces are White.
 * All interaction paths are validated against the same generated legal moves.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NoirChess = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const PROMOTIONS = ['q', 'r', 'b', 'n'];
  const KNIGHT_STEPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const DIAGONALS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const ORTHOGONALS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const KING_STEPS = [...DIAGONALS, ...ORTHOGONALS];
  const opposite = color => color === 'w' ? 'b' : 'w';
  const row = square => Math.floor(square / 8);
  const file = square => square % 8;
  const inside = (r, f) => r >= 0 && r < 8 && f >= 0 && f < 8;
  const pieceColor = piece => piece ? (piece === piece.toUpperCase() ? 'w' : 'b') : null;
  const pieceType = piece => piece ? piece.toLowerCase() : null;
  const clone = value => JSON.parse(JSON.stringify(value));
  const squareName = square => String.fromCharCode(97 + file(square)) + (8 - row(square));
  function squareIndex(value) {
    if (Number.isInteger(value) && value >= 0 && value < 64) return value;
    if (typeof value === 'string' && /^[a-h][1-8]$/.test(value)) {
      return (8 - Number(value[1])) * 8 + value.charCodeAt(0) - 97;
    }
    return -1;
  }

  function parseFEN(fen) {
    const fields = fen.trim().split(/\s+/);
    if (fields.length !== 6) throw new Error('A FEN needs six fields.');
    const [placement, turn, rights, enPassant, halfmove, fullmove] = fields;
    const ranks = placement.split('/');
    if (ranks.length !== 8) throw new Error('A board needs eight ranks.');
    const board = [];
    for (const rank of ranks) {
      const start = board.length;
      for (const token of rank) {
        if (/^[1-8]$/.test(token)) board.push(...Array(Number(token)).fill(null));
        else if (/^[prnbqkPRNBQK]$/.test(token)) board.push(token);
        else throw new Error('Invalid FEN piece.');
      }
      if (board.length - start !== 8) throw new Error('A rank needs eight squares.');
    }
    if (!['w', 'b'].includes(turn) || !/^(?:-|K?Q?k?q?)$/.test(rights)) throw new Error('Invalid FEN turn or castling rights.');
    if (board.filter(p => p === 'K').length !== 1 || board.filter(p => p === 'k').length !== 1) throw new Error('A position needs one king per side.');
    const epSquare = enPassant === '-' ? null : squareIndex(enPassant);
    if (epSquare === -1 || (epSquare !== null && ![2, 5].includes(row(epSquare)))) throw new Error('Invalid en passant square.');
    if (!/^\d+$/.test(halfmove) || !/^[1-9]\d*$/.test(fullmove)) throw new Error('Invalid FEN counters.');
    return {
      board, turn,
      castling: { K: rights.includes('K'), Q: rights.includes('Q'), k: rights.includes('k'), q: rights.includes('q') },
      epSquare, halfmove: Number(halfmove), fullmove: Number(fullmove),
      captures: { w: [], b: [] }, moves: [], lastMove: null,
      repetitionCounts: {}, positionKey: '', result: null
    };
  }

  function placementFEN(board) {
    const ranks = [];
    for (let r = 0; r < 8; r++) {
      let line = '', empty = 0;
      for (let f = 0; f < 8; f++) {
        const piece = board[r * 8 + f];
        if (!piece) empty++;
        else {
          if (empty) line += empty;
          empty = 0;
          line += piece;
        }
      }
      if (empty) line += empty;
      ranks.push(line);
    }
    return ranks.join('/');
  }
  function castlingFEN(position) {
    return ['K', 'Q', 'k', 'q'].filter(right => position.castling[right]).join('') || '-';
  }
  function toFEN(position) {
    return `${placementFEN(position.board)} ${position.turn} ${castlingFEN(position)} ${position.epSquare === null ? '-' : squareName(position.epSquare)} ${position.halfmove} ${position.fullmove}`;
  }

  /* Attacks are NOT legal moves: a pinned piece still attacks a square, and
   * pawn attacks differ from pawn pushes. This distinction is vital for kings.
   */
  function isSquareAttacked(position, square, byColor) {
    const r = row(square), f = file(square), board = position.board;
    const pawn = byColor === 'w' ? 'P' : 'p';
    const pawnRow = r + (byColor === 'w' ? 1 : -1);
    for (const df of [-1, 1]) {
      if (inside(pawnRow, f + df) && board[pawnRow * 8 + f + df] === pawn) return true;
    }
    const knight = byColor === 'w' ? 'N' : 'n';
    for (const [dr, df] of KNIGHT_STEPS) {
      if (inside(r + dr, f + df) && board[(r + dr) * 8 + f + df] === knight) return true;
    }
    const king = byColor === 'w' ? 'K' : 'k';
    for (const [dr, df] of KING_STEPS) {
      if (inside(r + dr, f + df) && board[(r + dr) * 8 + f + df] === king) return true;
    }
    for (const [dr, df] of KING_STEPS) {
      let rr = r + dr, ff = f + df;
      while (inside(rr, ff)) {
        const piece = board[rr * 8 + ff];
        if (piece) {
          if (pieceColor(piece) === byColor) {
            const type = pieceType(piece);
            if (type === 'q' || (dr && df ? type === 'b' : type === 'r')) return true;
          }
          break;
        }
        rr += dr;
        ff += df;
      }
    }
    return false;
  }
  function inCheck(position, color = position.turn) {
    const king = position.board.indexOf(color === 'w' ? 'K' : 'k');
    return king === -1 || isSquareAttacked(position, king, opposite(color));
  }

  function pseudoMoves(position, from) {
    const piece = position.board[from];
    if (!piece || pieceColor(piece) !== position.turn) return [];
    const color = position.turn, enemy = opposite(color), type = pieceType(piece);
    const r = row(from), f = file(from), board = position.board, moves = [];
    function add(to, extra = {}) {
      const captured = extra.kind === 'enpassant' ? board[extra.captureSquare] : board[to];
      if (captured && (pieceColor(captured) === color || pieceType(captured) === 'k')) return;
      const base = { from, to, piece, captured: captured || null, promotion: null, kind: 'normal', ...extra };
      if (type === 'p' && [0, 7].includes(row(to))) {
        for (const promotion of PROMOTIONS) moves.push({ ...base, promotion });
      } else moves.push(base);
    }
    if (type === 'p') {
      const dr = color === 'w' ? -1 : 1, nextRow = r + dr;
      if (inside(nextRow, f) && !board[nextRow * 8 + f]) {
        add(nextRow * 8 + f);
        const startRow = color === 'w' ? 6 : 1;
        if (r === startRow && !board[(r + 2 * dr) * 8 + f]) add((r + 2 * dr) * 8 + f, { kind: 'double' });
      }
      for (const df of [-1, 1]) {
        if (!inside(nextRow, f + df)) continue;
        const to = nextRow * 8 + f + df;
        if (board[to] && pieceColor(board[to]) === enemy) add(to);
        else if (to === position.epSquare && !board[to]) {
          const captureSquare = r * 8 + f + df;
          if (board[captureSquare] === (enemy === 'w' ? 'P' : 'p')) add(to, { kind: 'enpassant', captureSquare });
        }
      }
    } else if (type === 'n' || type === 'k') {
      for (const [dr, df] of type === 'n' ? KNIGHT_STEPS : KING_STEPS) {
        if (inside(r + dr, f + df)) add((r + dr) * 8 + f + df);
      }
      if (type === 'k') {
        const home = color === 'w' ? 60 : 4;
        if (from === home && !inCheck(position, color)) {
          for (const kingSide of [true, false]) {
            const right = color === 'w' ? (kingSide ? 'K' : 'Q') : (kingSide ? 'k' : 'q');
            const rookFrom = home + (kingSide ? 3 : -4), step = kingSide ? 1 : -1;
            const between = kingSide ? [home + 1, home + 2] : [home - 1, home - 2, home - 3];
            if (!position.castling[right] || board[rookFrom] !== (color === 'w' ? 'R' : 'r') || between.some(s => board[s])) continue;
            // Test the transit square with the king actually removed from e1/e8.
            const transit = applyMove(position, { from, to: home + step, piece, captured: null, promotion: null, kind: 'normal' });
            if (inCheck(transit, color)) continue;
            const castle = { from, to: home + 2 * step, piece, captured: null, promotion: null, kind: 'castle', rookFrom, rookTo: home + step };
            if (!inCheck(applyMove(position, castle), color)) moves.push(castle);
          }
        }
      }
    } else {
      const directions = type === 'b' ? DIAGONALS : type === 'r' ? ORTHOGONALS : KING_STEPS;
      for (const [dr, df] of directions) {
        let rr = r + dr, ff = f + df;
        while (inside(rr, ff)) {
          const to = rr * 8 + ff;
          add(to);
          if (board[to]) break;
          rr += dr;
          ff += df;
        }
      }
    }
    return moves;
  }

  /* Pure position transition. This function neither updates history nor decides
   * whether a move is legal; callers must use generateLegalMoves first.
   */
  function applyMove(position, move) {
    const next = { ...position, board: position.board.slice(), castling: { ...position.castling }, epSquare: null };
    const color = pieceColor(move.piece), type = pieceType(move.piece);
    next.board[move.from] = null;
    if (move.kind === 'enpassant') next.board[move.captureSquare] = null;
    next.board[move.to] = move.promotion ? (color === 'w' ? move.promotion.toUpperCase() : move.promotion) : move.piece;
    if (move.kind === 'castle') {
      next.board[move.rookTo] = next.board[move.rookFrom];
      next.board[move.rookFrom] = null;
    }
    if (type === 'k') {
      next.castling[color === 'w' ? 'K' : 'k'] = false;
      next.castling[color === 'w' ? 'Q' : 'q'] = false;
    }
    const rookRights = { 0: 'q', 7: 'k', 56: 'Q', 63: 'K' };
    if (type === 'r' && rookRights[move.from]) next.castling[rookRights[move.from]] = false;
    if (pieceType(move.captured) === 'r' && rookRights[move.to]) next.castling[rookRights[move.to]] = false;
    if (move.kind === 'double') next.epSquare = (move.from + move.to) / 2;
    next.halfmove = type === 'p' || move.captured ? 0 : position.halfmove + 1;
    next.fullmove = position.fullmove + (color === 'b' ? 1 : 0);
    next.turn = opposite(color);
    return next;
  }

  function generateLegalMoves(position, from = null) {
    const squares = from === null ? Array.from({ length: 64 }, (_, i) => i) : [squareIndex(from)];
    const moves = [];
    for (const square of squares) {
      if (square < 0) continue;
      for (const move of pseudoMoves(position, square)) {
        // This also catches en passant's discovered attacks after BOTH pawns leave.
        if (!inCheck(applyMove(position, move), position.turn)) moves.push(move);
      }
    }
    return moves;
  }

  function repetitionKey(position) {
    // An en passant target matters only if an actual LEGAL en passant capture
    // exists. A pinned pawn or an uncapturable double push must not change identity.
    const ep = position.epSquare !== null && generateLegalMoves(position).some(m => m.kind === 'enpassant')
      ? squareName(position.epSquare) : '-';
    return `${placementFEN(position.board)} ${position.turn} ${castlingFEN(position)} ${ep}`;
  }

  function isInsufficientMaterial(position) {
    const minors = [];
    for (let i = 0; i < 64; i++) {
      const type = pieceType(position.board[i]);
      if (!type || type === 'k') continue;
      if (['p', 'r', 'q'].includes(type)) return false;
      minors.push({ type, squareColor: (row(i) + file(i)) % 2 });
    }
    if (minors.length <= 1) return true;
    // Multiple knights are not automatically a dead position. With bishops only,
    // all bishops must occupy the SAME color complex (including promotions).
    return minors.every(p => p.type === 'b') && minors.every(p => p.squareColor === minors[0].squareColor);
  }

  function automaticResult(position, legal = generateLegalMoves(position)) {
    if (!legal.length) {
      return inCheck(position)
        ? { type: 'checkmate', winner: opposite(position.turn), reason: 'checkmate' }
        : { type: 'draw', winner: null, reason: 'stalemate' };
    }
    if (isInsufficientMaterial(position)) return { type: 'draw', winner: null, reason: 'insufficient' };
    const count = position.repetitionCounts[position.positionKey || repetitionKey(position)] || 0;
    if (count >= 5) return { type: 'draw', winner: null, reason: 'fivefold' };
    // Checkmate takes precedence over the automatic seventy-five-move draw.
    if (position.halfmove >= 150) return { type: 'draw', winner: null, reason: 'seventyFive' };
    return null;
  }

  function algebraicNotation(position, move, legalBefore, after = applyMove(position, move)) {
    let notation;
    if (move.kind === 'castle') notation = move.to > move.from ? 'O-O' : 'O-O-O';
    else {
      const type = pieceType(move.piece);
      notation = type === 'p' ? '' : type.toUpperCase();
      if (type !== 'p') {
        const alternatives = legalBefore.filter(other => other.from !== move.from && other.to === move.to && other.piece === move.piece);
        if (alternatives.length) {
          if (!alternatives.some(other => file(other.from) === file(move.from))) notation += squareName(move.from)[0];
          else if (!alternatives.some(other => row(other.from) === row(move.from))) notation += squareName(move.from)[1];
          else notation += squareName(move.from);
        }
      } else if (move.captured) notation += squareName(move.from)[0];
      if (move.captured) notation += 'x';
      notation += squareName(move.to);
      if (move.promotion) notation += '=' + move.promotion.toUpperCase();
    }
    if (inCheck(after)) notation += generateLegalMoves(after).length ? '+' : '#';
    return notation;
  }

  function currentClaimReasons(position) {
    const reasons = [];
    const count = position.repetitionCounts[position.positionKey || repetitionKey(position)] || 0;
    if (count >= 3) reasons.push('threefold');
    if (position.halfmove >= 100) reasons.push('fiftyMove');
    return reasons;
  }

  class ChessGame {
    constructor(fen = START_FEN) {
      this._state = parseFEN(fen);
      this._history = [];
      this._state.positionKey = repetitionKey(this._state);
      this._state.repetitionCounts[this._state.positionKey] = 1;
      this._state.result = automaticResult(this._state);
    }
    // Rendering receives a copy and cannot inadvertently mutate the game.
    get state() { return clone(this._state); }
    get canUndo() { return this._history.length > 0; }
    get lastAction() { return this._history.length ? this._history[this._history.length - 1].action : null; }
    legalMoves(from = null) { return this._state.result ? [] : generateLegalMoves(this._state, from); }
    getStatus() {
      return { inCheck: inCheck(this._state), result: clone(this._state.result), claimReasons: this._state.result ? [] : currentClaimReasons(this._state) };
    }
    move(from, to, promotion = null) {
      if (this._state.result) return { ok: false, error: 'The game has ended.' };
      from = squareIndex(from);
      to = squareIndex(to);
      if (from < 0 || to < 0) return { ok: false, error: 'Invalid square.' };
      const allLegal = generateLegalMoves(this._state);
      const candidates = allLegal.filter(m => m.from === from && m.to === to);
      if (!candidates.length) return { ok: false, error: 'That move is not legal.' };
      if (candidates.some(m => m.promotion) && !promotion) {
        return { ok: false, needsPromotion: true, choices: PROMOTIONS.slice() };
      }
      const normalizedPromotion = typeof promotion === 'string' ? promotion.toLowerCase() : null;
      const move = candidates.find(m => m.promotion === normalizedPromotion);
      if (!move) return { ok: false, error: 'Invalid promotion choice.' };
      const before = this._state;
      const next = applyMove(before, move);
      const san = algebraicNotation(before, move, allLegal, next);
      this._history.push({ state: clone(before), action: 'move' });
      const record = { ...move, san, color: before.turn, moveNumber: before.fullmove };
      next.moves = [...before.moves, record];
      next.captures = { w: before.captures.w.slice(), b: before.captures.b.slice() };
      if (move.captured) next.captures[before.turn].push(move.captured);
      next.lastMove = record;
      next.positionKey = repetitionKey(next);
      next.repetitionCounts = { ...before.repetitionCounts };
      next.repetitionCounts[next.positionKey] = (next.repetitionCounts[next.positionKey] || 0) + 1;
      next.result = automaticResult(next);
      this._state = next;
      return { ok: true, move: clone(record), result: clone(next.result) };
    }
    undo() {
      if (!this._history.length) return false;
      this._state = this._history.pop().state;
      return true;
    }
    claimOptions() {
      if (this._state.result) return { current: [], byMove: [] };
      const current = currentClaimReasons(this._state), byMove = [];
      const possibleRepetition = Object.values(this._state.repetitionCounts).some(count => count >= 2);
      if (this._state.halfmove >= 99 || possibleRepetition) {
        const legal = generateLegalMoves(this._state);
        for (const move of legal) {
          const next = applyMove(this._state, move);
          const key = repetitionKey(next), reasons = [];
          if ((this._state.repetitionCounts[key] || 0) + 1 >= 3) reasons.push('threefold');
          if (next.halfmove >= 100) reasons.push('fiftyMove');
          if (!reasons.length) continue;
          if (inCheck(next) && !generateLegalMoves(next).length) continue;
          byMove.push({ move: clone(move), san: algebraicNotation(this._state, move, legal, next), reasons });
        }
      }
      return { current, byMove };
    }
    claimDraw(intendedMove = null) {
      const options = this.claimOptions();
      let reason, intendedSAN = null;
      if (intendedMove) {
        const from = squareIndex(intendedMove.from), to = squareIndex(intendedMove.to);
        const choice = options.byMove.find(option => option.move.from === from && option.move.to === to && option.move.promotion === (intendedMove.promotion || null));
        if (!choice) return { ok: false, error: 'That declared move does not permit a draw claim.' };
        reason = choice.reasons[0];
        intendedSAN = choice.san;
      } else {
        if (!options.current.length) return { ok: false, error: 'No draw can be claimed in this position.' };
        reason = options.current[0];
      }
      this._history.push({ state: clone(this._state), action: 'claim' });
      this._state = { ...this._state, result: { type: 'draw', winner: null, reason, claimant: this._state.turn, intendedSAN } };
      // Under FIDE rules an intended-move claim ends the game BEFORE that move
      // is played, so the board, counters and score sheet remain unchanged.
      return { ok: true, result: clone(this._state.result) };
    }
  }

  return { ChessGame, START_FEN, parseFEN, toFEN, squareName, squareIndex, pieceColor, pieceType,
    opposite, inCheck, isSquareAttacked, generateLegalMoves, applyMove, repetitionKey,
    isInsufficientMaterial, algebraicNotation };
});

```


## app.js

```javascript
/* NOIR Chess — rendering and input only. Every move, including drag-and-drop
 * and promotion, passes through ChessGame.move(). The rules live in engine.js.
 */
(function () {
  'use strict';
  const { ChessGame, squareName, squareIndex, pieceColor, pieceType } = window.NoirChess;
  const $ = id => document.getElementById(id);
  const names = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
  const colorName = color => color === 'w' ? 'White' : 'Black';
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const reasonNames = {
    stalemate: 'Stalemate', insufficient: 'Insufficient material', threefold: 'Threefold repetition',
    fiftyMove: 'Fifty-move rule', fivefold: 'Fivefold repetition', seventyFive: 'Seventy-five-move rule'
  };

  // Original, embedded Staunton-style vectors: consistent on every device,
  // without relying on chess fonts, image requests, or third-party assets.
  const base = '<path d="M18 51h28l3 5v3H15v-3Z"/><path class="piece-detail" d="M19 55h26"/>';
  const art = {
    p: '<circle cx="32" cy="15" r="7.5"/><path d="M26 22h12c-2 7-1 14 4 22H22c5-8 6-15 4-22Z"/><path d="M22 44h20l3 7H19Z"/><path class="piece-detail" d="M24 47h16"/>',
    r: '<path d="M17 10h7v7h4v-7h8v7h4v-7h7v15l-6 5v15h4v6H19v-6h4V30l-6-5Z"/><path class="piece-detail" d="M18 25h28M23 30h18M23 45h18"/>',
    n: '<path d="M19 48c-1-9 2-17 9-24l-8 6-5-2v-5l11-11 4-5 4 7c12 1 17 11 13 21l-4 13Z"/><path class="piece-detail" d="M35 17c8 9 7 19 3 29M20 32l7-3M25 12l4 3"/><circle class="piece-eye" cx="28" cy="20" r="1.8"/><circle class="piece-eye" cx="18.5" cy="25" r="1"/><path d="M20 47h24l2 4H18Z"/>',
    b: '<circle cx="32" cy="8" r="3"/><path d="M32 11c-12 9-13 14-6 20l-3 12h18l-3-12c7-6 6-11-6-20Z"/><path class="piece-detail" d="m34 16-7 10M26 31h12"/><path d="M21 43h22v5l3 3H18l3-3Z"/>',
    q: '<path d="m15 17 6 20h22l6-20-10 7 1-12-8 11-8-11 1 12Z"/><circle cx="15" cy="14" r="3"/><circle cx="24" cy="9" r="3"/><circle cx="32" cy="7" r="3"/><circle cx="40" cy="9" r="3"/><circle cx="49" cy="14" r="3"/><path d="M22 37h20l-3 8H25Z"/><path d="M21 45h22l3 6H18Z"/><path class="piece-detail" d="M24 40h16M24 48h16"/>',
    k: '<path d="M29 5h6v6h6v5h-6v8h-6v-8h-6v-5h6Z"/><path d="M24 23c-7-5-9 7-1 13l2 8h14l2-8c8-6 6-18-1-13-5-4-11-4-16 0Z"/><path class="piece-detail" d="M24 35h16M32 22v11"/><path d="M22 44h20l4 7H18Z"/><path class="piece-detail" d="M25 47h14"/>'
  };
  function pieceSVG(piece) {
    return `<svg class="chess-piece piece-${pieceColor(piece) === 'w' ? 'white' : 'black'}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${art[pieceType(piece)]}${base}</svg>`;
  }
  function pieceDescription(piece) { return `${colorName(pieceColor(piece))} ${names[pieceType(piece)]}`; }

  let game = new ChessGame();
  let flipped = false;
  let selected = null;
  let selectedMoves = [];
  let focusSquare = squareIndex('e2');
  let pendingPromotion = null;
  let pointerGesture = null;
  let interactionMessage = '';
  let currentClaimOptions = { current: [], byMove: [] };
  let claimDialogOptions = { current: [], byMove: [] };
  let announcementTimer;

  function announce(message) {
    clearTimeout(announcementTimer);
    $('announcement').textContent = '';
    announcementTimer = setTimeout(() => { $('announcement').textContent = message; }, 30);
  }
  function dialogIsOpen() { return !!document.querySelector('dialog[open]'); }
  function boardButton(square) { return $('board').querySelector(`[data-square="${square}"]`); }
  function setFocusSquare(square, focus = false) {
    focusSquare = square;
    $('board').querySelectorAll('.square').forEach(button => { button.tabIndex = Number(button.dataset.square) === square ? 0 : -1; });
    if (focus) boardButton(square)?.focus({ preventScroll: true });
  }

  function playerMarkup(color, state, status) {
    const active = !state.result && state.turn === color;
    let caption = active ? (status.inCheck ? 'Find a safe reply' : 'Choose your next move') : `Waiting for ${colorName(state.turn)}`;
    let tag = active ? (status.inCheck ? 'IN CHECK' : 'TO MOVE') : '';
    if (state.result) {
      caption = state.result.type === 'draw' ? 'Game drawn' : state.result.winner === color ? 'Well played' : 'Checkmated';
      tag = state.result.type === 'draw' ? 'DRAW' : state.result.winner === color ? 'WINNER' : '';
    }
    const captured = state.captures[color].slice().sort((a, b) => values[pieceType(b)] - values[pieceType(a)]);
    const material = state.board.reduce((sum, piece) => piece ? sum + (pieceColor(piece) === color ? 1 : -1) * values[pieceType(piece)] : sum, 0);
    const gain = material > 0 ? `<span class="material-gain" aria-label="Ahead by ${material} material points">+${material}</span>` : '';
    const captureLabel = captured.length ? `Captured by ${colorName(color)}: ${captured.map(pieceDescription).join(', ')}` : `No pieces captured by ${colorName(color)}`;
    return `<span class="player-avatar" aria-hidden="true">${pieceSVG(color === 'w' ? 'K' : 'k')}</span><div class="player-info"><div class="player-name">${colorName(color)}${tag ? `<span class="turn-tag">${tag}</span>` : ''}</div><div class="player-caption">${caption}</div></div><div class="captured-tray" role="img" aria-label="${captureLabel}">${captured.length ? captured.map(pieceSVG).join('') : '<span class="no-captures" aria-hidden="true">No captures yet</span>'}${gain}</div>`;
  }
  function renderPlayers(state, status) {
    const topColor = flipped ? 'w' : 'b', bottomColor = flipped ? 'b' : 'w';
    for (const [id, color] of [['topPlayer', topColor], ['bottomPlayer', bottomColor]]) {
      $(id).innerHTML = playerMarkup(color, state, status);
      $(id).classList.toggle('active-player', !state.result && state.turn === color);
      $(id).setAttribute('aria-label', `${colorName(color)} player${!state.result && state.turn === color ? ', to move' : ''}`);
    }
  }
  function renderBoard(state, status) {
    const legalTargets = new Map();
    selectedMoves.forEach(move => legalTargets.set(move.to, move));
    const checkedKing = status.inCheck ? state.board.indexOf(state.turn === 'w' ? 'K' : 'k') : -1;
    const lastSquares = state.lastMove ? [state.lastMove.from, state.lastMove.to] : [];
    let markup = '';
    for (let visualRow = 0; visualRow < 8; visualRow++) {
      markup += `<div class="board-row" role="row" aria-rowindex="${visualRow + 1}">`;
      for (let visualFile = 0; visualFile < 8; visualFile++) {
        const index = visualRow * 8 + visualFile, square = flipped ? 63 - index : index;
        const piece = state.board[square], legal = legalTargets.get(square);
        const isSelected = selected === square, isLast = lastSquares.includes(square), isChecked = checkedKing === square;
        const classes = ['square', (Math.floor(square / 8) + square % 8) % 2 ? 'dark' : 'light'];
        if (piece && pieceColor(piece) === state.turn && !state.result) classes.push('movable');
        if (isSelected) classes.push('selected');
        if (legal) classes.push('legal');
        if (isLast) classes.push('last-move');
        if (isChecked) classes.push('in-check');
        if (pointerGesture?.didDrag && pointerGesture.from === square) classes.push('drag-source');
        let label = `${squareName(square)}, ${piece ? pieceDescription(piece) : 'empty'}`;
        if (isSelected) label += ', selected';
        if (legal) label += legal.captured ? ', legal capture' : ', legal destination';
        if (isLast) label += ', last move';
        if (isChecked) label += ', in check';
        markup += `<button type="button" class="${classes.join(' ')}" role="gridcell" aria-colindex="${visualFile + 1}" aria-selected="${isSelected}" ${state.result ? 'aria-disabled="true"' : ''} aria-label="${label}" data-square="${square}" tabindex="${focusSquare === square ? 0 : -1}">${isLast ? '<span class="last-marker" aria-hidden="true"></span>' : ''}${piece ? pieceSVG(piece) : ''}${legal ? `<span class="${legal.captured ? 'capture-ring' : 'legal-dot'}" aria-hidden="true"></span>` : ''}${isChecked ? '<span class="check-badge" aria-hidden="true">!</span>' : ''}</button>`;
      }
      markup += '</div>';
    }
    $('board').innerHTML = markup;
    $('board').setAttribute('aria-label', `Chessboard, ${flipped ? 'Black' : 'White'} at the bottom. ${state.result ? 'Game complete' : `${colorName(state.turn)} to move${status.inCheck ? ', in check' : ''}`}`);
    $('rankLabels').innerHTML = Array.from({ length: 8 }, (_, i) => `<span>${flipped ? i + 1 : 8 - i}</span>`).join('');
    $('fileLabels').innerHTML = (flipped ? 'hgfedcba' : 'abcdefgh').split('').map(f => `<span>${f}</span>`).join('');
    let hint = 'Choose a piece, then a destination.';
    if (state.result) hint = state.result.type === 'checkmate' ? 'Checkmate. A new chapter awaits.' : 'Game drawn. A good game, well played.';
    else if (selected !== null) hint = `${names[pieceType(state.board[selected])][0].toUpperCase()}${names[pieceType(state.board[selected])].slice(1)} on ${squareName(selected)} · ${legalTargets.size} legal ${legalTargets.size === 1 ? 'square' : 'squares'}.`;
    else if (status.inCheck) hint = 'Check. Your king needs a safe reply.';
    $('boardHint').textContent = interactionMessage || hint;
  }

  function presentation(state, status) {
    if (!state.result) {
      let copy = state.moves.length ? 'Choose a piece to explore its legal moves.' : 'The board is set. Make the first move.';
      if (status.inCheck) copy = `${colorName(state.turn)}'s king is under attack. Find a safe reply.`;
      if (currentClaimOptions.current.length) copy += ` A draw is available by ${reasonNames[currentClaimOptions.current[0]].toLowerCase()}.`;
      else if (currentClaimOptions.byMove.length) copy += ' A draw is available with a declared next move.';
      return { heading: `${colorName(state.turn)} to move`, phase: status.inCheck ? 'KING IN CHECK' : 'IN PROGRESS', copy, detailLabel: 'LAST MOVE', detail: state.lastMove ? `${state.lastMove.san} · ${squareName(state.lastMove.from)} → ${squareName(state.lastMove.to)}` : '—', symbolColor: state.turn, score: '' };
    }
    const result = state.result;
    if (result.type === 'checkmate') {
      return { heading: `${colorName(result.winner)} wins`, phase: 'CHECKMATE', copy: `${colorName(state.turn)}'s king is in check with no legal move. A decisive finish.`, detailLabel: 'RESULT', detail: 'Checkmate', symbolColor: result.winner, score: result.winner === 'w' ? '1–0' : '0–1' };
    }
    const drawCopy = {
      stalemate: `${colorName(state.turn)} has no legal move, but the king is not in check.`,
      insufficient: 'Neither side has sufficient material for a possible checkmate.',
      threefold: result.intendedSAN ? `${colorName(result.claimant)} declared ${result.intendedSAN} to complete a third repetition.` : `The same position has occurred three times. Draw claimed by ${colorName(result.claimant)}.`,
      fiftyMove: result.intendedSAN ? `${colorName(result.claimant)} declared ${result.intendedSAN} to reach fifty moves per side without a pawn move or capture.` : 'Fifty moves per side without a pawn move or capture. Draw claimed.',
      fivefold: 'The same position has occurred five times. An automatic draw.',
      seventyFive: 'Seventy-five moves per side without a pawn move or capture. An automatic draw.'
    };
    return { heading: 'A drawn game', phase: 'GAME DRAWN', copy: drawCopy[result.reason], detailLabel: result.intendedSAN ? 'DECLARED MOVE' : 'RESULT', detail: result.intendedSAN || reasonNames[result.reason], symbolColor: 'draw', score: '½–½' };
  }
  function renderStatus(state, status) {
    const view = presentation(state, status);
    $('phaseLabel').innerHTML = `<span class="status-dot" aria-hidden="true"></span>${view.phase}`;
    $('phaseLabel').classList.toggle('complete', !!state.result);
    $('positionHeading').textContent = view.heading;
    $('statusText').textContent = view.copy;
    $('detailLabel').textContent = view.detailLabel;
    $('statusDetail').textContent = view.detail;
    $('turnSymbol').className = view.symbolColor === 'b' ? 'black' : view.symbolColor === 'draw' ? 'drawn' : '';
    const displayedMove = state.result && state.lastMove && !state.result.intendedSAN ? state.lastMove.moveNumber : state.fullmove;
    $('turnNumber').textContent = String(displayedMove).padStart(2, '0');
    $('turnNumber').setAttribute('aria-label', `Move number ${displayedMove}`);
    $('gameScore').textContent = view.score;
    $('gameScore').setAttribute('aria-label', state.result ? `Game result: ${view.score}${state.result.intendedSAN ? `, declared move ${state.result.intendedSAN}` : ''}` : 'Game still in progress');
    $('claimDraw').hidden = !!state.result || !(currentClaimOptions.current.length || currentClaimOptions.byMove.length);
  }
  function renderHistory(state, scrollToLatest) {
    const scroll = $('historyScroll'), priorScroll = scroll.scrollTop;
    const rows = new Map();
    for (let i = 0; i < state.moves.length; i++) {
      const move = state.moves[i];
      if (!rows.has(move.moveNumber)) rows.set(move.moveNumber, {});
      rows.get(move.moveNumber)[move.color] = { ...move, latest: i === state.moves.length - 1 };
    }
    function cell(move) {
      if (!move) return '<td><span class="move-placeholder" aria-label="Not played">—</span></td>';
      const description = `${colorName(move.color)} move ${move.moveNumber}: ${move.san}, ${names[pieceType(move.piece)]} from ${squareName(move.from)} to ${squareName(move.to)}${move.captured ? `, capturing ${pieceDescription(move.captured)}` : ''}${move.promotion ? `, promoting to ${names[move.promotion]}` : ''}`;
      return `<td aria-label="${description}"><span class="move-notation${move.latest ? ' latest' : ''}">${move.san}</span></td>`;
    }
    $('moveBody').innerHTML = Array.from(rows, ([number, moves]) => `<tr><td>${number}.</td>${cell(moves.w)}${cell(moves.b)}</tr>`).join('');
    $('historyEmpty').hidden = !!state.moves.length;
    $('moveCount').textContent = state.moves.length;
    $('moveCount').setAttribute('aria-label', `${state.moves.length} half-moves played`);
    scroll.scrollTop = scrollToLatest ? scroll.scrollHeight : priorScroll;
  }
  function render(options = {}) {
    const active = document.activeElement;
    const restoreFocus = !!active?.classList.contains('square') && !dialogIsOpen();
    const state = game.state, status = game.getStatus();
    currentClaimOptions = game.claimOptions();
    if (selected !== null && (state.result || pieceColor(state.board[selected]) !== state.turn)) {
      selected = null;
      selectedMoves = [];
    } else selectedMoves = selected === null ? [] : game.legalMoves(selected);
    renderPlayers(state, status);
    renderBoard(state, status);
    renderStatus(state, status);
    renderHistory(state, !!options.scrollToLatest);
    $('undoMove').disabled = !game.canUndo;
    $('undoMove').querySelector('span').textContent = game.lastAction === 'claim' ? 'Undo claim' : 'Undo move';
    $('flipBoard').setAttribute('aria-pressed', String(flipped));
    if (restoreFocus && options.restoreFocus !== false) boardButton(focusSquare)?.focus({ preventScroll: true });
  }

  function clearSelection(message = '') {
    selected = null;
    selectedMoves = [];
    interactionMessage = message;
  }
  function selectSquare(square) {
    selected = square;
    selectedMoves = game.legalMoves(square);
    focusSquare = square;
    interactionMessage = '';
    render();
    const destinations = [...new Set(selectedMoves.map(move => squareName(move.to)))];
    announce(`${pieceDescription(game.state.board[square])} on ${squareName(square)} selected. ${destinations.length} legal destinations${destinations.length && destinations.length <= 8 ? ': ' + destinations.join(', ') : ''}.`);
  }
  function moveAnnouncement(record) {
    const state = game.state, status = game.getStatus(), view = presentation(state, status);
    return `${colorName(record.color)} played ${record.san}. ${view.heading}. ${state.result ? view.copy : status.inCheck ? 'Check.' : ''}`;
  }
  function attemptMove(from, to, promotion = null) {
    const result = game.move(from, to, promotion);
    if (result.needsPromotion) {
      pendingPromotion = { from, to };
      render(); // Remove any drag-source styling before opening the modal.
      const color = game.state.turn;
      $('promotionOptions').innerHTML = result.choices.map(type => `<button type="button" class="promotion-option" data-promotion="${type}" aria-label="Promote to ${names[type]}">${pieceSVG(color === 'w' ? type.toUpperCase() : type)}<span>${names[type][0].toUpperCase() + names[type].slice(1)}</span></button>`).join('');
      $('promotionDialog').showModal();
      $('promotionOptions').querySelector('button').focus();
      announce('Promotion. Choose a queen, rook, bishop, or knight. Escape cancels the move.');
      return;
    }
    if (!result.ok) {
      interactionMessage = 'Not a legal move. Choose a marked destination.';
      render();
      announce(result.error);
      return;
    }
    pendingPromotion = null;
    focusSquare = to;
    clearSelection();
    render({ scrollToLatest: true });
    announce(moveAnnouncement(result.move));
  }
  function handleSquare(square) {
    if (pendingPromotion || dialogIsOpen()) return;
    const state = game.state;
    if (state.result) { announce('The game is complete. Start a new game or use Undo to continue.'); return; }
    if (selected !== null && selectedMoves.some(move => move.to === square)) { attemptMove(selected, square); return; }
    if (selected === square) { clearSelection(); render(); announce('Selection cleared.'); return; }
    if (state.board[square] && pieceColor(state.board[square]) === state.turn) { selectSquare(square); return; }
    interactionMessage = selected === null ? `${colorName(state.turn)} to move. Choose a ${colorName(state.turn).toLowerCase()} piece.` : 'Not a legal destination. Choose a marked square.';
    render();
    announce(interactionMessage);
  }

  // Pointer capture belongs to the stable board container, never a square that
  // rendering replaces. A drop cannot bypass the same legal-move validator.
  $('board').addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || pointerGesture || dialogIsOpen()) return;
    const button = event.target.closest('.square');
    if (!button) return;
    const from = Number(button.dataset.square), state = game.state;
    event.preventDefault();
    setFocusSquare(from, event.pointerType === 'mouse');
    pointerGesture = { pointerId: event.pointerId, from, startX: event.clientX, startY: event.clientY, canDrag: !state.result && pieceColor(state.board[from]) === state.turn, didDrag: false, piece: state.board[from], size: button.getBoundingClientRect().width * .92 };
    $('board').setPointerCapture(event.pointerId);
  });
  $('board').addEventListener('pointermove', event => {
    const gesture = pointerGesture;
    if (!gesture || gesture.pointerId !== event.pointerId || !gesture.canDrag) return;
    if (!gesture.didDrag && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) >= 7) {
      gesture.didDrag = true;
      selectSquare(gesture.from);
      $('dragGhost').innerHTML = pieceSVG(gesture.piece);
      $('dragGhost').style.width = `${gesture.size}px`;
      $('dragGhost').style.height = `${gesture.size}px`;
      $('dragGhost').hidden = false;
    }
    if (gesture.didDrag) {
      $('dragGhost').style.left = `${event.clientX}px`;
      $('dragGhost').style.top = `${event.clientY}px`;
    }
  });
  function endPointerGesture() {
    const gesture = pointerGesture;
    pointerGesture = null;
    $('dragGhost').hidden = true;
    if (gesture && $('board').hasPointerCapture(gesture.pointerId)) $('board').releasePointerCapture(gesture.pointerId);
    return gesture;
  }
  $('board').addEventListener('pointerup', event => {
    if (!pointerGesture || pointerGesture.pointerId !== event.pointerId) return;
    const button = document.elementFromPoint(event.clientX, event.clientY)?.closest('.square');
    const target = button && $('board').contains(button) ? Number(button.dataset.square) : null;
    const gesture = endPointerGesture();
    if (gesture.didDrag) {
      if (target !== null && selectedMoves.some(move => move.to === target)) attemptMove(gesture.from, target);
      else {
        interactionMessage = 'Piece returned. Choose a marked destination.';
        render();
        announce('Move canceled. The position has not changed.');
      }
    } else if (target === gesture.from) handleSquare(target);
  });
  function cancelPointerGesture() {
    if (!pointerGesture) return;
    const gesture = endPointerGesture();
    if (gesture.didDrag) { interactionMessage = 'Move canceled. The position is unchanged.'; render(); }
  }
  $('board').addEventListener('pointercancel', cancelPointerGesture);
  $('board').addEventListener('lostpointercapture', cancelPointerGesture);
  $('board').addEventListener('contextmenu', event => event.preventDefault());
  window.addEventListener('blur', cancelPointerGesture);
  window.addEventListener('resize', cancelPointerGesture);
  // Assistive technologies can activate buttons without generating pointers.
  $('board').addEventListener('click', event => {
    if (event.detail !== 0) return;
    const button = event.target.closest('.square');
    if (button) handleSquare(Number(button.dataset.square));
  });
  $('board').addEventListener('focusin', event => {
    const button = event.target.closest('.square');
    if (button) setFocusSquare(Number(button.dataset.square));
  });
  $('board').addEventListener('keydown', event => {
    const button = event.target.closest('.square');
    if (!button) return;
    const square = Number(button.dataset.square), visual = flipped ? 63 - square : square;
    let next = visual;
    switch (event.key) {
      case 'ArrowLeft': if (visual % 8 > 0) next--; break;
      case 'ArrowRight': if (visual % 8 < 7) next++; break;
      case 'ArrowUp': if (visual >= 8) next -= 8; break;
      case 'ArrowDown': if (visual < 56) next += 8; break;
      case 'Home': next = event.ctrlKey ? 0 : Math.floor(visual / 8) * 8; break;
      case 'End': next = event.ctrlKey ? 63 : Math.floor(visual / 8) * 8 + 7; break;
      case 'Enter': case ' ': event.preventDefault(); cancelPointerGesture(); handleSquare(square); return;
      case 'Escape': event.preventDefault(); cancelPointerGesture(); clearSelection(); render(); announce('Selection cleared.'); return;
      default: return;
    }
    event.preventDefault();
    setFocusSquare(flipped ? 63 - next : next, true);
  });

  function cancelPromotion() {
    pendingPromotion = null;
    if ($('promotionDialog').open) $('promotionDialog').close();
    render();
    boardButton(focusSquare)?.focus({ preventScroll: true });
    announce('Promotion canceled. The position is unchanged.');
  }
  $('promotionOptions').addEventListener('click', event => {
    const button = event.target.closest('[data-promotion]');
    if (!button || !pendingPromotion) return;
    const move = pendingPromotion;
    pendingPromotion = null;
    $('promotionDialog').close();
    attemptMove(move.from, move.to, button.dataset.promotion);
    boardButton(focusSquare)?.focus({ preventScroll: true });
  });
  $('promotionClose').addEventListener('click', cancelPromotion);
  $('promotionDialog').addEventListener('cancel', event => { event.preventDefault(); cancelPromotion(); });

  function startNewGame() {
    cancelPointerGesture();
    if ($('newGameDialog').open) $('newGameDialog').close();
    if ($('promotionDialog').open) $('promotionDialog').close();
    pendingPromotion = null;
    game = new ChessGame();
    flipped = false;
    focusSquare = squareIndex('e2');
    clearSelection();
    render({ scrollToLatest: true });
    announce('New game. White moves first. White is at the bottom.');
  }
  $('newGame').addEventListener('click', () => {
    const state = game.state;
    if (!state.result) {
      $('newGameDialog').showModal();
      $('keepPlaying').focus();
    } else startNewGame();
  });
  $('confirmNewGame').addEventListener('click', startNewGame);
  $('keepPlaying').addEventListener('click', () => $('newGameDialog').close());
  $('newGameClose').addEventListener('click', () => $('newGameDialog').close());
  $('undoMove').addEventListener('click', () => {
    cancelPointerGesture();
    const before = game.state, lastAction = game.lastAction;
    if (!game.undo()) return;
    pendingPromotion = null;
    clearSelection();
    if (lastAction === 'move' && before.lastMove) focusSquare = before.lastMove.from;
    render({ scrollToLatest: true });
    announce(`${lastAction === 'claim' ? 'Draw claim withdrawn' : 'Move undone'}. ${colorName(game.state.turn)} to move${game.getStatus().inCheck ? ', in check' : ''}.`);
  });
  $('flipBoard').addEventListener('click', () => {
    cancelPointerGesture();
    flipped = !flipped;
    interactionMessage = '';
    render();
    announce(`Board flipped. ${flipped ? 'Black' : 'White'} is at the bottom. The position and turn are unchanged.`);
  });
  $('helpButton').addEventListener('click', () => $('helpDialog').showModal());
  $('helpClose').addEventListener('click', () => $('helpDialog').close());
  $('helpDone').addEventListener('click', () => $('helpDialog').close());

  $('claimDraw').addEventListener('click', () => {
    claimDialogOptions = game.claimOptions();
    const { current, byMove } = claimDialogOptions;
    if (!current.length && !byMove.length) return;
    $('claimDescription').textContent = current.length
      ? `${colorName(game.state.turn)} may claim this position by ${reasonNames[current[0]].toLowerCase()}. Claiming ends the game as a draw.`
      : 'A legal next move can complete a third repetition or the fifty-move rule. Declare one below to end the game as a draw.';
    $('claimCurrent').hidden = !current.length;
    $('intendedClaimSection').hidden = !byMove.length;
    $('claimMoveTitle').textContent = current.length ? 'Or declare a move' : 'Declare your next move';
    $('claimOptions').innerHTML = byMove.map((option, index) => `<button class="claim-option" type="button" data-claim-index="${index}" aria-label="Declare ${option.san} and claim by ${reasonNames[option.reasons[0]].toLowerCase()}"><strong>${option.san}</strong><span>${reasonNames[option.reasons[0]]} →</span></button>`).join('');
    $('claimDialog').showModal();
    if (current.length) $('claimCurrent').focus();
    else $('claimOptions').querySelector('button')?.focus();
  });
  function makeDrawClaim(move = null) {
    const response = game.claimDraw(move);
    if (!response.ok) { announce(response.error); return; }
    $('claimDialog').close();
    clearSelection();
    render();
    announce(`Game drawn by ${reasonNames[response.result.reason].toLowerCase()}${response.result.intendedSAN ? `, with declared move ${response.result.intendedSAN}` : ''}.`);
  }
  $('claimCurrent').addEventListener('click', () => makeDrawClaim());
  $('claimOptions').addEventListener('click', event => {
    const button = event.target.closest('[data-claim-index]');
    if (!button) return;
    const option = claimDialogOptions.byMove[Number(button.dataset.claimIndex)];
    if (option) makeDrawClaim(option.move);
  });
  $('claimClose').addEventListener('click', () => $('claimDialog').close());

  document.querySelector('.brand').addEventListener('click', event => {
    // Keep fragment navigation local even inside a srcdoc/sandbox preview.
    event.preventDefault();
    $('main').focus({ preventScroll: true });
    $('main').scrollIntoView({ block: 'start' });
  });

  $('emptyPiece').innerHTML = pieceSVG('P');
  render();
})();

```


## Optional regression tests: tests.js

Run `node tests.js` only if you want to verify the engine; Node is not required to play. These tests use only the built-in assertion module.

```javascript
/* Optional engine regression suite. Run: node tests.js
 * Uses only Node's built-in assertion module; nothing is needed to play.
 */
'use strict';
const assert = require('node:assert/strict');
const E = require('./engine.js');
const { ChessGame, parseFEN, generateLegalMoves, squareIndex, squareName } = E;
let passed = 0;
function test(name, callback) {
  try { callback(); console.log('✓ ' + name); passed++; }
  catch (error) { console.error('✗ ' + name); throw error; }
}
function play(game, uci) {
  const result = game.move(uci.slice(0, 2), uci.slice(2, 4), uci[4] || null);
  assert.equal(result.ok, true, `${uci}: ${result.error || 'promotion not chosen'}`);
  return result;
}
function hasMove(fen, uci) {
  return generateLegalMoves(parseFEN(fen)).some(m => squareName(m.from) + squareName(m.to) + (m.promotion || '') === uci);
}
function perft(position, depth) {
  if (!depth) return 1;
  const moves = generateLegalMoves(position);
  if (depth === 1) return moves.length;
  return moves.reduce((nodes, move) => nodes + perft(E.applyMove(position, move), depth - 1), 0);
}

test('Initial setup, orientation, FEN, and 20 legal opening moves', () => {
  const g = new ChessGame(), s = g.state;
  assert.equal(E.toFEN(s), E.START_FEN);
  assert.equal(s.board.filter(Boolean).length, 32);
  for (const [square, piece] of [['a8', 'r'], ['e8', 'k'], ['e1', 'K'], ['h1', 'R'], ['a2', 'P']]) assert.equal(s.board[squareIndex(square)], piece);
  assert.equal(g.legalMoves().length, 20);
  assert.equal(g.canUndo, false);
});
test('Starting-position perft: depths 1–4', () => {
  const p = parseFEN(E.START_FEN);
  [20, 400, 8902, 197281].forEach((expected, i) => assert.equal(perft(p, i + 1), expected));
});
test('Kiwipete perft: castling, pins, captures, and checks', () => {
  const p = parseFEN('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
  [48, 2039, 97862].forEach((expected, i) => assert.equal(perft(p, i + 1), expected));
});
test('Endgame perft: en passant and discovered checks', () => {
  const p = parseFEN('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
  [14, 191, 2812, 43238].forEach((expected, i) => assert.equal(perft(p, i + 1), expected));
});
test('Promotion-heavy and check-evasion perft', () => {
  const p = parseFEN('r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1');
  [6, 264, 9467].forEach((expected, i) => assert.equal(perft(p, i + 1), expected));
});
test('Underpromotion and castling-rights perft', () => {
  const p = parseFEN('rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8');
  [44, 1486, 62379].forEach((expected, i) => assert.equal(perft(p, i + 1), expected));
});
test('Turns, invalid squares, illegal moves, and invalid promotion are immutable', () => {
  const g = new ChessGame(), before = g.state;
  for (const args of [['e7', 'e5'], ['e2', 'e5'], ['zz', 'e4'], [-1, 32], ['g1', 'f3', 'q']]) {
    assert.equal(g.move(...args).ok, false);
    assert.deepEqual(g.state, before);
  }
});
test('Snapshots are defensive copies, not mutable board references', () => {
  const g = new ChessGame(), snapshot = g.state;
  snapshot.board[60] = null;
  snapshot.castling.K = false;
  snapshot.repetitionCounts = {};
  assert.equal(g.state.board[60], 'K');
  assert.equal(g.state.castling.K, true);
});
test('Pawns cannot push through pieces, capture forward, or move backward', () => {
  const fen = '7k/8/8/8/8/4p3/4P3/7K w - - 0 1';
  assert.equal(hasMove(fen, 'e2e3'), false);
  assert.equal(hasMove(fen, 'e2e4'), false);
  assert.equal(hasMove(fen, 'e2e1q'), false);
});
test('Ordinary captures update the board, tray, turn, counter, and SAN', () => {
  const g = new ChessGame();
  ['e2e4', 'd7d5'].forEach(m => play(g, m));
  assert.equal(play(g, 'e4d5').move.san, 'exd5');
  assert.equal(g.state.board[squareIndex('e4')], null);
  assert.equal(g.state.board[squareIndex('d5')], 'P');
  assert.deepEqual(g.state.captures.w, ['p']);
  assert.equal(g.state.turn, 'b');
  assert.equal(g.state.halfmove, 0);
});
test('A pinned piece cannot expose its king', () => {
  const g = new ChessGame('k3r3/8/8/8/8/8/4R3/4K3 w - - 0 1');
  const before = g.state;
  assert.equal(g.move('e2', 'd2').ok, false);
  assert.deepEqual(g.state, before);
  assert.equal(play(g, 'e2e8').move.san, 'Rxe8+');
});
test('Kings cannot approach each other or capture another king', () => {
  assert.equal(hasMove('8/8/8/8/8/4k3/8/4K3 w - - 0 1', 'e1e2'), false);
  assert.equal(hasMove('8/8/8/8/8/8/4k3/4K3 w - - 0 1', 'e1e2'), false);
});
test('King-side castling moves both pieces and undo restores ALL state', () => {
  const g = new ChessGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'), before = g.state;
  assert.equal(play(g, 'e1g1').move.san, 'O-O');
  assert.equal(g.state.board[squareIndex('g1')], 'K');
  assert.equal(g.state.board[squareIndex('f1')], 'R');
  assert.equal(g.state.board[squareIndex('h1')], null);
  assert.equal(g.state.castling.K, false);
  assert.equal(g.state.castling.Q, false);
  assert.equal(g.state.castling.k, true);
  assert.equal(g.state.halfmove, 1);
  g.undo();
  assert.deepEqual(g.state, before);
});
test('Queen-side castling and Black castling', () => {
  const g = new ChessGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  assert.equal(play(g, 'e1c1').move.san, 'O-O-O');
  assert.equal(g.state.board[squareIndex('d1')], 'R');
  assert.equal(play(g, 'e8g8').move.san, 'O-O');
  assert.equal(g.state.board[squareIndex('f8')], 'r');
});
test('Castling is forbidden while in, through, or into check', () => {
  for (const fen of ['k3r3/8/8/8/8/8/8/4K2R w K - 0 1', 'k4r2/8/8/8/8/8/8/4K2R w K - 0 1', 'k5r1/8/8/8/8/8/8/4K2R w K - 0 1']) assert.equal(hasMove(fen, 'e1g1'), false);
});
test('Queen-side b-file must be empty, but need not be unattacked', () => {
  assert.equal(hasMove('1r2k3/8/8/8/8/8/8/R3K3 w Q - 0 1', 'e1c1'), true);
  assert.equal(hasMove('4k3/8/8/8/8/8/8/RN2K3 w Q - 0 1', 'e1c1'), false);
});
test('Missing rook, lost rights, and a returning rook cannot enable castling', () => {
  assert.equal(hasMove('4k3/8/8/8/8/8/8/4K3 w KQ - 0 1', 'e1g1'), false);
  assert.equal(hasMove('r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1', 'e1g1'), false);
  const g = new ChessGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  ['h1h2', 'h8h7', 'h2h1', 'h7h8'].forEach(m => play(g, m));
  assert.equal(g.state.castling.K, false);
  assert.equal(g.state.castling.k, false);
  assert.equal(g.legalMoves('e1').some(m => m.to === squareIndex('g1')), false);
});
test('Capturing a home rook removes its right; undo restores it and captures', () => {
  const g = new ChessGame('r3k2r/1B6/8/8/8/8/8/R3K2R w KQkq - 0 1'), before = g.state;
  play(g, 'b7a8');
  assert.equal(g.state.castling.q, false);
  assert.equal(g.state.castling.k, true);
  assert.deepEqual(g.state.captures.w, ['r']);
  g.undo();
  assert.deepEqual(g.state, before);
});
test('En passant capture, SAN, victim removal, and complete undo', () => {
  const g = new ChessGame();
  ['e2e4', 'a7a6', 'e4e5', 'd7d5'].forEach(m => play(g, m));
  const before = g.state;
  assert.equal(play(g, 'e5d6').move.san, 'exd6');
  assert.equal(g.state.board[squareIndex('d5')], null);
  assert.equal(g.state.board[squareIndex('d6')], 'P');
  assert.deepEqual(g.state.captures.w, ['p']);
  assert.equal(g.state.epSquare, null);
  assert.equal(g.state.halfmove, 0);
  g.undo();
  assert.deepEqual(g.state, before);
  assert.equal(g.state.epSquare, squareIndex('d6'));
});
test('Black en passant removes the White victim and restores correctly', () => {
  const g = new ChessGame('7k/8/8/8/3Pp3/8/8/7K b - d3 0 1'), before = g.state;
  assert.equal(play(g, 'e4d3').move.san, 'exd3');
  assert.equal(g.state.board[squareIndex('d4')], null);
  assert.equal(g.state.board[squareIndex('d3')], 'p');
  assert.deepEqual(g.state.captures.b, ['P']);
  g.undo();
  assert.deepEqual(g.state, before);
});
test('En passant expires immediately after another move', () => {
  const g = new ChessGame();
  ['e2e4', 'a7a6', 'e4e5', 'd7d5', 'g1f3', 'a6a5'].forEach(m => play(g, m));
  assert.equal(g.state.epSquare, null);
  assert.equal(g.move('e5', 'd6').ok, false);
});
test('En passant cannot expose either a file or a rank attack', () => {
  assert.equal(hasMove('k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', 'e5d6'), false);
  assert.equal(hasMove('8/8/8/r4pPK/8/8/8/4k3 w - f6 0 1', 'g5f6'), false);
});
test('Repetition identity includes only LEGAL en passant availability', () => {
  const pinned = 'k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1';
  assert.equal(E.repetitionKey(parseFEN(pinned)), E.repetitionKey(parseFEN(pinned.replace('d6', '-'))));
  const legal = '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1';
  assert.notEqual(E.repetitionKey(parseFEN(legal)), E.repetitionKey(parseFEN(legal.replace('d6', '-'))));
  const noCapturer = E.applyMove(parseFEN(E.START_FEN), generateLegalMoves(parseFEN(E.START_FEN)).find(m => m.from === squareIndex('e2') && m.to === squareIndex('e4')));
  assert.equal(E.repetitionKey(noCapturer).endsWith(' -'), true);
});
test('Promotion is atomic, accepts all four choices, and undoes completely', () => {
  for (const type of ['q', 'r', 'b', 'n']) {
    const g = new ChessGame('7k/P7/8/8/8/8/8/7K w - - 0 1'), before = g.state;
    assert.equal(g.move('a7', 'a8').needsPromotion, true);
    assert.deepEqual(g.state, before);
    assert.equal(g.move('a7', 'a8', 'k').ok, false);
    assert.deepEqual(g.state, before);
    const result = play(g, 'a7a8' + type);
    assert.equal(g.state.board[squareIndex('a8')], type.toUpperCase());
    assert.equal(result.move.san.startsWith('a8=' + type.toUpperCase()), true);
    g.undo();
    assert.deepEqual(g.state, before);
  }
});
test('Promotion captures and Black promotions are correct', () => {
  const g = new ChessGame('r3k3/1P6/8/8/8/8/8/7K w q - 0 1');
  assert.equal(play(g, 'b7a8q').move.san, 'bxa8=Q+');
  assert.deepEqual(g.state.captures.w, ['r']);
  assert.equal(g.state.castling.q, false);
  const b = new ChessGame('7k/8/8/8/8/8/p7/7K b - - 0 1');
  assert.equal(play(b, 'a2a1q').move.san, 'a1=Q+');
  assert.equal(b.state.board[squareIndex('a1')], 'q');
});
test('SAN disambiguates by file, rank, or both', () => {
  assert.equal(play(new ChessGame('7k/8/8/8/8/8/3N3N/7K w - - 0 1'), 'd2f3').move.san, 'Ndf3');
  assert.equal(play(new ChessGame('7k/8/8/1N6/8/1N6/8/7K w - - 0 1'), 'b3d4').move.san, 'N3d4');
  assert.equal(play(new ChessGame('7k/8/8/1N6/8/1N3N2/8/7K w - - 0 1'), 'b3d4').move.san, 'Nb3d4');
});
test('A pinned alternative does NOT cause SAN disambiguation', () => {
  assert.equal(play(new ChessGame('k3r3/8/8/8/8/8/4N1N1/4K3 w - - 0 1'), 'g2f4').move.san, 'Nf4');
});
test('Fool’s mate: check, checkmate, result, move lock, and undo', () => {
  const g = new ChessGame();
  ['f2f3', 'e7e5', 'g2g4'].forEach(m => play(g, m));
  const before = g.state;
  assert.equal(play(g, 'd8h4').move.san, 'Qh4#');
  assert.deepEqual(g.state.result, { type: 'checkmate', winner: 'b', reason: 'checkmate' });
  assert.equal(g.getStatus().inCheck, true);
  assert.equal(g.legalMoves().length, 0);
  assert.equal(g.move('a2', 'a3').ok, false);
  g.undo();
  assert.deepEqual(g.state, before);
});
test('Stalemate is distinct from checkmate', () => {
  const g = new ChessGame('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
  assert.equal(g.state.result.reason, 'stalemate');
  assert.equal(g.getStatus().inCheck, false);
});
test('Insufficient material: kings, one minor, same-color bishops only', () => {
  for (const fen of ['7k/8/8/8/8/8/8/7K w - - 0 1', '7k/8/8/8/8/8/8/6NK w - - 0 1', '7k/8/8/8/8/8/8/5B1K w - - 0 1', '5b1k/8/8/8/8/8/8/2B4K w - - 0 1']) assert.equal(new ChessGame(fen).state.result.reason, 'insufficient');
  for (const fen of ['7k/8/8/8/8/8/8/5NNK w - - 0 1', '6nk/8/8/8/8/8/8/6NK w - - 0 1', '6bk/8/8/8/8/8/8/2B4K w - - 0 1']) assert.equal(E.isInsufficientMaterial(parseFEN(fen)), false);
});
test('Threefold can be claimed now or BEFORE a declared move', () => {
  const g = new ChessGame();
  assert.equal(g.claimDraw().ok, false);
  ['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1'].forEach(m => play(g, m));
  assert.equal(g.claimOptions().current.length, 0);
  assert.equal(g.claimOptions().byMove.some(o => o.san === 'Ng8'), true);
  const before = g.state;
  assert.equal(g.claimDraw({ from: 'f6', to: 'g8' }).ok, true);
  assert.equal(g.state.result.reason, 'threefold');
  assert.equal(g.state.result.intendedSAN, 'Ng8');
  assert.deepEqual(g.state.board, before.board);
  assert.deepEqual(g.state.moves, before.moves);
  assert.equal(g.state.halfmove, before.halfmove);
  assert.equal(g.lastAction, 'claim');
  g.undo();
  assert.deepEqual(g.state, before);
  play(g, 'f6g8');
  assert.equal(g.state.result, null); // FIDE: threefold is claimable, not automatic.
  assert.deepEqual(g.claimOptions().current, ['threefold']);
  assert.equal(g.claimDraw().ok, true);
  assert.equal(g.state.result.reason, 'threefold');
});
test('Fivefold repetition is automatic and undoes to the correct count', () => {
  const g = new ChessGame();
  const cycle = ['g1f3', 'g8f6', 'f3g1', 'f6g8'];
  for (let i = 0; i < 4; i++) cycle.forEach(m => play(g, m));
  assert.equal(g.state.result.reason, 'fivefold');
  g.undo();
  assert.equal(g.state.result, null);
  assert.equal(g.claimOptions().byMove.some(o => o.san === 'Ng8'), true);
  play(g, 'f6g8');
  assert.equal(g.state.result.reason, 'fivefold');
});
test('Castling rights and side to move are part of repetition identity', () => {
  const g = new ChessGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1'), initial = g.state;
  ['e1f1', 'e8f8', 'f1e1', 'f8e8'].forEach(m => play(g, m));
  assert.deepEqual(g.state.board, initial.board);
  assert.notEqual(g.state.positionKey, initial.positionKey);
  assert.equal(g.state.repetitionCounts[g.state.positionKey], 1);
  assert.notEqual(E.repetitionKey(initial), E.repetitionKey({ ...initial, turn: 'b' }));
});
test('Fifty-move claim: 100 half-moves, intended move, and undo', () => {
  const g = new ChessGame('7k/8/8/8/8/8/R7/7K w - - 99 1');
  assert.equal(g.claimOptions().current.length, 0);
  assert.equal(g.claimOptions().byMove.some(o => o.san === 'Rb2'), true);
  const before = g.state;
  assert.equal(g.claimDraw({ from: 'a2', to: 'b2' }).ok, true);
  assert.equal(g.state.result.reason, 'fiftyMove');
  assert.deepEqual(g.state.board, before.board);
  g.undo();
  assert.deepEqual(g.state, before);
  play(g, 'a2b2');
  assert.equal(g.state.halfmove, 100);
  assert.equal(g.state.result, null);
  assert.deepEqual(g.claimOptions().current, ['fiftyMove']);
  const at100 = g.state;
  g.claimDraw();
  assert.equal(g.state.result.reason, 'fiftyMove');
  g.undo();
  assert.deepEqual(g.state, at100);
  g.undo();
  assert.deepEqual(g.state, before);
});
test('Pawn moves and captures reset the fifty-move counter', () => {
  const pawn = new ChessGame('7k/8/8/8/8/8/4P3/7K w - - 99 1');
  play(pawn, 'e2e3');
  assert.equal(pawn.state.halfmove, 0);
  const capture = new ChessGame('7k/8/8/8/8/p7/R7/7K w - - 99 1');
  play(capture, 'a2a3');
  assert.equal(capture.state.halfmove, 0);
});
test('Seventy-five-move rule is automatic at 150 half-moves', () => {
  const g = new ChessGame('7k/8/8/8/8/8/R7/7K w - - 149 1');
  play(g, 'a2b2');
  assert.equal(g.state.result.reason, 'seventyFive');
});
test('Checkmate takes precedence over move-counter draws', () => {
  const g = new ChessGame('7k/8/5KQ1/8/8/8/8/8 w - - 149 1');
  assert.equal(g.claimOptions().byMove.some(o => o.san === 'Qg7#'), false);
  assert.equal(play(g, 'g6g7').move.san, 'Qg7#');
  assert.equal(g.state.halfmove, 150);
  assert.equal(g.state.result.type, 'checkmate');
});
test('Repeated undo restores every snapshot, down to the starting state', () => {
  const g = new ChessGame(), snapshots = [g.state];
  for (const move of ['e2e4', 'a7a6', 'e4e5', 'd7d5', 'e5d6', 'e7e6', 'g1f3', 'g8f6', 'f1e2', 'f8e7', 'e1g1']) {
    play(g, move); snapshots.push(g.state);
  }
  for (let i = snapshots.length - 2; i >= 0; i--) {
    assert.equal(g.undo(), true);
    assert.deepEqual(g.state, snapshots[i]);
  }
  assert.equal(g.canUndo, false);
  assert.equal(g.undo(), false);
});

console.log(`\n${passed} regression tests passed. All reference perft counts match.`);

```
