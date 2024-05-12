// 创建一个父类, 生物
// Create a parent class of creature
class Creatures{
  constructor(x, y, health, movementSpeed) {
    this.x = x; // coordinates x
    this.y = y; // coordinates y
    this.health = health; // creature health
    this.movementSpeed = movementSpeed; // the speed of move
  }
}

// ----------------------------------------------------------------------
let size = 20; // size of deadbody
let currentWeaponType = 0;
// 创建玩家角色
// Create the son class player
class Player extends Creatures{
  constructor(x, y, health, movementSpeed){
    super(x, y, health, movementSpeed);
    this.weapon = null;
  }
  
  currentWeapon(weapon) {
    this.weapon = weapon;
  }

  chooseWeapon() {
    if (keyIsDown(49)) { // 按下 "1" 键选择宝剑 // press "1" to choose the sword
      this.currentWeapon(new Sword());
      currentWeaponType = 1;
    } else if (keyIsDown(50)) { // 按下 "2" 键选择弓箭 // press "2" to choose the BowArrow
      this.currentWeapon(new Crossbow());
      currentWeaponType = 2;
      textSize(12);
      textAlign(LEFT, BASELINE);
      text(numArrow + "/" + maxArrow, this.x - 5, this.y - 15) // show how much arrow you still left when you hold "2"
    }
  }

  show() { // show
    fill(0, 0, 255);
    noStroke();
    ellipse(this.x, this.y, 20, 20);

    if (this.weapon !== null) {
      // 如果角色有武器，显示武器 // if player is holding weapon. show the weapon.
      this.weapon.show(this.x, this.y, mouseX, mouseY);
    }
  }

  attack(){
    if (currentWeaponType === 1){
      // 攻击范围内造成伤害 // if zombie is in the attack range, attack
      for (let i = 0; i < zombies.length; i++) {
        let currentZombie = zombies[i];
        let distance = dist(this.x, this.y, currentZombie.x, currentZombie.y);
        if (distance <= this.weapon.range + 20) { // add 20, player circle center radius
          if(this.weapon.attackCoolDown === 0){
            currentZombie.takeDamage(this.weapon.damage); // heavy hit
          }
          else if(this.weapon.attackCoolDown <= 25){
            currentZombie.takeDamage(this.weapon.damage/3); // light hit
          }
        }
      }
      swordEffect.play();
      this.weapon.attackCoolDown = 50;
      this.weapon.animateRotationAngle = 30;
    }
    //-----------------------------------------------------
    else if(currentWeaponType === 2){
      if (mouseButton === LEFT && this.weapon.multiShot === false && numArrow > 0) {
        arrows.push(new Arrow(this.x, this.y, 0));
        numArrow -= 1;
      }
      if (mouseButton === LEFT && this.weapon.multiShot === true && numArrow > 0) {
        arrows.push(new Arrow(this.x, this.y, 0));
        arrows.push(new Arrow(this.x, this.y, -0.1));
        arrows.push(new Arrow(this.x, this.y, 0.1));
        numArrow -= 1;
      }
    }
    //-----------------------------------------------------
  }
  
  death(){ // move the dead body to the center of the screen, change the body to red
    
    fill(255, 0, 0);
    noStroke();
    circle(this.x, this.y, size);

    if(this.x > width/2){
      this.x -= 5;
    }
    if(this.y > height/2){
      this.y -= 5;
    }
    if(this.x < width/2){
      this.x += 5;
    }
    if(this.y < height/2){
      this.y += 5;
    } 
  }
  
  update() { // update the data of Player
    // 游戏常用的WASD按键控制方向
    // WASD keys commonly used in games control direction
    if (keyIsDown(65)) {
      this.x -= this.movementSpeed;
    }
    if (keyIsDown(68)) {
      this.x += this.movementSpeed;
    }
    if (keyIsDown(87)) {
      this.y -= this.movementSpeed;
    }
    if (keyIsDown(83)) {
      this.y += this.movementSpeed;
    }

    // 创建玩家不可到边界外 // player can not move outside the bounds
    if (this.y <= 0) {
      this.y += this.movementSpeed + 1;
    }
    if (this.y >= 600) {
      this.y -= this.movementSpeed + 1;
    }
    if (this.x <= 0) {
      this.x += this.movementSpeed + 1;
    }
    if (this.x >= 800) {
      this.x -= this.movementSpeed + 1;
    }

    this.chooseWeapon(); // update the choose weapon

    if(this.weapon !== null){
        this.weapon.update(); // if player is taking a weapon, update the weapon
    }
  }

}

