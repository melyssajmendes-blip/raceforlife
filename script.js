const score = document.querySelector('.score');
const startScreen = document.querySelector('.startScreen');
const gameArea = document.querySelector('.gameArea');

startScreen.addEventListener('click', start);

let player = {
    speed: 5,
    score: 0,
    start: false,
    baseSpeed: 5,
    speedBoostActive: false,
    boostTimer: 0,
    shieldActive: false,
    shieldTimer: 0,
    level: 1,
    x: 0,
    y: 0,
    nitroParticles: []
};

let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(e) {
    e.preventDefault();
    keys[e.key] = true;
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && player.start) {
        createNitroEffect();
    }
}

function keyUp(e) {
    e.preventDefault();
    keys[e.key] = false;
}

function createNitroEffect() {
    if (player.speedBoostActive) {
        const car = document.querySelector('.car');
        const carRect = car.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();
        
        for(let i = 0; i < 3; i++) {
            const nitro = document.createElement('div');
            nitro.className = 'nitroEffect';
            nitro.style.left = (carRect.left - gameRect.left - 30) + 'px';
            nitro.style.top = (carRect.top - gameRect.top + 40 + Math.random() * 20) + 'px';
            gameArea.appendChild(nitro);
            
            setTimeout(() => nitro.remove(), 300);
        }
    }
}

function isCollide(a, b) {
    aRect = a.getBoundingClientRect();
    bRect = b.getBoundingClientRect();
    
    const margin = 10;
    return !(
        (aRect.bottom - margin < bRect.top + margin) ||
        (aRect.top + margin > bRect.bottom - margin) ||
        (aRect.right - margin < bRect.left + margin) ||
        (aRect.left + margin > bRect.right - margin)
    );
}

function createParticle(x, y, type) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.borderRadius = '50%';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.pointerEvents = 'none';
    
    if (type === 'coin') {
        particle.style.background = 'gold';
        particle.style.boxShadow = '0 0 10px gold';
    } else if (type === 'boost') {
        particle.style.background = '#00ff00';
        particle.style.boxShadow = '0 0 10px #00ff00';
    }
    
    gameArea.appendChild(particle);
    
    let opacity = 1;
    let size = 10;
    const animate = () => {
        opacity -= 0.05;
        size += 1;
        particle.style.opacity = opacity;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.top = parseFloat(particle.style.top) - 5 + 'px';
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    };
    animate();
}

