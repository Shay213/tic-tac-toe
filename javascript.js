let gameBoard = (function(){
    let displayBoard = function(){
        window.addEventListener('load', e => {
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
                //drawCircle(canvasEl);
                drawX(canvasEl);
            }

            function drawCircle(canvas){
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
                            draw(curPer/200);
                        });
                    }
                }
                draw();
            }

            function drawX(canvas){
                let ctx = canvas.getContext('2d');
                let x = canvas.width;
                let y = canvas.height;
                let endPosX = x-95;
                let endPosY = y-10;
                let curPosX = 75;
                let curPosY = 10;
                ctx.lineWidth = 25;
                ctx.strokeStyle = '#44403c';

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
            }

        });
    };

    return {
        displayBoard,
    };

})();

gameBoard.displayBoard();