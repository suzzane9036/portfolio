let canvas, ctx;
let gridSize, rows, cols;
let snake = [];
let food = null;
let direction = "right";
let gameInterval = null;

// 确保在页面加载完成后初始化
window.addEventListener("DOMContentLoaded", () => {
    initGame();
    drawGame();  // 只绘制初始状态，不启动游戏
});

function initGame() {
    canvas = document.getElementById("gridCanvas");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    ctx = canvas.getContext("2d");
    
    calculateDimensions();
    resetGame();
    
    window.addEventListener('resize', debounce(() => {
        calculateDimensions();
        resetGame();
        drawGame();  // 重绘当前状态
    }, 250));
}

function calculateDimensions() {
    const isMobile = window.innerWidth <= 768;
    const minGridSize = 40;  // 设置最小格子尺寸为40
    
    if (isMobile) {
        // 移动端布局
        gridSize = Math.max(Math.floor(window.innerWidth / 15), minGridSize);  // 确保不小于最小尺寸
        canvas.width = gridSize * Math.floor(window.innerWidth / gridSize);    // 确保宽度能被格子大小整除
        canvas.height = gridSize * Math.floor((window.innerHeight * 0.7) / gridSize);  // 确保高度也能被格子大小整除
    } else {
        // PC端横屏布局
        const maxWidth = Math.min(window.innerWidth * 0.6, 1200);
        gridSize = Math.max(Math.floor(maxWidth / 20), minGridSize);  // 确保不小于最小尺寸
        canvas.width = gridSize * Math.floor(maxWidth / gridSize);    // 确保宽度能被格子大小整除
        canvas.height = gridSize * Math.floor(Math.min(window.innerHeight * 0.8, 800) / gridSize);  // 确保高度能被格子大小整除
    }

    cols = Math.floor(canvas.width / gridSize);
    rows = Math.floor(canvas.height / gridSize);
}

const snakeBodyColor = "#FFFFFF"; // 白色方块
const snakeGradientColor = "#AF474C"; // 渐变主色
const foodColor = "#FFFFFF"; // 食物颜色
const eyeColor = "#000000"; // 眼睛颜色
const tongueColor = "#FFFFFF"; // 舌头颜色

let isPaused = false;    // 游戏是否暂停

// 添加防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 修改食物位置计算函数
function getRandomFoodPosition() {
  return {
    x: Math.floor(Math.random() * cols) * gridSize,
    y: Math.floor(Math.random() * rows) * gridSize
  };
}

// 重置游戏状态
function resetGame() {
  const startX = Math.floor(cols / 2) * gridSize;
  const startY = Math.floor(rows / 2) * gridSize;
  
  snake = [
    { x: startX, y: startY },
    { x: startX - gridSize, y: startY },
    { x: startX - gridSize * 2, y: startY }
  ];
  
  direction = "right";
  food = getRandomFoodPosition();
}

// 开始游戏
function startGame() {
    if (gameInterval) return; // 如果游戏已经在运行，直接返回
    
    gameInterval = setInterval(updateGame, 400); // 改回原来的速度
    isPaused = false;
    
    // 更新按钮状态
    document.getElementById("startButton").disabled = true;
    document.getElementById("pauseButton").disabled = false;
}

// 暂停游戏
function pauseGame() {
    if (!gameInterval) return; // 如果游戏未在运行，直接返回
    
    clearInterval(gameInterval);
    gameInterval = null;
    isPaused = true;
    
    // 更新按钮状态
    document.getElementById("startButton").disabled = false;
    document.getElementById("pauseButton").disabled = true;
}

// 切换游戏状态
function toggleGame() {
    if (gameInterval) {
        pauseGame();
    } else {
        startGame();
    }
}

// 重置游戏状态
function resetGameState() {
    // 停止当前游戏循环
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    // 重置游戏状态
    resetGame();
    drawGame();
    
    // 重置按钮状态
    document.getElementById("startButton").disabled = false;
    document.getElementById("pauseButton").disabled = true;
    isPaused = false;
}

// 修改按钮事件绑定
window.addEventListener("DOMContentLoaded", () => {
    initGame();
    drawGame();  // 只绘制初始状态，不启动游戏
    
    // 绑定按钮事件
    document.getElementById("startButton").addEventListener("click", startGame);
    document.getElementById("pauseButton").addEventListener("click", pauseGame);
    document.getElementById("resetButton").addEventListener("click", resetGameState);
    document.getElementById("saveButton").addEventListener("click", saveCanvas);  // 添加保存按钮事件

    // 初始状态：开始按钮可用，暂停按钮禁用
    document.getElementById("startButton").disabled = false;
    document.getElementById("pauseButton").disabled = true;
});

// 修改键盘事件监听，确保回车键和方向键的处理都在同一个监听器中
document.addEventListener("keydown", (e) => {
    // 回车键控制
    if (e.key === "Enter") {
        e.preventDefault();
        toggleGame();
        return;
    }
    
    // 方向键控制
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        
        if (!gameInterval) {
            startGame();
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
    }
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

// 添加触摸事件处理
let touchStartX = null;
let touchStartY = null;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;

    // 确定滑动方向（需要有最小滑动距离，避免误触）
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && direction !== "left") {
                direction = "right";
            } else if (deltaX < 0 && direction !== "right") {
                direction = "left";
            }
        }
    } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && direction !== "up") {
                direction = "down";
            } else if (deltaY < 0 && direction !== "down") {
                direction = "up";
            }
        }
    }

    // 如果游戏还没开始，开始游戏
    if (!gameInterval) {
        startGame();
    }

    // 重置触摸起始点
    touchStartX = null;
    touchStartY = null;
});

// 阻止默认的触摸行为（如页面滚动）
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

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

// 开始绘制游戏
drawGame();

// 修改保存画布功能
function saveCanvas() {
    // 暂停游戏
    const wasRunning = !!gameInterval;
    if (wasRunning) {
        pauseGame();
    }
    
    // 创建临时画布（包含边框空间）
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const borderWidth = 20; // 边框宽度
    
    // 设置临时画布尺寸（加上边框宽度）
    tempCanvas.width = canvas.width + (borderWidth * 2);
    tempCanvas.height = canvas.height + (borderWidth * 2);
    
    // 绘制边框
    tempCtx.strokeStyle = 'white'; // 边框颜色=白色
    tempCtx.lineWidth = borderWidth;
    tempCtx.strokeRect(
        borderWidth / 2,
        borderWidth / 2,
        tempCanvas.width - borderWidth,
        tempCanvas.height - borderWidth
    );
    
    // 将原画布内容绘制到临时画布（考虑边框偏移）
    tempCtx.drawImage(canvas, borderWidth, borderWidth);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = '0102Design祝您蛇年大吉贪吃不怕-专属贺卡.png';
    link.href = tempCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 如果游戏之前在运行，则恢复
    if (wasRunning) {
        startGame();
    }
}




