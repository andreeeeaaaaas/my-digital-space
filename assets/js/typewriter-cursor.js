function initializeTypewriterCursor(variableSpan, cursorChar = "_") {
  if (!variableSpan) {
    return;
  }

  variableSpan.innerHTML = "";
  variableSpan.prepend(document.createTextNode(""));

  const cursor = document.createElement("span");
  cursor.className = "typewriter-cursor";
  cursor.textContent = cursorChar;
  variableSpan.appendChild(cursor);
}

