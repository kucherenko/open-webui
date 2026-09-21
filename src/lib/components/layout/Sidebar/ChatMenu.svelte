<script lang="ts">
	import { getContext, tick } from 'svelte';

	import fileSaver from 'file-saver';
	const { saveAs } = fileSaver;

	import Dropdown from '$lib/components/common/Dropdown.svelte';
	import DropdownMenu from '$lib/components/common/DropdownMenu.svelte';
	import DropdownSub from '$lib/components/common/DropdownSub.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Tags from '$lib/components/chat/Tags.svelte';
	import {
		getChatById,
		getChatPinnedStatusById,
		toggleChatPinnedStatusById
	} from '$lib/apis/chats';
	import { chats, folders, settings, theme, user } from '$lib/stores';
	import { getChatAsText, saveElementAsPdf, saveTextAsPdf } from '$lib/utils/chatExport';
	import { downloadChatAsPDF } from '$lib/apis/utils';
	import ArchiveBoxIcon from '$lib/components/icons/ArchiveBox.svelte';
	import CopyIcon from './icons/Copy.svelte';
	import DownloadIcon from './icons/Download.svelte';
	import EditPencilIcon from './icons/EditPencil.svelte';
	import FolderIcon from './icons/Folder.svelte';
	import Messages from '$lib/components/chat/Messages.svelte';
	import PinIcon from './icons/Pin.svelte';
	import PinSlashIcon from './icons/PinSlash.svelte';
	import ShareIcon from './icons/Share.svelte';
	import TrashIcon from './icons/Trash.svelte';
	import ChatCheckIcon from '$lib/components/icons/ChatCheck.svelte';

	const i18n = getContext('i18n');

	export let shareHandler: Function;
	export let moveChatHandler: Function;

	export let cloneChatHandler: Function;
	export let archiveChatHandler: Function;
	export let renameHandler: Function;
	export let deleteHandler: Function;
	export let onOpen: () => void = () => {};
	export let onClose: Function;
	export let markUnreadHandler: Function = () => {};

	export let chatId = '';

	let dropdown: Dropdown;
	let show = false;
	let pinned = false;

	let chat = null;
	let showFullMessages = false;

	export let onPinChange: () => void = () => {};

	const pinHandler = async () => {
		await toggleChatPinnedStatusById(localStorage.token, chatId);
		onPinChange();
	};

	const checkPinned = async () => {
		pinned = await getChatPinnedStatusById(localStorage.token, chatId);
	};

	const downloadTxt = async () => {
		const chat = await getChatById(localStorage.token, chatId);
		if (!chat) {
			return;
		}

		const chatText = await getChatAsText(chat);
		let blob = new Blob([chatText], {
			type: 'text/plain'
		});

		saveAs(blob, `chat-${chat.chat.title}.txt`);
	};

	const downloadPdf = async () => {
		chat = await getChatById(localStorage.token, chatId);
		if (!chat) {
			return;
		}

		if ($settings?.stylizedPdfExport ?? true) {
			showFullMessages = true;
			await tick();

			const containerElement = document.getElementById('full-messages-container');
			if (containerElement) {
				try {
					await saveElementAsPdf(containerElement, `chat-${chat.chat.title}.pdf`);

					showFullMessages = false;
				} catch (error) {
					console.error('Error generating PDF', error);
				}
			}
		} else {
			console.log('Downloading PDF');

			await saveTextAsPdf(getChatAsText(chat), `chat-${chat.chat.title}.pdf`);
		}
	};

	const downloadJSONExport = async () => {
		const chat = await getChatById(localStorage.token, chatId);

		if (chat) {
			let blob = new Blob([JSON.stringify([chat])], {
				type: 'application/json'
			});
			saveAs(blob, `chat-export-${Date.now()}.json`);
		}
	};

	$: if (show) {
		checkPinned();
	}
</script>

