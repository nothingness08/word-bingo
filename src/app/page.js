"use client";
import "./globals.css";
import { useEffect, useState } from 'react';
import sightWords from './sightWords';

function randomInt(max) {
  return Math.floor(Math.random() * (max+1));
}

function arraysEqual(arr1, arr2) { //takes in two arrays
  if (arr1.length !== arr2.length) return false; //if they are not same length, return false
  return arr1.every((value, index) => value === arr2[index]); //return true if all of the vales are the same at each index, else false
}

export default function Game(){
  const [board, setBoard] = useState([]);
  const [gridSize, setGridSize] = useState(5);
  const [correctWord, setCorrectWord] = useState("");
  const [correctClicked, setCorrectClicked] = useState([]); 
  const [words, setWords] = useState([]);
  const [incorrectClicked, setIncorrectClicked] = useState([]);


  useEffect(() => {
    const initialBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

    let shuffledWords = [...sightWords];
    for (let i = shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
    }
    
    shuffledWords = shuffledWords.slice(0, gridSize*gridSize);
    setWords(shuffledWords);
    
    for(let i = 0; i < gridSize; i++){
    for(let j = 0; j < gridSize; j++){
      const index = (i*gridSize) + j;
      initialBoard[i][j] = shuffledWords[index];
    }
    }
    setBoard(initialBoard);
    setCorrectWord(shuffledWords[randomInt(gridSize * gridSize)]);
  }, []);
  

  function randomNewWord(){
    let randRow, randCol;
    do{
      randRow = randomInt(gridSize -1);
      randCol = randomInt(gridSize -1);
    }while(!board[randRow][randCol])
    return board[randRow][randCol]
  }

  function handleCellClick(word, row, col){
    if(!board[row][col] || arraysEqual(incorrectClicked, [row, col]))return;
    const clickedCell = [row, col];
    if(word === correctWord){
      const newCorrectClicked = [...correctClicked, clickedCell];
      setCorrectClicked(newCorrectClicked);

      const newBoard = [...board];
      newBoard[row][col] = null;
      setBoard(newBoard);
      setIncorrectClicked([]);
    }else{
      const newIncorrectClicked = clickedCell;
      setIncorrectClicked(newIncorrectClicked);

      setTimeout(() => removeIncorrect(), 1500);
    }

    let newWord;
    do{
      newWord = randomNewWord();
    }while(newWord === correctWord);
    setCorrectWord(newWord);
  }

  function removeIncorrect(){
    setIncorrectClicked([]);
  }

  return(
    <div className="game-container">
      <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {

          const cellStyle = {}; //red/blue/white
          const isCorrect = correctClicked.some(([correctRow, correctCol]) =>
            correctRow === rowIndex && correctCol === colIndex);
          const isIncorrect = arraysEqual([rowIndex, colIndex], incorrectClicked);

          if(isCorrect){cellStyle.backgroundColor = 'green';}
          else if(isIncorrect){cellStyle.backgroundColor = 'red';}
          else{cellStyle.backgroundColor = 'white'}

          return(
            <Cell
            key={`${rowIndex}-${colIndex}`}
            onTileClick={() => handleCellClick(cell, rowIndex, colIndex)}
            value={cell}
            style={cellStyle}
          />
          )
        })
      )}
      </div>
      <div>{correctWord}</div>
    </div>
    
  );
}

function Cell({onTileClick, value, style}){
  return(
    <button 
      className="cell"
      onClick={onTileClick} 
      style={style}
    >{value}</button>
  );
}