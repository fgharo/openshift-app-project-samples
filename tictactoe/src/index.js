import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/*
EXTRA TODOS:
Display the location for each move in the format (col, row) in the move history list. done
Bold the currently selected item in the move list. done
Rewrite Board to use two loops to make the squares instead of hardcoding them. done did it with one loop
Add a toggle button that lets you sort the moves in either ascending or descending order.
When someone wins, highlight the three squares that caused the win. done
When no one wins, display a message about the result being a draw. done

*/

class Square extends React.Component {
  render(){
    const highlightColor = (this.props.value.won)? 'yellow': 'none';

    return (
      <button className="square" onClick={()=>this.props.onClick()} style={{ 'backgroundColor': highlightColor}}>
        {this.props.value.mark}
      </button>
    );
  }

}

class Board extends React.Component {
  renderSquare(i) {
    let winningSquare = false;
    if(
      this.props.value.winningLine &&
      (i === this.props.value.winningLine[0] || i=== this.props.value.winningLine[1] || i === this.props.value.winningLine[2])){
      winningSquare = true;
    }

    let square = {
      mark: this.props.value.squares[i],
      won: winningSquare,
    };
    let customKey = i + ',' + square.mark + ',' + square.won;
    return (
      <Square
        key={customKey}
        value={square}
        onClick={()=> this.props.onClick(i)}
      />
    );
  }

  render() {
    const rows = [];

    for(const i of [0, 3, 6]){
      rows.push(
        <div className="board-row" key={i}>
          {this.renderSquare(i+0)}
          {this.renderSquare(i+1)}
          {this.renderSquare(i+2)}
        </div>
      );
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
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

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
