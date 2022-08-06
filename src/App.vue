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

<script>
	import TopBar from "@/components/topbar.vue";
	import BottomBar from "@/components/bottombar.vue";
	export default {
		name: "App",
		components: {
			TopBar,
			BottomBar,
		},
	};
</script>

<style>
	main {
		height: 100%;
		overflow: hidden;
	}
</style>
