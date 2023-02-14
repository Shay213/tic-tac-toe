const gameFlow = (function(){
    let boardCells;
    let playerTurn = 'x';
    let playVsFriend = false;
    let aiTurn = false;
    let aiDifficulty = 'easy';
    const playerXScoreBoard = document.querySelector('.player-x');
    const playerOScoreBoard = document.querySelector('.player-o');
    const textScoreBoard = document.querySelector('.menu p:last-of-type');
    const boardContainer = document.querySelector('.board-container');
    const roundEndMessage = document.querySelector('.round-end-message');
    const roundEndContainer = document.querySelector('.round-end');
    const canvasCrossLine = document.querySelector('.round-end canvas:first-child');
    const canvasContainer = document.querySelector('.round-end .canvas-container');
    const canvasMessage = roundEndContainer.querySelector('.canvas-container canvas');
    const WINNING_COMBINATIONS =[['1','2','3'],['4','5','6'],['7','8','9'],
                                ['1','4','7'],['2','5','8'],['3','6','9'],
                                ['1','5','9'],['3','5','7']
                                ];
    let currentBoardState = [1,2,3,4,5,6,7,8,9];
    let humanMark = 'x'; 
    let aiMark = 'o';
    let availableChoices = [1,2,3,4,5,6,7,8,9];
    let xScore = 0;
    let oScore = 0;

    let _gameStart = function(){
        _createBoard();
        _changeDifficulty();
        
        boardCells = document.querySelectorAll('.board > div[data-cell]');
        
        boardCells.forEach(el => {
            el.addEventListener('click', boardCellsControl);
        });
    };

    let _checkIfWon = function(playerChoices, playerX, playerO, winner) {
        //console.log(playerChoices, playerX, playerO, winner);
        let won = WINNING_COMBINATIONS.find(combination => combination.every(item => playerChoices.includes(item)));
        let unavailableCells = 9 - availableChoices.length;
        if(won || unavailableCells === 9){
            
            _roundEndAnimation(winner, unavailableCells, won);
            
            if(unavailableCells === 9 && !won){
                console.log('draw');
            }
            else if(winner === 'x'){
                playerX.wonRound();
                xScore++;
                updateScoreScreen('x');
                playerXScoreBoard.classList.add('active');
                playerOScoreBoard.classList.remove('active');
                updateScoreBoardText('x', true);  
            } else if(winner === 'o'){
                playerO.wonRound();
                oScore++;
                updateScoreScreen('o'); 
                playerXScoreBoard.classList.remove('active');
                playerOScoreBoard.classList.add('active');
                updateScoreBoardText('o', true);
            }

            // wait for roundEndAnimation then reset round
            setTimeout(function(){
                
                boardCells.forEach(el => {
                    let canvas = el.querySelector('canvas');
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                    el.removeEventListener('click', boardCellsControl);
                });
                
                playerX.resetChoices();
                playerO.resetChoices();
                if(playVsFriend){
                    console.log(':)');
                }else{
                    playerTurn = 'x';
                }

                boardContainer.style.cursor = 'pointer';
                boardContainer.addEventListener('click', beginRound,{once:true});
            
                function beginRound(e){
                    boardContainer.style.cursor = 'auto';
                    boardCells.forEach(el => {
                        el.addEventListener('click', boardCellsControl);
                    });
                    resetRoundEndAnimation();
                    currentBoardState = [1,2,3,4,5,6,7,8,9];
                    availableChoices = [1,2,3,4,5,6,7,8,9];
                    
                    if(playVsFriend){
                        updateScoreBoardText(playerTurn);
                        if(playerTurn === 'x'){
                            playerXScoreBoard.classList.add('active');
                            playerOScoreBoard.classList.remove('active');
                        }else if(playerTurn === 'o'){
                            playerXScoreBoard.classList.remove('active');
                            playerOScoreBoard.classList.add('active');
                        }
                    }else{
                        textScoreBoard.innerHTML = 'Start game or choose player';
                        aiTurn = false;
                        playerXScoreBoard.classList.add('active');
                        playerOScoreBoard.classList.remove('active');
                        _playAsChoice();
                    }
                }

                function resetRoundEndAnimation(){
                    roundEndContainer.style.display = 'none';
                    roundEndMessage.style.display = 'none';
                    roundEndContainer.style.backgroundColor = 'transparent';

                    // if draw
                    if(unavailableCells === 9 && !won){
                        canvasContainer.removeChild(canvasContainer.querySelector('.clone'));
                        canvasMessage.style.width = '100%';
                        roundEndContainer.style.display = 'none';
                        roundEndMessage.style.display = 'none';
                        roundEndContainer.style.width = '230px';
                        canvasCrossLine.style.display = 'block';
                    }
                }

            },1100);
        }
        else if(!playVsFriend){
            if(aiTurn){
                aiTurn = false;
                availableChoices.forEach(el => {
                    boardCells[el-1].addEventListener('click', boardCellsControl);
                });
            }else{
                aiTurn = true;
                boardCells.forEach(el => {
                    el.removeEventListener('click', boardCellsControl)
                });
                setTimeout(function() {
                    boardCellsControl.call(ai); 
                }, 700);
            }
        }
    };

    let _whoIsX = function(){
        if(playVsFriend){
            if(player1.getPlayAs() === 'x'){
                return {
                    playerX: player1,
                    playerO: friend
                };
            } else{
                return {
                    playerX: friend,
                    playerO: player1
                };
            }
        }
        else{
            if(player1.getPlayAs() === 'x'){
                humanMark = 'x';
                aiMark = 'o';
                return {
                    playerX: player1,
                    playerO: ai
                };
            } else{
                humanMark = 'o';
                aiMark = 'x';
                return {
                    playerX: ai,
                    playerO: player1
                };
            }
        }
    };

    let boardCellsControl = function (e){
        let {playerX, playerO} = _whoIsX();
        let chosenCell;
        let chosenCellValue;

        if(!aiTurn){
            e.stopPropagation();
            chosenCell = e.currentTarget;
            chosenCellValue = chosenCell.dataset.cell;
        }
        else{
            //here this refers to ai object 
            let aiChoice;
            switch(aiDifficulty){
                case 'easy':
                    aiChoice = this.easy(availableChoices);
                    break;
                case 'intermediate':
                    aiChoice = this.intermediate(currentBoardState, availableChoices, humanMark, WINNING_COMBINATIONS).toString();
                    break;
                case 'impossible':
                    aiChoice = this.impossible(currentBoardState, playerTurn, humanMark, aiMark).index.toString();
                    break;
            }
            chosenCellValue = aiChoice;
            chosenCell = boardCells[+aiChoice-1];
        }
        chosenCell.removeEventListener('click', boardCellsControl);


        if(playerTurn === 'x'){
            playerX.setChoices(chosenCellValue);
            currentBoardState[chosenCellValue-1] = 'x';
            availableChoices = currentBoardState.filter(el => el != 'x' && el != 'o');
            _drawX(chosenCell.querySelector('canvas'));
            playerXScoreBoard.classList.remove('active');
            playerOScoreBoard.classList.add('active');
            updateScoreBoardText('o');
            _checkIfWon(playerX.getChoices(), playerX, playerO, 'x');
            playerTurn = 'o';
        }
        else if(playerTurn === 'o'){
            playerO.setChoices(chosenCellValue);
            currentBoardState[chosenCellValue-1] = 'o';
            availableChoices = currentBoardState.filter(el => el != 'x' && el != 'o');
            _drawCircle(chosenCell.querySelector('canvas'));
            playerOScoreBoard.classList.remove('active');
            playerXScoreBoard.classList.add('active');
            updateScoreBoardText('x');
            _checkIfWon(playerO.getChoices(), playerX, playerO, 'o');
            playerTurn = 'x';
        }
    };

    let updateScoreBoardText = function(whoNow, winner = false){
        if(!winner)
            textScoreBoard.innerHTML = `It's <b>${whoNow.toUpperCase()}</b> turn`;
        else
            textScoreBoard.innerHTML = 'Game over';
        
    };

    let updateScoreScreen = function(who) {
        let scoreX = document.querySelector('.player-x span:last-of-type');
        let scoreO = document.querySelector('.player-o span:last-of-type');

        who === 'x' ? scoreX.innerHTML = `${xScore}` : scoreO.innerHTML = `${oScore}`;
    };

    let _roundEndAnimation = function(winner, unavailableCells, wonCombination){
        let text = roundEndContainer.querySelector('h1');

        // DRAW
        if(unavailableCells === 9 && !wonCombination){
            let canvasClone = canvasMessage.cloneNode();
            canvasClone.classList.add('clone');
            canvasContainer.appendChild(canvasClone);
            canvasMessage.style.width = '40%';
            canvasClone.style.width = '40%';
            roundEndContainer.style.display = 'block';
            roundEndMessage.style.display = 'block';
            roundEndContainer.style.width = '360px';
            roundEndContainer.style.backgroundColor = '#2dd4bf';
            canvasCrossLine.style.display = 'none';
            roundEndContainer.style.opacity = '0';

            _drawCircle(canvasMessage);
            _drawX(canvasClone);
            text.innerHTML = 'DRAW!';
            setTimeout(function(){
                

                roundEndContainer.animate([
                    {
                        opacity: '0'
                    },
                    {
                        opacity: '1'
                    }
                ],600);

                roundEndContainer.style.opacity = '1';

            }, 600);
        }
        else{ //WINNER
            roundEndContainer.style.display = 'block';
            canvasCrossLine.style.display = 'block';
            cellsCrossAnimation();

            setTimeout(function(){
                canvasCrossLine.style.display = 'none';
                roundEndMessage.style.display = 'block';
                roundEndContainer.style.backgroundColor = '#2dd4bf';

                text.innerText = 'WINS!';
                winner === 'x' ? _drawX(canvasMessage) : _drawCircle(canvasMessage);
            }, 1100);
        }

        function cellsCrossAnimation(){
            let canvasBig = document.querySelector('.round-end canvas:first-child');
            let ctx = canvasBig.getContext('2d');
            ctx.clearRect(0, 0, canvasBig.width, canvasBig.height);
            ctx.lineWidth = 4;
            winner === 'x' ? ctx.strokeStyle = '#4b5563' : ctx.strokeStyle = '#f5f5f4';
            let startPosX;
            let startPosY;
            let curPosX;
            let curPosY;
            let endPosX;
            let endPosY;
            let distanceX;
            let distanceY;
            let xSpeed;
            let ySpeed;

            switch(wonCombination.join('')){
                case '123':
                    startPosX = 0;
                    startPosY = 23;
                    curPosX = 0;
                    curPosY = 23;
                    endPosX = canvasBig.width + 10;
                    endPosY = 23;
                    distanceX = canvasBig.width;
                    distanceY = 0;
                    xSpeed = distanceX/20;
                    ySpeed = 0;
                    drawStraight();
                    break;
                case '456':
                    startPosX = 0;
                    startPosY = canvasBig.height/2;
                    curPosX = 0;
                    curPosY = canvasBig.height/2;
                    endPosX = canvasBig.width + 10;
                    endPosY = canvasBig.height/2;
                    distanceX = canvasBig.width;
                    distanceY = 0;
                    xSpeed = distanceX/20;
                    ySpeed = 0;
                    drawStraight();
                    break;
                case '789':
                    startPosX = 0;
                    startPosY = canvasBig.height-25;
                    curPosX = 0;
                    curPosY = canvasBig.height-25;
                    endPosX = canvasBig.width + 10;
                    endPosY = canvasBig.height-25;
                    distanceX = canvasBig.width;
                    distanceY = 0;
                    xSpeed = distanceX/20;
                    ySpeed = 0;
                    drawStraight();
                    break;
                case '147':
                    ctx.lineWidth = 8;
                    startPosX = 47;
                    startPosY = 0;
                    curPosX = 47;
                    curPosY = 0;
                    endPosX = 47;
                    endPosY = canvasBig.height + 10;
                    distanceX = 0;
                    distanceY = canvasBig.height + 10;
                    xSpeed = 0;
                    ySpeed = distanceY/20;
                    drawStraight();
                    break;
                case '258':
                    ctx.lineWidth = 8;
                    startPosX = canvasBig.width/2;
                    startPosY = 0;
                    curPosX = canvasBig.width/2;
                    curPosY = 0;
                    endPosX = canvasBig.width/2;
                    endPosY = canvasBig.height + 10;
                    distanceX = 0;
                    distanceY = canvasBig.height + 10;
                    xSpeed = 0;
                    ySpeed = distanceY/20;
                    drawStraight();
                    break;
                case '369':
                    ctx.lineWidth = 8;
                    startPosX = canvasBig.width - 47;
                    startPosY = 0;
                    curPosX = canvasBig.width - 47;
                    curPosY = 0;
                    endPosX = canvasBig.width - 47;
                    endPosY = canvasBig.height + 10;
                    distanceX = 0;
                    distanceY = canvasBig.height + 10;
                    xSpeed = 0;
                    ySpeed = distanceY/20;
                    drawStraight();
                    break;
                case '159':
                    startPosX = 0;
                    startPosY = 0;
                    curPosX = 0;
                    curPosY = 0;
                    endPosX = canvasBig.width;
                    endPosY = canvasBig.height;
                    distanceX = endPosX - startPosX;
                    distanceY = endPosY - startPosY;
                    xSpeed = distanceX/20;
                    ySpeed = distanceY/20;
                    drawDiagonals();
                    break;
                case '357':
                    startPosX = canvasBig.width;
                    startPosY = 0;
                    curPosX = canvasBig.width;
                    curPosY = 0;
                    endPosX = 0;
                    endPosY = canvasBig.height;
                    distanceX = Math.abs(endPosX - startPosX);
                    distanceY = Math.abs(endPosY - startPosY);
                    xSpeed = distanceX/20;
                    ySpeed = distanceY/20;
                    drawDiagonals();
                    break;
            }

            function drawStraight(){
                ctx.clearRect(0, 0, canvasBig.width, canvasBig.height);
                ctx.beginPath();
                ctx.moveTo(startPosX, startPosY);
                ctx.lineTo(curPosX, curPosY);
                ctx.stroke();

                if(distanceX === 0){
                    curPosY+=ySpeed;
                    if(curPosY < endPosY) {
                        requestAnimationFrame(function(){
                            drawStraight();
                        });
                    } 
                }else{
                    curPosX+=xSpeed;
                    if(curPosX < endPosX) {
                        requestAnimationFrame(function(){
                            drawStraight();
                        });
                    } 
                } 
            }

            function drawDiagonals(){
                ctx.clearRect(0, 0, canvasBig.width, canvasBig.height);
                ctx.beginPath();
                ctx.moveTo(startPosX, startPosY);
                ctx.lineTo(curPosX, curPosY);
                ctx.stroke();

                if(curPosX < endPosX && curPosY < endPosY){
                    curPosX+=xSpeed;
                    curPosY+=ySpeed;
                
                    requestAnimationFrame(function(){
                        drawDiagonals();
                    });
                
                }
                else if(curPosX > endPosX && curPosY < endPosY){
                    curPosX-=xSpeed;
                    curPosY+=ySpeed;
                    
                    requestAnimationFrame(function(){
                        drawDiagonals();
                    });
                    
                }
            }
        }
    };

    let _changeDifficulty = function(){
        let difficultyEl = document.getElementById('difficulty');
        function onChange(){
            let value = difficultyEl.value;
            switch(value){
                case 'easy':
                    _fullReset('ai');
                    playVsFriend = false;
                    aiDifficulty = 'easy';
                    textScoreBoard.innerHTML = `Start game or choose player`;
                    _playAsChoice();
                    break;
                case 'intermediate':
                    _fullReset('ai');
                    playVsFriend = false;
                    aiDifficulty = 'intermediate';
                    textScoreBoard.innerHTML = `Start game or choose player`;
                    _playAsChoice();
                    break;
                case 'impossible':
                    _fullReset('ai');
                    playVsFriend = false;
                    aiDifficulty = 'impossible';
                    textScoreBoard.innerHTML = `Start game or choose player`;
                    _playAsChoice();
                    break;
                case 'friends':
                    _fullReset('friend');
                    playVsFriend = true;
                    textScoreBoard.innerHTML = `It's <b>X</b> turn`;
                    break;
            }
        }
        difficultyEl.onchange = onChange;
        onChange();
    };

    let _fullReset = function(secondPlayer){
        let scoreXScreen = document.querySelector('.player-x span:last-of-type');
        let scoreOScreen = document.querySelector('.player-o span:last-of-type');
        player1.resetChoices();
        player1.resetRounds();
        xScore = 0;
        oScore = 0;
        currentBoardState = [1,2,3,4,5,6,7,8,9];
        availableChoices = [1,2,3,4,5,6,7,8,9];
        scoreXScreen.innerHTML = '_';
        scoreOScreen.innerHTML = '_';
        
        playerXScoreBoard.classList.add('active');
        playerOScoreBoard.classList.remove('active');
        playerTurn = 'x';
        boardContainer.style.cursor = 'auto';
        roundEndContainer.style.display = 'none';
        roundEndMessage.style.display = 'none';
        roundEndContainer.style.backgroundColor = 'transparent';

        if(secondPlayer === 'friend'){
            playerOScoreBoard.removeEventListener('click', _changePlayer);
            friend.resetChoices();
            friend.resetRounds();
        }
        else if(secondPlayer === 'ai'){
            _playAsChoice();
            player1.setPlayAs('x');
            aiTurn = false;
        }

        // reset for draw screen message
        let canvasClone = canvasContainer.querySelector('.clone');
        if(canvasClone)
            canvasContainer.removeChild(canvasClone);
        canvasMessage.style.width = '100%';
        roundEndContainer.style.display = 'none';
        roundEndMessage.style.display = 'none';
        roundEndContainer.style.width = '230px';
        canvasCrossLine.style.display = 'block';

        setTimeout(function() {
            boardCells.forEach(el => {
                let canvas = el.querySelector('canvas');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                el.addEventListener('click', boardCellsControl);
            });
        }, 200);
        
    };

    let _playAsChoice = function(){
        playerOScoreBoard.addEventListener('click', _changePlayer,{once:true});
    };

    let _changePlayer = function(e){
        player1.setPlayAs('o'); 
        playerOScoreBoard.classList.add('active');
        playerXScoreBoard.classList.remove('active');

        // AI first move
        aiTurn = true;
        boardCellsControl.call(ai);
    }


    let _createBoard = function(){
        let board = document.querySelector('.board');
        
        for(let i = 0; i<9; i++){
            let divEl = document.createElement('div');
            divEl.setAttribute('data-cell', i+1);
            board.appendChild(divEl);

            // canvas 
            let canvasEl = document.createElement('canvas');
            canvasEl.setAttribute('style', 'width: 100%;');
            divEl.setAttribute('style', 'display: flex; align-items: center;');
            divEl.appendChild(canvasEl);
        }
    };

    let _drawCircle = function (canvas){
        let ctx = canvas.getContext('2d'); 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        let r = 63;
        let endPercent = 50;
        let curPer = 0;

        ctx.lineWidth = 25;
        ctx.strokeStyle = '#f5f5f4';

        function draw(currentPercent){
            ctx.clearRect(0,0,canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, curPer*currentPercent, false);
            ctx.stroke();

            curPer++;
            if(curPer < endPercent) {
                requestAnimationFrame(function(){
                    draw(curPer/80);
                });
            }
        }
        draw();
    };

    let _drawX = function (canvas){
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let x = canvas.width;
        let y = canvas.height;
        let endPosX = x-95;
        let endPosY = y-10;
        let curPosX = 75;
        let curPosY = 10;
        ctx.lineWidth = 25;
        ctx.strokeStyle = '#4b5563';

        let distanceX = endPosX - curPosX;
        let distanceY = endPosY - curPosY;
        let ratio = distanceX/distanceY;
        let xSpeed = (distanceX/26) + ratio;
        let ySpeed = distanceY/26;

        function draw(currentPosX, currentPosY, startX, startY, speedX, speedY, endPosX, endPosY, direction){
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentPosX, currentPosY);
            ctx.stroke();

            if(direction === 'left-to-right'){
                currentPosX+=speedX;
                currentPosY+=speedY;
                if(currentPosX < endPosX || currentPosY < endPosY) {
                    requestAnimationFrame(function(){
                        draw(currentPosX, currentPosY, startX, startY, speedX, speedY, endPosX, endPosY, direction);
                    });
                }
            }else{
                currentPosX-=speedX;
                currentPosY+=speedY;
                if(currentPosX > endPosX || currentPosY < endPosY) {
                    requestAnimationFrame(function(){
                        draw(currentPosX, currentPosY, startX, startY, speedX, speedY, endPosX, endPosY, direction);
                    });
                }
            }
            
            
        }
        draw(curPosX, curPosY, 75, 10, xSpeed, ySpeed, endPosX, endPosY, 'left-to-right'); 

        
        endPosX = 75;
        endPosY = y-10;
        curPosX = x-75;
        curPosY = 10;
        
        draw(curPosX, curPosY, x-75, 10, xSpeed, ySpeed, endPosX, endPosY, 'right-to-left');
    };

    let init = function(){
        _gameStart();
    };

    return {init};

})();