// ----------------------------------------------------------------------

// creates the son class for the
class Zombie extends Creatures {
  
  constructor(x, y, health, attackCoolDown, movementSpeed, zDamage) {
    super(x, y, health, movementSpeed)
    this.attackCoolDown = attackCoolDown;
    this.zDamage = zDamage;
    this.isActive = true;
  }

  show() {
    fill(0, 255, 0);
    noStroke();
    ellipse(this.x, this.y, 20, 20);
  }

  takeDamage(damage){
    this.health -= damage;

    if(this.health <= 0){
      zombieDeath.play();
    }else{
      zombieHurt.play();
    }
    
  }

  update() {
    if(this.isActive === true){
      if (this.x > player.x) {
        this.x -= this.movementSpeed;
      }
      if (this.y > player.y) {
        this.y -= this.movementSpeed;
      }
      if (this.x < player.x) {
        this.x += this.movementSpeed;
      }
      if (this.y < player.y) {
        this.y += this.movementSpeed;
      }

      if (this.attackCoolDown > 0) {
        this.attackCoolDown--;
      }
    }
    for (let i = 0; i < zombies.length; i++) {
      let currentZombie = zombies[i];
      if (dist(currentZombie.x, currentZombie.y, player.x, player.y) < 20 && currentZombie.attackCoolDown == 0) {
        player.health -= this.zDamage;
        currentZombie.attackCoolDown += 60;
      }
      if (currentZombie.health <= 0) {
        // 生命值归零时将僵尸移除 // health = 0, remove zombie
        currentZombie.remove();
        zombies.splice(i, 1);
      }
    }
  }

  remove() {
    // 将僵尸的坐标设置为远离地图的位置
    this.x = -1000;
    this.y = -1000;
    // 禁用僵尸的移动和攻击逻辑
    this.isActive = false;
    numZombies -= 1;
  }
}

// ----------------------------------------------------------------------

// create a weapon father class
class Weapon {
  constructor(){
  }
  show(playerX, playerY, mouseX, mouseY) {
    // do nothing in default
  }
}

// create a sword son class

let swordLevel = 1;
class Sword extends Weapon {
  constructor(){
    super();
    this.damage = 2.6;
    this.range = 30;
    this.attackCoolDown = 40;
    this.animateRotationAngle = 0;
  }

  show(playerX, playerY, mouseX, mouseY) {
    // 计算角度
    let angle = atan2(mouseY - playerY, mouseX - playerX);
    
    push();
    translate(playerX, playerY);
    rotate(angle + this.animateRotationAngle); // 旋转到鼠标的方向
    if(this.animateRotationAngle > 0){
      this.animateRotationAngle--;
    }
    
    // 绘制剑的形状
    strokeWeight(4);
    stroke(255);
    line(0, 0, this.range, 0);
  }
  
  update(){
    
    if(this.attackCoolDown > 0){
      this.attackCoolDown--;
    }
    if(swordLevel === 2){
      this.damage = 4;
    }
    if(swordLevel === 3){
      this.damage = 5.5;
    }
  }
}

// ----------------------------------------------------------------------

// create a bow son class
let increaseArrowNumber = false;
let increaseArrowDamage = false;
let maxArrow = 10;
let aim;
let numArrow = 10;
class Crossbow extends Weapon {
  constructor(){
    super(); // the number of arrows each wave
    this.weaponSize = 30
    this.angle = 100; // 弓形状 shape of the bow
    this.attackCoolDown = 200;
    this.multiShot = false;
  }

