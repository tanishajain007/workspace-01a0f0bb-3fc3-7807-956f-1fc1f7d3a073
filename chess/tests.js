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
