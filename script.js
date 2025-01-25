const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 40; // 每个格子的大小
const rows = canvas.height / gridSize; // 行数
const cols = canvas.width / gridSize;  // 列数

const snakeBodyColor = "#FFFFFF"; // 白色方块
const snakeGradientColor = "#AF474C"; // 渐变主色
const foodColor = "#FFFFFF"; // 食物颜色
const eyeColor = "#000000"; // 眼睛颜色
const tongueColor = "#FFFFFF"; // 舌头颜色



// 初始化蛇和食物的位置
let snake = [
  { x: 120, y: 120 }, // 蛇头
  { x: 80, y: 120 },  // 第二格
  { x: 40, y: 120 },  // 身体部分
];
let food = { x: 200, y: 200 }; // 初始食物的位置
let direction = "right"; // 初始前进方向（可选值：'up', 'down', 'left', 'right'）


let gameInterval = null; // 游戏循环的定时器
let isPaused = false;    // 游戏是否暂停

// 添加触摸事件相关变量
let touchStartX = null;
let touchStartY = null;
const minSwipeDistance = 30; // 最小滑动距离，防止误触

// 启动暂停游戏
function startGame() {
  console.log("Start button clicked");
  if (!gameInterval) { // 确保游戏未运行
    gameInterval = setInterval(updateGame, 400); // 每 400 毫秒运行一次
    document.getElementById("startButton").disabled = true; // 禁用 "开始" 按钮
    document.getElementById("pauseButton").disabled = false; // 启用 "暂停" 按钮
    isPaused = false;
  }
}

function pauseGame() {
  console.log("Pause button clicked");
  if (gameInterval) {
    clearInterval(gameInterval); // 停止定时器
    gameInterval = null;
    document.getElementById("startButton").disabled = false; // 启用 "开始" 按钮
    document.getElementById("pauseButton").disabled = true; // 禁用 "暂停" 按钮
    isPaused = true;
  }
}


// 按钮事件绑定
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startButton").addEventListener("click", startGame);
  document.getElementById("pauseButton").addEventListener("click", pauseGame);

  // 初始状态：开始按钮可用，暂停按钮禁用
  document.getElementById("startButton").disabled = false;
  document.getElementById("pauseButton").disabled = true;
});


// 更新游戏逻辑：让蛇移动
function updateGame() {
  moveSnake(); // 更新蛇的位置
  drawGame(); // 重新绘制游戏
}

// 移动蛇的逻辑
function moveSnake() {
  const head = { ...snake[0] }; // 获取蛇头


  
  // 根据当前方向更新蛇头的位置
  if (direction === "right") {
    head.x += gridSize;
  } else if (direction === "left") {
    head.x -= gridSize;
  } else if (direction === "down") {
    head.y += gridSize;
  } else if (direction === "up") {
    head.y -= gridSize;
  }

  // 检查边界条件
  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
  ) {
    console.log("游戏结束");
    clearInterval(gameInterval); // 停止游戏循环
    return;
  }

  // 检查是否吃到食物
  if (head.x === food.x && head.y === food.y) {
    console.log("吃到食物！");
    food = getRandomFoodPosition(); // 重新生成食物
    // 蛇长度增加：只添加头部，不移除尾部
  } else {
    // 如果没有吃到食物，移除尾部
    snake.pop();
  }

  // 添加新的蛇头
  snake.unshift(head);
}

// 防止新生成的食物与蛇重叠。
function getRandomFoodPosition() {
  let newFoodPosition;

  do {
    newFoodPosition = {
      x: Math.floor(Math.random() * cols) * gridSize,
      y: Math.floor(Math.random() * rows) * gridSize,
    };
  } while (snake.some((part) => part.x === newFoodPosition.x && part.y === newFoodPosition.y));

  return newFoodPosition;
}

