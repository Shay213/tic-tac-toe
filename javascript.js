const gameFlow = (function(){
    let boardCells;
    let playerTurn = 'x';

    let _gameStart = function(){
        _createBoard();
        _changeDifficulty();
        _playAsChoice();
        boardCells = document.querySelectorAll('.board > div[data-cell]');

        boardCells.forEach(el => {
            el.addEventListener('click', boardCellsControl);
        });

        function boardCellsControl(e){
            let chosenCell = e.currentTarget;
            let chosenCellValue = chosenCell.dataset.cell;
            chosenCell.removeEventListener('click', boardCellsControl);
            let {playerX, playerO} = _whoIsX();

            if(playerTurn === 'x'){
                playerX.setChoices(chosenCellValue);
                _drawX(chosenCell.querySelector('canvas'));
                playerTurn = 'o';
            }
            else if(playerTurn === 'o'){
                playerO.setChoices(chosenCellValue);
                _drawCircle(chosenCell.querySelector('canvas'));
                playerTurn = 'x';
            }

            console.log(playerX.getChoices());
            console.log(playerO.getChoices());
        }
    };

    let _whoIsX = function(){
        if(player1.getPlayAs() === 'x'){
            return {
                playerX: player1,
                playerO: enemy1
            };
        } else{
            return {
                playerX: enemy1,
                playerO: player1
            };
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
                    // reset game and add second player
                    console.log('friends');
                    break;
            }
        }
        difficultyEl.onchange = onChange;
        onChange();
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
    
    let getPlayAs = () => playAs;
    let getChoices = () => choices;
    let setChoices = (choice) => choices.push(choice);
    return {getPlayAs,getChoices,setChoices};
};

const Enemy = () => {
    let choices = [];
    const {getChoices, setChoices} = Player();
    return {getChoices,setChoices};
};

const player1 = Player();
const enemy1 = Enemy(); 
gameFlow.init();