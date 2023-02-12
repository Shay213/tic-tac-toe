const gameFlow = (function(){
    let boardCells;
    let playerTurn = 'x';
    let playVsFriend = false;
    let playerXScoreBoard = document.querySelector('.player-x');
    let playerOScoreBoard = document.querySelector('.player-o');
    let message = document.querySelector('.round-end');
    let board = document.querySelector('.board');
    let textScoreBoard = document.querySelector('.menu p:last-of-type');
    let boardContainer = document.querySelector('.board-container');
    let roundEndMessage = document.querySelector('.round-end-message');
    let roundEndContainer = document.querySelector('.round-end');
    const WINNING_COMBINATIONS =[['1','2','3'],['4','5','6'],['7','8','9'],
                                ['1','4','7'],['2','5','8'],['3','6','9'],
                                ['1','5','9'],['3','5','7']
                                ];

    let _gameStart = function(){
        _createBoard();
        _changeDifficulty();
        _playAsChoice();
        boardCells = document.querySelectorAll('.board > div[data-cell]');

        boardCells.forEach(el => {
            el.addEventListener('click', boardCellsControl);
        });
    };

    let _checkIfWon = function(playerChoices, unavailableCells, playerX, playerO, winner) {
        let won = WINNING_COMBINATIONS.find(combination => combination.every(item => playerChoices.includes(item)));
        if(won || unavailableCells === 9){
            
            _roundEndAnimation(winner, unavailableCells, won);
            

            if(winner === 'x'){
                playerX.wonRound();
                updateScoreScreen(playerX, 'x');
                playerXScoreBoard.classList.add('active');
                playerOScoreBoard.classList.remove('active');
                if(playVsFriend){
                    updateScoreBoardText('x', true);
                }
            } else{
                playerO.wonRound();
                updateScoreScreen(playerO, 'o'); 
                playerXScoreBoard.classList.remove('active');
                playerOScoreBoard.classList.add('active');
                if(playVsFriend){
                    updateScoreBoardText('o', true);
                } 
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
                    if(playVsFriend){
                        updateScoreBoardText(playerTurn);
                        if(playerTurn === 'x'){
                            playerXScoreBoard.classList.add('active');
                            playerOScoreBoard.classList.remove('active');
                        }else if(playerTurn === 'o'){
                            playerXScoreBoard.classList.remove('active');
                            playerOScoreBoard.classList.add('active');
                        }
                    }
                }

                function resetRoundEndAnimation(){
                    roundEndContainer.style.display = 'none';
                    roundEndMessage.style.display = 'none';
                    roundEndContainer.style.backgroundColor = 'transparent';
                }

            },1100);
        }
    };

    let _whoIsX = function(){
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
    };

    let boardCellsControl = function (e){
        e.stopPropagation();
        let chosenCell = e.currentTarget;
        let chosenCellValue = chosenCell.dataset.cell;
        chosenCell.removeEventListener('click', boardCellsControl);
        let {playerX, playerO} = _whoIsX();
        let sum;

        if(playerTurn === 'x'){
            playerX.setChoices(chosenCellValue);
            _drawX(chosenCell.querySelector('canvas'));
            playerXScoreBoard.classList.remove('active');
            playerOScoreBoard.classList.add('active');
            updateScoreBoardText('o');
            sum = playerX.getChoices().length + playerO.getChoices().length;
            if(sum > 4){
                _checkIfWon(playerX.getChoices(), sum, playerX, playerO, 'x');
            }
            playerTurn = 'o';
        }
        else if(playerTurn === 'o'){
            playerO.setChoices(chosenCellValue);
            _drawCircle(chosenCell.querySelector('canvas'));
            playerOScoreBoard.classList.remove('active');
            playerXScoreBoard.classList.add('active');
            updateScoreBoardText('x');
            sum = playerX.getChoices().length + playerO.getChoices().length;
            if(sum > 4){
                _checkIfWon(playerO.getChoices(), sum, playerX, playerO, 'o');
            }
            playerTurn = 'x';
        }
    };

    let updateScoreBoardText = function(whoNow, winner = false){
        if(playVsFriend){
            if(!winner)
                textScoreBoard.innerHTML = `It's <b>${whoNow.toUpperCase()}</b> turn`;
            else
                textScoreBoard.innerHTML = 'Game over';
        }
    };

    let updateScoreScreen = function(player, who) {
        let scoreX = document.querySelector('.player-x span:last-of-type');
        let scoreO = document.querySelector('.player-o span:last-of-type');

        who === 'x' ? scoreX.innerHTML = `${player.getRoundsWon()}` : scoreO.innerHTML = `${player.getRoundsWon()}`;
    };

    let _roundEndAnimation = function(winner, unavailableCells, wonCombination){
        let canvasCrossLine = document.querySelector('.round-end canvas:first-child');
        let canvasContainer = document.querySelector('.round-end .canvas-container');
        let canvasMessage = roundEndContainer.querySelector('.canvas-container canvas');
        let text = roundEndContainer.querySelector('h1');

        // DRAW
        if(unavailableCells === 9){
            let canvasClone = canvasMessage.cloneNode();
            canvasContainer.appendChild(canvasClone);
            canvasMessage.style.width = '40%';
            canvasClone.style.width = '40%';
            roundEndContainer.style.width = '360px';
            _drawCircle(canvasMessage);
            _drawX(canvasClone);
            text.innerHTML = 'DRAW!';
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
                    // reset game and run easy AI
                    console.log('easy');
                    break;
                case 'intermediate':
                    // reset game and run intermediate AI
                    console.log('intermediate');
                    break;
                case 'impossible':
                    // reset game and run impossible AI
                    console.log('impossible');
                    break;
                case 'friends':
                    _fullReset();
                    playVsFriend = true;
                    textScoreBoard.innerHTML = `It's <b>X</b> turn`;
                    break;
            }
        }
        difficultyEl.onchange = onChange;
        onChange();
    };

    let _fullReset = function(){
        player1.resetChoices();
        player1.resetRounds();
        friend.resetChoices();
        friend.resetRounds();
        updateScoreScreen(player1, 'x');
        updateScoreScreen(friend, 'o');
        playerXScoreBoard.classList.add('active');
        playerOScoreBoard.classList.remove('active');
        message.classList.add('hide');
        board.classList.remove('hide');
        playerTurn = 'x';
        boardContainer.style.cursor = 'auto';

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
        let btns = document.querySelectorAll('.score > div');

        btns.forEach(el => {
            el.addEventListener('click', e => {
                console.log(e.currentTarget);    
            });
        });
    };


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
                    draw(curPer/100);
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
    
    let getPlayAs = () => playAs;
    let getChoices = () => choices;
    let setChoices = (choice) => choices.push(choice);
    let resetChoices = () => choices = [];
    let wonRound = () => roundsWon++;
    let resetRounds = () => roundsWon = 0;
    let getRoundsWon = () => roundsWon;

    return {getPlayAs,getChoices,setChoices, resetChoices, wonRound, resetRounds, getRoundsWon};
};

const Friend = () => {
    let choices = [];
    let roundsWon = 0;
    const {getChoices, setChoices, resetChoices,
         wonRound, resetRounds, getRoundsWon} = Player();
    return {getChoices,setChoices, resetChoices, wonRound, resetRounds, getRoundsWon};
};

const player1 = Player();
const friend = Friend(); 
gameFlow.init();