  show(playerX, playerY, mouseX, mouseY) {
    // 计算弓箭角度 // calculate the angle of the player to player’s mouse
    let angle = atan2(mouseY - playerY, mouseX - playerX);
    aim = angle;
    push();
    translate(playerX, playerY);
    rotate(angle); // 旋转到鼠标的方向 // rotate to where the player‘s mouse position
    
    // 绘制箭的形状 // draw the shape of arrow 
    strokeWeight(4);
    stroke(255);
    line(0, 0, this.weaponSize, 0);
    
    // 绘制弓 // draw the bow
    let startAngle = -PI / 4; // 起始角度 // angle
    let endAngle = PI / 4; // 结束角度 // another angle
    let radius = this.weaponSize; // 扇形半径 // fan shape radius
    noFill();
    stroke(255, 50); // 设置扇形的边框颜色和透明度
    arc(0, 0, radius * 2, radius * 2, startAngle, endAngle, OPEN); // 绘制扇形
    pop();

  }

  update(){
    if (increaseArrowNumber === true) {
      numArrow = 20; // increase the number of arrows each wave
    }
  }
}

//----------------------------------------------------------------

let arrows = []; // 存储子弹的数组

class Arrow extends Weapon {
  constructor(x, y, angleChange) {
    super();
    this.x = x;
    this.y = y;
    this.speed = 8; // 子弹的速度
    // 子弹的方向是指向鼠标位置的单位向量
    let angle = atan2(mouseY - y, mouseX - x) + angleChange;
    this.angleChange = angleChange;
    this.vx = this.speed * cos(angle);
    this.vy = this.speed * sin(angle);

    this.damage = 6;
  }

  update() {
    // 子弹沿着它的速度方向移动
    this.x += this.vx;
    this.y += this.vy;
  }

  show() {
    // 绘制子弹
    fill(0);
    noStroke();
    ellipse(this.x, this.y, 5, 5);
  }

  isOffscreen() {
    // 检查子弹是否飞出屏幕
    return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
  }
}

// https://www.reddit.com/r/gamemaker/comments/5aq97l/diagonal_sincos_movement/?rdt=61956 (bullet motion formula)

//----------------------------------------------------------------

function updateArrows() {
  // 更新和显示每一颗子弹
  for (let i = arrows.length - 1; i >= 0; i--) {
    let arrow = arrows[i];
    arrow.update();
    arrow.show();
    if (arrow.isOffscreen()) {
      arrows.splice(i, 1); // 如果子弹飞出屏幕，就移除它
    }
  }

  for (let i = 0; i < arrows.length; i++) {
    let arrow = arrows[i];
    for (let j = 0; j < zombies.length; j++) {
      let currentZombie = zombies[j];
      let distance = dist(arrow.x, arrow.y, currentZombie.x, currentZombie.y);
      
      if (distance <= 10) { // zombie radius
        currentZombie.takeDamage(arrow.damage);
        arrows.splice(i, 1); // 移除击中的箭
        break; // 碰撞检测完成，跳出内部循环
      }
    }
  }
}

// ----------------------------------------------------------------

// Collision volume checker to prevent zombies from crowding into one spot
function collisionVolumeChecker(zombieA, zombieB){
  let d = Math.sqrt((zombieA.x - zombieB.x) ** 2 + (zombieA.y - zombieB.y) ** 2); // use Pythagorean theorem to calculate the distance between two zombies
  
  if (d <= 20) {
    return true; // The distance between zombies is less than or equal to the calculated distance.
  } else {
    return false; 
  }
}

function awayFromCollision(zombieA, zombieB){
  if (zombieA.x > zombieB.x){
    zombieA.x += 0.5
    zombieB.x -= 0.5
  }
  if (zombieA.x < zombieB.x){
    zombieA.x -= 0.5
    zombieB.x += 0.5
  }
  if (zombieA.y > zombieB.y){
    zombieA.y += 0.5
    zombieB.y -= 0.5
  }
  if (zombieA.y < zombieB.y){
    zombieA.y -= 0.5
    zombieB.y += 0.5
  }
}

// ----------------------------------------------------------------------

