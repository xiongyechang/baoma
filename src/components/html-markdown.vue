<template>
	<vue3-markdown-it class="markdown" :source="markdown" :plugins="plugins" />
</template>

<script>
	import { reactive, toRefs } from "vue";
	import markdownItMultimdTable from "markdown-it-multimd-table";
	import markdownItAbbr from "markdown-it-abbr";
	import markdownItAnchor from "markdown-it-anchor";
	import markdownItDeflist from "markdown-it-deflist";
	import markdownItEmoji from "markdown-it-emoji";
	import markdownItFootnote from "markdown-it-footnote";
	import markdownItHighlightjs from "markdown-it-highlightjs";
	import markdownItIns from "markdown-it-ins";
	import markdownItMark from "markdown-it-mark";
	import markdownItSub from "markdown-it-sub";
	import markdownItSup from "markdown-it-sup";
	import markdownItTaskLists from "markdown-it-task-lists";
	import markdownItTocDoneRight from "markdown-it-toc-done-right";

	export default {
		name: "html-markdown",
		props: {
			markdown: String,
		},
		setup(props, context) {
			const store = reactive({
				plugins: [
					{
						plugin: markdownItMultimdTable,
					},
					{
						plugin: markdownItAbbr,
					},
					{
						plugin: markdownItAnchor,
					},
					{
						plugin: markdownItDeflist,
					},
					{
						plugin: markdownItEmoji,
					},
					{
						plugin: markdownItFootnote,
					},
					{
						plugin: markdownItHighlightjs,
					},
					{
						plugin: markdownItIns,
					},
					{
						plugin: markdownItMark,
					},
					{
						plugin: markdownItSub,
					},
					{
						plugin: markdownItSup,
					},
					{
						plugin: markdownItTaskLists,
					},
					{
						plugin: markdownItTocDoneRight,
					},
				],
			});

			return {
				...toRefs(store),
			};
		},
	};
</script>

<style lang="scss">
	@import url("https://fonts.googleapis.com/css2?family=Fruktur&family=Roboto+Mono&display=swap");
	.markdown {
		word-break: break-all;
		line-height: 2rem;
		font-size: 16px;
		text-align: left;
		font-family: "Roboto Mono", monospace;
		padding-right: 10px;

		hr {
			margin: 10px 0;
		}

		h1 {
			height: 50px;
			line-height: 50px;
			position: sticky;
			top: 0;
			right: 0;
			left: 0;
			padding-top: 10px;
			background-color: white;
			z-index: 9999;
			margin-bottom: 8px;
		}

		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			color: red;
		}

		img {
			max-width: 100%;
		}

		pre {
			margin-bottom: 10px;
		}

		pre > code {
			border-radius: 5px;
		}

		p {
			line-height: 1.6rem;
			& > img {
				width: 100%;
			}
		}
	}
</style>