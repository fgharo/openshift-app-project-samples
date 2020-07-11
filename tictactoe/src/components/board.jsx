import React from 'react';
import '../index.css';
import Square from './square';

export default class Board extends React.Component {
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
