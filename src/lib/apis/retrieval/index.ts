import { apiRequest } from '$lib/apis/request';
import { RETRIEVAL_API_BASE_URL } from '$lib/constants';

export const getRAGConfig = async (token: string) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/config`, { token });
};

type ChunkConfigForm = {
	chunk_size: number;
	chunk_overlap: number;
};

type DocumentIntelligenceConfigForm = {
	key: string;
	endpoint: string;
	model: string;
};

type ContentExtractConfigForm = {
	engine: string;
	tika_server_url: string | null;
	document_intelligence_config: DocumentIntelligenceConfigForm | null;
};

type YoutubeConfigForm = {
	language: string[];
	translation?: string | null;
	proxy_url: string;
};

type RAGConfigForm = {
	PDF_EXTRACT_IMAGES?: boolean;
	CONTENT_EXTRACTION_SUPPORTED_MEDIA_MIME_TYPES?: string[];
	ENABLE_GOOGLE_DRIVE_INTEGRATION?: boolean;
	ENABLE_ONEDRIVE_INTEGRATION?: boolean;
	EXTERNAL_DOCUMENT_LOADER_HEADERS?: Record<string, string>;
	TIKA_SERVER_VERSION?: string | null;
	chunk?: ChunkConfigForm;
	content_extraction?: ContentExtractConfigForm;
	web_loader_ssl_verification?: boolean;
	web?: Record<string, unknown>;
	youtube?: YoutubeConfigForm;
};

export const updateRAGConfig = async (token: string, payload: RAGConfigForm) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/config/update`, {
		method: 'POST',
		token,
		body: {
			...payload
		}
	});
};

export const getQuerySettings = async (token: string) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/query/settings`, { token });
};

type QuerySettings = {
	k: number | null;
	r: number | null;
	template: string | null;
};

export const updateQuerySettings = async (token: string, settings: QuerySettings) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/query/settings/update`, {
		method: 'POST',
		token,
		body: {
			...settings
		}
	});
};

export const getEmbeddingConfig = async (token: string) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/embedding`, { token });
};

type OpenAIConfigForm = {
	key: string;
	url: string;
};

type OllamaConfigForm = OpenAIConfigForm;

type AzureOpenAIConfigForm = {
	key: string;
	url: string;
	version: string;
};

type EmbeddingModelUpdateForm = {
	openai_config?: OpenAIConfigForm;
	ollama_config?: OllamaConfigForm;
	azure_openai_config?: AzureOpenAIConfigForm;
	RAG_EMBEDDING_ENGINE: string;
	RAG_EMBEDDING_MODEL: string;
	RAG_EMBEDDING_BATCH_SIZE?: number;
	ENABLE_ASYNC_EMBEDDING?: boolean;
	RAG_EMBEDDING_CONCURRENT_REQUESTS?: number;
};

export const updateEmbeddingConfig = async (token: string, payload: EmbeddingModelUpdateForm) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/embedding/update`, {
		method: 'POST',
		token,
		body: {
			...payload
		}
	});
};

export const getRerankingConfig = async (token: string) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/reranking`, { token });
};

type RerankingModelUpdateForm = {
	reranking_model: string;
};

export const updateRerankingConfig = async (token: string, payload: RerankingModelUpdateForm) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/reranking/update`, {
		method: 'POST',
		token,
		body: {
			...payload
		}
	});
};

export interface SearchDocument {
	status: boolean;
	collection_name: string;
	filenames: string[];
}

export const processYoutubeVideo = async (token: string, url: string) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/process/youtube`, {
		method: 'POST',
		token,
		body: {
			url: url
		}
	});
};

export const processUrl = async (
	token: string,
	url: string,
	collection_name: string | null = null,
	process: boolean = true
) => {
	const searchParams = new URLSearchParams();
	if (!process) {
		searchParams.append('process', 'false');
	}

	return apiRequest(`${RETRIEVAL_API_BASE_URL}/process/url?${searchParams.toString()}`, {
		method: 'POST',
		token,
		body: {
			url,
			collection_name
		}
	});
};

export const processWeb = async (
	token: string,
	collection_name: string,
	url: string,
	process: boolean = true
) => {
	const searchParams = new URLSearchParams();

	if (!process) {
		searchParams.append('process', 'false');
	}

	return apiRequest(`${RETRIEVAL_API_BASE_URL}/process/web?${searchParams.toString()}`, {
		method: 'POST',
		token,
		body: {
			url: url,
			collection_name: collection_name
		}
	});
};

export const processWebSearch = async (
	token: string,
	query: string,
	collection_name?: string
): Promise<SearchDocument | null> => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/process/web/search`, {
		method: 'POST',
		token,
		body: {
			query,
			collection_name: collection_name ?? ''
		}
	});
};

export const queryDoc = async (
	token: string,
	collection_name: string,
	query: string,
	k: number | null = null
) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/query/doc`, {
		method: 'POST',
		token,
		body: {
			collection_name: collection_name,
			query: query,
			k: k
		}
	});
};

export const queryCollection = async (
	token: string,
	collection_names: string,
	query: string,
	k: number | null = null
) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/query/collection`, {
		method: 'POST',
		token,
		body: {
			collection_names: collection_names,
			query: query,
			k: k
		}
	});
};

export const resetUploadDir = async (token: string) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/reset/uploads`, { method: 'POST', token });
};

export const resetVectorDB = async (token: string) => {
	return apiRequest(`${RETRIEVAL_API_BASE_URL}/reset/db`, { method: 'POST', token });
};
