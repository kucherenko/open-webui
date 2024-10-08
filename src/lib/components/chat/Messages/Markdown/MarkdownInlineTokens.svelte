<script lang="ts">
	import DOMPurify from 'dompurify';
	import type { Token } from 'marked';
	import { revertSanitizedResponseContent, unescapeHtml } from '$lib/utils';
	import { onMount } from 'svelte';
	import Image from '$lib/components/common/Image.svelte';

	import KatexRenderer from './KatexRenderer.svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';

	export let id: string;
	export let tokens: Token[];
</script>

{#each tokens as token}
	{#if token.type === 'escape'}
		{unescapeHtml(token.text)}
	{:else if token.type === 'html'}
		{@const html = DOMPurify.sanitize(token.text)}
		{#if html && html.includes('<video')}
			{@html html}
		{:else if token.text.includes(`<iframe src="${WEBUI_BASE_URL}/api/v1/files/`)}
			{@html `${token.text}`}
		{:else}
			{token.text}
		{/if}
	{:else if token.type === 'link'}
		<a href={token.href} target="_blank" rel="nofollow" title={token.title}>{token.text}</a>
	{:else if token.type === 'image'}
		<Image src={token.href} alt={token.text} />
	{:else if token.type === 'strong'}
		<strong>
			<svelte:self id={`${id}-strong`} tokens={token.tokens} />
		</strong>
	{:else if token.type === 'em'}
		<em>
			<svelte:self id={`${id}-em`} tokens={token.tokens} />
		</em>
	{:else if token.type === 'codespan'}
		<code class="codespan">{unescapeHtml(token.text)}</code>
	{:else if token.type === 'br'}
		<br />
	{:else if token.type === 'del'}
		<del>
			<svelte:self id={`${id}-del`} tokens={token.tokens} />
		</del>
	{:else if token.type === 'inlineKatex'}
		{#if token.text}
			<KatexRenderer content={revertSanitizedResponseContent(token.text)} displayMode={false} />
		{/if}
	{:else if token.type === 'iframe'}
		<iframe
			src="{WEBUI_BASE_URL}/api/v1/files/{token.fileId}/content"
			title={token.fileId}
			width="100%"
			frameborder="0"
			onload="this.style.height=(this.contentWindow.document.body.scrollHeight+20)+'px';"
		></iframe>
	{:else if token.type === 'text'}
		{token.raw}
	{/if}
{/each}
