//shortcuts
const gameBoard = document.getElementById("gameBoard");
const context = gameBoard.getContext("2d");
const scoreText = document.getElementById("scoreText");
const resetBtn = document.getElementById("resetBtn");
const reset4PlayersBtn = document.getElementById("reset4PlayersBtn");
const player1Btn = document.getElementById("player1Btn");
const player2Btn = document.getElementById("player2Btn");
const player3Btn = document.getElementById("player3Btn");
const player4Btn = document.getElementById("player4Btn");
const decreaseBalls = document.getElementById("decreaseBalls");
const ballsLbl = document.getElementById("ballsLbl");
const increaseBalls = document.getElementById("increaseBalls");

//gameBoard
const gameWidth = 1000;
const gameHeight = 500;
gameBoard.width = gameWidth;
gameBoard.height = gameHeight;
const boardBackground = "white";
let intervalID;

//paddle
const OFFLINE = 0;
const HUMAN = 1;
const IA = 2;
let playerHumanOrIA = {
    player1: 1,
    player2: 1,
    player3: 0,
    player4: 0,
}
const paddleColor = "black";
// const paddleBorder = "black";
const paddleSpeed = 10;
const paddleWidth = 25;
const paddleHeight = 100;
const paddleHeight4Players = 70;
class Paddle{
    constructor(width, height, x, y, status, yMin, yMax){
        this.width = width;
        this.height = height
        this.x = x;
        this.y = y;
        this.status = status;
        this.yMin = yMin;
        this.yMax = yMax;
        this.score = 0;
    }
}
let paddle1 = new Paddle(0, 0, 0, 0, HUMAN);
let paddle2 = new Paddle(0, 0, 0, 0, HUMAN);
let paddle3 = new Paddle(0, 0, 0, 0, OFFLINE);
let paddle4 = new Paddle(0, 0, 0, 0, OFFLINE);


//ball
const ballColor = "orange";
//const ballBorder = "black";
const ballRadius = 10;
const ballInitialSpeed = 2.2;
const ballIncr = 0.2;
// 100 put y axe incr at -1 to 1 
const ballFov = 90 / 100 * 2;
class Ball{
    constructor(speed, x, y, xDirection, yDirection){
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.xDirection = xDirection;
        this.yDirection = yDirection;
        this.arrivalTime = 0;
        this.ignore = true;
    }
    setValues(speed, x, y, xDirection, yDirection){
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.xDirection = xDirection;
        this.yDirection = yDirection;
        this.arrivalTime = 0;
        this.ignore = false;
    }
}
let ballNbr = 1;


//keyboard controls
const spaceBar = 32;
const paddle1up = 87;
const paddle1down = 83;
const paddle2up = 38;
const paddle2down = 40;
const paddle3down = 72;
const paddle3up = 89;
const paddle4down = 34;
const paddle4up = 33;
let keys = [];

//set events
resetBtn.addEventListener("click", resetGame);
reset4PlayersBtn.addEventListener("click", reset4Players);
player1Btn.addEventListener("click", switchPlayer1);
player2Btn.addEventListener("click", switchPlayer2);
player3Btn.addEventListener("click", switchPlayer3);
player4Btn.addEventListener("click", switchPlayer4);
decreaseBalls.addEventListener("click", decreaseBallsCount);
increaseBalls.addEventListener("click", increaseBallsCount);
window.addEventListener("keydown", keyIsPressedPlayer1);
window.addEventListener("keydown", keyIsPressedPlayer2);
window.addEventListener("keyup", keyIsNotPressed);

//settings players and IA
let time = -1000;




// Pong for two Players

resetGame();

