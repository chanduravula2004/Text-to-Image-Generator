

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


  imageContainer.style.display = "flex";
  setTimeout(() => imageContainer.classList.add("visible"), 20);

  imageContainer.innerHTML = `<div class="loader"></div>`;

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);


    const response = await fetch("https://text-to-image-generator-32h7.onrender.com/generate",  {
      method: "POST",
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