{#if chat && showFullMessages}
	<div class="hidden w-full h-full flex-col">
		<div id="full-messages-container">
			<Messages
				className="h-full flex pt-4 pb-8 w-full"
				chatId={`chat-preview-${chat?.id ?? ''}`}
				user={$user}
				readOnly={true}
				history={chat.chat.history}
				messages={chat.chat.messages}
				autoScroll={true}
				sendMessage={() => {}}
				continueResponse={() => {}}
				regenerateResponse={() => {}}
				messagesCount={null}
				editCodeBlock={false}
			/>
		</div>
	</div>
{/if}

<Dropdown
	bind:this={dropdown}
	bind:show
	onOpenChange={(state) => {
		if (state) {
			onOpen();
		} else {
			onClose();
		}
	}}
>
	<Tooltip content={$i18n.t('More')}>
		<slot />
	</Tooltip>

	<div slot="content">
		<DropdownMenu className="select-none min-w-[12.5rem] transition">
			{#if $user?.role === 'admin' || ($user.permissions?.chat?.share ?? true)}
				<button
					draggable="false"
					class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
					on:click={() => {
						shareHandler();
					}}
				>
					<ShareIcon className="size-3.5" strokeWidth="1.5" />
					<div class="flex items-center">{$i18n.t('Share')}</div>
				</button>
			{/if}

			{#if $user?.role === 'admin' || ($user.permissions?.chat?.export ?? true)}
				<DropdownSub contentClass="select-none z-50">
					<button
						slot="trigger"
						draggable="false"
						class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
					>
						<DownloadIcon className="size-3.5" strokeWidth="1.5" />
						<div class="flex items-center">{$i18n.t('Download')}</div>
					</button>

					<button
						draggable="false"
						class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
						on:click={() => {
							downloadJSONExport();
						}}
					>
						<div class="flex items-center line-clamp-1">{$i18n.t('Export chat (.json)')}</div>
					</button>

					<button
						draggable="false"
						class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
						on:click={() => {
							downloadTxt();
						}}
					>
						<div class="flex items-center line-clamp-1">{$i18n.t('Plain text (.txt)')}</div>
					</button>

					<button
						draggable="false"
						class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 select-none w-full"
						on:click={() => {
							downloadPdf();
						}}
					>
						<div class="flex items-center line-clamp-1">{$i18n.t('PDF document (.pdf)')}</div>
					</button>
				</DropdownSub>
			{/if}

			<button
				draggable="false"
				class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
				on:click={() => {
					dropdown.close();
					renameHandler();
				}}
			>
				<EditPencilIcon className="size-3.5" strokeWidth="1.5" />
				<div class="flex items-center">{$i18n.t('Rename')}</div>
			</button>

			<button
				draggable="false"
				class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
				on:click={() => {
					dropdown.close();
					markUnreadHandler();
				}}
			>
				<ChatCheckIcon className="size-3.5" strokeWidth="1.5" />
				<div class="flex items-center">{$i18n.t('Mark as unread')}</div>
			</button>

			<hr class="border-gray-50/30 dark:border-gray-800/30 mx-1 my-0.5" />

			<button
				draggable="false"
				class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
				on:click={() => {
					dropdown.close();
					pinHandler();
				}}
			>
				{#if pinned}
					<PinSlashIcon className="size-3.5" strokeWidth="1.5" />
					<div class="flex items-center">{$i18n.t('Unpin')}</div>
				{:else}
					<PinIcon className="size-3.5" strokeWidth="1.5" />
					<div class="flex items-center">{$i18n.t('Pin')}</div>
				{/if}
			</button>

			{#if $user?.role === 'admin' || ($user?.permissions?.chat?.import ?? true)}
				<button
					draggable="false"
					class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
					on:click={() => {
						dropdown.close();
						cloneChatHandler();
					}}
				>
					<CopyIcon className="size-3.5" strokeWidth="1.5" />
					<div class="flex items-center">{$i18n.t('Clone')}</div>
				</button>
			{/if}

			{#if chatId && $folders.length > 0}
				<DropdownSub contentClass="select-none z-50 max-h-52 overflow-y-auto scrollbar-hidden">
					<button
						slot="trigger"
						draggable="false"
						class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 select-none w-full"
					>
						<FolderIcon className="size-3.5" />
						<div class="flex items-center">{$i18n.t('Move')}</div>
					</button>

					{#each $folders.sort((a, b) => b.updated_at - a.updated_at) as folder}
						<button
							draggable="false"
							class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 overflow-hidden w-full"
							on:click={() => {
								moveChatHandler(chatId, folder.id);
							}}
						>
							<div class="shrink-0">
								<FolderIcon className="size-3.5" />
							</div>

							<div class="truncate">{folder?.name ?? 'Folder'}</div>
						</button>
					{/each}
				</DropdownSub>
			{/if}

			<button
				draggable="false"
				class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
				on:click={() => {
					archiveChatHandler();
				}}
			>
				<ArchiveBoxIcon className="size-3.5" strokeWidth="1.7" />
				<div class="flex items-center">{$i18n.t('Archive')}</div>
			</button>

			{#if $user?.role === 'admin' || ($user?.permissions?.chat?.delete ?? true)}
				<button
					draggable="false"
					class="flex h-[1.6875rem] gap-2 items-center rounded-xl px-2 text-[0.8125rem] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 w-full"
					on:click={() => {
						deleteHandler();
					}}
				>
					<TrashIcon className="size-3.5" strokeWidth="1.5" />
					<div class="flex items-center">{$i18n.t('Delete')}</div>
				</button>
			{/if}
		</DropdownMenu>
	</div>
</Dropdown>
