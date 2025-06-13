const fileInput = document.getElementById('fileInput');
const fileContent = document.getElementById('fileContent');
const wordInfo = document.getElementById('wordInfo');
let highlightedSpan = null;

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Clear previous content and state
            if (highlightedSpan) {
                // No need to manually remove if we are resetting textContent
                highlightedSpan = null;
            }
            fileContent.textContent = e.target.result; // Set new content
            wordInfo.textContent = ''; // Clear word info
        }
        reader.readAsText(file);
    } else {
        // No file selected or selection cancelled
        if (highlightedSpan) {
            // Attempt to remove highlight if a file was previously loaded
            // This path might be less common if fileInput.value is cleared by browser
            const parent = highlightedSpan.parentNode;
            if (parent) {
                 parent.replaceChild(document.createTextNode(highlightedSpan.textContent), highlightedSpan);
                 parent.normalize(); // Merge text nodes
            }
            highlightedSpan = null;
        }
        fileContent.textContent = ''; // Clear display
        wordInfo.textContent = ''; // Clear word info
    }
});

fileContent.addEventListener('click', function(event) {
    if (!fileContent.textContent) return;

    // Remove previous highlight
    if (highlightedSpan) {
        const parent = highlightedSpan.parentNode;
        if (parent) { // Check if span is still in DOM
            parent.replaceChild(document.createTextNode(highlightedSpan.textContent), highlightedSpan);
            parent.normalize(); // Merge adjacent text nodes
        }
        highlightedSpan = null;
    }

    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let clickedNode = range.startContainer;
    let clickedOffset = range.startOffset;

    // Only proceed if the click is within fileContent and on a Text Node
    if (!fileContent.contains(clickedNode) || clickedNode.nodeType !== Node.TEXT_NODE) {
        wordInfo.textContent = 'Please click directly on the text.';
        return;
    }

    const fullTextContent = fileContent.textContent; // Get current full text for line/col calculation

    // Expand to find word boundaries within the clickedNode's text
    let wordStart = clickedOffset;
    let wordEnd = clickedOffset;

    // Find word start
    while (wordStart > 0 && !isWordBoundary(clickedNode.textContent[wordStart - 1])) {
        wordStart--;
    }

    // Find word end
    while (wordEnd < clickedNode.textContent.length && !isWordBoundary(clickedNode.textContent[wordEnd])) {
        wordEnd++;
    }

    if (wordStart === wordEnd) { // Click was on whitespace or boundary itself
        wordInfo.textContent = '';
        return;
    }

    const word = clickedNode.textContent.substring(wordStart, wordEnd);

    // Create a new range for the identified word within clickedNode
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
    // The 'absoluteWordStartOffset' is the sum of lengths of all text nodes
    // before 'clickedNode' plus 'wordStart' within 'clickedNode'.
    let absoluteWordStartOffset = 0;
    let node = fileContent.firstChild;
    while (node) {
        if (node === clickedNode) {
            absoluteWordStartOffset += wordStart;
            break;
        }
        if (node.nodeType === Node.TEXT_NODE) {
            absoluteWordStartOffset += node.textContent.length;
        } else if (node === highlightedSpan && node !== newSpan) {
            // This case should ideally not be hit if highlights are properly removed and normalized
            // but as a safeguard, count its text length if it's an old highlight somehow missed.
            absoluteWordStartOffset += node.textContent.length;
        }
        node = node.nextSibling;
    }
    // If node is null here, it means clickedNode was not found, which is an error state.
     if (!node && fileContent.contains(clickedNode)) {
        // Fallback if clickedNode was not directly found in iteration (e.g. deeply nested, though not expected for <pre>)
        // This part of the logic for offset calculation could be tricky if the DOM is complex.
        // For <pre> with text and spans, the direct child iteration should work.
        // Re-calculating based on fullTextContent as a simpler, more robust way for line/col:
        // Find the instance of the word. This is problematic if words repeat.
        // A better way is to use the range's start offset in the context of the whole fileContent.
        // However, Range.startOffset is relative to startContainer.
        // The most robust way to get an "absolute" offset for line/col counting
        // is to iterate up to the point of insertion.
        // The current `absoluteWordStartOffset` logic should be mostly correct for a flat <pre> structure.
    }


    let lineNum = 1;
    let colNum = 1;
    // Use `fullTextContent` which is the normalized, complete text at the time of click (before new span)
    // The `absoluteWordStartOffset` should correspond to this `fullTextContent`.
    // The issue is `fullTextContent` is from `fileContent.textContent` *before* the new span is inserted
    // but *after* the old span was removed and normalized. This should be correct.
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
    // Matches spaces, tabs, newlines, and common punctuation
    return /\s|[\.,;:"'!(){}\[\]?]/.test(char);
}
