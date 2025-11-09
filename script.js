const API_URL = "https://clipdrop-api.co/text-to-image/v1";
const API_KEY = "1682d9fd8154e9aea9641ce7f3c83dd60b0bec8e6aea5295d9595848d4151e0174cb2f3a061b9316cee7edca36693d8d"; // Replace with your Clipdrop API key

let lastPrompt = "";

async function generateImage() {
  const promptInput = document.getElementById("prompt");
  const imageContainer = document.getElementById("image-container");
  const regenBtn = document.getElementById("regen-btn");
  const historySelect = document.getElementById("history");
  const prompt = promptInput.value.trim();

  if (!prompt) {
    alert("Please enter a prompt!");
    return;
  }

  // Save prompt to history
  if (prompt && !Array.from(historySelect.options).some(opt => opt.value === prompt)) {
    const option = document.createElement("option");
    option.value = prompt;
    option.textContent = prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt;
    historySelect.insertBefore(option, historySelect[1]);
  }

  lastPrompt = prompt;
  regenBtn.disabled = false;

  // First-time animation
  imageContainer.style.display = "flex";
  setTimeout(() => imageContainer.classList.add("visible"), 20);

  // Show loader
  imageContainer.innerHTML = `<div class="loader"></div>`;

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "x-api-key": API_KEY },
      body: formData,
    });

    if (!response.ok) throw new Error("Image generation failed");

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    imageContainer.innerHTML = `
      <div class="action-buttons">
        <button onclick="downloadImage('${imageUrl}')">Download</button>
        <button onclick="deleteImage()">Delete</button>
      </div>
      <img src="${imageUrl}" alt="Generated Image" />
    `;

    const img = imageContainer.querySelector("img");
    img.onload = () => img.classList.add("visible");
  } catch (error) {
    console.error(error);
    alert("❌ Failed to generate image. Please try again.");
    imageContainer.style.display = "none";
    imageContainer.classList.remove("visible");
  }
}

function regenerate() {
  if (lastPrompt) {
    document.getElementById("prompt").value = lastPrompt;
    generateImage();
  }
}

function downloadImage(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "generated-image.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function deleteImage() {
  const imageContainer = document.getElementById("image-container");
  imageContainer.classList.remove("visible");
  setTimeout(() => {
    imageContainer.style.display = "none";
    imageContainer.innerHTML = "";
  }, 400);
}

function loadPrompt(value) {
  if (value) {
    document.getElementById("prompt").value = value;
  }
}