function gameStart(balls, fakeballs){
    drawPaddles();
    for(let i = 0; i < balls.length; i++)
        createBall(balls[i]);
    drawBall(balls[0]);
    nextTick(balls, fakeballs);
};
function nextTick(balls, fakeballs){
    intervalID = setTimeout(() => {
        clearBoard();
        movePaddles(balls, fakeballs);
        drawPaddles();
        for(let i = 0; i < balls.length; i++)
        {
            moveBall(balls[i]);
            drawBall(balls[i]);
            checkCollision(balls[i], fakeballs[i]);
        }
        nextTick(balls, fakeballs);
    }, 10)
};
function drawPaddles(){
    context.fillStyle = paddleColor;
    context.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    context.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
};
function createBall(ball){
    ball.x = gameWidth / 2;
    ball.y = gameHeight / 2;
    ball.speed = ballInitialSpeed;
    ball.yDirection = (Math.random() - 0.5) * ballFov * ball.speed;
    ball.xDirection = Math.sqrt((ball.speed ** 2) - (ball.yDirection ** 2));
    if (Math.round(Math.random()) == 1)
        ball.xDirection *= -1;
};
function drawBall(ball){
    context.fillStyle = ballColor;
    context.beginPath();
    context.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI);
    context.fill();
};
function moveBall(ball){
    ball.x += (ball.speed * ball.xDirection);
    ball.y += (ball.speed * ball.yDirection);
};
function movePaddles(balls, fakeballs){
    // human paddles
    if (keys[paddle1up] && paddle1.y >= paddle1.yMin)
        paddle1.y -= paddleSpeed;
    if (keys[paddle1down] && paddle1.y <= paddle1.yMax)
        paddle1.y += paddleSpeed;
    if (keys[paddle2up] && paddle2.y >= paddle2.yMin)
        paddle2.y -= paddleSpeed;
    if (keys[paddle2down] && paddle2.y <= paddle2.yMax)
        paddle2.y += paddleSpeed;
    

    //update ball position every 1 second
    if (Date.now() - time >= 1000)
    {
        for (let i = 0; i < balls.length; i++)
            checkBallDestination(balls[i], fakeballs[i]);
    }

    if (paddle1.status == IA)
        movePaddlesIA(fakeballs, paddle1);
    if (paddle2.status == IA)
        movePaddlesIA(fakeballs, paddle2);
};
function checkBallDestination(ball, fakeball)
{
    time = Date.now();
    fakeball.setValues(ball.speed, ball.x, ball.y, ball.xDirection, ball.yDirection);
    let check = fakeball.xDirection;
    fakeball.arrivalTime = 0
    while (fakeball.xDirection * check >= 0)
    {
        moveBall(fakeball);
        checkCollisionFakeBall(fakeball);
        fakeball.arrivalTime++;
    }

    // value rounded where ia will move to with angle variant
    fakeball.y = Math.round(fakeball.y / paddleSpeed) * paddleSpeed + ((Math.round(Math.random()) - 0.5) * (paddleHeight - paddleSpeed * 4));
}
function checkCollisionFakeBall(fakeball){
    //ball bounced top and down
    if (fakeball.y <= 0 + ballRadius)
    {
        if (fakeball.yDirection < 0)
            fakeball.yDirection *= -1;
    }
    else if (fakeball.y >= gameHeight - ballRadius)
    {
        if (fakeball.yDirection > 0)
            fakeball.yDirection *= -1;
    }

    //ball score
    if (fakeball.x <= 0){
        fakeball.xDirection *= -1;
        return;
    }
    if (fakeball.x >= gameWidth){
        fakeball.xDirection *= -1;
        return;
    }
    
    //ball reach paddle
    if (fakeball.x <= (paddle1.x + paddle1.width + ballRadius)){
        if (fakeball.y >= paddle1.y && fakeball.y <= paddle1.y + paddle1.height)
            fakeball.xDirection *= -1;
    }
    else if (fakeball.x >= (paddle2.x - ballRadius)){
        if (fakeball.y >= paddle2.y && fakeball.y <= paddle2.y + paddle2.height)
            fakeball.xDirection *= -1;
    }
};
function movePaddlesIA(fakeballs, paddle)
{
    // search next target
    let targetball = fakeballs[0];
    for(let i = 1; i < fakeballs.length; i++)
    {
        if (targetball.ignore == false)
        {
            // check priority ball
            if (fakeballs[i].ignore == true || fakeballs[i].arrivalTime > targetball.arrivalTime)
                continue;
    
            // check if ball in wrong direction
            if ((fakeballs[i].xDirection > 0 && paddle.x) || (fakeballs[i].xDirection < 0 && !paddle.x))
                continue;

            //check if ball accessible
            if ((paddle.y - fakeballs[i].y > 0) && ((paddle.y - fakeballs[i].y) / paddleSpeed > fakeballs[i].arrivalTime))
                continue;
            if ((paddle.y - fakeballs[i].y < 0) && (fakeballs[i].y > paddle.y + paddle.height) && ((fakeballs[i].y - paddle.y - paddle.height) / paddleSpeed > fakeballs[i].arrivalTime))
                continue;
        }
        targetball = fakeballs[i];
    }


    // position paddle
    if (targetball.ignore == true || (targetball.xDirection > 0 && paddle.x) || (targetball.xDirection < 0 && !paddle.x) || ((Math.abs(paddle.y - targetball.y) / paddleSpeed) > targetball.arrivalTime))
    {
        // go middle court (stand by)
        if (paddle.y < (gameHeight - paddle.height) / 2)
            paddle.y += paddleSpeed;
        else if (paddle.y > (gameHeight - paddle.height) / 2)
            paddle.y -= paddleSpeed;
    }
    else
    {
        // position itself were the ball will arrive with random angle variant
        if (paddle.y >= paddle.yMin && (paddle.y + (paddle.height / 2) > targetball.y))
            paddle.y -= paddleSpeed;
        else if (paddle.y <= paddle.yMax && (paddle.y + (paddle.height / 2) < targetball.y))
            paddle.y += paddleSpeed;
    }
}
function checkCollision(ball, fakeball){
    //ball bounced top and down
    if (ball.y <= 0 + ballRadius)
    {
        if (ball.yDirection < 0)
            ball.yDirection *= -1;
    }
    else if (ball.y >= gameHeight - ballRadius)
    {
        if (ball.yDirection > 0)
            ball.yDirection *= -1;
    }
            
    //ball score
    if (ball.x <= 0){
        paddle2.score += 1;
        updateScore();
        createBall(ball);
        fakeball.ignore = true;
        return;
    }
    if (ball.x >= gameWidth){
        paddle1.score += 1;
        updateScore();
        createBall(ball);
        fakeball.ignore = true;
        return;
    }

    //ball bounced paddle
    if (ball.x <= (paddle1.x + paddle1.width + ballRadius)){
        if (ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.height){
            ball.speed += ballIncr;
            ball.x = paddle1.x + paddle1.width + ballRadius;
            ball.yDirection = (((ball.y - paddle1.y) / paddle1.height) -0.5) * ballFov * ball.speed;
            ball.xDirection = Math.sqrt((ball.speed ** 2) - (ball.yDirection ** 2));
            fakeball.ignore = true;
        }
    }
    else if (ball.x >= (paddle2.x - ballRadius)){
        if (ball.y >= paddle2.y && ball.y <= paddle2.y + paddle2.height){
            ball.speed += ballIncr;
            ball.x = paddle2.x - ballRadius;
            ball.yDirection = (((ball.y - paddle2.y) / paddle2.height) -0.5) * ballFov * ball.speed;
            ball.xDirection = -Math.sqrt((ball.speed ** 2) - (ball.yDirection ** 2));
            fakeball.ignore = true;
        }
    }
};
function clearBoard(){
    context.clearRect(0, 0, gameWidth, gameHeight);
};
function updateScore(){
    scoreText.textContent = `${paddle1.score} : ${paddle2.score}`;
};




