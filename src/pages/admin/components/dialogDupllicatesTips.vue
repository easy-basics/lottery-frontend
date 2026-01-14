<template>
  <div>
    <el-dialog v-model="dialogVisible" title="Warning" width="500" center>
      <span>
        存在重复用户，是否继续？
      </span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialogVisible = ref(false)
</script>
<style lang="sass" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>