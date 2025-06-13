const fileInput = document.getElementById('fileInput');
const fileContent = document.getElementById('fileContent');
const wordInfo = document.getElementById('wordInfo');
let highlightedSpan = null;

// --- WebSocket Setup ---
let socket = null;

function connectWebSocket() {
    socket = new WebSocket('ws://localhost:9001');

    socket.onopen = function(event) {
        console.log('WebSocket connection established.');
        // Optionally, inform the user or change UI element status
        // wordInfo.textContent = 'Connected to server.';
    };

    socket.onmessage = function(event) {
        // For this task, the server isn't expected to send messages back other than for debug
        console.log('Message from server:', event.data);
    };

    socket.onerror = function(event) {
        console.error('WebSocket error:', event);
        wordInfo.textContent = 'WebSocket connection error. Is the C++ server running?';
    };

    socket.onclose = function(event) {
        console.log('WebSocket connection closed:', event);
        // Optionally, try to reconnect or inform the user
        // wordInfo.textContent = 'WebSocket connection closed.';
        socket = null; // Ensure socket is null so connectWebSocket can be called again if needed
    };
}

// Attempt to connect when the script loads
connectWebSocket();

// --- Rest of the script ---

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (highlightedSpan) {
                highlightedSpan = null;
            }
            fileContent.textContent = e.target.result;
            wordInfo.textContent = '';
        }
        reader.readAsText(file);
    } else {
        if (highlightedSpan) {
            const parent = highlightedSpan.parentNode;
            if (parent) {
                 parent.replaceChild(document.createTextNode(highlightedSpan.textContent), highlightedSpan);
                 parent.normalize();
            }
            highlightedSpan = null;
        }
        fileContent.textContent = '';
        wordInfo.textContent = '';
    }
});

fileContent.addEventListener('click', function(event) {
    if (!fileContent.textContent) return;

    if (highlightedSpan) {
        const parent = highlightedSpan.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(highlightedSpan.textContent), highlightedSpan);
            parent.normalize();
        }
        highlightedSpan = null;
    }

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let clickedNode = range.startContainer;
    let clickedOffset = range.startOffset;

    if (!fileContent.contains(clickedNode) || clickedNode.nodeType !== Node.TEXT_NODE) {
        // wordInfo.textContent = 'Please click directly on the text.'; // Keep or remove based on preference
        return;
    }

    const fullTextContent = fileContent.textContent;

    let wordStart = clickedOffset;
    let wordEnd = clickedOffset;

    while (wordStart > 0 && !isWordBoundary(clickedNode.textContent[wordStart - 1])) {
        wordStart--;
    }
    while (wordEnd < clickedNode.textContent.length && !isWordBoundary(clickedNode.textContent[wordEnd])) {
        wordEnd++;
    }

    if (wordStart === wordEnd) {
        wordInfo.textContent = '';
        return;
    }

    const word = clickedNode.textContent.substring(wordStart, wordEnd);

    // --- Send word via WebSocket ---
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(word);
        console.log(`Sent to server: "${word}"`);
    } else {
        console.warn('WebSocket not connected. Cannot send word.');
        // Optionally, try to reconnect or queue the message
        // if (!socket || socket.readyState === WebSocket.CLOSED) connectWebSocket();
    }
    // --- End WebSocket Send ---

    const wordRange = document.createRange();
    wordRange.setStart(clickedNode, wordStart);
    wordRange.setEnd(clickedNode, wordEnd);

    const newSpan = document.createElement('span');
    newSpan.className = 'highlight';
    newSpan.textContent = word;

    wordRange.deleteContents();
    wordRange.insertNode(newSpan);
    highlightedSpan = newSpan;

    let absoluteWordStartOffset = 0;
    let node = fileContent.firstChild;
    while (node) {
        if (node === clickedNode) {
            absoluteWordStartOffset += wordStart;
            break;
        }
        if (node.nodeType === Node.TEXT_NODE) {
            absoluteWordStartOffset += node.textContent.length;
        }
        node = node.nextSibling;
    }

    let lineNum = 1;
    let colNum = 1;
    for (let i = 0; i < absoluteWordStartOffset; i++) {
        if (fullTextContent[i] === '\n') {
            lineNum++;
            colNum = 1;
        } else {
            colNum++;
        }
    }
    wordInfo.textContent = `Word: "${word}", Line: ${lineNum}, Column: ${colNum}`;
});

function isWordBoundary(char) {
    return /\s|[\.,;:"'!(){}\[\]?]/.test(char);
}
