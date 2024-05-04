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
      this.currentWeapon(new BowArrow());
      currentWeaponType = 2;
      textSize(12);
      textAlign(LEFT, BASELINE);
      text(this.weapon.numArrow + "/" + maxArrow, this.x - 5, this.y - 15) // display how much arrow you still left when you hold "2"
    }
  }

  show() { // display
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

    this.chooseWeapon(); // update the choose weapon

    if(this.weapon !== null){
        this.weapon.update(); // if player is taking a weapon, update the weapon
    }
  }

}

// creates the son class for the
class Zombie extends Creatures {
  
  constructor(x, y, health, attackCoolDown, movementSpeed) {
    super(x, y, health, movementSpeed)
    this.attackCoolDown = attackCoolDown;
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
        player.health -= 2.5;
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
    this.x = 100;
    this.y = 100;
    // 禁用僵尸的移动和攻击逻辑
    this.isActive = false;
    numZombies -= 1;
    // play the sound effect
  }
}

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

// create a bow son class
let bowLevel = 1;
let maxArrow = 10;
let aim;
class BowArrow extends Weapon {
  constructor(){
    super();
    this.numArrow = 10; // the number of arrows each wave
    this.weaponSize = 30
    this.angle = 100; // 弓形状 shape of the bow
    this.attackCoolDown = 100;
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
    if (bowLevel === 2) {
      this.numArrow = 20; // increase the number of arrows each wave
      maxArrow = 20;
    }
    if (bowLevel === 3) {
      arrow.damage = 12;
    }
  }
}



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
  // textSize(textSize2);
  // text("你是真的菜", width/2, height/2 + 50);
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

let startScreen;
let startMusic;
let startButton;
let inGameMusic;
let winMusic;
let loseMusic;
let swordEffect;
let eatEffect;
let zombieHurt;
let zombieDeath;
function preload() {
  // Image
  startScreen = loadImage("ZombieWave_Encountering.jpg")
  startButton = loadImage("start.jpeg");


  // Music and sound effects
  startMusic = loadSound("Prepare_for_Escape.mp3");
  inGameMusic = loadSound("dwrgSurvive.mp3");
  winMusic = loadSound("win.mp3");
  loseMusic = loadSound("lose.mp3");
  swordEffect = loadSound("swordEffect_4.mp3");
  eatEffect = loadSound("eatEffect.mp3");
  zombieDeath = loadSound("zombieDeath.mp3");
  zombieHurt = loadSound("zombieHurt.mp3");

  
}

let gameStartedStatus = false; // not start the game 
function drawStartScreen() {
  image(startScreen, 0, 0, 800, 600);
  image(startButton, 350, 300, 125, 50);

}


function setup() {
  createCanvas(800, 600);
}

let player;
let zombie;

function mousePressed() {
  if (gameStartedStatus === false) {
    if(mouseX >= 337.5 && mouseX <= 462.5 && mouseY >= 300 && mouseY <= 350){
      // start the game
      gameStartedStatus = true;
      player = new Player(width / 2, height / 2, 20, 1.5);
      // zombie = new Zombie(0, 0, 10, 60, 0.5);
      startMusic.stop();
      inGameMusic.play();
      inGameMusic.loop();
    }
  }
  else{
    player.attack();
  }
}

let numZombies = 0; // number of zombies
let fibonacci_Sequence = [0, 1, 1, 2, 3, 5, 8, 13, 21, 0]; //number of zombie in each wave
let wave = 0; // current wave
let zombies = []; // Array to store all zombies

function waves() {
  let randomSide;
  let randomX;
  let randomY;
  
  if (numZombies == 0 && wave < 9){
    wave += 1;
    waveI = 200;
    numZombies = fibonacci_Sequence[wave];

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
      zombies.push(new Zombie(randomX, randomY, 10, 60, 0.5));
    }
  }
  else if (wave === 9) {
    // need add a image here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // -------------------------------------------------------------------
    winNote();
  }
}

function gameLoop() {
  background(220);

  information(); // show the information

  waves();
  // // Render and update zombies
  for (let i = 0; i < zombies.length; i++) {
    let currentZombie = zombies[i];
    currentZombie.show();
    currentZombie.update();
  }
  // zombie.show();
  // zombie.update();

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

function draw() {
  if (gameStartedStatus === false) {
    drawStartScreen();
    if (!startMusic.isPlaying()) {
      startMusic.play();
      startMusic.loop();
      inGameMusic.stop(); // make sure the music only play when the game is started
    }
  } else {
    gameLoop();
  }
}
