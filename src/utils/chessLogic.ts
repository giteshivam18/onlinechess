import type { Board, Piece, Position, PieceColor, Move, GameState } from '../types/chess';

export const PIECE_SYMBOLS: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟',
};

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  const backRow: Array<Piece['type']> = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: 'black' };
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
    board[7][col] = { type: backRow[col], color: 'white' };
  }

  return board;
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

export function getPieceAt(board: Board, pos: Position): Piece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

export function findKing(board: Board, color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

export function isSquareUnderAttack(board: Board, pos: Position, byColor: PieceColor): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const moves = getPseudoLegalMoves(board, { row, col }, null);
        if (moves.some(move => move.row === pos.row && move.col === pos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  return isSquareUnderAttack(board, kingPos, color === 'white' ? 'black' : 'white');
}

function getPseudoLegalMoves(board: Board, from: Position, enPassantTarget: Position | null): Position[] {
  const piece = getPieceAt(board, from);
  if (!piece) return [];

  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, from, piece.color, enPassantTarget);
    case 'knight':
      return getKnightMoves(board, from, piece.color);
    case 'bishop':
      return getBishopMoves(board, from, piece.color);
    case 'rook':
      return getRookMoves(board, from, piece.color);
    case 'queen':
      return getQueenMoves(board, from, piece.color);
    case 'king':
      return getKingMoves(board, from, piece.color);
    default:
      return [];
  }
}

function getPawnMoves(board: Board, from: Position, color: PieceColor, enPassantTarget: Position | null): Position[] {
  const moves: Position[] = [];
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  const forward = { row: from.row + direction, col: from.col };
  if (isValidPosition(forward) && !getPieceAt(board, forward)) {
    moves.push(forward);

    if (from.row === startRow) {
      const doubleForward = { row: from.row + 2 * direction, col: from.col };
      if (!getPieceAt(board, doubleForward)) {
        moves.push(doubleForward);
      }
    }
  }

  const captures = [
    { row: from.row + direction, col: from.col - 1 },
    { row: from.row + direction, col: from.col + 1 },
  ];

  for (const capture of captures) {
    if (isValidPosition(capture)) {
      const targetPiece = getPieceAt(board, capture);
      if (targetPiece && targetPiece.color !== color) {
        moves.push(capture);
      }

      if (enPassantTarget && capture.row === enPassantTarget.row && capture.col === enPassantTarget.col) {
        moves.push(capture);
      }
    }
  }

  return moves;
}

function getKnightMoves(board: Board, from: Position, color: PieceColor): Position[] {
  const moves: Position[] = [];
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];

  for (const [dRow, dCol] of offsets) {
    const to = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(to)) {
      const targetPiece = getPieceAt(board, to);
      if (!targetPiece || targetPiece.color !== color) {
        moves.push(to);
      }
    }
  }

  return moves;
}

function getBishopMoves(board: Board, from: Position, color: PieceColor): Position[] {
  return getSlidingMoves(board, from, color, [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ]);
}

function getRookMoves(board: Board, from: Position, color: PieceColor): Position[] {
  return getSlidingMoves(board, from, color, [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ]);
}

function getQueenMoves(board: Board, from: Position, color: PieceColor): Position[] {
  return getSlidingMoves(board, from, color, [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ]);
}

function getSlidingMoves(board: Board, from: Position, color: PieceColor, directions: number[][]): Position[] {
  const moves: Position[] = [];

  for (const [dRow, dCol] of directions) {
    let row = from.row + dRow;
    let col = from.col + dCol;

    while (isValidPosition({ row, col })) {
      const targetPiece = getPieceAt(board, { row, col });
      if (!targetPiece) {
        moves.push({ row, col });
      } else {
        if (targetPiece.color !== color) {
          moves.push({ row, col });
        }
        break;
      }
      row += dRow;
      col += dCol;
    }
  }

  return moves;
}

