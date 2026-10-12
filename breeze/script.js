const imageDialog = document.querySelector("#image-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogClose = document.querySelector(".image-dialog__close");
const zoomButtons = Array.from(document.querySelectorAll("[data-zoom]"));

function openImageDialog(button) {
  dialogImage.src = button.dataset.zoom;
  dialogImage.alt = button.dataset.alt || "Breeze 项目图片预览";
  imageDialog.showModal();
}

zoomButtons.forEach((button) => {
  button.addEventListener("click", () => openImageDialog(button));
});

dialogClose.addEventListener("click", () => imageDialog.close());
imageDialog.addEventListener("click", (event) => {
  if (event.target === imageDialog) imageDialog.close();
});

imageDialog.addEventListener("close", () => {
  dialogImage.removeAttribute("src");
});
