let gameBoard = (function(){
    let displayBoard = function(){
        window.addEventListener('load', e => {
            for(let i = 0; i<9; i++){
                let divEl = document.createElement('div');
                let board = document.querySelector('.board');
                divEl.setAttribute('data-cell', i+1);
                board.appendChild(divEl);
            }
        });
    };

    return {
        displayBoard,
    };

})();

gameBoard.displayBoard();