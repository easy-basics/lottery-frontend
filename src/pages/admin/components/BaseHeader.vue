<script lang="ts" setup>

import { toggleDark } from '@/composables'
</script>

<template>
  <div class="header-wrap">
    <div class="head-title">Lottery Admin</div>
    <!-- <el-dropdown :show-timeout="0" :hide-timeout="0">
      <img src="https://internal-api-lark-file.rwork.crc.com.cn/static-resource/v1/v3_00o1_2982eee3-3d63-4389-b4ff-742b669b390p~?image_size=640x640&cut_type=&quality=&format=image&sticker_format=.webp" alt="" class="avatar-style" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown> -->
    
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
