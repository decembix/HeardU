const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = 5555;

app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/isokay', (req, res) => {
    res.sendFile(path.join(__dirname, 'isokay.html'));
});

app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/css", express.static(path.join(__dirname, "css")));

app.use(cors());
const upload = multer({ dest: "uploads/" });

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, "result.txt");

  const whisperCmd = `python whisper_run.py ${inputPath} ${outputPath}`;
  exec(whisperCmd, (err, stdout, stderr) => {
    if (err) {
      console.error("Whisper 오류:", stderr);
      return res.status(500).json({ error: "STT 오류" });
    }

    const transcribedText = fs.readFileSync(outputPath, "utf-8").trim();
    console.log("🎧 Whisper 결과:", transcribedText);
    
    const llamaCmd = `python llama/llama_generate.py "${transcribedText}"`;

    exec(llamaCmd, (err2, stdout2, stderr2) => {
      if (err2) {
        console.error("LLaMA 오류:", stderr2);
        return res.status(500).json({ error: "LLaMA 오류 발생" });
      }

      const reply = stdout2.trim();
      console.log("LLaMA 응답:", reply);

      res.json({ text: transcribedText, reply: reply });
    });
  });
});

app.listen(PORT, () => {
  console.log(`서버ON | http://localhost:${PORT}`);
});