let waveI = 200;
function information() {
  noStroke();
  textSize(12);
  textAlign(LEFT, BASELINE);
  text("Player's health:" + player.health, 5, 20);
  text("Wave:" + wave, 5, 40);

  if (waveI > 0){
    textStyle(BOLD);
    textAlign(CENTER);
    textSize(48);
    text("Wave:" + wave, 400, 150);
    waveI--;
  }
}

// ----------------------------------------------------------------------

let textSize1 = 2;
let textSize2 = 4;
let winOrLose = 1;
function deathNote(){
  inGameMusic.stop();
  if (!loseMusic.isPlaying() && winOrLose === 1){
    loseMusic.play();
    winOrLose = 0;
  }
  fill(0);
  noStroke();
  textStyle(BOLD);
  textAlign(CENTER);
  textSize(textSize1);
  text("YOU LOSE THE GAME", width/2, height/2 - 35);
  textSize(textSize2);
  text("菜", width/2, height/2 + 50);
}

function winNote(){
  inGameMusic.stop();

  if (!winMusic.isPlaying() && winOrLose === 1) {
    winMusic.play();
    winOrLose = 0;
  }
  fill(0);
  noStroke();
  textStyle(BOLD);
  textAlign(CENTER);
  textSize(48);
  text("YOU PROTECTED YOUR SELF!", width/2, height/2);
}

// ----------------------------------------------------------------------

// Image
let startScreen;
let startButton;
let startPage;
let difficultPage;

// Music
let startMusic;
let inGameMusic;
let winMusic;
let loseMusic;

// Sound Effects
let swordEffect;
let eatEffect;
let zombieHurt;
let zombieDeath;
let mouseClick;
function preload() {
  // Image
  startScreen = loadImage("gameImage/ZombieWave_Encountering.jpg")
  startButton = loadImage("gameImage/start.jpeg");
  startPage = loadImage("gameImage/StartPage.png");
  difficultPage = loadImage("gameImage/pickD.png");

  // Music
  startMusic = loadSound("gameMusic/Prepare_for_Escape.mp3");
  inGameMusic = loadSound("gameMusic/dwrgSurvive.mp3");
  winMusic = loadSound("gameMusic/win.mp3");
  loseMusic = loadSound("gameMusic/lose.mp3");
  
  // sound effects
  swordEffect = loadSound("gameSoundEffect/swordEffect_4.mp3");
  eatEffect = loadSound("gameSoundEffect/eatEffect.mp3");
  zombieDeath = loadSound("gameSoundEffect/zombieDeath.mp3");
  zombieHurt = loadSound("gameSoundEffect/zombieHurt.mp3");
  mouseClick = loadSound("gameSoundEffect/mouseClick.mp3");
}

// ----------------------------------------------------------------------

function drawStartScreen() {
  image(startScreen, 0, 0, 800, 600);
  image(startButton, 350, 300, 125, 50);
}
// ----------------------------------------------------------------------

function setup() {
  createCanvas(800, 600);
}

// ----------------------------------------------------------------------
let player;
let gameStartedStatus = 0; // 0 pre , 1 start page, 2 choose difficulty, 3 start game
function mousePressed() {
  if (gameStartedStatus === 1) {
    if(mouseX >= 337.5 && mouseX <= 462.5 && mouseY >= 300 && mouseY <= 350){
      // start the game
      gameStartedStatus = 2;
      image(difficultPage, 0, 0, 800, 600);
      mouseClick.play();
    }
  }else if(gameStartedStatus === 0){
    gameStartedStatus = 1;
    mouseClick.play();
  }else if(gameStartedStatus === 2){
    if (mouseX >= 50 && mouseX <= 250 && mouseY >= 200 && mouseY <= 400){
      player = new Player(width / 2, height / 2, 20, 1.5);
      startMusic.stop();
      inGameMusic.play();
      inGameMusic.loop();

      difficulty = 0
      gameStartedStatus = 3;
    }else if(mouseX >= 300 && mouseX <= 500 && mouseY >= 200 && mouseY <= 400){
      player = new Player(width / 2, height / 2, 20, 1.5);
      startMusic.stop();
      inGameMusic.play();
      inGameMusic.loop();

      difficulty = 1
      gameStartedStatus = 3;
    }else if(mouseX >= 550 && mouseX <= 750 && mouseY >= 200 && mouseY <= 400){
      player = new Player(width / 2, height / 2, 20, 1.5);
      startMusic.stop();
      inGameMusic.play();
      inGameMusic.loop();

      difficulty = 2;
      gameStartedStatus = 3;
    }
    mouseClick.play();
  }else{
    player.attack();
  }
}