function getKingMoves(board: Board, from: Position, color: PieceColor): Position[] {
  const moves: Position[] = [];
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];

  for (const [dRow, dCol] of offsets) {
    const to = { row: from.row + dRow, col: from.col + dCol };
    if (isValidPosition(to)) {
      const targetPiece = getPieceAt(board, to);
      if (!targetPiece || targetPiece.color !== color) {
        moves.push(to);
      }
    }
  }

  return moves;
}

export function getLegalMoves(
  board: Board,
  from: Position,
  enPassantTarget: Position | null,
  castlingRights: GameState['castlingRights']
): Position[] {
  const piece = getPieceAt(board, from);
  if (!piece) return [];

  let moves = getPseudoLegalMoves(board, from, enPassantTarget);

  if (piece.type === 'king') {
    const row = piece.color === 'white' ? 7 : 0;

    if (piece.color === 'white' && castlingRights.whiteKingSide) {
      if (canCastle(board, piece.color, 'kingside')) {
        moves.push({ row, col: 6 });
      }
    }
    if (piece.color === 'white' && castlingRights.whiteQueenSide) {
      if (canCastle(board, piece.color, 'queenside')) {
        moves.push({ row, col: 2 });
      }
    }
    if (piece.color === 'black' && castlingRights.blackKingSide) {
      if (canCastle(board, piece.color, 'kingside')) {
        moves.push({ row, col: 6 });
      }
    }
    if (piece.color === 'black' && castlingRights.blackQueenSide) {
      if (canCastle(board, piece.color, 'queenside')) {
        moves.push({ row, col: 2 });
      }
    }
  }

  moves = moves.filter(to => {
    const testBoard = board.map(row => [...row]);
    testBoard[to.row][to.col] = testBoard[from.row][from.col];
    testBoard[from.row][from.col] = null;

    if (piece.type === 'pawn' && enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
      const captureRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      testBoard[captureRow][to.col] = null;
    }

    return !isInCheck(testBoard, piece.color);
  });

  return moves;
}

function canCastle(board: Board, color: PieceColor, side: 'kingside' | 'queenside'): boolean {
  const row = color === 'white' ? 7 : 0;
  const kingCol = 4;

  if (isInCheck(board, color)) return false;

  if (side === 'kingside') {
    if (board[row][5] || board[row][6]) return false;

    const testBoard = board.map(r => [...r]);
    testBoard[row][5] = testBoard[row][kingCol];
    testBoard[row][kingCol] = null;
    if (isInCheck(testBoard, color)) return false;

    if (isSquareUnderAttack(board, { row, col: 6 }, color === 'white' ? 'black' : 'white')) return false;
  } else {
    if (board[row][1] || board[row][2] || board[row][3]) return false;

    const testBoard = board.map(r => [...r]);
    testBoard[row][3] = testBoard[row][kingCol];
    testBoard[row][kingCol] = null;
    if (isInCheck(testBoard, color)) return false;

    if (isSquareUnderAttack(board, { row, col: 2 }, color === 'white' ? 'black' : 'white')) return false;
  }

  return true;
}

