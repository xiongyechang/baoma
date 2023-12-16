<template>
  <top-bar></top-bar>
  <main>
    <router-view v-slot="{ Component }">
      <keep-alive include="web">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <router-view name="blank" />
  </main>
  <bottom-bar></bottom-bar>
</template>

<style>
main {
  height: 100%;
  overflow: hidden;
}
</style>
