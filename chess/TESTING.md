# Verification — NOIR Chess

Verified on 30 September 2026.

## Rules-engine regression suite

**38 tests passed**, using Node.js 20 and its built-in assertion module. Run them with `node tests.js`; no packages or build step are required.

The suite covers:

- Standard setup and defensive, read-only rendering snapshots.
- Move legality, blocked pawns, captures, pins, and kings' safety.
- Both castlings and colors; in-check, transit-check, and destination-check rejection; lost/returning-rook rights; rook captures; and complete undo.
- White and Black en passant, immediate expiry, file/rank discovered checks, repetition identity, and undo.
- All four promotions, promotion captures, atomic choice/cancellation, and Black promotion.
- SAN captures, castling, promotion, check, mate, and file/rank/full-square disambiguation, excluding pinned alternatives.
- Checkmate, stalemate, insufficient material, threefold claims, intended-move claims, automatic fivefold repetition, fifty-move counters/claims, the seventy-five-move rule, and checkmate precedence.
- Repeated undo of complete snapshots, including every special-move right and draw counter.

### Reference move-tree counts (perft)

| Position | Depth 1 | Depth 2 | Depth 3 | Depth 4 |
| --- | ---: | ---: | ---: | ---: |
| Standard opening | 20 | 400 | 8,902 | 197,281 |
| Kiwipete (castling-heavy) | 48 | 2,039 | 97,862 | — |
| Rook/pawn endgame | 14 | 191 | 2,812 | 43,238 |
| Promotion / check evasion | 6 | 264 | 9,467 | — |
| Underpromotion / castling rights | 44 | 1,486 | 62,379 | — |

All listed counts match their known reference values.

## Independent cross-check

Across **12,413 positions from 80 deterministic random games**, the engine agreed with an independent development-only rules reference on:

- The complete legal-move set in every position.
- Standard algebraic notation for the chosen move.
- Position FEN before and after each move, including special-move rights and counters.
- Check, insufficient material, and automatic results.

The reference software is **not included in, linked to, or required by the game**.

## Browser verification

**16 browser interaction groups passed** in Chromium, using desktop and mobile/touch emulation:

1. Initial orientation, all 32 pieces, accessible control names, and disabled initial undo.
2. Click selection, legal markers, turn enforcement, illegal-move rejection, last-move markers, and SAN.
3. Captures, captured-piece display, and visible-state undo.
4. Board flip without changing position, history, captures, or turn.
5. New-game confirmation, Keep playing, Escape, close, and reset.
6. Roving board focus, arrows, Enter, Space, Home/End, Ctrl+Home/End, and Escape.
7. Legal dragging, illegal-drop rollback, and drag-ghost cleanup.
8. Help dialog and every dismissal path.
9. Castling interaction, undo of rights, and transit-check rejection.
10. En passant interaction/undo and pinned-en-passant rejection.
11. Queen, rook, bishop, and knight promotion; click and drag; Escape, close, and undo.
12. Checkmate, ended-game move lock, undo, stalemate, insufficient material, and result scores.
13. Current-position / declared-move draw claims, claim undo, and automatic draw display.
14. Actual touch-event taps and dragging; scrolling suppression scoped only to the board.
15. No horizontal overflow at widths of 320, 390, 768, 1,024, and 1,440 pixels.
16. No JavaScript exceptions or browser-console errors in these tests.

Both the multi-file `index.html` and single-file `NOIR-Chess.html` were opened directly with `file://`, moved in, and undone successfully.

The single-file edition was additionally tested inside an opaque-origin iframe with `sandbox="allow-scripts"` and all network requests blocked. Moves, modal help, flip, new-game confirmation/reset, and local brand navigation worked with **zero network requests and zero runtime or console errors**.

These are automated Chromium checks, not a claim that every browser/assistive-technology combination has been exhaustively tested.