export function makeMove(gameState: GameState, from: Position, to: Position): GameState | null {
  const piece = getPieceAt(gameState.board, from);
  if (!piece || piece.color !== gameState.currentPlayer) return null;

  const legalMoves = getLegalMoves(gameState.board, from, gameState.enPassantTarget, gameState.castlingRights);
  if (!legalMoves.some(move => move.row === to.row && move.col === to.col)) return null;

  const newBoard = gameState.board.map(row => [...row]);
  const capturedPiece = newBoard[to.row][to.col];
  const newCapturedPieces = { ...gameState.capturedPieces };

  let isEnPassant = false;
  let isCastling = false;

  if (piece.type === 'pawn' && gameState.enPassantTarget && to.row === gameState.enPassantTarget.row && to.col === gameState.enPassantTarget.col) {
    isEnPassant = true;
    const captureRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    const capturedPawn = newBoard[captureRow][to.col];
    if (capturedPawn) {
      newCapturedPieces[piece.color].push(capturedPawn);
    }
    newBoard[captureRow][to.col] = null;
  }

  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    isCastling = true;
    const rookFromCol = to.col === 6 ? 7 : 0;
    const rookToCol = to.col === 6 ? 5 : 3;
    newBoard[to.row][rookToCol] = newBoard[to.row][rookFromCol];
    newBoard[to.row][rookFromCol] = null;
  }

  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  if (capturedPiece && !isEnPassant) {
    newCapturedPieces[piece.color].push(capturedPiece);
  }

  const newEnPassantTarget = piece.type === 'pawn' && Math.abs(to.row - from.row) === 2
    ? { row: (from.row + to.row) / 2, col: from.col }
    : null;

  const newCastlingRights = { ...gameState.castlingRights };
  if (piece.type === 'king') {
    if (piece.color === 'white') {
      newCastlingRights.whiteKingSide = false;
      newCastlingRights.whiteQueenSide = false;
    } else {
      newCastlingRights.blackKingSide = false;
      newCastlingRights.blackQueenSide = false;
    }
  }
  if (piece.type === 'rook') {
    if (piece.color === 'white') {
      if (from.row === 7 && from.col === 7) newCastlingRights.whiteKingSide = false;
      if (from.row === 7 && from.col === 0) newCastlingRights.whiteQueenSide = false;
    } else {
      if (from.row === 0 && from.col === 7) newCastlingRights.blackKingSide = false;
      if (from.row === 0 && from.col === 0) newCastlingRights.blackQueenSide = false;
    }
  }

  const move: Move = {
    from,
    to,
    piece,
    capturedPiece: capturedPiece || undefined,
    isEnPassant,
    isCastling,
    notation: getMoveNotation(piece, from, to, capturedPiece !== null, isEnPassant, isCastling),
  };

  const nextPlayer = piece.color === 'white' ? 'black' : 'white';
  const isCheck = isInCheck(newBoard, nextPlayer);
  const hasLegalMoves = checkHasLegalMoves(newBoard, nextPlayer, newEnPassantTarget, newCastlingRights);

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    selectedSquare: null,
    legalMoves: [],
    moveHistory: [...gameState.moveHistory, move],
    capturedPieces: newCapturedPieces,
    isCheck,
    isCheckmate: isCheck && !hasLegalMoves,
    isStalemate: !isCheck && !hasLegalMoves,
    lastMove: move,
    enPassantTarget: newEnPassantTarget,
    castlingRights: newCastlingRights,
  };
}

function checkHasLegalMoves(
  board: Board,
  color: PieceColor,
  enPassantTarget: Position | null,
  castlingRights: GameState['castlingRights']
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, { row, col }, enPassantTarget, castlingRights);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

function getMoveNotation(piece: Piece, from: Position, to: Position, isCapture: boolean, isEnPassant: boolean, isCastling: boolean): string {
  if (isCastling) {
    return to.col === 6 ? 'O-O' : 'O-O-O';
  }

  const files = 'abcdefgh';
  const pieceSymbol = piece.type === 'pawn' ? '' : piece.type.charAt(0).toUpperCase();
  const captureSymbol = isCapture || isEnPassant ? 'x' : '';
  const fromFile = piece.type === 'pawn' && isCapture ? files[from.col] : '';
  const toSquare = files[to.col] + (8 - to.row);

  return `${pieceSymbol}${fromFile}${captureSymbol}${toSquare}`;
}

export function shouldPromotePawn(board: Board, pos: Position): boolean {
  const piece = getPieceAt(board, pos);
  if (!piece || piece.type !== 'pawn') return false;
  return (piece.color === 'white' && pos.row === 0) || (piece.color === 'black' && pos.row === 7);
}

export function promotePawn(gameState: GameState, pos: Position, promoteTo: Piece['type']): GameState {
  const newBoard = gameState.board.map(row => [...row]);
  const piece = newBoard[pos.row][pos.col];
  if (piece) {
    newBoard[pos.row][pos.col] = { ...piece, type: promoteTo };
  }
  return { ...gameState, board: newBoard };
}