// Pong for four Players

function gameStart4Players(balls, fakeballs){
    drawPaddles4Players();
    for(let i = 0; i < balls.length; i++)
        createBall(balls[i]);
    drawBall(balls[0]);
    nextTick4Players(balls, fakeballs);
};
function nextTick4Players(balls, fakeballs){
    intervalID = setTimeout(() => {
        clearBoard();
        movePaddles4Players();
        drawPaddles4Players();
        // moveBall(balls);
        // drawBall(balls);
        // checkCollision4Players(balls, fakeballs);
        nextTick4Players(balls, fakeballs);
    }, 10)
};
function drawPaddles4Players(){
    context.fillStyle = paddleColor;
    context.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    context.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    context.fillRect(paddle3.x, paddle3.y, paddle3.width, paddle3.height);
    context.fillRect(paddle4.x, paddle4.y, paddle4.width, paddle4.height);
};
function movePaddles4Players(balls, fakeballs){
    movePaddles4PlayersHumanUpTop(paddle1, paddle3, paddle1up, paddle1down);
    movePaddles4PlayersHumanUpTop(paddle2, paddle4, paddle2up, paddle2down);
    movePaddles4PlayersHumanUpBottom(paddle3, paddle1, paddle3up, paddle3down);
    movePaddles4PlayersHumanUpBottom(paddle4, paddle2, paddle4up, paddle4down);


    //check ball position every 1 second
    if (Date.now() - time >= 1000)
    {
        for (let i = 0; i < balls.length; i++)
            checkBallDestination(balls[i], fakeballs[i]);
    }

    if (paddle1.status == IA)
        movePaddlesIA4Players(fakeballs, paddle1);
    if (paddle2.status == IA)
        movePaddlesIA4Players(fakeballs, paddle2);
    if (paddle3.status == IA)
        movePaddlesIA4Players(fakeballs, paddle3);
    if (paddle4.status == IA)
        movePaddlesIA4Players(fakeballs, paddle4);
};
function movePaddles4PlayersHumanUpTop(paddletop, paddlebottom, paddleup, paddledown){
    // move humans top paddles (paddle 1 and 3)
    if (!keys[paddleup] || !keys[paddledown])
    {
        if (keys[paddleup] && paddletop.y >= paddletop.yMin)
            paddletop.y -= paddleSpeed;
        else if (keys[paddledown] && paddletop.y <= paddletop.yMax)
        {
            paddletop.y += paddleSpeed;
            //check if ally collision with friendly paddle
            if (paddletop.y > paddlebottom.y - paddlebottom.height)
                paddlebottom.y += paddleSpeed;
        }
    }
}
function movePaddles4PlayersHumanUpBottom(paddlebottom, paddletop, paddleup, paddledown){
    // move humans top paddles (paddle 2 and 4)
    if (!keys[paddleup] || !keys[paddledown])
    {
        if (keys[paddleup] && paddlebottom.y >= paddlebottom.yMin)
        {
            paddlebottom.y -= paddleSpeed;
            //check if ally collision with friendly paddle
            if (paddlebottom.y < paddletop.y + paddletop.height)
                paddletop.y -= paddleSpeed;
        }
        else if (keys[paddledown] && paddlebottom.y <= paddlebottom.yMax)
            paddlebottom.y += paddleSpeed;
    }
}
// function searchNextTarget4Players(fakeballs, paddletop, paddlebootom, targetballtop, targetballbottom){
//     for(let i = 1; i < fakeballs.length; i++)
//         {
//             if (targetball.ignore == false)
//             {
//                 // check priority ball
//                 if (fakeballs[i].ignore == true || fakeballs[i].arrivalTime > targetball.arrivalTime)
//                     continue;
        