function moveItems(items, className) {
    items.forEach(function(item) {
        if (isCollide(document.querySelector('.car'), item)) {
            const carRect = document.querySelector('.car').getBoundingClientRect();
            const gameRect = gameArea.getBoundingClientRect();
            const x = carRect.left - gameRect.left + 30;
            const y = carRect.top - gameRect.top + 50;
            
            if (className === 'coin') {
                player.score += 50;
                createParticle(x, y, 'coin');
                item.remove();
                console.log("Coin collected! +50 points");
            } else if (className === 'speedBoost') {
                if (!player.speedBoostActive) {
                    player.speedBoostActive = true;
                    player.boostTimer = 300;
                    player.speed += 4;
                    createParticle(x, y, 'boost');
                    document.querySelector('.car').classList.add('boostActive');
                    item.remove();
                    console.log("Speed boost activated!");
                    
                    setTimeout(() => {
                        if (player.speedBoostActive) {
                            player.speedBoostActive = false;
                            player.speed = player.baseSpeed + Math.floor(player.score / 1500);
                            document.querySelector('.car').classList.remove('boostActive');
                            console.log("Speed boost ended");
                        }
                    }, 5000);
                }
            } else if (className === 'shield') {
                if (!player.shieldActive) {
                    player.shieldActive = true;
                    player.shieldTimer = 450;
                    document.querySelector('.car').classList.add('shieldActive');
                    item.remove();
                    console.log("Shield activated!");
                    
                    setTimeout(() => {
                        if (player.shieldActive) {
                            player.shieldActive = false;
                            document.querySelector('.car').classList.remove('shieldActive');
                            console.log("Shield ended");
                        }
                    }, 7500);
                }
            }
        }
        
        if (item.y >= 750) {
            item.y = -300;
            const lanes = [70, 220, 370, 520];
            item.style.left = lanes[Math.floor(Math.random() * 4)] + "px";
            
            if (Math.random() > 0.7) {
                const newLane = Math.floor(Math.random() * 4);
                item.style.left = lanes[newLane] + "px";
            }
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

function endGame() {
    player.start = false;
    startScreen.classList.remove('hide');
    startScreen.innerHTML = `
        <h1>GAME OVER</h1>
        <p>Final Score: <strong>${player.score}</strong></p>
        <p>Level Reached: <strong>${player.level}</strong></p>
        <p>Top Speed: <strong>${player.speed} km/h</strong></p>
        <br>
        <p>Press here to restart</p>
    `;
}

function getRandomCarType() {
    const carTypes = ['red', 'blue', 'green', 'yellow', 'purple', 'truck', 'sports'];
    const weights = [0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1];
    
    let random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < carTypes.length; i++) {
        sum += weights[i];
        if (random <= sum) {
            return carTypes[i];
        }
    }
    return carTypes[0];
}

function moveEnemy(car) {
    let enemy = document.querySelectorAll('.enemy');
    enemy.forEach(function(item) {
        if (isCollide(car, item) && !player.shieldActive) {
            console.log("Collision!");
            endGame();
            return;
        }
        
        if (item.y >= 750) {
            item.y = -400 - Math.random() * 300;
            const lanes = [60, 210, 360, 510];
            const randomLane = Math.floor(Math.random() * 4);
            item.style.left = lanes[randomLane] + "px";
            
            if (Math.random() > 0.8) {
                const newType = getRandomCarType();
                item.className = 'enemy ' + newType;
                
                if (newType === 'truck') {
                    item.style.height = '120px';
                    item.style.width = '80px';
                    item.style.backgroundSize = '80px 120px';
                } else {
                    item.style.height = '100px';
                    item.style.width = '60px';
                    item.style.backgroundSize = '60px 100px';
                }
            }
            
            let speedMultiplier = 1;
            if (item.classList.contains('sports')) speedMultiplier = 1.3;
            if (item.classList.contains('truck')) speedMultiplier = 0.8;
            
            item.dataset.speedMultiplier = speedMultiplier;
        }
        
        const speedMultiplier = parseFloat(item.dataset.speedMultiplier) || 1;
        item.y += player.speed * speedMultiplier;
        item.style.top = item.y + "px";
        
        if (item.classList.contains('sports') && Math.random() > 0.7) {
            const swing = Math.sin(Date.now() / 200) * 3;
            item.style.transform = `translateX(${swing}px)`;
        }
    });
}

function increaseDifficulty() {
    const newLevel = Math.floor(player.score / 1500) + 1;
    if (newLevel > player.level) {
        player.level = newLevel;
        player.baseSpeed = 5 + (player.level * 0.8);
        if (!player.speedBoostActive) {
            player.speed = Math.min(player.baseSpeed, 25);
        }
        console.log("Level up! Speed: " + player.speed.toFixed(1));
        
        if (player.level % 3 === 0) {
            spawnAdditionalEnemy();
        }
    }
}

function spawnAdditionalEnemy() {
    let enemyCar = document.createElement('div');
    const carType = getRandomCarType();
    enemyCar.className = 'enemy ' + carType;
    enemyCar.y = -400 - Math.random() * 300;
    enemyCar.style.top = enemyCar.y + "px";
    
    const lanes = [60, 210, 360, 510];
    enemyCar.style.left = lanes[Math.floor(Math.random() * 4)] + "px";
    
    if (carType === 'truck') {
        enemyCar.style.height = '120px';
        enemyCar.style.width = '80px';
        enemyCar.style.backgroundSize = '80px 120px';
    }
    
    gameArea.appendChild(enemyCar);
}

function updateTimers() {
    if (player.speedBoostActive) {
        player.boostTimer--;
        if (player.boostTimer <= 0) {
            player.speedBoostActive = false;
            player.speed = Math.min(player.baseSpeed + Math.floor(player.score / 1500), 25);
            document.querySelector('.car').classList.remove('boostActive');
        }
    }
    
    if (player.shieldActive) {
        player.shieldTimer--;
        if (player.shieldTimer <= 0) {
            player.shieldActive = false;
            document.querySelector('.car').classList.remove('shieldActive');
        }
    }
}

function gamePlay() {
    let car = document.querySelector('.car');
    let road = gameArea.getBoundingClientRect();
    
    if (player.start) {
        // ANIMAÇÃO DO SCROLL DA PISTA
        const currentY = parseFloat(gameArea.style.backgroundPositionY) || 0;
        gameArea.style.backgroundPositionY = (currentY + player.speed * 1.5) + 'px';
        
        moveEnemy(car);
        
        let coins = document.querySelectorAll('.coin');
        let boosts = document.querySelectorAll('.speedBoost');
        let shields = document.querySelectorAll('.shield');
        moveItems(coins, 'coin');
        moveItems(boosts, 'speedBoost');
        moveItems(shields, 'shield');
        
        updateTimers();
        increaseDifficulty();
        
        const minX = 10;
        const maxX = road.width - 70;
        
        if (keys.ArrowUp && player.y > (road.top + 100)) {
            player.y -= player.speed;
        }
        if (keys.ArrowDown && player.y < (road.bottom - 180)) {
            player.y += player.speed;
        }
        if (keys.ArrowLeft && player.x > minX) {
            player.x -= player.speed * 1.2;
        }
        if (keys.ArrowRight && player.x < maxX) {
            player.x += player.speed * 1.2;
        }
        
        car.style.top = player.y + "px";
        car.style.left = player.x + "px";
        
        if (player.speed > 15) {
            const blurAmount = Math.min((player.speed - 15) / 5, 3);
            gameArea.style.filter = `blur(${blurAmount}px)`;
        } else {
            gameArea.style.filter = 'blur(0px)';
        }
        
        window.requestAnimationFrame(gamePlay);
        
        player.score += Math.floor(player.speed / 5);
        score.innerHTML = `
            <div style="font-size: 1.1em; font-weight: bold;">SCORE: ${player.score}</div>
            <div>LEVEL: ${player.level}</div>
            <div>SPEED: ${player.speed.toFixed(1)}</div>
            ${player.speedBoostActive ? '<div style="color: #00ff00;">BOOST ACTIVE!</div>' : ''}
            ${player.shieldActive ? '<div style="color: cyan;">SHIELD ACTIVE!</div>' : ''}
        `;
    }
}

function start() {
    startScreen.classList.add('hide');
    gameArea.innerHTML = "";
    
    // NÃO SOBRESCREVER O BACKGROUND - ele já está definido no CSS
    // Apenas garantir que a animação de scroll funcione
    gameArea.style.backgroundPositionY = '0px';
    
    player.start = true;
    player.score = 0;
    player.level = 1;
    player.baseSpeed = 5;
    player.speed = 5;
    player.speedBoostActive = false;
    player.shieldActive = false;
    player.x = 270;
    player.y = gameArea.offsetHeight - 200;
    
    window.requestAnimationFrame(gamePlay);
    
    // Criar carro do jogador
    let car = document.createElement('div');
    car.className = 'car';
    car.style.left = player.x + "px";
    car.style.top = player.y + "px";
    gameArea.appendChild(car);
    
    // Criar carros inimigos
    for (let x = 0; x < 3; x++) {
        let enemyCar = document.createElement('div');
        const carType = getRandomCarType();
        enemyCar.className = 'enemy ' + carType;
        enemyCar.y = ((x + 1) * 350) * -1;
        enemyCar.style.top = enemyCar.y + "px";
        const lanes = [60, 210, 360, 510];
        enemyCar.style.left = lanes[Math.floor(Math.random() * 4)] + "px";
        
        if (carType === 'truck') {
            enemyCar.style.height = '120px';
            enemyCar.style.width = '80px';
            enemyCar.style.backgroundSize = '80px 120px';
        }
        
        gameArea.appendChild(enemyCar);
    }
    
    createCollectibles();
}

function createCollectibles() {
    for (let x = 0; x < 8; x++) {
        let coin = document.createElement('div');
        coin.className = 'coin';
        coin.y = ((x + 1) * 150) * -1;
        coin.style.top = coin.y + "px";
        const lanes = [70, 220, 370, 520];
        coin.style.left = lanes[Math.floor(Math.random() * 4)] + "px";
        gameArea.appendChild(coin);
    }
    
    for (let x = 0; x < 3; x++) {
        let boost = document.createElement('div');
        boost.className = 'speedBoost';
        boost.y = ((x + 1) * 400) * -1;
        boost.style.top = boost.y + "px";
        const lanes = [70, 220, 370, 520];
        boost.style.left = lanes[Math.floor(Math.random() * 4)] + "px";
        gameArea.appendChild(boost);
    }
    
    for (let x = 0; x < 2; x++) {
        let shield = document.createElement('div');
        shield.className = 'shield';
        shield.y = ((x + 1) * 600) * -1;
        shield.style.top = shield.y + "px";
        const lanes = [70, 220, 370, 520];
        shield.style.left = lanes[Math.floor(Math.random() * 4)] + "px";
        gameArea.appendChild(shield);
    }
}