const Player = () => {
    let difficulty = 'easy';
    let playAs = 'x';
    let choices = [];
    let roundsWon = 0;
    
    const getPlayAs = () => playAs;
    const setPlayAs = (x) => playAs = x;
    const getChoices = () => choices;
    const setChoices = (choice) => choices.push(choice);
    const resetChoices = () => choices = [];
    const wonRound = () => roundsWon++;
    const resetRounds = () => roundsWon = 0;
    const getRoundsWon = () => roundsWon;

    return {getPlayAs,getChoices,setChoices, resetChoices, wonRound, resetRounds, getRoundsWon, setPlayAs};
};

const Friend = () => {
    let choices = [];
    let roundsWon = 0;
    const {getChoices, setChoices, resetChoices,
         wonRound, resetRounds, getRoundsWon} = Player();
    return {getChoices,setChoices, resetChoices, wonRound, resetRounds, getRoundsWon};
};

const AI = () => {
    let choices = [];
    let roundsWon = 0;

    const easy = function(availableChoices){
        let getRandomInt = max => Math.floor(Math.random() * max);

        return availableChoices[getRandomInt(availableChoices.length)].toString();
    };

    const intermediate = function(currBdSt, availableChoices, humanMark, winCom){
        let getRandomInt = max => Math.floor(Math.random() * max);
        let aiChoice;
        winCom.forEach(el => {
            const boardTriple = el.map(e => currBdSt[+e-1]);
            const numberOfOpponentSymbols = boardTriple.filter(s => s === humanMark).length;
            const numberOfEmpty = boardTriple.filter(s => s != 'x' && s != 'o').length;

            if(numberOfOpponentSymbols === 2 && numberOfEmpty === 1){
                boardTriple.forEach(e => {
                    if(e != 'x' && e != 'o'){
                        aiChoice = e;
                    }
                });
            }
        });
        console.log(aiChoice);
        return aiChoice ? aiChoice : availableChoices[getRandomInt(availableChoices.length)];
    };

    const impossible = function(currBdSt, currMark, humanMark, aiMark){
        function minimax(currBdSt, currMark){
            const availCellsIndexes = getAllEmptyCellsIndexes(currBdSt);

            if(checkIfWinnerFound(currBdSt, humanMark)){
                return {score: -1};
            }else if(checkIfWinnerFound(currBdSt, aiMark)){
                return {score: 1};
            } else if(availCellsIndexes.length === 0){
                return {score: 0};
            }

            const allTestPlayInfos = [];

            for(let i=0; i<availCellsIndexes.length; i++){
                const currentTestPlayInfo = {};
                currentTestPlayInfo.index = currBdSt[availCellsIndexes[i]-1];
                currBdSt[availCellsIndexes[i]-1] = currMark;

                if(currMark === aiMark){
                    const result = minimax(currBdSt, humanMark);
                    currentTestPlayInfo.score = result.score;
                }else{
                    const result = minimax(currBdSt, aiMark);
                    currentTestPlayInfo.score = result.score;
                }
                currBdSt[availCellsIndexes[i]-1] = currentTestPlayInfo.index;
                allTestPlayInfos.push(currentTestPlayInfo);
            }

            const sorted = allTestPlayInfos.sort((a,b) => a.score - b.score);
            
            if(currMark === aiMark) {
                return sorted.pop();
            }else{
                return sorted[0];
            }
        }

        return minimax(currBdSt, currMark);
    };

    function getAllEmptyCellsIndexes(currBdSt){
        return currBdSt.filter(el => el != 'x' && el != 'o');
    }

    function checkIfWinnerFound(currBdSt, currMark) {
        if (
          (currBdSt[0] === currMark &&
            currBdSt[1] === currMark &&
            currBdSt[2] === currMark) ||
          (currBdSt[3] === currMark &&
            currBdSt[4] === currMark &&
            currBdSt[5] === currMark) ||
          (currBdSt[6] === currMark &&
            currBdSt[7] === currMark &&
            currBdSt[8] === currMark) ||
          (currBdSt[0] === currMark &&
            currBdSt[3] === currMark &&
            currBdSt[6] === currMark) ||
          (currBdSt[1] === currMark &&
            currBdSt[4] === currMark &&
            currBdSt[7] === currMark) ||
          (currBdSt[2] === currMark &&
            currBdSt[5] === currMark &&
            currBdSt[8] === currMark) ||
          (currBdSt[0] === currMark &&
            currBdSt[4] === currMark &&
            currBdSt[8] === currMark) ||
          (currBdSt[2] === currMark &&
            currBdSt[4] === currMark &&
            currBdSt[6] === currMark)
        ) {
          return true;
        } else {
          return false;
        }
    }

    const {getChoices, setChoices, resetChoices,
         wonRound, resetRounds, getRoundsWon} = Player();
    return {getChoices,setChoices, resetChoices, wonRound, resetRounds, getRoundsWon, easy, impossible, intermediate};
};

const player1 = Player(); 
const friend = Friend();
const ai = AI();
gameFlow.init();
