import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './components/game';

/*
EXTRA TODOS:
Display the location for each move in the format (col, row) in the move history list. done
Bold the currently selected item in the move list. done
Rewrite Board to use two loops to make the squares instead of hardcoding them. done did it with one loop
Add a toggle button that lets you sort the moves in either ascending or descending order.
When someone wins, highlight the three squares that caused the win. done
When no one wins, display a message about the result being a draw. done

*/

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
