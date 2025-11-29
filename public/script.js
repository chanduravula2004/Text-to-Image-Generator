// ---------- script.js ----------

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

  // --- Add to history dropdown ---
  if (
    prompt &&
    !Array.from(historySelect.options).some((opt) => opt.value === prompt)
  ) {
    const option = document.createElement("option");
    option.value = prompt;
    option.textContent =
      prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt;
    historySelect.insertBefore(option, historySelect[1]);
  }

  lastPrompt = prompt;
  regenBtn.disabled = false;

  // --- Show loader animation ---
  imageContainer.style.display = "flex";
  setTimeout(() => imageContainer.classList.add("visible"), 20);

  imageContainer.innerHTML = `<div class="loader"></div>`;

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);

    // 🔥 Call your backend instead of ClipDrop API directly
    const response = await fetch("http://localhost:5000/generate", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Image generation failed");

    // Receive generated image blob
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    // Replace loader with generated image
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

// Regenerate with last prompt
function regenerate() {
  if (lastPrompt) {
    document.getElementById("prompt").value = lastPrompt;
    generateImage();
  }
}

// Download image
function downloadImage(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "generated-image.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Delete image container
function deleteImage() {
  const imageContainer = document.getElementById("image-container");
  imageContainer.classList.remove("visible");

  setTimeout(() => {
    imageContainer.style.display = "none";
    imageContainer.innerHTML = "";
  }, 400);
}

// Load prompt from history
function loadPrompt(value) {
  if (value) {
    document.getElementById("prompt").value = value;
  }
}
