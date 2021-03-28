<template>
    <top-bar></top-bar>
    <router-view class="app-router-view"></router-view>
    <router-view class="app-router-view" name="blank"></router-view>
    <bottom-bar></bottom-bar>
</template>

<script>
import TopBar from '@/components/topbar.vue';
import BottomBar from '@/components/bottombar.vue';
export default {
  name: 'App',
  components: {
    TopBar,
    BottomBar
  }
}
</script>

<style>
</style>
