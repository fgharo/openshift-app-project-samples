import React from 'react';
import '../index.css';

export default class Square extends React.Component {
  render(){
    const highlightColor = (this.props.value.won)? 'yellow': 'none';

    return (
      <button className="square" onClick={()=>this.props.onClick()} style={{ 'backgroundColor': highlightColor}}>
        {this.props.value.mark}
      </button>
    );
  }

}
