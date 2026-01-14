<script setup lang="ts">
  import BaseHeader from './BaseHeader.vue'
  import BaseSide from './BaseSide.vue'
</script>
<template>
  <!-- <div class="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50"> -->
    <BaseHeader />
    <div class="main-container flex">
      <BaseSide />
      <div class="admin-content">
        <RouterView />
      </div>
    </div>
  <!-- </div> -->
</template>
<style lang="scss" scoped>
  .admin-content {
    flex: 1;
    padding: 20px;
    background-color: #fff;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    overflow: auto;
    // background-color: rgba(0, 0, 0, 0);
  }

</style>