// ----------------------------------------------------------------------

let numZombies = 0; // number of zombies
let fibonacci_Sequence = [0, 1, 1, 2, 3, 5, 8, 13, 21, 0]; //number of zombie in each wave
let wave = 0; // current wave
let zombies = []; // Array to store all zombies
let difficulty; // difficulty 0 is easy, 1 is normal, 2 is hard.

function waves() {
  let randomSide;
  let randomX;
  let randomY;
  
  if (numZombies === 0 && wave < 9){
    wave += 1;
    waveI = 200;
    numZombies = fibonacci_Sequence[wave];

    // 补充箭
    if (maxArrow === 10){
      numArrow = 10;
    }else if (maxArrow === 20){
      numArrow = 20;
    }
    
    if (player.health <= 18){
      player.health += 2; // heal the player if player's health is below 18.
      eatEffect.play();
    }

    for (let i = 0; i < numZombies; i++) {
      randomSide = Math.floor(Math.random() * 4) + 1; // upEdge = 1, downEdge = 2, leftEdge = 3, rightEdge = 4

      if(randomSide === 1){
        randomX = Math.floor(Math.random() * 800);
        randomY = 0;
      }
      else if(randomSide === 2){
        randomX = Math.floor(Math.random() * 800);
        randomY = 600;
      }
      else if(randomSide === 3){
        randomX = 0;
        randomY = Math.floor(Math.random() * 600);
      }
      else if(randomSide === 4){
        randomX = 800;
        randomY = Math.floor(Math.random() * 600);
      }

      if(difficulty === 0){
        zombies.push(new Zombie(randomX, randomY, 10, 60, 0.5, 2.5));
      }else if(difficulty === 1){
        zombies.push(new Zombie(randomX, randomY, 11, 60, 0.5, 3));
      }else if(difficulty === 2){
        zombies.push(new Zombie(randomX, randomY, 16, 60, 0.5, 4.5));
      }
    }
  }
  else if (wave === 9) {
    // need add a image here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // -------------------------------------------------------------------
    winNote();
  }
}

// ----------------------------------------------------------------------

function gameLoop() {
  background(220);

  information(); // show the information

  waves();

  updateArrows(); // update the Arrows

  // // Render and update zombies
  for (let i = 0; i < zombies.length; i++) {
    let currentZombie = zombies[i];
    currentZombie.show();
    currentZombie.update();
    for (let j = 0; j < zombies.length; j++) {
      if(i != j){
        if(collisionVolumeChecker(currentZombie, zombies[j])){
          awayFromCollision(currentZombie, zombies[j]);
        }
      }
    }
  }

  // Render and update players
  if (player.health > 0) {
    player.show();
    player.update();
  }else{
    player.death();
    if(size < 1700){
      size += 10; // the death animation
    }
    if(size >= 600){
      if(textSize1 < 48){
        textSize1 += 0.5; // the death animation
      }
      if(textSize2 < 96){
        textSize2 += 1; // the death animation
      }
      deathNote(); // the text tell you that you lose
    } 
  }
}

// ----------------------------------------------------------------------

let gamePause = false;
function draw() {
  if (gameStartedStatus === 0) {
    image(startPage, 0, 0, 800, 600);
  } else if (gameStartedStatus === 1) {
    drawStartScreen();
    if (!startMusic.isPlaying()) {
      startMusic.play();
      startMusic.loop();
      inGameMusic.stop(); // make sure the music only play when the game is started
    }
  }else if(gameStartedStatus === 2) {
    fill(255);
    noStroke();
    textStyle(BOLD);
    textAlign(CENTER);
    textSize(48);
    text("Choose Difficulty", width/2, height/2-200);
  }else{
    if (gamePause === true){
      // To be continued
    }else{
      gameLoop();
    }
  }
}





