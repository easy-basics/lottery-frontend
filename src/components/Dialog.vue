<template>
  <el-dialog class="dialog-wrap" :title="title" :model-value="dialogVisible" :width="width" align-center>
    <slot></slot>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emits('update:dialogVisible', false)" v-if="isCancel">{{ cancelText }}</el-button>
        <el-button type="primary" @click="emits('confirm')">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { isCollapsible } from 'element-plus/es/components/splitter/src/hooks/usePanel.mjs';
import { ref } from 'vue'
const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Warning'
  },
  width: {
    type: String,
    default: '600px'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  isCancel: {
    type: Boolean,
    default: true
  },
})

const emits = defineEmits(['update:dialogVisible', 'confirm'])
</script>

<style scoped lang="scss">
  .dialog-wrap{
    &:deep(.ep-dialog){
      padding: 0px !important;
      .ep-dialog__header{
        padding: 20px 30px;
      }
    }
  }



  .dialog-footer{
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0px;
    border-top: 1px solid var(--ep-border-color);
  }

</style>