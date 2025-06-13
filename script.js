const fileInput = document.getElementById('fileInput');
const fileContent = document.getElementById('fileContent');
const wordInfo = document.getElementById('wordInfo');
let highlightedSpan = null;

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fileContent.textContent = e.target.result;
            // Clear previous word info and highlight when a new file is loaded
            wordInfo.textContent = '';
            if (highlightedSpan) {
                highlightedSpan = null; // Reset highlightedSpan as its parent is gone
            }
        }
        reader.readAsText(file);
    }
});

fileContent.addEventListener('click', function(event) {
    const text = fileContent.textContent;
    if (!text) return;

    // Remove previous highlight
    if (highlightedSpan) {
        const parent = highlightedSpan.parentNode;
        parent.replaceChild(document.createTextNode(highlightedSpan.textContent), highlightedSpan);
        highlightedSpan = null;
        // After replacing the child, the DOM structure changes.
        // We need to re-normalize the text nodes if the highlight was in a split text node.
        // However, for simplicity with <pre>, we re-set its textContent to avoid complex node manipulation.
        // This is okay because we're primarily working with plain text display.
        // A more robust solution for rich text would involve careful range manipulation.
        fileContent.textContent = text; // This re-sets the content and loses the highlight.
                                        // A better way is needed if we want to keep other highlights or complex structures.
                                        // For this task, we assume only one highlight at a time.
    }

    // Get selection / caret position
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let clickedNode = range.startContainer;
    let clickedOffset = range.startOffset;

    // Ensure we're working with a text node within fileContent
    if (!fileContent.contains(clickedNode) || clickedNode.nodeType !== Node.TEXT_NODE) {
        // Fallback or attempt to find the text node from event coordinates if direct selection is problematic
        // This can happen if the click is on the <pre> but not directly on text.
        // For simplicity, we'll rely on the selection API here.
        // More advanced logic might use document.caretPositionFromPoint.
        console.log("Click was not directly on text or selection is problematic.");
        return;
    }

    const fullText = fileContent.textContent; // Use fullText for calculations

    // Expand to find word boundaries
    let wordStart = clickedOffset;
    let wordEnd = clickedOffset;

    // Find word start
    while (wordStart > 0 && !isWordBoundary(fullText[wordStart - 1])) {
        wordStart--;
    }

    // Find word end
    while (wordEnd < clickedNode.textContent.length && !isWordBoundary(clickedNode.textContent[wordEnd])) {
        wordEnd++;
    }

    // If no word is found (e.g., clicking on whitespace), do nothing
    if (wordStart === wordEnd) {
        wordInfo.textContent = '';
        return;
    }

    const word = clickedNode.textContent.substring(wordStart, wordEnd);

    // Create a new range for the identified word
    const wordRange = document.createRange();
    wordRange.setStart(clickedNode, wordStart);
    wordRange.setEnd(clickedNode, wordEnd);

    // Highlight the word
    const newSpan = document.createElement('span');
    newSpan.className = 'highlight';
    newSpan.textContent = word;
    wordRange.deleteContents(); // Remove the text
    wordRange.insertNode(newSpan); // Insert the span
    highlightedSpan = newSpan;

    // Calculate line and column
    // To get the absolute offset of the word in the *entire* fileContent text
    let absoluteWordStartOffset = 0;
    let currentNode = fileContent.firstChild;
    let found = false;
    while(currentNode && !found) {
        if (currentNode === clickedNode) {
            absoluteWordStartOffset += wordStart;
            found = true;
        } else if (currentNode.nodeType === Node.TEXT_NODE) {
            absoluteWordStartOffset += currentNode.textContent.length;
        }
        currentNode = currentNode.nextSibling;
    }


    let lineNum = 1;
    let colNum = 1;
    for (let i = 0; i < absoluteWordStartOffset; i++) {
        if (fullText[i] === '\n') {
            lineNum++;
            colNum = 1;
        } else {
            colNum++;
        }
    }
    wordInfo.textContent = `Word: "${word}", Line: ${lineNum}, Column: ${colNum}`;

});

function isWordBoundary(char) {
    // Matches spaces, tabs, newlines, and common punctuation
    return /\s|[\.,;:"'!(){}\[\]?]/.test(char);
}