// 监听键盘事件以改变方向并防止默认行为
document.addEventListener("keydown", (e) => {
  // 阻止默认的键盘滚动行为
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  // 更新方向
  if (e.key === "ArrowRight" && direction !== "left") {
    direction = "right";
  } else if (e.key === "ArrowLeft" && direction !== "right") {
    direction = "left";
  } else if (e.key === "ArrowDown" && direction !== "up") {
    direction = "down";
  } else if (e.key === "ArrowUp" && direction !== "down") {
    direction = "up";
  }


  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
  ) {
    console.log("游戏结束");
    clearInterval(gameInterval);
    gameInterval = null;
    document.getElementById("startButton").disabled = false; // 启用 "开始" 按钮
    document.getElementById("pauseButton").disabled = true;  // 禁用 "暂停" 按钮
    alert("游戏结束！");
    return;
  }
  
});



// 绘制蛇
function drawSnake() {
  snake.forEach((part, index) => {
    if (index === 0) {
      // 蛇头（包含舌头和眼睛）
      drawTongueAndEyes(part.x, part.y);
    } else {
      const isGradient = Math.random() < 0.5; // 50% 概率使用渐变
      if (isGradient) {
        let gradient;

        // 随机选择渐变方向
        const direction = Math.floor(Math.random() * 4); // 0: 上, 1: 下, 2: 左, 3: 右
        switch (direction) {
          case 0: // 从下到上
            gradient = ctx.createLinearGradient(
              part.x, part.y + gridSize,
              part.x, part.y
            );
            break;
          case 1: // 从上到下
            gradient = ctx.createLinearGradient(
              part.x, part.y,
              part.x, part.y + gridSize
            );
            break;
          case 2: // 从右到左
            gradient = ctx.createLinearGradient(
              part.x + gridSize, part.y,
              part.x, part.y
            );
            break;
          case 3: // 从左到右
            gradient = ctx.createLinearGradient(
              part.x, part.y,
              part.x + gridSize, part.y
            );
            break;
        }

        gradient.addColorStop(0, snakeGradientColor); // 起始颜色
        gradient.addColorStop(0.7, "white"); // 白色扩展到70%
        gradient.addColorStop(1, "white"); // 保持结束为白色
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = snakeBodyColor; // 非渐变部分的默认颜色
      }

      // 绘制蛇身体部分
      ctx.fillRect(part.x, part.y, gridSize, gridSize);
    }
  });
}

// 绘制舌头和眼睛
function drawTongueAndEyes(x, y) {
  drawEyes(x, y); // 绘制眼睛
  drawTongue(x, y); // 绘制舌头
} 

