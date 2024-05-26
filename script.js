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

      if(bossFight === true && boss.length > 0){    
        for(let i = 0; i < bullet.length; i++){
          let bull = bullet[i];
          let dist1 = dist(this.x, this.y, bull.x, bull.y);
          if (dist1 <= this.weapon.range + 20) { // add 20, player circle center radius
            if(this.weapon.attackCoolDown <= 25){
              bull.health -= this.weapon.damage;
            }
          }
        }
      }

      swordEffect.play();
      this.weapon.attackCoolDown = 50;
      this.weapon.animateRotationAngle = 30;
    }
    //-----------------------------------------------------
    else if(currentWeaponType === 2){
      if (mouseButton === LEFT && multiShot === false && numArrow > 0 && readyToShot === true) {
        arrows.push(new Arrow(this.x, this.y, 0));
        numArrow -= 1;
        readyToShot = false
        crossbowShoot.play();
      }
      if (mouseButton === LEFT && multiShot === true && numArrow > 0 && readyToShot === true) {
        arrows.push(new Arrow(this.x, this.y, 0));
        arrows.push(new Arrow(this.x, this.y, -0.1));
        arrows.push(new Arrow(this.x, this.y, 0.1));
        numArrow -= 1;
        readyToShot = false
        crossbowShoot.play();
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

    // ----------------------------
    resetGameButton();
    // --------------------------
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
        playerHurt.play();// player hurt effect
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

// ---------------------------------------------------------------------
let time1 = 0;
let attack = false;
let laserAttack = false;

let attacked = false;
class Boss extends Creatures{
  constructor(x, y, health, movementSpeed){
    super(x, y, health, movementSpeed);
  }

  show(){
    fill(0, 0, 0)
    stroke(0, 0, 0);
    ellipse(this.x, this.y, 50, 50);
  }

  laserHorizontalAttack(){
    laserAttack = true;
    leftRight = Math.floor(Math.random() * 2);
  }

  intensiveBarrageAttack(){
    bullet[0] = new BossBullet(this.x, this.y, 0);
    bullet[1] = new BossBullet(this.x, this.y, 1);
    bullet[2] = new BossBullet(this.x, this.y, 2);
    bullet[3] = new BossBullet(this.x, this.y, 3);
    bullet[4] = new BossBullet(this.x, this.y, 4);
    bullet[5] = new BossBullet(this.x, this.y, 5);
    bullet[6] = new BossBullet(this.x, this.y, 6);
    bullet[7] = new BossBullet(this.x, this.y, 7);

    let time = 0;
    if(time < 50){
      time += 1;
    }else{
      attack = false;
      time1 = 0;
    }
  }

  callZombie(){
    if(zombies.length === 0){
      for(var i = 0; i < 4; i++){
        if(difficulty === 0){
          zombies.push(new Zombie(player.x + 50, player.y + 25, 10, 60, 0.6, 2.5));
        }else if(difficulty === 1){
          zombies.push(new Zombie(player.x + 50, player.y + 25, 11, 60, 0.8, 3));
        }else if(difficulty === 2){
          zombies.push(new Zombie(player.x + 50, player.y + 25, 16, 60, 1, 4.5));
        }
      }
    }else{
      let a = Math.floor(Math.random() * 2);
      if(a === 0){
        this.laserHorizontalAttack(); // 用其他的来替代
      }else if(a === 1){
        this.intensiveBarrageAttack();
      }
    }
    attack = false;
    time1 = 0;
  }

  update(){
    if(time1 < 200){
      attack = false;
      time1 += 1;
    }else{
      attack = true;
      attacked = false;
    }

    
    if(attack === true && attacked === false){
      let a = Math.floor(Math.random() * 3)
      if(a === 0){
        this.laserHorizontalAttack();
        attacked = true;
      }else if(a === 1){
        this.intensiveBarrageAttack();
        attacked = true;
      }else if(a === 2){
        this.callZombie();
        attacked = true;
      }
    }

    if(this.health <= 0){
      boss.splice(0, 1);
    }
  }
}

// ----------------------------------------------------------------------

let time = 0;
let startAngleA;
let laserAngle = 0;
let laserEndX;
let laserEndY; 
let leftRight;

let lockPlace = false;
let playerXA;
let playerYA;

function laserHorizontal(){
  if (lockPlace === false){
    playerXA = player.x;
    playerYA = player.y;
    lockPlace = true;
  }
  if (time < 125) {
    if(boss.length > 0){
      if(leftRight === 0){
        startAngleA = atan2(playerYA - boss[0].y, playerXA - boss[0].x) - PI / 4;
      }else{
        startAngleA = atan2(playerYA - boss[0].y, playerXA - boss[0].x) + PI / 4;
      }
      laserEndX = boss[0].x + cos(startAngleA + laserAngle) * 1000;
      laserEndY = boss[0].y + sin(startAngleA + laserAngle) * 1000;
    }

    // 激光柱
    stroke(255, 0, 0); 
    strokeWeight(20);
    line(width/2, height/2, laserEndX, laserEndY);

    stroke(255, 255, 0); 
    strokeWeight(8);
    line(width/2, height/2, laserEndX, laserEndY);

    stroke(255, 255, 255); 
    strokeWeight(3);
    line(width/2, height/2, laserEndX, laserEndY);

    // 发射激光口
    stroke(180, 0, 0);
    fill(180, 0, 0);
    circle(width/2, height/2, 50)

    stroke(255, 0, 0);
    fill(255, 0, 0);
    circle(width/2, height/2, 25)

    stroke(255, 255, 255);
    fill(255, 255, 255);
    circle(width/2, height/2, 10)

    // 更新角度
    if(leftRight === 0) {
      laserAngle += 0.01;
    }else{
      laserAngle -= 0.01;
    }

    time += 1;

    hitByLaser();
  }else{
    laserAttack = false;
    lockPlace = false;
    hited = false;
    hit = false;
  }
}

// ----------------------------------------------------------------------

let hit = false;
let hited = false;
let laserX;
let laserY;

function hitByLaser(){
  for(var i = 1; i < 1001; i++){
    if(boss.length > 0){
      laserX = boss[0].x + cos(startAngleA + laserAngle) * i;
      laserY = boss[0].y + sin(startAngleA + laserAngle) * i;
    }
  
    if(dist(laserX, laserY, player.x, player.y) < 20){
      hit = true;
    }
  }
  if(hit === true && hited === false){
    if(difficulty === 0){
      player.health -= 4; // 5下
    }else if(difficulty === 1){
      player.health -= 6; // 4下
    }else if(difficulty === 2){
      player.health -= 8; // 3下
    }
    
    playerHurt.play();
    hited = true;
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

let sharpness = false; // ID 1
let attackRangeIncrease = false; // ID 2
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
    if(sharpness === true){
      this.damage = 4.5;
    }else{
      this.damage = 2.6;
    }
    if(attackRangeIncrease === true){
      this.range = 40;
    }else{
      this.range = 30;
    }
  }
}

// ----------------------------------------------------------------------

// create a bow son class
let increaseArrowNumber = false; // ID 3
let increaseArrowDamage = false; // ID 4
let fastReload = false; // ID 5
let multiShot = false; // ID 6
let maxArrow = 10;
let aim;
let numArrow = 10;
let readyToShot = true;
let reload = 1250;
let timeDelay = 0;

class Crossbow extends Weapon {
  constructor(){
    super(); // the number of arrows each wave
    this.weaponSize = 30
    this.angle = 100; // 弓形状 shape of the bow
    
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
      maxArrow = 20; // increase the number of arrows each wave
    }else if(increaseArrowNumber === false){
      maxArrow = 10;
    }
    if (fastReload === true) {
      reload = 750;
    }else if(fastReload === false) {
      reload = 1250;
    }

    // 更新弩箭上弦状态
    if(readyToShot === false && numArrow > 0) {
      if (!crossbowReload.isPlaying()){
        crossbowReload.play();
      }
      if(readyToShot === false && timeDelay < reload){ 
        timeDelay += 12.5;
      }else{
        readyToShot = true;
        timeDelay = 0;
      }
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
    this.speed = 10; // 子弹的速度
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

    if(increaseArrowDamage === true) {
      this.damage = 11
    }
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

class BossBullet extends Weapon{
  constructor(x, y, direction) {
    super();
    this.x = x;
    this.y = y;
    this.direction = direction; // 0为上, 1为下, 2为左, 3为右, 4左上, 5右上, 6左下, 7右下
    this.health = 0.1;
  }

  show() {
    fill(255, 255, 0);
    noStroke();
    ellipse(this.x, this.y, 10, 10);
    fill(0);
    ellipse(this.x, this.y, 5, 5);
  }

  update() {
    switch(this.direction){
      case 0:
        this.y += 1.5;
        break;
      case 1:
        this.y -= 1.5;
        break;
      case 2:
        this.x -= 2;
        break;
      case 3:
        this.x += 2;
        break;
      case 4:
        this.x -= 2;
        this.y -= 1.5;
        break;
      case 5:
        this.x += 2;
        this.y -= 1.5;
        break;
      case 6:
        this.x -= 2;
        this.y += 1.5;
        break;
      case 7:
        this.x += 2;
        this.y += 1.5;
        break;
    }
  }

  isOffscreen() {
    // 检查子弹是否飞出屏幕
    return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
  }
}

// ----------------------------------------------------------------

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
    
    if(bossFight === true && boss.length > 0) {
      let distance = dist(arrow.x, arrow.y, boss[0].x, boss[0].y);
      if (distance <= 25){
        boss[0].health -= arrow.damage;
        arrows.splice(i, 1);
        if(!zombieHurt.isPlaying()){
          zombieHurt.play();
        }
      }
    }
  }
}

// -----------------------------------------------------------------------

let bullet = [];

function updateBossBullet() {
  // 更新和显示每一颗子弹
  for (let i = bullet.length - 1; i >= 0; i--) {
    let bull = bullet[i];
    bull.update();
    bull.show();
    if (bull.isOffscreen()) {
      bullet.splice(i, 1); // 如果子弹飞出屏幕，就移除它
    }
    if (bull.health <= 0){
      bullet.splice(i, 1); 
    }
  }

  for (let i = bullet.length - 1; i >= 0; i--) {
    let d = Math.sqrt((bullet[i].x - player.x) ** 2 + (bullet[i].y - player.y) ** 2);
    if(d < 10){
      if(difficulty === 0){
        player.health -= 2;
        bullet.splice(i, 1);
      }else if(difficulty === 1){
        player.health -= 3;
      }else if(difficulty === 3){
        player.health -= 4;
      }
      playerHurt.play();
      bullet.splice(i, 1);
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
    if(wave < 9){
      text("Wave:" + wave, 400, 150);
    }else if(wave >= 9){
      text("◿卝⨀ϟ‡“Boss”", 400, 150);
    }
    
    waveI -= 1;
  }
}

// ----------------------------------------------------------------------

let textSize1 = 2;
let textSize2 = 4;
let winOrLose = 1; // 检查是否有输赢
function deathNote(){
  inGameMusic.stop();
  bossFightMusic.stop();
  zombies = [];

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
  bossFightMusic.stop();

  zombies = [];

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

// talent icon Image

// 1 = sharpnessSword
// 2 = attack range increased, 
// 3 = quiver
// 4 = sharpnessArrow
// 5 = quick reload
// 6 = multiShot
let sharpnessIcon;
let rangeIncreaseIcon;
let quiverIcon;
let sharpArrowIcon;
let fastReloadIcon;
let multiShotIcon;

// Music
let startMusic;
let inGameMusic;
let winMusic;
let loseMusic;
let bossFightMusic;

// Sound Effects
let swordEffect;
let eatEffect;
let zombieHurt;
let zombieDeath;
let mouseClick;
let crossbowReload;
let crossbowShoot;
let playerHurt;
function preload() {
  // Image
  startScreen = loadImage("gameImage/ZombieWave_Encountering.jpg")
  startButton = loadImage("gameImage/start.jpeg");
  startPage = loadImage("gameImage/StartPage.png");
  difficultPage = loadImage("gameImage/pickD.png");

  // talent icon image
  sharpnessIcon = loadImage("gameTalentIcon/sharpnessIcon.png");
  rangeIncreaseIcon = loadImage("gameTalentIcon/rangeIncrease.png");
  quiverIcon = loadImage("gameTalentIcon/quiverIcon.png");
  sharpArrowIcon = loadImage("gameTalentIcon/sharpArrowIcon.png");
  fastReloadIcon = loadImage("gameTalentIcon/fastReload.png");
  multiShotIcon = loadImage("gameTalentIcon/multiShot.png");

  // Music
  startMusic = loadSound("gameMusic/Prepare_for_Escape.mp3");
  inGameMusic = loadSound("gameMusic/dwrgSurvive.mp3");
  winMusic = loadSound("gameMusic/win.mp3");
  loseMusic = loadSound("gameMusic/lose.mp3");
  bossFightMusic = loadSound("gameMusic/BossMusic.mp3");
  
  // sound effects
  swordEffect = loadSound("gameSoundEffect/swordEffect_4.mp3");
  eatEffect = loadSound("gameSoundEffect/eatEffect.mp3");
  zombieDeath = loadSound("gameSoundEffect/zombieDeath.mp3");
  zombieHurt = loadSound("gameSoundEffect/zombieHurt.mp3");
  mouseClick = loadSound("gameSoundEffect/mouseClick.mp3");
  crossbowReload = loadSound("gameSoundEffect/crossbowReload.mp3");
  crossbowShoot = loadSound("gameSoundEffect/crossbowShoot.mp3");
  playerHurt = loadSound("gameSoundEffect/playerHurt.mp3");
}

// ----------------------------------------------------------------------

function drawStartScreen() {
  image(startScreen, 0, 0, 800, 600);
  image(startButton, 350, 300, 125, 50);
}
// ----------------------------------------------------------------------

function setup() {
  createCanvas(800, 600); // A 4:3 ratio
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

      difficulty = 0
      gameStartedStatus = 3;
    }else if(mouseX >= 300 && mouseX <= 500 && mouseY >= 200 && mouseY <= 400){
      player = new Player(width / 2, height / 2, 20, 1.5);
      startMusic.stop();

      difficulty = 1
      gameStartedStatus = 3;
    }else if(mouseX >= 550 && mouseX <= 750 && mouseY >= 200 && mouseY <= 400){
      player = new Player(width / 2, height / 2, 20, 1.5);
      startMusic.stop();

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
let choseTalent = false; 

let boss = [];
let bossFight = false;

function waves() {
  let randomSide;
  let randomX;
  let randomY;
  
  if (numZombies === 0 && wave < 9){
    if(wave % 2 === 1 && wave != 0 && selectedTalents.length < 4){
      talent();
      console.log("no");
    }else if(wave % 2 === 0 || wave === 9){ 
      choseTalent = true; // There is no need to select talents, so skip it.
      console.log("yes");
    }
    if (choseTalent === true){ // run wave after the Talent is chose
      randomTalentsSpawned = false;
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
  }else if (wave === 9) {
    if(difficulty === 0){
      boss[0] = new Boss(width/2, height/2, 200, 0);
    }else if(difficulty === 1){
      boss[0] = new Boss(width/2, height/2, 300, 0);
    }else if(difficulty === 2){
      boss[0] = new Boss(width/2, height/2, 400, 0);
    }
    bossFight = true;
    wave += 1;
  }
}

// ----------------------------------------------------------------------

function bossHealthBar(){
  stroke(0);
  strokeWeight(4);
  noFill();
  rect(199, 49, 402, 22);

  let healthBar1;
  let healthBar2;
  let healthBar3;

  if(boss.length != 0){
    healthBar1 = boss[0].health * 2;
    healthBar2 = (boss[0].health * 4)/3;
    healthBar3 = boss[0].health;
  }

  noStroke();
  fill(255, 0, 0);
  if(difficulty === 0){
    rect(200, 50, healthBar1, 20);
  }else if(difficulty === 1){
    rect(200, 50, healthBar2, 20);
  }else if(difficulty === 2){
    rect(200, 50, healthBar3, 20);
  }
}

// ----------------------------------------------------------------------
function gameLoop() {
  background(220);

  if(bossFight === false){
    bossFightMusic.stop();
    if(!inGameMusic.isPlaying()){
      inGameMusic.play();
    }
  }else{
    inGameMusic.stop();
    if(!bossFightMusic.isPlaying()){
      bossFightMusic.play();
    }

    if(boss.length > 0){
      boss[0].show();
      boss[0].update();
      bossHealthBar();

      if(laserAttack === true){
        laserHorizontal();
      }else{
        time = 0;
        laserAngle = 0; 
      }
    }
    updateBossBullet();

    if(boss.length === 0){
      bossFightMusic.stop();
      winNote();
      resetGameButton();
    }

    if(numArrow < maxArrow){
      numArrow += 1;
    }
  }

  information(); // show the information

  waves();

  talentsIcon();

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
  }else if(gameStartedStatus === 3) {
    gameLoop();
  }
}


// Sword: attack range increased, sharpness
// Crossbow: multiShot, quick reload, quiver(箭袋), sharpnessArrow, exploding arrow
// Ability: flywheel(飞轮), diamond armor

// Implemented: 
// 1 = sharpnessSword
// 2 = attack range increased, 
// 3 = quiver
// 4 = sharpnessArrow
// 5 = quick reload
// 6 = multiShot
  
// Not implemented yet:
// 7 = exploding arrow
// 8 = flywheel, 
// 9 = Diamond Armor

let talents = [1, 2, 3, 4, 5, 6];
let randomTalentsSpawned = false;

function talent(){
  
  let randomI1 = Math.floor(Math.random() * talents.length);
  let randomJ1 = talents[randomI1];
  while (selectedTalents.includes(randomJ1)){
    randomI1 = Math.floor(Math.random() * talents.length);
    randomJ1 = talents[randomI1];
  }

  switch (randomJ1) {
    case 1:
      sharpness = true;
      selectedTalents.push(1);
      break;
    case 2:
      attackRangeIncrease = true;
      selectedTalents.push(2);
      break;
    case 3:
      increaseArrowNumber = true;
      selectedTalents.push(3);
      break;
    case 4:
      increaseArrowDamage = true;
      selectedTalents.push(4);
      break;
    case 5:
      fastReload = true;
      selectedTalents.push(5);
      break;
    case 6:
      multiShot = true;
      selectedTalents.push(6);
      break;
  }

  talents.splice(randomJ1, 1);
  
  for (var i = 0; i < talents.length; i++){
    console.log(talents[i]);
  }
}

// -----------------------------------------------------

let selectedTalents = []; // no more than 4
function talentsIcon(){ // very stupid method...
  for(let i = 0; i < selectedTalents.length; i++){
    switch (selectedTalents[i]) {
      case 1:
        if(i === 0){
          image(sharpnessIcon, 745, 5, 50, 50);
        }else if(i === 1){
          image(sharpnessIcon, 690, 5, 50, 50);
        }else if(i === 2){
          image(sharpnessIcon, 635, 5, 50, 50);
        }else{
          image(sharpnessIcon, 580, 5, 50, 50);
        }
        break;
      case 2:
        if(i === 0){
          image(rangeIncreaseIcon, 745, 5, 50, 50);
        }else if(i === 1){
          image(rangeIncreaseIcon, 690, 5, 50, 50);
        }else if(i === 2){
          image(rangeIncreaseIcon, 635, 5, 50, 50);
        }else{
          image(rangeIncreaseIcon, 580, 5, 50, 50);
        }
        break;
      case 3:
        if(i === 0){
          image(quiverIcon, 745, 5, 50, 50);
        }else if(i === 1){
          image(quiverIcon, 690, 5, 50, 50);
        }else if(i === 2){
          image(quiverIcon, 635, 5, 50, 50);
        }else{
          image(quiverIcon, 580, 5, 50, 50);
        }
        break;
      case 4:
        if(i === 0){
          image(sharpArrowIcon, 745, 5, 50, 50);
        }else if(i === 1){
          image(sharpArrowIcon, 690, 5, 50, 50);
        }else if(i === 2){
          image(sharpArrowIcon, 635, 5, 50, 50);
        }else{
          image(sharpArrowIcon, 580, 5, 50, 50);
        }
        break;
      case 5:
        if(i === 0){
          image(fastReloadIcon, 745, 5, 50, 50);
        }else if(i === 1){
          image(fastReloadIcon, 690, 5, 50, 50);
        }else if(i === 2){
          image(fastReloadIcon, 635, 5, 50, 50);
        }else{
          image(fastReloadIcon, 580, 5, 50, 50);
        }
        break;
      case 6:
        if(i === 0){
          image(multiShotIcon, 745, 5, 50, 50);
        }else if(i === 1){
          image(multiShotIcon, 690, 5, 50, 50);
        }else if(i === 2){
          image(multiShotIcon, 635, 5, 50, 50);
        }else{
          image(multiShotIcon, 580, 5, 50, 50);
        }
        break;
    }
  }
}

// ----------------------------------------------------

function resetGameButton(){
  fill(0);
  noStroke();
  textStyle(BOLD);
  textAlign(CENTER);
  textSize(18);
  text("Press space key to restart", width/2, height/2 + 250);
  if (keyIsPressed && keyCode === 32) {
    resetGame();
  }
}

// ----------------------------------------------------

function resetGame() {
  // set game statue to the main page
  gameStartedStatus = 1;

  // stop playing music
  startMusic.stop();
  inGameMusic.stop();
  winMusic.stop();
  loseMusic.stop();
  bossFightMusic.stop();
  
  // reset all variables
  // boss variable
  bossFight = false;

  // wave variables
  zombies = [];
  numZombies = 0;
  wave = 0;

  // crossbow variables
  arrows = [];
  numArrow = 10;
  readyToShot = true;

  // player variable
  size = 20;
  currentWeaponType = 0;

  // win/lose text size variables
  textSize1 = 2;
  textSize2 = 4;
  winOrLose = 1;
  
  // set all talent to default - false
  talents.splice(0, talents.length);
  talents = [1, 2, 3, 4, 5, 6];
  selectedTalents.splice(0, selectedTalents.length);
  selectedTalents = [];
  randomTalentsSpawned = false;
  sharpness = false;
  attackRangeIncrease = false;
  increaseArrowNumber = false;
  increaseArrowDamage = false;
  fastReload = false;
  multiShot = false;
  
}
