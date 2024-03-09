使用絕對定位將多個 Canvas 元素重疊在同一個 DIV
父元素設定 position: relative; 
子元素設定 position: absolute;


<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Overlapping Canvases</title>
<style>
    .canvas-container {
    position: relative; /* 设置容器相对定位 */
    }

    .canvas {
    position: absolute; /* 设置 Canvas 绝对定位 */
    top: 0; /* 将 Canvas 定位到容器的左上角 */
    left: 0;
    }
</style>
</head>
<body>
<div class="canvas-container">
    <canvas class="canvas" width="200" height="200"></canvas>
    <canvas class="canvas" width="200" height="200"></canvas>
    <canvas class="canvas" width="200" height="200"></canvas>
</div>

<script>
    const canvases = document.querySelectorAll('.canvas');
    const ctxs = Array.from(canvases).map(canvas => canvas.getContext('2d'));

    // 在每个 Canvas 上绘制不同的内容
    ctxs.forEach((ctx, index) => {
    ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    ctx.fillRect(0, 0, 200, 200);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Canvas ${index + 1}`, 10, 30);
    });
</script>
</body>
</html>
