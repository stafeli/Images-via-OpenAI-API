import express from "express";
import { config } from "dotenv";
import { promises as fs } from "fs";
import path from "node:path";
import OpenAI from "openai";

config();                               // loads OPENAI_API_KEY

/* ---------- helpers ---------- */
const ts = () => {
  const d = new Date();
  return d.toISOString()               // 2025-05-20T11:15:03.123Z
          .replace(/[-:T]/g,"")        // 20250520 111503.123Z
          .slice(0,15);                // 20250520-111503
};
const sizeLabel = s => {
  const [w,h] = s.split("x").map(Number);
  if (w === h) return "square";
  return w > h ? "wide" : "tall";
};

/* ---------- OpenAI & Express ---------- */
const openai = new OpenAI();

const app = express();
app.use(express.json({ limit:"30mb" }));
app.use(express.static("public"));     // serves index.html & edit.html, etc.

/* ---------- image-generation endpoint ---------- */
app.post("/api/generate", async (req, res) => {
  try {
    const { model, prompt, n = 1, size, quality, background } = req.body;

    /* ---- build request per model ---- */
    const base = { model, prompt, n:+n };
    if(model==="dall-e-2"){
      base.size = size;                      // 256x256|512x512|1024x1024
      base.response_format = "b64_json";
    }else if(model==="dall-e-3"){
      base.size = size;                      // 1024x1024|1024x1792|1792x1024
      base.response_format = "b64_json";
      if(quality==="hd") base.quality = "hd";
    }else if(model==="gpt-image-1"){
      Object.assign(base,{ size, quality, background });
    }else{
      return res.status(400).json({ error:"Unknown model" });
    }

    /* ---- call OpenAI ---- */
    const rsp = await openai.images.generate(base);
    const images = (rsp.data ?? [])
                    .map(d => d.b64_json || d)
                    .filter(Boolean);
    if(!images.length) throw new Error("No images returned");

    /* ---- choose folder + filename pattern ---- */
    const stamp = ts();                       // 20250520-111503
    let dir, baseName;
    if(model==="dall-e-2"){
      dir      = "photos-dalle2";
      baseName = `dalle2-${stamp}-${size.split("x")[0]}`;        // dalle2-...-512
    }else if(model==="dall-e-3"){
      dir      = "photos-dalle3";
      baseName = `dalle3-${stamp}-${sizeLabel(size)}-${quality||"standard"}`;
    }else{                                    // gpt-image-1
      dir      = "photos-gpt";
      baseName = `gpt-${stamp}-${sizeLabel(size)}-${quality}`;
    }

    await fs.mkdir(dir,{ recursive:true });

    /* ---- save each PNG ---- */
    await Promise.all(
      images.map((b64,idx)=>{
        const name = `${baseName}${model==="gpt-image-1" ? `-${idx+1}` : ""}.png`;
        return fs.writeFile(path.join(dir,name),Buffer.from(b64,"base64"));
      })
    );

    res.json({ images });

  } catch(err){
    console.error(err);
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

app.listen(3000,()=>console.log("✓ http://localhost:3000"));
