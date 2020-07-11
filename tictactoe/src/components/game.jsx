import React from 'react';
import '../index.css';
import Board from './board';

export default class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        indices: [-1,-1],
      }],
      stepNumber: 0,
      nextUp: 'X',
      sortMoves: true,
    }
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      nextUp: ((step%2) === 0) ? 'X': 'O',
    });
  }

  getNewSquares(oldSquares, indexToMark){
    const newSquares = oldSquares.slice();
    newSquares[indexToMark] = this.state.nextUp;
    return newSquares;
  }

  getNewNextUp(currentNextUp){
    return (currentNextUp === 'X'? 'O': 'X');
  }

  getIndicesMarked(index){
    switch(index){
      case 0: return [0, 0];
      case 1: return [0, 1];
      case 2: return [0, 2];
      case 3: return [1, 0];
      case 4: return [1, 1];
      case 5: return [1, 2];
      case 6: return [2, 0];
      case 7: return [2, 1];
      default: return [2, 2];
    }
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length-1];
    if(calculateWinner(current.squares) || current.squares[i]){
      return;
    }

    this.setState({
      history: history.concat([{squares: this.getNewSquares(current.squares, i), indices: this.getIndicesMarked(i)}]),
      stepNumber: history.length,
      nextUp: this.getNewNextUp(this.state.nextUp),
    });
  }

  sortMoves(){
    this.setState({
      sortMoves: !this.state.sortMoves,
    });
    console.log(this.state.sortMoves);
  }

  render() {
    let history = this.state.history.slice();

    /*
    TODO Add a toggle button that lets you sort the moves in either ascending or descending order.
    This doesn't work.
    if(!this.state.sortMoves){
      history.reverse();
    }
    */

    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    let status;
    if(winner){
      if(winner.stalemate){
          status = 'Oooh Stalemate!';
      }else{
          status = winner.name + ' won!';
      }

    }else{
      status = 'Next player: ' + this.state.nextUp;
    }

    let moves = history.map((step,move)=>{
        const desc = (move ?
          'Go to move #' + move : 'Go to game start');

        const desc2 = (step.indices[0] === -1)? 'Nobody has marked.' : 'Row ' + step.indices[0] + ', Column ' + step.indices[1] + ' marked.'
        const highlightColor = (move === this.state.stepNumber)? 'yellow': 'none';
        const customKey = move + ',' + highlightColor;

        return (
          <li key={customKey}>
            <button onClick={()=> this.jumpTo(move)} style={{ 'backgroundColor': highlightColor}}>{desc}</button> {desc2}
          </li>
        );
    });

    let board = {
      squares: current.squares,
      winningLine: (winner)? winner.winningLine:null,
    };

    return (
      <div>
        <div>
          <h1>TicTacToe</h1>
        </div>
        <div className="game">
          <div className="game-board">
            <Board
              value={board}
              onClick={(i)=> this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <label>
              Sort Moves
              <input type="checkbox" defaultChecked={this.state.sortMoves} onChange={()=>{this.sortMoves(); }}/>
            </label>
            <ol>{moves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {stalemate: false, name: squares[a], winningLine: lines[i]};
    }
  }

  // check if we can still make progress in the game.
  for(let i = 0; i < squares.length; i++){
    if(squares[i]==null){
      return null;
    }
  }

  // otherwise its a stalemate
  return {stalemate: true, name: null, winningLine: null};
}