//                 // check if ball in wrong direction
//                 if ((fakeballs[i].xDirection > 0 && paddle.x) || (fakeballs[i].xDirection < 0 && !paddle.x))
//                     continue;
    
//                 //check if ball accessible
//                 if ((paddle.y - fakeballs[i].y > 0) && ((paddle.y - fakeballs[i].y) / paddleSpeed > fakeballs[i].arrivalTime))
//                     continue;
//                 if ((paddle.y - fakeballs[i].y < 0) && ((fakeballs[i].y - paddle.y - paddle.height) / paddleSpeed > fakeballs[i].arrivalTime))
//                     continue;
//             }
//             targetball = fakeballs[i];
//         }
// }
function movePaddlesIA4Players(fakeballs, paddletop, paddlebottom){
    
    // search next target
    // let targetballtop = fakeballs[0];
    // let targetballbottom = fakeballs[0];
    // if (fakeballs.length > 1)
    // {
    //     if (fakeballs[0].y < gameHeight / 2)
    //     {
    //         targetballtop = fakeballs[0];
    //         targetballbottom = fakeballs[1];
    //         searchNextTarget4Players(fakeballs, paddletop, paddlebottom, targetballtop, targetballbottom);
    //     }
    //     else
    //     {
    //         targetballtop = fakeballs[0];
    //         targetballbottom = fakeballs[1];
    //     }

    // }

    // search next target
    let targetball = fakeballs[0];
    let targetballindex = 0;
    for(let i = 1; i < fakeballs.length; i++)
    {
        if (targetball.ignore == false)
        {
            // check priority ball
            if (fakeballs[i].ignore == true || fakeballs[i].arrivalTime > targetball.arrivalTime)
                continue;
    
            // check if ball in wrong direction
            if ((fakeballs[i].xDirection > 0 && paddle.x) || (fakeballs[i].xDirection < 0 && !paddle.x))
                continue;

            //check if ball accessible
            if ((paddletop.y - fakeballs[i].y > 0) && ((paddletop.y - fakeballs[i].y) / paddleSpeed > fakeballs[i].arrivalTime))
            {
                if ((paddlebottom.y - fakeballs[i].y > 0) && ((paddlebottom.y - fakeballs[i].y) / paddleSpeed > fakeballs[i].arrivalTime))
                    continue;
                if ((paddlebottom.y - fakeballs[i].y < 0) && ((fakeballs[i].y - paddlebottom.y - paddle.height) / paddleSpeed > fakeballs[i].arrivalTime))
                    continue;
            }
            if ((paddletop.y - fakeballs[i].y < 0) && ((fakeballs[i].y - paddletop.y - paddletop.height) / paddleSpeed > fakeballs[i].arrivalTime))
            {
                if ((paddlebottom.y - fakeballs[i].y > 0) && ((paddlebottom.y - fakeballs[i].y) / paddleSpeed > fakeballs[i].arrivalTime))
                    continue;
                if ((paddlebottom.y - fakeballs[i].y < 0) && ((fakeballs[i].y - paddlebottom.y - paddlebottom.height) / paddleSpeed > fakeballs[i].arrivalTime))
                    continue;
            }
        }
        targetball = fakeballs[i];
        targetballindex = i;
    }
    //check which paddle is closer 
    let targetballtop;
    let targetballbottom;
    if (paddletop.y + paddletop.height - targetball.y >= 0)
        targetballtop = targetball;
    else if (paddlebottom.y - targetball.y <= 0)
        targetballbottom = targetball;
    else if (targetball.y - paddletop.y - paddletop.height <= paddlebottom.y - targetball.y)
        targetballtop = targetball;
    else
        targetballbottom = targetball;

    
    // search second target for the other paddle
    for(let i = 1; i < fakeballs.length; i++)
    {
        if (targetball.ignore == false && targetballindex != i)
        {
            // check priority ball
            if (fakeballs[i].ignore == true || fakeballs[i].arrivalTime > targetball.arrivalTime)
                continue;
    
            // check if ball in wrong direction
            if ((fakeballs[i].xDirection > 0 && paddle.x) || (fakeballs[i].xDirection < 0 && !paddle.x))
                continue;

            //check if ball accessible
            if ((paddletop.y - fakeballs[i].y > 0) && ((paddletop.y - fakeballs[i].y) / paddleSpeed > fakeballs[i].arrivalTime))
            {
                if ((paddlebottom.y - fakeballs[i].y > 0) && ((paddlebottom.y - fakeballs[i].y) / paddleSpeed > fakeballs[i].arrivalTime))
                    continue;
                if ((paddlebottom.y - fakeballs[i].y < 0) && ((fakeballs[i].y - paddlebottom.y - paddle.height) / paddleSpeed > fakeballs[i].arrivalTime))
                    continue;
            }
            if ((paddletop.y - fakeballs[i].y < 0) && ((fakeballs[i].y - paddletop.y - paddletop.height) / paddleSpeed > fakeballs[i].arrivalTime))
            {
                if ((paddlebottom.y - fakeballs[i].y > 0) && ((paddlebottom.y - fakeballs[i].y) / paddleSpeed > fakeballs[i].arrivalTime))
                    continue;
                if ((paddlebottom.y - fakeballs[i].y < 0) && ((fakeballs[i].y - paddlebottom.y - paddlebottom.height) / paddleSpeed > fakeballs[i].arrivalTime))
                    continue;
            }
        }
        targetball = fakeballs[i];
    }
}
function checkCollision4Players(ball){
    //ball bounced top and down
    if (ball.y <= 0 + ballRadius)
    {
        if (ball.yDirection < 0)
            ball.yDirection *= -1;
    }
    else if (ball.y >= gameHeight - ballRadius)
    {
        if (ball.yDirection > 0)
            ball.yDirection *= -1;
    }
    
    //ball score
    if (ball.x <= 0)
    {
        paddle2.score += 1;
        updateScore();
        createBall(ball);
        return;
    }
    if (ball.x >= gameWidth)
    {
        paddle1.score += 1;
        updateScore();
        createBall(ball);
        return;
    }
    
    //ball bounced paddle
    if (ball.x <= (paddle1.x + paddle1.width + ballRadius))
    {
        if (ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.height){
            ball.speed += ballIncr;
            ball.x = paddle1.x + paddle1.width + ballRadius;
            ball.yDirection = (((ball.y - paddle1.y) / paddle1.height) -0.5) * ballFov * ball.speed;
            ball.xDirection = Math.sqrt((ball.speed ** 2) - (ball.yDirection ** 2));
        }
        else if(ball.y >= paddle3.y && ball.y <= paddle3.y + paddle3.height){
            ball.speed += ballIncr;
            ball.x = paddle3.x + paddle3.width + ballRadius;
            ball.yDirection = (((ball.y - paddle3.y) / paddle3.height) -0.5) * ballFov * ball.speed;
            ball.xDirection = Math.sqrt((ball.speed ** 2) - (ball.yDirection ** 2));
        }
    }
    else if (ball.x >= (paddle2.x - ballRadius))
    {
        if (ball.y >= paddle2.y && ball.y <= paddle2.y + paddle2.height){
            ball.speed += ballIncr;
            ball.x = paddle2.x - ballRadius;
            ball.yDirection = (((ball.y - paddle2.y) / paddle2.height) -0.5) * ballFov * ball.speed;
            ball.xDirection = -Math.sqrt((ball.speed ** 2) - (ball.yDirection ** 2));
        }
        else if (ball.y >= paddle4.y && ball.y <= paddle4.y + paddle4.height){
            ball.speed += ballIncr;
            ball.x = paddle4.x - ballRadius;
            ball.yDirection = (((ball.y - paddle4.y) / paddle4.height) -0.5) * ballFov * ball.speed;
            ball.xDirection = -Math.sqrt((ball.speed ** 2) - (ball.yDirection ** 2));
        }
    }
};