// 修正绘制眼睛的代码
function drawEyes(x, y) {
  const outerRadius = gridSize / 6; // 外圆半径
  const innerRadius = outerRadius / 2; // 内圆半径（外圆的 1/2）

 // 创建红到白的渐变背景
let bodyGradient;

if (direction === "up") {
  bodyGradient = ctx.createLinearGradient(x, y + gridSize, x, y); // 从下到上
} else if (direction === "down") {
  bodyGradient = ctx.createLinearGradient(x, y, x, y + gridSize); // 从上到下
} else if (direction === "left") {
  bodyGradient = ctx.createLinearGradient(x + gridSize, y, x, y); // 从右到左
} else if (direction === "right") {
  bodyGradient = ctx.createLinearGradient(x, y, x + gridSize, y); // 从左到右
}

bodyGradient.addColorStop(0, "#FFFFFF"); // 白色
bodyGradient.addColorStop(1, "#8E1D22"); // 红色

// 绘制背景
ctx.fillStyle = bodyGradient;
ctx.fillRect(x, y, gridSize, gridSize);

  // 动态调整眼睛位置
  let leftEyeX, rightEyeX, leftEyeY, rightEyeY, innerLeftEyeX, innerRightEyeX, innerLeftEyeY, innerRightEyeY;

  if (direction === "right") {
    leftEyeX = x + (3 * gridSize) / 4; // 左眼外圆 X 坐标
    rightEyeX = x + (3 * gridSize) / 4; // 右眼外圆 X 坐标
    leftEyeY = y + gridSize / 4; // 顶部眼睛 Y 坐标
    rightEyeY = y + (3 * gridSize) / 4; // 底部眼睛 Y 坐标

    innerLeftEyeX = leftEyeX + (outerRadius - innerRadius);
    innerLeftEyeY = leftEyeY;
    innerRightEyeX = rightEyeX + (outerRadius - innerRadius);
    innerRightEyeY = rightEyeY;
  } else if (direction === "left") {
    leftEyeX = x + gridSize / 4;
    rightEyeX = x + gridSize / 4;
    leftEyeY = y + gridSize / 4;
    rightEyeY = y + (3 * gridSize) / 4;


    innerLeftEyeX = leftEyeX - (outerRadius - innerRadius);
    innerLeftEyeY = leftEyeY;
    innerRightEyeX = rightEyeX - (outerRadius - innerRadius);
    innerRightEyeY = rightEyeY;
  } else if (direction === "down") {
    leftEyeX = x + gridSize / 4; // 左眼外圆 X 坐标
    rightEyeX = x + (3 * gridSize) / 4; // 右眼外圆 X 坐标
    leftEyeY = y + (3 * gridSize) / 4; // 左眼外圆 Y 坐标
    rightEyeY = y + (3 * gridSize) / 4; // 右眼外圆 Y 坐标


    innerLeftEyeX = leftEyeX;
    innerLeftEyeY = leftEyeY + (outerRadius - innerRadius);
    innerRightEyeX = rightEyeX;
    innerRightEyeY = rightEyeY + (outerRadius - innerRadius);
  } else if (direction === "up") {
    leftEyeX = x + gridSize / 4;
    rightEyeX = x + (3 * gridSize) / 4;
    leftEyeY = y + gridSize / 4;
    rightEyeY = y + gridSize / 4;


    innerLeftEyeX = leftEyeX;
    innerLeftEyeY = leftEyeY - (outerRadius - innerRadius);
    innerRightEyeX = rightEyeX;
    innerRightEyeY = rightEyeY - (outerRadius - innerRadius);
  }

  // 绘制外圆
  ctx.fillStyle = createEyeGradient(leftEyeX, leftEyeY, outerRadius); // 左眼渐变
  ctx.beginPath();
  ctx.arc(leftEyeX, leftEyeY, outerRadius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = createEyeGradient(rightEyeX, rightEyeY, outerRadius); // 右眼渐变
  ctx.beginPath();
  ctx.arc(rightEyeX, rightEyeY, outerRadius, 0, 2 * Math.PI);
  ctx.fill();

  // 绘制内圆
  ctx.fillStyle = eyeColor; // 黑色内圆
  ctx.beginPath();
  ctx.arc(innerLeftEyeX, innerLeftEyeY, innerRadius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(innerRightEyeX, innerRightEyeY, innerRadius, 0, 2 * Math.PI);
  ctx.fill();
}


// 修正的眼睛渐变
function createEyeGradient(x, y, radius) {
  const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  gradient.addColorStop(0, "#FFFFFF"); // 白色
  gradient.addColorStop(0.5, "#FFFFFF"); // 白色部分扩展到 10%
  gradient.addColorStop(1, "#BB787B"); // 红色
  return gradient;
}



// 动态创建蛇身体背景色
function createGradientColor(x, y) {
  const gradient = ctx.createLinearGradient(
    x, y,
    x + gridSize, y + gridSize
  );
  gradient.addColorStop(0, snakeGradientColor);
  gradient.addColorStop(1, snakeBodyColor);
  return gradient;
}

function drawTongue(x, y) {
  const tongueWidth = gridSize / 5; // 舌头宽度
  const tongueHeight = gridSize / 2; // 舌头高度

  let tongueX, tongueY, gradient;

  if (direction === "right") {
    tongueX = x + gridSize;
    tongueY = y + gridSize / 2 - tongueWidth / 2;
    gradient = ctx.createLinearGradient(tongueX, tongueY, tongueX + tongueHeight, tongueY);
  } else if (direction === "left") {
    tongueX = x - tongueHeight;
    tongueY = y + gridSize / 2 - tongueWidth / 2;
    gradient = ctx.createLinearGradient(tongueX + tongueHeight, tongueY, tongueX, tongueY);
  } else if (direction === "down") {
    tongueX = x + gridSize / 2 - tongueWidth / 2;
    tongueY = y + gridSize;
    gradient = ctx.createLinearGradient(tongueX, tongueY, tongueX, tongueY + tongueHeight);
  } else if (direction === "up") {
    tongueX = x + gridSize / 2 - tongueWidth / 2;
    tongueY = y - tongueHeight;
    gradient = ctx.createLinearGradient(tongueX, tongueY + tongueHeight, tongueX, tongueY);

  }

  // 设置渐变颜色
  gradient.addColorStop(0, "#BB787B"); // 起始为红色
  gradient.addColorStop(1, "white"); // 结束为白色

  ctx.fillStyle = gradient; // 使用渐变作为填充样式
  if (direction === "right" || direction === "left") {
    ctx.fillRect(tongueX, tongueY, tongueHeight, tongueWidth);
  } else {
    ctx.fillRect(tongueX, tongueY, tongueWidth, tongueHeight);
  }
}

// 绘制食物
function drawFood() {
  ctx.fillStyle = foodColor; // 食物为白色方块
  ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

// 绘制整个网格
function drawGrid() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * gridSize;
      const y = row * gridSize;
      drawCell(x, y);
    }
  }
}

