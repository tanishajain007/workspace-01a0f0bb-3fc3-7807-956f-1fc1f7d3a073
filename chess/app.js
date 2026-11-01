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
