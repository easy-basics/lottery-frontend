<template>
  <div class="lottery-stage" ref="container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps({
  // 参与者总列表: Array<{ name: string, id: string }>
  participants: {
    type: Array,
    default: () => []
  },
  // 需要抽取的获奖人数
  winnerCount: {
    type: Number,
    default: 1
  },
  // 基础主题色
  themeColor: {
    type: String,
    default: '#FF8C00'
  }
});

const emit = defineEmits(['finished']);

const container = ref(null);
const canvasRef = ref(null);
let ctx = null;
let animationId = null;
let slots = [];
let isRunning = false;
let isStopping = false;

// 1. 槽位类：管理单个奖窗的状态
class Slot {
  constructor(x, y, w, h) {
    this.updateRect(x, y, w, h);
    this.currentUser = { name: '等待开奖', id: '****' };
    this.targetUser = null;
    this.state = 'idle'; // idle | rolling | stopping | locked
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
    const padding = 8; // 稍微减小边距，给文字留出更多空间

    // 1. 绘制卡片背景和边框
    ctx.save();
    ctx.shadowBlur = this.state === 'locked' ? 15 : 0; // 仅中奖后开启外发光，减少平时性能开销
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

    // 2. 绘制文字内容
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // --- 关键调整区 ---

    // 姓名：比例从 0.25 降至 0.15，位置微调
    const nameSize = Math.floor(h * 0.15);
    ctx.font = `bold ${nameSize}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = this.state === 'locked' ? themeColor : '#FFFFFF';
    // 名字放在格子上部 42% 的位置
    ctx.fillText(this.currentUser.name, x + w / 2, y + h * 0.42);

    // 工号：比例从 0.15 降至 0.11，颜色稍微减淡
    const idSize = Math.floor(h * 0.08);
    ctx.font = `${idSize}px "Consolas", "Monaco", monospace`;
    ctx.fillStyle = this.state === 'locked' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)';
    // 工号放在下部 62% 的位置，保持与名字的间距
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

// 2. 初始化布局：根据中奖人数自动计算行列
// 修改 CanvasLottery.vue 中的 initLayout 方法
const initLayout = () => {
  if (!canvasRef.value || !container.value) return;
  const rect = container.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // 1. 同步物理像素，防止 4K 模糊
  canvasRef.value.width = rect.width * dpr;
  canvasRef.value.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  // 2. 动态布局算法：根据当前容器的宽高比，计算最整齐的网格
  const count = props.winnerCount;
  const containerRatio = rect.width / rect.height;

  // 核心公式：寻找最接近容器比例的行列组合
  let cols = Math.ceil(Math.sqrt(count * containerRatio));
  let rows = Math.ceil(count / cols);

  // 二次校验：如果行数过多导致超出高度，则减少列数增加行数
  const slotW = rect.width / cols;
  const slotH = rect.height / rows;

  slots = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;

    // 居中偏移量计算：如果最后一行不满，让它居中显示
    const currentRowCount = (r === rows - 1) ? (count % cols || cols) : cols;
    const offsetX = (rect.width - currentRowCount * slotW) / 2;

    slots.push(new Slot(c * slotW + offsetX, r * slotH, slotW, slotH));
  }
};

const render = (now) => {
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  let allLocked = true;

  slots.forEach(s => {
    s.update(now, props.participants);
    s.draw(ctx, props.themeColor);
    if (s.state !== 'locked') allLocked = false;
  });

  if (isStopping && allLocked) {
    isRunning = false;
    isStopping = false;
    emit('finished', slots.map(s => s.targetUser));
    return;
  }
  animationId = requestAnimationFrame(render);
};

// 3. 对外暴露的方法
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

  // 核心逻辑：完全随机抽取
  const winners = [...props.participants]
    .sort(() => Math.random() - 0.5)
    .slice(0, props.winnerCount);

  const now = performance.now();
  slots.forEach((s, i) => {
    s.targetUser = winners[i];
    s.state = 'stopping';
    s.stopStartTime = now;
    s.stopDelay = i * 150 + Math.random() * 200; // 阶梯式停止
  });
};

defineExpose({ start, stop });

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