<template>
  <div class="lottery-stage" ref="container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineExpose, nextTick } from 'vue';

const props = defineProps({
  participants: { type: Array, default: () => [] },
  winnerCount: { type: Number, default: 1 },
  themeColor: { type: String, default: '#FF8C00' },
  // 新增功能 1 & 2 的 Props
  mainTitle: { type: String, default: '' },
  subTitle: { type: String, default: '' },
  initialWinners: { type: Array, default: () => [] } // 用于回显中奖名单
});

const emit = defineEmits(['finished']);

const container = ref(null);
const canvasRef = ref(null);
let ctx = null;
let animationId = null;
let slots = [];
let isRunning = false;
let isStopping = false;

// 预留顶部标题高度比例
const HEADER_HEIGHT_RATIO = 0.15;

class Slot {
  constructor(x, y, w, h, user = null) {
    this.updateRect(x, y, w, h);
    this.currentUser = user || { name: '等待开奖', ldap: '****' };
    this.targetUser = null;
    this.state = user ? 'locked' : 'idle'; // 如果初始化有用户，直接锁定
    this.speed = 20;
    this.lastUpdate = 0;
    this.stopDelay = 0;
    this.stopStartTime = 0;
  }

  updateRect(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
  }

  update(now, pool) {
    if (this.state === 'rolling') {
      if (now - this.lastUpdate > 1000 / this.speed) {
        this.currentUser = pool[Math.floor(Math.random() * pool.length)];
        this.lastUpdate = now;
      }
    } else if (this.state === 'stopping') {
      if (now < this.stopStartTime + this.stopDelay) return;
      this.speed *= 0.95;
      if (this.speed < 2) {
        this.currentUser = this.targetUser;
        this.state = 'locked';
      } else if (now - this.lastUpdate > 1000 / this.speed) {
        this.currentUser = pool[Math.floor(Math.random() * pool.length)];
        this.lastUpdate = now;
      }
    }
  }

  draw(ctx, themeColor) {
    const { x, y, w, h } = this;
    const padding = 8;

    ctx.save();
    ctx.shadowBlur = this.state === 'locked' ? 15 : 0;
    ctx.shadowColor = themeColor;

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, 'rgba(40, 40, 40, 0.85)');
    grad.addColorStop(1, 'rgba(15, 15, 15, 0.95)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = this.state === 'locked' ? themeColor : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = this.state === 'locked' ? 2 : 1;

    this.roundRect(ctx, x + padding, y + padding, w - padding * 2, h - padding * 2, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const nameSize = Math.floor(h * 0.15);
    ctx.font = `bold ${nameSize}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = this.state === 'locked' ? themeColor : '#FFFFFF';
    ctx.fillText(this.currentUser.name, x + w / 2, y + h * 0.42);

    const idSize = Math.floor(h * 0.08);
    ctx.font = `${idSize}px "Consolas", monospace`;
    ctx.fillStyle = this.state === 'locked' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)';
    ctx.fillText(`${this.currentUser.ldap || '***'}`, x + w / 2, y + h * 0.62);

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
}

// 绘制主副标题
const drawHeader = (rect) => {
  if (!props.mainTitle && !props.subTitle) return;

  ctx.save();
  ctx.textAlign = 'center';

  // 主标题
  const mainFontSize = Math.min(rect.width * 0.04, 40);
  ctx.font = `bold ${mainFontSize}px "Microsoft YaHei"`;
  ctx.fillStyle = props.themeColor;
  ctx.fillText(props.mainTitle, rect.width / 2, rect.height * 0.06);

  // 副标题
  const subFontSize = mainFontSize * 0.6;
  ctx.font = `${subFontSize}px "Microsoft YaHei"`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(props.subTitle, rect.width / 2, rect.height * 0.11);

  ctx.restore();
};

const initLayout = () => {
  if (!canvasRef.value || !container.value) return;
  const rect = container.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvasRef.value.width = rect.width * dpr;
  canvasRef.value.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const count = props.winnerCount;
  // 核心修改：减去标题占用的高度
  const availableHeight = rect.height * (1 - HEADER_HEIGHT_RATIO);
  const startY = rect.height * HEADER_HEIGHT_RATIO;

  const containerRatio = rect.width / availableHeight;
  let cols = Math.ceil(Math.sqrt(count * containerRatio));
  let rows = Math.ceil(count / cols);

  const slotW = rect.width / cols;
  const slotH = availableHeight / rows;

  slots = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const currentRowCount = (r === rows - 1) ? (count % cols || cols) : cols;
    const offsetX = (rect.width - currentRowCount * slotW) / 2;

    // 回显逻辑：如果 initialWinners 存在对应索引的数据，直接传入
    const echoUser = props.initialWinners[i] || null;
    slots.push(new Slot(c * slotW + offsetX, r * slotH + startY, slotW, slotH, echoUser));
  }
};

// const render = (now) => {
//   const rect = container.value.getBoundingClientRect();
//   ctx.clearRect(0, 0, rect.width, rect.height);

//   drawHeader(rect);

//   let allLocked = true;
//   slots.forEach(s => {
//     s.update(now, props.participants);
//     s.draw(ctx, props.themeColor);
//     if (s.state !== 'locked') allLocked = false;
//   });

//   if (isStopping && allLocked) {
//     isRunning = false;
//     isStopping = false;
//     emit('finished', slots.map(s => s.targetUser));
//   }
//   animationId = requestAnimationFrame(render);
// };

const render = (now) => {
  if (!canvasRef.value || !container.value) return;

  const rect = container.value.getBoundingClientRect();
  const canvas = canvasRef.value;

  // 1. 绘制底色背景（核心修改点）
  // 注意：我们需要先重置一下变换，确保填充的是整个物理像素区域，然后再恢复
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置缩放/位移
  ctx.fillStyle = '#000000';         // 设置背景颜色
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // 2. 绘制标题
  drawHeader(rect);

  // 3. 绘制槽位
  let allLocked = true;
  slots.forEach(s => {
    s.update(now, props.participants);
    s.draw(ctx, props.themeColor);
    if (s.state !== 'locked') allLocked = false;
  });

  // 4. 状态判断
  if (isStopping && allLocked) {
    isRunning = false;
    isStopping = false;
    emit('finished', slots.map(s => s.targetUser));
  }

  animationId = requestAnimationFrame(render);
};

const start = () => {
  if (isRunning) return;
  isRunning = true;
  isStopping = false;
  slots.forEach(s => {
    s.state = 'rolling';
    s.speed = 20 + Math.random() * 10;
  });
};

const stop = () => {
  if (!isRunning || isStopping) return;
  isStopping = true;
  const winners = [...props.participants]
    .sort(() => Math.random() - 0.5)
    .slice(0, props.winnerCount);

  const now = performance.now();
  slots.forEach((s, i) => {
    s.targetUser = winners[i];
    s.state = 'stopping';
    s.stopStartTime = now;
    s.stopDelay = i * 150 + Math.random() * 200;
  });
};

// 新增功能 3：导出图片方法
const exportImage = () => {
  if (!canvasRef.value) return null;
  // 如果需要包含背景色，可以在导出前临时绘制一个底层背景
  return canvasRef.value.toDataURL('image/png');
};

defineExpose({ start, stop, exportImage });

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  initLayout();
  render(0);
  window.addEventListener('resize', initLayout);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', initLayout);
  cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.lottery-stage {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>