//reset functions
function resetGame(){
    //set event listeners
    paddle3.status = OFFLINE;
    paddle4.status = OFFLINE;
    player3Btn.textContent = `player 3 ❌`;
    player4Btn.textContent = `player 4 ❌`;
    window.removeEventListener("keydown", keyIsPressedPlayer3);
    window.removeEventListener("keydown", keyIsPressedPlayer4);
    
    
    //set paddles
    paddle1 = new Paddle(paddleWidth, paddleHeight, 0, (gameHeight - paddleHeight) / 2, paddle1.status, paddleSpeed, gameHeight - paddleHeight - paddleSpeed);
    paddle2 = new Paddle(paddleWidth, paddleHeight, gameWidth - paddleWidth, (gameHeight - paddleHeight) / 2, paddle2.status, paddleSpeed, gameHeight - paddleHeight - paddleSpeed);
    paddle1.score = 0;
    paddle2.score = 0;

    //set balls
    let balls = [];
    let fakeballs = [];
    for(let i = 0; i < ballNbr; i++)
    {
        let ball = new Ball(0, 0, 0, 0, 0);
        balls.push(ball);
        let fakeball = new Ball(0, 0, 0, 0, 0);
        fakeballs.push(fakeball);
    }

    updateScore();
    clearInterval(intervalID);
    gameStart(balls, fakeballs);
};
function reset4Players(){
    //set event listeners
    if (paddle3.status == OFFLINE)
    {
        window.addEventListener("keydown", keyIsPressedPlayer3);
        paddle3.status = HUMAN;
        player3Btn.textContent = `player 3 🧑`;
    }
    if (paddle4.status == OFFLINE)
    {
        window.addEventListener("keydown", keyIsPressedPlayer4);
        paddle4.status = HUMAN;
        player4Btn.textContent = `player 4 🧑`;
    }

    //set paddles
    paddle1 = new Paddle(paddleWidth, paddleHeight4Players, 0, Math.floor((gameHeight - paddleHeight4Players) / 4 / 10) * 10, paddle1.status, paddleSpeed, gameHeight - paddleHeight4Players * 2 - paddleSpeed);
    paddle2 = new Paddle(paddleWidth, paddleHeight4Players, gameWidth - paddleWidth, Math.floor((gameHeight - paddleHeight4Players) / 4 / 10) * 10, paddle2.status, paddleSpeed, gameHeight - paddleHeight4Players * 2 - paddleSpeed);
    paddle3 = new Paddle(paddleWidth, paddleHeight4Players, 0, Math.floor((gameHeight - paddleHeight4Players) * 3 / 4 / 10) * 10, paddle3.status, paddleSpeed + paddleHeight4Players, gameHeight - paddleHeight4Players - paddleSpeed);
    paddle4 = new Paddle(paddleWidth, paddleHeight4Players, gameWidth - paddleWidth, Math.floor((gameHeight - paddleHeight4Players) * 3 / 4 / 10) * 10, paddle4.status, paddleSpeed + paddleHeight4Players, gameHeight - paddleHeight4Players - paddleSpeed);
    paddle1.score = 0;
    paddle2.score = 0;

    //set balls
    let balls = [];
    let fakeballs = [];
    for(let i = 0; i < ballNbr; i++)
    {
        let ball = new Ball(0, 0, 0, 0, 0);
        balls.push(ball);
        let fakeball = new Ball(0, 0, 0, 0, 0);
        fakeballs.push(fakeball);
    }

    updateScore();
    clearInterval(intervalID);
    gameStart4Players(balls, fakeballs);
};


