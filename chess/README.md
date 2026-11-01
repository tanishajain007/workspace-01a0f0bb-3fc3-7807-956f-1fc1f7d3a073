# NOIR — The chess room

A complete, offline chess game for two people sharing a device. Written entirely in HTML, CSS, and vanilla JavaScript. No frameworks, libraries, game engines, remote assets, build tools, or installation are needed to play.

## Open the game

1. Extract the source ZIP.
2. Keep `index.html`, `styles.css`, `engine.js`, and `app.js` together.
3. Double-click **`index.html`** to open it in a modern browser.

Alternatively, open **`NOIR-Chess.html`**, the self-contained edition. It contains exactly the same styles, engine, and interface, embedded in one portable file. It also works without a server or internet connection.

Use a current version of Chrome, Edge, Firefox, or Safari with JavaScript enabled. The current game stays in memory; refreshing or closing the page starts over. There are no clocks, accounts, computer opponents, or online connections.

## Play

- **White moves first**, with White at the bottom of the starting board. Each player moves only their own pieces.
- **Click or tap** a piece, then a marked destination. Click the selected piece again to deselect it.
- **Drag and drop** also works with a mouse or touch. An illegal or canceled drop never changes the position.
- Dots indicate legal destinations. Rings indicate legal captures, including en passant. Corner brackets mark the last move. A dashed king outline and an **“!”** indicate check. These cues do not depend on color alone.
- A pawn reaching its last rank opens a choice of **queen, rook, bishop, or knight**. The move is committed only after you choose. Escape or the close button cancels it without changing the game.
- The player strips show captured pieces. A `+N` badge denotes that player's current material advantage (pawn 1, knight/bishop 3, rook 5, queen 9), not a game score.
- The score sheet uses **standard algebraic notation**: `Nf3`, `exd5`, `O-O`, `O-O-O`, `a8=Q`, `+` for check, and `#` for checkmate. It includes legal-move-based disambiguation.

### Keyboard

Tab into the board, then use:

| Key | Action |
| --- | --- |
| Arrow keys | Navigate in the board's current visual orientation |
| Enter / Space | Select a piece or move to a legal destination |
| Escape | Clear the selection or cancel/close a dialog |
| Home / End | First / last square of the current visual row |
| Ctrl + Home / End | First / last square of the entire visual board |
| Tab / Shift + Tab | Move between the board and other controls |

The board has one tab stop, descriptive square labels, visible focus, and live move announcements. Dialogs use native modal focus management. The move-history area can also be focused and scrolled with the keyboard. Normal page scrolling and text selection remain available outside the board.

### Controls

- **New game** asks for confirmation while a game is active, then restores the standard position, clears all history and captures, and places White at the bottom. A finished game can be reset immediately.
- **Undo move** restores the entire prior state: position, turn, captured pieces, score sheet, last move, castling rights, en passant target, full-move and half-move counters, repetition counts, and game result. One undo reverses one player's move.
- After a claimed draw, the control reads **Undo claim**. Its first activation withdraws the claim without undoing a played move; a subsequent undo reverses the preceding move.
- **Flip board** rotates the view and coordinates by 180 degrees. It does not change the position, player to move, special-move rights, or counters.
- **How to play** opens the in-game instructions.

## Rules and draws

All piece moves, captures, checks, checkmates, stalemates, both castlings, en passant, and all four promotions are implemented. Every input path is checked against the same legal-move generator, including the moving king's safety.

Draw handling follows the distinction between **claimable** and **automatic** draws:

- **Threefold repetition:** use **Claim a draw** when the same position has occurred at least three times. Position identity includes the player to move, castling rights, and *legally available* en passant captures.
- **Fifty-move rule:** use **Claim a draw** after 100 half-moves (50 moves by each side) without a pawn move or capture.
- Both claims also support an **intended next move**. If a legal next move would qualify, the claim dialog offers that move. Declaring it ends the game **before the move is played**; the board and score sheet stay unchanged and the declared move appears with the result.
- **Fivefold repetition** and **75 moves by each side** without a pawn move or capture end the game automatically. Checkmate takes precedence over the move-counter draw.
- **Stalemate** ends the game automatically.
- **Insufficient material** is detected for bare kings, a single bishop or knight against a king, and bishops-only positions where every bishop is confined to the same color complex. Two knights, mixed minor pieces, and opposite-colored bishops are not incorrectly declared drawn just because a mate cannot be forced.

Claims do not have to be accepted by the other player: they are available only when the engine verifies their conditions. Choosing to keep playing at threefold repetition or the fifty-move threshold is intentional and follows standard claim rules.

## Source files

| File | Purpose |
| --- | --- |
| `index.html` | Semantic page, controls, SVG icon definitions, and accessible dialogs |
| `styles.css` | Monochrome presentation, piece styling, state markers, and responsive layouts |
| `engine.js` | Independent rules engine, SAN, repetition identity, draws, and full-state undo |
| `app.js` | Rendering, original embedded piece vectors, pointer/touch input, and keyboard navigation |
| `tests.js` | Optional regression tests using only Node's built-in assertion module |
| `TESTING.md` | Verification summary |
| `NOIR-Chess.html` | Self-contained edition; no companion files required |

The engine owns the authoritative game state and gives rendering defensive snapshots. Pure move validation is independent of the DOM. Clicks, taps, drags, and promotions all call `ChessGame.move()`; no interaction handler directly edits a piece or game counter. An undo snapshot includes the complete game state, not just the board.

## Optional tests

If Node.js is already installed, run:

```sh
node tests.js
```

This is **not** a build step and is **not** needed to play. No packages need to be installed. The suite covers reference move-tree counts, king safety, special moves, notation, draw claims, counters, and complete undo.
