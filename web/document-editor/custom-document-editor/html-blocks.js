// In html-blocks.js
export function showDownloadZipPopup(folderStructure, onDownload) {
  // First, dynamically load the CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "popup-styles.css"; // Make sure this path is correct
  document.head.appendChild(link);

  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const content = `
      <div class="modal-content">
        <h2 class="modal-title">Download Zip</h2>
        <div>
          <p class="modal-text">
            Are you sure you want to download a Zip file? Downloading this Zip file will splice the
            original document into unique PDF files per the Classifications you've finalized.
          </p>
          <p class="modal-text">
            To confirm you are ready to approve, review the summary below. Once you have
            reviewed, click the "Download" button.
          </p>
          <div class="folder-structure">
            <h3 class="folder-title">Folder Title: ${folderStructure.title}</h3>
            <div class="list-container">
            <ol>
                ${folderStructure.subfolders
                .map(
                    (subfolder) => `
                <li><div class="subfolder">
                    <h4 class="subfolder-title">Subfolder Title: ${
                    subfolder.title
                    }</h4>
                    <ul class="file-list">
                    ${subfolder.files.map((file) => `<li>${file}</li>`).join("")}
                    </ul>
                </div></li>
                `
                )
                .join("")}
            </ol>
            </div>
          </div>
        </div>
        <div class="button-container">
          <button id="cancelDownload" class="button button-cancel">Cancel</button>
          <button id="confirmDownload" class="button button-confirm">Download</button>
        </div>
      </div>
    `;

  modal.innerHTML = content;
  document.body.appendChild(modal);

  const cancelButton = modal.querySelector("#cancelDownload");
  const confirmButton = modal.querySelector("#confirmDownload");

  cancelButton.addEventListener("click", () => {
    document.body.removeChild(modal);
    document.head.removeChild(link); // Remove the dynamically added stylesheet
  });

  confirmButton.addEventListener("click", async () => {
    confirmButton.textContent = "Downloading...";
    confirmButton.disabled = true;
    await onDownload();
    document.body.removeChild(modal);
    document.head.removeChild(link); // Remove the dynamically added stylesheet
  });
}
