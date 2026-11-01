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
