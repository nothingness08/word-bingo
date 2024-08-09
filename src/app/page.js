"use client";
import "./globals.css";
import { useEffect, useState } from 'react';
import sightWords from './sightWords';
import speakText from "./speakText";
import winPatterns from "./winPatterns";

function randomInt(max) {
  return Math.floor(Math.random() * (max+1));
}

function arraysEqual(arr1, arr2) { //takes in two arrays
  if (arr1.length !== arr2.length) return false; //if they are not same length, return false
  return arr1.every((value, index) => value === arr2[index]); //return true if all of the vales are the same at each index, else false
}

export default function Game(){
  const [board, setBoard] = useState([]);
  const [gridSize, setGridSize] = useState(5); //winning will not occur if this is changed
  const [correctWord, setCorrectWord] = useState("");
  const [correctClicked, setCorrectClicked] = useState([]); 
  const [words, setWords] = useState([]);
  const [incorrectClicked, setIncorrectClicked] = useState([]);
  const [gameState, setGameState] = useState(1); //0 means stopped, 1 means active


  useEffect(() => {
    gameStart();
  }, []);

  function gameStart(){
    setGameState(1);
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
    setCorrectClicked([]);
  }
  

  function randomNewWord(){
    let randRow, randCol;
    do{
      randRow = randomInt(gridSize -1);
      randCol = randomInt(gridSize -1);
    }while(!board[randRow][randCol])
    return board[randRow][randCol]
  }

  function handleCellClick(word, row, col){
    if(gameState === 0)return;
    if(!board[row][col] || arraysEqual(incorrectClicked, [row, col]))return;
    const clickedCell = [row, col];
    if(word === correctWord){
      const newCorrectClicked = [...correctClicked, clickedCell];
      setCorrectClicked(newCorrectClicked);

      const newBoard = [...board];
      newBoard[row][col] = null;
      setBoard(newBoard);
      setIncorrectClicked([]);
      
      let newWord;
      do{
        newWord = randomNewWord();
      }while(newWord === correctWord);
      //check for win
      if(checkForWin(newCorrectClicked)){
        setGameState(0);
        playAudio("You win")
      }
      else{
        setCorrectWord(newWord);
        playAudio(newWord);
      }
    }else{
      playAudio(correctWord);

      const newIncorrectClicked = clickedCell;
      setIncorrectClicked(newIncorrectClicked);

      setTimeout(() => removeIncorrect(), 1500);
    }
  }

  function removeIncorrect(){
    setIncorrectClicked([]);
  }

  function playAudio(word){
    if(gameState === 1)speakText(word);
    /* Problems with speaker:
      "into" is pronounced "inta"
      "the" sounds like thee (hard e sound)
      in this word list I pulled, "oneSight", there is "to", "two", and "too"
      I have no idea why the first voice played is different from the rest
    */
  }

  function checkForWin(correctClickedNew){
    for(let i = 0; i < winPatterns.length; i++){
      let allCorrect = true;
      for(let j = 0; j < winPatterns[i].length; j++){
        let [winRow, winCol] = winPatterns[i][j];
        
        let matchFound = correctClickedNew.some(([correctRow, correctCol]) => 
        correctRow === winRow && correctCol === winCol);

        if(!matchFound){
          allCorrect = false;
          break;
        }
      }
      if(allCorrect){
        return true;
      }
    }
    return false;
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
      <button
        className="audio-button"
        onClick={() => playAudio(correctWord)}
        style={{ backgroundImage: `url(/audioButton.png)`, backgroundSize: 'cover' }}  
      ></button>
      <button
        onClick={() => gameStart()}
      >Restart</button>
      {(gameState === 0) && <div>You win</div>}
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