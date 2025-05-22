# 🐢🐢🐢 @polepole 🐢🐢🐢  
## Images with OpenAI API

A local web application for generating images using OpenAI's **DALL·E 2**, **DALL·E 3**, and **GPT-Image-1** models. This tool provides a clean interface to input prompts, customize generation settings, and automatically save images to local folders.

---

## 📚 Table of Contents

- [🧭 Overview](#-overview)
- [✨ Features](#-features)
- [🔧 Requirements](#-requirements)
- [📦 Installation](#-installation)
- [🔐 Environment Setup](#-environment-setup)
- [🚀 Usage](#-usage)
- [🧠 How It Works](#-how-it-works)
- [🧠 Model Capabilities](#-model-capabilities)
- [📁 File Structure & Saving Logic](#-file-structure--saving-logic)
- [💬 Example Usage](#-example-usage)
- [📚 References](#-references)
- [📄 License](#-license)

---

## 🧭 Overview

This app enables local image generation using OpenAI's APIs:

- `dall-e-2`
- `dall-e-3`
- `gpt-image-1`

Once running, open [http://localhost:3000](http://localhost:3000) in your browser to use the tool.

While the application runs locally, image generation itself is performed by OpenAI’s cloud-hosted models, so an internet connection and valid API key are required.

---

## ✨ Features

- ✅ Supports **DALL·E 2**, **DALL·E 3**, and **GPT-Image-1**
- 🧠 Model-aware options: image size, quality, background, number of outputs
- 📤 Prompt-based generation
- 🖼️ Dynamic image gallery with layout for square, wide, tall images
- 💾 Auto-saves all images to local folders
- 🖥️ Local web interface and server, but image generation relies on OpenAI’s cloud API (requires internet and valid API key) — no custom database or hosting needed

---

## 🔧 Requirements

### ✅ Software You Must Install

| Software     | Purpose                          | Install Guide                              |
|--------------|----------------------------------|--------------------------------------------|
| **Node.js**  | JavaScript runtime               | [nodejs.org](https://nodejs.org)           |
| **npm**      | Node package manager             | Comes with Node.js                         |
| **Git**      | Clone this project               | [git-scm.com](https://git-scm.com)         |
| **OpenAI API Key** | Authenticate with OpenAI  | [Get Key](https://platform.openai.com/account/api-keys) |

---

### 📦 Node.js Dependencies

Install with one command:
```bash
npm install express dotenv openai
````

| Package       | Description                                       |
| ------------- | ------------------------------------------------- |
| `express`     | HTTP server to host frontend and handle API calls |
| `dotenv`      | Load `OPENAI_API_KEY` from `.env` file            |
| `openai`      | Official SDK to interact with OpenAI APIs         |
| `fs/promises` | Node built-in module for file saving              |
| `path`        | Node built-in module for path resolution          |

You do **not** need to install `fs/promises` or `path` manually — they are built into Node.js.

---

### 💡 Optional for Development

* **VS Code** (or any IDE)
* **nodemon** (for auto-reloading server):

  ```bash
  npm install -g nodemon
  nodemon server.js
  ```

---

## 📦 Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/Images-with-OpenAI-API.git
   cd Images-with-OpenAI-API
   ```

2. Install dependencies:

   ```bash
   npm install express dotenv openai
   ```

3. Create `.env` file in the root directory:

   ```
   OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## 🚀 Usage

Start the server:

```bash
node server.js
```

Then open the app in your browser:

```
http://localhost:3000
```

> Modify the port in `server.js` if needed.

---

## 🧠 How It Works

### 📄 `index.html` (Frontend)

* Served from the `public/` directory by Express.
* Uses `<select>`, `<input>`, and `<textarea>` fields to build the image generation request.
* JavaScript dynamically reveals relevant options based on the selected model:

  * **DALL·E 2**: image size
  * **DALL·E 3**: size + quality
  * **GPT-Image-1**: size + quality + image count + background
* Sends a `POST` request to the backend endpoint: `/api/generate`
* Displays results using a responsive layout:

  * 1 image: centered
  * 2–4 images: 2×2 grid or horizontal scroll (for tall images)
* Includes a modal for fullscreen image viewing on click.

---

### 🌐 `server.js` (Backend)

* Uses Express to serve static files and handle API requests.

* Defines a single image generation endpoint:

  ```http
  POST /api/generate
  ```

* Parses the following request payload:

  ```js
  const { model, prompt, n, size, quality, background } = req.body;
  ```

* Constructs a call to OpenAI:

  ```js
  await openai.images.generate({ ...options });
  ```

* Images are requested in base64 format using `response_format: "b64_json"`. They are then decoded and saved locally as `.png` files using Node.js file system operations:

  > **Note:** This is only possible because the app explicitly requests base64-encoded output. Not all OpenAI endpoints support this format.

* Filenames include:

  * Model type
  * Timestamp
  * Size classification (`square`, `wide`, `tall`)
  * Quality setting
  * Index (if multiple images requested)

---

## 🧠 Model Capabilities

### `dall-e-2`

* ❗ Only 1 image per request
* ✅ Sizes: `256x256`, `512x512`, `1024x1024`

### `dall-e-3`

* ❗ Only 1 image per request
* ✅ Sizes: `1024x1024`, `1024x1792`, `1792x1024`
* ✅ Quality: `standard`, `hd`

### `gpt-image-1`

* ✅ 1–4 images per request
* ✅ Sizes: `1024x1024`, `1024x1536`, `1536x1024`
* ✅ Quality: `low`, `medium`, `high`
* ✅ Background: `transparent`, `opaque`

> To allow more than 4 images, update the `max` value in the `index.html` and backend `req.body.n` limit.

Continuing from the previous message, here’s the rest of the `README.md` including the project structure, image saving details, usage example, references, and license:

## 📁 File Structure & Saving Logic

### Project Layout

```

project-root/
├── public/                # Frontend HTML and assets
│   └── index.html
├── server.js              # Express backend + OpenAI API logic
├── .env                   # OpenAI API Key
├── package.json
├── photos-dalle2/         # Auto-created, saved DALL·E 2 images
├── photos-dalle3/         # Auto-created, saved DALL·E 3 images
├── photos-gpt/            # Auto-created, saved GPT-Image-1 images
└── README.md

```

### Image Saving Details

- All images are saved in `.png` format using base64 decoding.
- Saved via `fs.promises.writeFile()` in Node.js.

#### Filenames follow this structure:

| Model         | Example Filename                                |
|---------------|-------------------------------------------------|
| `dall-e-2`    | `dalle2-20250520-141501-1024.png`                |
| `dall-e-3`    | `dalle3-20250520-141530-tall-hd.png`             |
| `gpt-image-1` | `gpt-20250520-141600-square-high-1.png`          |

> Each request auto-creates folders and timestamps to keep files organized.

---

## 💬 Example Usage

1. **Enter Prompt**  
```

"A cozy mountain cabin at night with northern lights overhead"

````

2. **Select Settings**
- Model: `gpt-image-1`
- Number: `2`
- Size: `1536x1024`
- Quality: `high`
- Background: `transparent`

3. **Click Generate**

4. **Results**
- Images will appear in the gallery.
- Also saved as:
  ```
  photos-gpt/gpt-20250520-142210-wide-high-1.png
  photos-gpt/gpt-20250520-142210-wide-high-2.png
  ```

---

## 📚 References

Below are official OpenAI documents and resources related to image generation using the API:

1. **Model Overview & Pricing**
   Comprehensive specs and pricing details for the `gpt-image-1` model:

   👉 [https://platform.openai.com/docs/models/gpt-image-1](https://platform.openai.com/docs/models/gpt-image-1)

2. **Image Generation Guide**
   Step-by-step instructions for using `gpt-image-1` and DALL·E for image generation and editing:

   👉 [https://platform.openai.com/docs/guides/image-generation](https://platform.openai.com/docs/guides/image-generation)

3. **Images API Reference**
   Complete reference for the `/v1/images/generations` endpoint, including request structure and parameters:

   👉 [https://platform.openai.com/docs/api-reference/images](https://platform.openai.com/docs/api-reference/images)

4. **Developer Announcement**
   Forum post introducing `gpt-image-1`, with discussion and initial usage tips:

   👉 [https://community.openai.com/t/new-gpt-image-model-in-the-api/1239462](https://community.openai.com/t/new-gpt-image-model-in-the-api/1239462)

5. **Official Blog Post**
   OpenAI’s announcement with industry examples of how businesses use image generation:

   👉 [https://openai.com/index/image-generation-api/](https://openai.com/index/image-generation-api/)

6. **Images & Vision with Responses API**
   Guide to using image generation/input in the new multimodal Responses API:

   👉 [https://platform.openai.com/docs/guides/images-vision?api-mode=responses](https://platform.openai.com/docs/guides/images-vision?api-mode=responses)

7. **Images & Vision with Chat Completions API**
   How to handle vision tasks (input + generation) via Chat Completions:
   
   👉 [https://platform.openai.com/docs/guides/images-vision?api-mode=chat](https://platform.openai.com/docs/guides/images-vision?api-mode=chat)

---

## 📄 License

This project is currently private and intended for personal or internal use.  
You may modify, adapt, or publish your own version under your preferred license.

> For contributions or inquiries, clone the repo or submit a private pull request.

---

## 🐢 Author

**@polepole**  
_"Images... with OpenAI API"_