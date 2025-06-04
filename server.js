const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = 5000;

// 정적 파일 서빙
app.use(express.static(__dirname));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/css", express.static(path.join(__dirname, "css")));

app.use(cors());
const upload = multer({ dest: "uploads/" });

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, "result.txt");

  // whisper 파이썬 스크립트 실행 (로컬 Python에서 heardU.pt로 예측)
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
