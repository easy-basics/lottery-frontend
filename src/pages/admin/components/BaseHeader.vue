<script lang="ts" setup>

import { toggleDark } from '@/composables'
</script>

<template>
  <div class="header-wrap">
    <div class="head-title">Lottery Admin</div>
  </div>
</template>

<style lang="scss" scoped>
.header-wrap{
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--ep-border-color);
  padding: 0px 10px;
  .head-title{
    font-size: 26px;
    font-weight: bold;
    color: #232323;
    cursor: pointer;
  }
  .avatar-style{
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    margin: 0;
    padding: 0;
    border: none;
    &:hover{
      border: none;
    }
  }
}
</style>