// 绘制单个格子（背景）
function drawCell(x, y) {
  const isPureRed = Math.random() < 1 / 5; // 纯红色比例约为1:5
  if (isPureRed) {
    ctx.fillStyle = "#E7231E";
    ctx.fillRect(x, y, gridSize, gridSize);
  } else {
    const gradient = createRandomGradient(x, y);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, gridSize, gridSize);
  }
}

// 创建随机渐变
function createRandomGradient(x, y) {
  const gradientType = Math.floor(Math.random() * 4); // 随机生成 0, 1, 2, 3
  let gradient;

  switch (gradientType) {
    case 0: // 从上到下渐变
      gradient = ctx.createLinearGradient(x, y, x, y + gridSize);
      break;
    case 1: // 从左到右渐变
      gradient = ctx.createLinearGradient(x, y, x + gridSize, y);
      break;
    case 2: // 从下到上渐变
      gradient = ctx.createLinearGradient(x, y + gridSize, x, y);
      break;
    case 3: // 从右到左渐变
      gradient = ctx.createLinearGradient(x + gridSize, y, x, y);
      break;
  }

  // 调整颜色占比
  gradient.addColorStop(0, "#E7231E"); // 红色开始
  gradient.addColorStop(0.2, "#E7231E"); // 红色范围更大
  gradient.addColorStop(1, "#972227"); // 深红色结束

  return gradient;
}

// 运行游戏画布
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
  drawGrid(); // 绘制背景网格
  drawFood(); // 绘制食物
  drawSnake(); // 绘制蛇
}

// 添加触摸事件监听器
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

// 处理触摸开始事件
function handleTouchStart(e) {
  e.preventDefault(); // 阻止默认滚动行为
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

// 处理触摸移动事件
function handleTouchMove(e) {
  e.preventDefault(); // 阻止默认滚动行为
}

// 处理触摸结束事件
function handleTouchEnd(e) {
  e.preventDefault();
  if (!touchStartX || !touchStartY) return;

  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  // 确保滑动距离足够长，避免误触
  if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
    touchStartX = null;
    touchStartY = null;
    return;
  }

  // 判断滑动方向
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // 水平滑动
    if (deltaX > 0 && direction !== 'left') {
      direction = 'right';
    } else if (deltaX < 0 && direction !== 'right') {
      direction = 'left';
    }
  } else {
    // 垂直滑动
    if (deltaY > 0 && direction !== 'up') {
      direction = 'down';
    } else if (deltaY < 0 && direction !== 'down') {
      direction = 'up';
    }
  }

  touchStartX = null;
  touchStartY = null;
}

// 开始绘制游戏
drawGame();