// Event functions
function keyIsPressedPlayer1(event){
    switch(event.keyCode){
        case(paddle1up):
        keys[paddle1up] = true;
        break;
        case(paddle1down):
        keys[paddle1down] = true;
        break;
    }
};
function keyIsPressedPlayer2(event){
    switch(event.keyCode){
        case(paddle2up):
        keys[paddle2up] = true;
        break;
        case(paddle2down):
        keys[paddle2down] = true;
        break;
    }
};
function keyIsPressedPlayer3(event){
    switch(event.keyCode){
        case(paddle3up):
        keys[paddle3up] = true;
        break;
        case(paddle3down):
        keys[paddle3down] = true;
        break;
    }
}
function keyIsPressedPlayer4(event){
    switch(event.keyCode){
        case(paddle4up):
        keys[paddle4up] = true;
        break;
        case(paddle4down):
        keys[paddle4down] = true;
        break;
    }
}
function keySpaceBar(event){
    if (event.keyCode == spaceBar)
        keys[spaceBar] = true;
}
function keyIsNotPressed(event){
    switch(event.keyCode){
        case(paddle1up):
            keys[paddle1up] = false;
        break;
        case(paddle1down):
            keys[paddle1down] = false;
        break;
        case(paddle2up):
            keys[paddle2up] = false;
        break;
        case(paddle2down):
            keys[paddle2down] = false;
        break;
        case(paddle3up):
            keys[paddle3up] = false;
        break;
        case(paddle3down):
            keys[paddle3down] = false;
        break;
        case(paddle4up):
            keys[paddle4up] = false;
        break;
        case(paddle4down):
            keys[paddle4down] = false;
        break;
        case(spaceBar):
            keys[spaceBar] = false;
        break;
    }
};
function switchPlayer1(event){
    if (paddle1.status == HUMAN)
    {
        paddle1.status = IA;
        event.target.textContent = "player 1 🤖";
        window.removeEventListener("keydown", keyIsPressedPlayer1);
        
    }
    else if (paddle1.status == IA)
    {
        paddle1.status = HUMAN;
        event.target.textContent = "player 1 🧑";
        window.addEventListener("keydown", keyIsPressedPlayer1);
    }
}
function switchPlayer2(event){
    if (paddle2.status == HUMAN)
    {
        paddle2.status = IA;
        event.target.textContent = "player 2 🤖";
        window.removeEventListener("keydown", keyIsPressedPlayer2);
    }
    else if (paddle2.status == IA)
    {
        paddle2.status = HUMAN;
        event.target.textContent = "player 2 🧑";
        window.addEventListener("keydown", keyIsPressedPlayer2);
    }
}
function switchPlayer3(event){
    if (paddle3.status == HUMAN)
    {
        paddle3.status = IA;
        event.target.textContent = "player 3 🤖";
        window.removeEventListener("keydown", keyIsPressedPlayer3);
    }
    else if (paddle3.status == IA)
    {
        paddle3.status = HUMAN;
        event.target.textContent = "player 3 🧑";
        window.addEventListener("keydown", keyIsPressedPlayer3);
    }
}
function switchPlayer4(event){
    if (paddle4.status == HUMAN)
    {
        paddle4.status = IA;
        event.target.textContent = "player 4 🤖";
        window.removeEventListener("keydown", keyIsPressedPlayer4);
    }
    else if (paddle4.status == IA)
    {
        paddle4.status = HUMAN;
        event.target.textContent = "player 4 🧑";
        window.addEventListener("keydown", keyIsPressedPlayer4);
    }
}
function decreaseBallsCount(event){
    if (ballNbr > 1)
        ballNbr--;
    ballsLbl.textContent = ballNbr;
}
function increaseBallsCount(event){
    if (ballNbr < 20)
        ballNbr++;
    ballsLbl.textContent = ballNbr;
}