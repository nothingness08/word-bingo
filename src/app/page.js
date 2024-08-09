"use client";
import "./globals.css";
import { useEffect, useState } from 'react';
import sightWords from './sightWords';
import speakText from "./speakText";
import winPatterns from "./winPatterns";

function randomInt(max) { //for getting random words
  return Math.floor(Math.random() * (max+1));
}

function arraysEqual(arr1, arr2) { //takes in two arrays
  if (arr1.length !== arr2.length) return false; //if they are not same length, return false
  return arr1.every((value, index) => value === arr2[index]); //return true if all of the vales are the same at each index, else false
}

export default function Game(){
  const [board, setBoard] = useState([]); //holds word strings
  const [gridSize, setGridSize] = useState(5); //winning will not occur if this is changed
  const [correctWord, setCorrectWord] = useState("");
  const [correctClicked, setCorrectClicked] = useState([]); 
  const [words, setWords] = useState([]);
  const [incorrectClicked, setIncorrectClicked] = useState([]);
  const [gameState, setGameState] = useState(1); //0 means stopped, 1 means active


  useEffect(() => { //call game start at the beginning
    gameStart();
  }, []);

  function gameStart(){
    setGameState(1); //set game to active
    const initialBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));//null 2D board

    let shuffledWords = [...sightWords];
    for (let i = shuffledWords.length - 1; i > 0; i--) { //shuffles sight words list
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
    }
    
    shuffledWords = shuffledWords.slice(0, gridSize*gridSize);//gets the first 25 words in shuffled list
    setWords(shuffledWords);
    
    for(let i = 0; i < gridSize; i++){
    for(let j = 0; j < gridSize; j++){
      const index = (i*gridSize) + j;
      initialBoard[i][j] = shuffledWords[index]; //sets each board position with a word
    }
    }
    setBoard(initialBoard);
    setCorrectWord(shuffledWords[randomInt(gridSize * gridSize)]);//random starting word
    setCorrectClicked([]);//no correctly clicked squares
  }
  

  function randomNewWord(){
    let randRow, randCol;
    do{
      randRow = randomInt(gridSize -1);
      randCol = randomInt(gridSize -1);
    }while(!board[randRow][randCol]) //if the chosen square doesn't have a word in it(null), find a different one
    return board[randRow][randCol]
  }

  function handleCellClick(word, row, col){ 
    //if clicked is null, or if square is already incorrectly clicked, or if the game is over, return
    if(!board[row][col] || arraysEqual(incorrectClicked, [row, col]) || gameState === 0)return;
    const clickedCell = [row, col];
    if(word === correctWord){
      const newCorrectClicked = [...correctClicked, clickedCell]; //add the new tile to the list of correctClicked
      setCorrectClicked(newCorrectClicked);

      const newBoard = [...board];//set the correctly clicked box to null
      newBoard[row][col] = null;
      setBoard(newBoard);
      setIncorrectClicked([]);
      
      let newWord; //find a new word that is not the clicked word
      do{
        newWord = randomNewWord();
      }while(newWord === correctWord);
      
      if(checkForWin(newCorrectClicked)){ //if the game is won, end the game and play audio
        setGameState(0);
        playAudio("You win")
      }
      else{
        setCorrectWord(newWord); 
        playAudio(newWord);
      }
    }else{ //if the correct word was not clicked
      playAudio(correctWord);

      const newIncorrectClicked = clickedCell; //add the tile to incorrectly clicked
      setIncorrectClicked(newIncorrectClicked);

      setTimeout(() => removeIncorrect(), 1500);
    }
  }

  function removeIncorrect(){ //clear incorrectly clicked array after 1.5 seconds, makes it look like it flashed red
    setIncorrectClicked([]);
  }

  function playAudio(word){
    if(gameState === 1)speakText(word);//imported speakText function
    /* Problems with speaker:
      "into" is pronounced "inta"
      "the" sounds like thee (hard e sound)
      in this word list I pulled, "oneSight", there is "to", "two", and "too"
      I have no idea why the first voice played is different from the rest
    */
  }

  function checkForWin(correctClickedNew){
    for(let i = 0; i < winPatterns.length; i++){ //for each possible winPattern
      let allCorrect = true;
      for(let j = 0; j < winPatterns[i].length; j++){ //for each box in each winPattern
        let [winRow, winCol] = winPatterns[i][j]; //seperate cordinates
        
        let matchFound = correctClickedNew.some(([correctRow, correctCol]) => 
        correctRow === winRow && correctCol === winCol); 
        //if a match exists in correctly clicked array and the box needed for that pattern

        if(!matchFound){
          allCorrect = false; //if one of the boxes was missing, that pattern isn't complete
          break;
        }
      }
      if(allCorrect){
        return true; //complete pattern found
      }
    }
    return false; //no complete pattern found
  }

  return(
    <div className="game-container">
      <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          
          const cellStyle = {}; //red/blue/white
          const isCorrect = correctClicked.some(([correctRow, correctCol]) =>
            correctRow === rowIndex && correctCol === colIndex); //check for correctly clicked tiles
          const isIncorrect = arraysEqual([rowIndex, colIndex], incorrectClicked); //check for incorrectly clicked tiles

          //set tile colors based on bools
          if(isCorrect){cellStyle.backgroundColor = 'green';}
          else if(isIncorrect){cellStyle.backgroundColor = 'red';}
          else{cellStyle.backgroundColor = 'white'}

          return(
            <Cell
            key={`${rowIndex}-${colIndex}`}
            onTileClick={() => handleCellClick(cell, rowIndex, colIndex)}
            value={cell}//the word in each box
            style={cellStyle}//modified colors
          />
          )
        })
      )}
      </div>
      <button
        className="audio-button"
        onClick={() => playAudio(correctWord)}
        style={{ backgroundImage: `url(/audioButton.png)`, backgroundSize: 'cover' }} //random image I found
      ></button>
      <button
        onClick={() => gameStart()}
      >Restart</button>
      {(gameState === 0) && <div>You win</div>} {/*conditionally render the you win text */}
    </div>
    
  );
}

function Cell({onTileClick, value, style}){ //cell structure
  return(
    <button 
      className="cell"
      onClick={onTileClick} 
      style={style}
    >{value}</button>
  );
}