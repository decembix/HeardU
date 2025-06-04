const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = 5555;

// 정적 파일 서빙
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

  const command = `python whisper_run.py ${inputPath} ${outputPath}`;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: "모델 처리 오류" });
    }
    const result = fs.readFileSync(outputPath, "utf-8");
    res.json({ text: result });
  });
});

app.listen(PORT, () => {
  console.log(`🔊 HeardU 서버 실행 중: http://localhost:${PORT}`);
});
