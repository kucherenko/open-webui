import { createMessagesList } from '$lib/utils';
import { getOutputText } from '$lib/components/chat/Messages/structuredOutput';

export const getChatAsText = (chat: any) => {
	const history = chat.chat.history;
	const messages = createMessagesList(history, history.currentId);
	const chatText = messages.reduce((a, message) => {
		const content = getOutputText(message.output) || message.content || '';
		return `${a}### ${message.role.toUpperCase()}\n${content}\n\n`;
	}, '');

	return chatText.trim();
};

/** Renders `element` off-screen with html2canvas and saves it as a paginated A4 PDF. */
export const saveElementAsPdf = async (element: HTMLElement, filename: string) => {
	const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
		import('jspdf'),
		import('html2canvas-pro')
	]);

	const isDarkMode = document.documentElement.classList.contains('dark');
	const virtualWidth = 800; // px, fixed width for cloned element

	// Clone and style
	const clonedElement = element.cloneNode(true) as HTMLElement;
	clonedElement.classList.add('text-black');
	clonedElement.classList.add('dark:text-white');
	clonedElement.style.width = `${virtualWidth}px`;
	clonedElement.style.position = 'absolute';
	clonedElement.style.left = '-9999px';
	clonedElement.style.height = 'auto';
	document.body.appendChild(clonedElement);

	// Override content-visibility so html2canvas can capture all messages
	clonedElement.querySelectorAll<HTMLElement>('.message-listitem').forEach((el) => {
		el.style.contentVisibility = 'visible';
	});

	// Let the browser compute layout for the cloned element
	await new Promise((r) => requestAnimationFrame(r));

	// Render entire content once
	const canvas = await html2canvas(clonedElement, {
		backgroundColor: isDarkMode ? '#000' : '#fff',
		useCORS: true,
		scale: 2, // increase resolution
		width: virtualWidth
	});

	document.body.removeChild(clonedElement);

	const pdf = new jsPDF('p', 'mm', 'a4');
	const pageWidthMM = 210;
	const pageHeightMM = 297;

	// Convert page height in mm to px on canvas scale for cropping
	// Get canvas DPI scale:
	const pxPerMM = canvas.width / virtualWidth; // width in px / width in px?
	// Since 1 page width is 210 mm, but canvas width is 800 px at scale 2
	// Assume 1 mm = px / (pageWidthMM scaled)
	// Actually better: Calculate scale factor from px/mm:
	// virtualWidth px corresponds directly to 210mm in PDF, so pxPerMM:
	const pxPerPDFMM = canvas.width / pageWidthMM; // canvas px per PDF mm

	// Height in px for one page slice:
	const pagePixelHeight = Math.floor(pxPerPDFMM * pageHeightMM);

	let offsetY = 0;
	let page = 0;

	while (offsetY < canvas.height) {
		// Height of slice
		const sliceHeight = Math.min(pagePixelHeight, canvas.height - offsetY);

		// Create temp canvas for slice
		const pageCanvas = document.createElement('canvas');
		pageCanvas.width = canvas.width;
		pageCanvas.height = sliceHeight;

		const ctx = pageCanvas.getContext('2d')!;

		// Draw the slice of original canvas onto pageCanvas
		ctx.drawImage(canvas, 0, offsetY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

		const imgData = pageCanvas.toDataURL('image/jpeg', 0.7);

		// Calculate image height in PDF units keeping aspect ratio
		const imgHeightMM = (sliceHeight * pageWidthMM) / canvas.width;

		if (page > 0) pdf.addPage();

		if (isDarkMode) {
			pdf.setFillColor(0, 0, 0);
			pdf.rect(0, 0, pageWidthMM, pageHeightMM, 'F'); // black bg
		}

		pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMM, imgHeightMM);

		offsetY += sliceHeight;
		page++;
	}

	pdf.save(filename);
};

/** Saves plain text as a PDF, wrapping lines and paginating. */
export const saveTextAsPdf = async (chatText: string, filename: string) => {
	const { default: jsPDF } = await import('jspdf');

	const doc = new jsPDF();

	// Margins
	const left = 15;
	const top = 20;
	const right = 15;
	const bottom = 20;

	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const usableWidth = pageWidth - left - right;
	const usableHeight = pageHeight - top - bottom;

	// Font size and line height
	const fontSize = 8;
	doc.setFontSize(fontSize);
	const lineHeight = fontSize * 1; // adjust if needed

	// Split the markdown into lines (handles \n)
	const paragraphs = chatText.split('\n');

	let y = top;

	for (let paragraph of paragraphs) {
		// Wrap each paragraph to fit the width
		const lines = doc.splitTextToSize(paragraph, usableWidth);

		for (let line of lines) {
			// If the line would overflow the bottom, add a new page
			if (y + lineHeight > pageHeight - bottom) {
				doc.addPage();
				y = top;
			}
			doc.text(line, left, y);
			y += lineHeight * 0.5;
		}
		// Add empty line at paragraph breaks
		y += lineHeight * 0.1;
	}

	doc.save(filename);
};
