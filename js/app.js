const recordBtn = document.getElementById("recordBtn");
const statusText = document.getElementById("status");
const resultText = document.getElementById("resultText");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let animationId;

recordBtn.onclick = async () => {
  console.log("🎤 버튼 클릭됨");

  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        stopWaveAnimation(); // 👈 정지
        recordBtn.classList.remove("listening");
        recordBtn.innerText = "음성 입력 시작";

        const blob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", blob, "input.wav");

        statusText.innerText = "⏳ 변환 중...";

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData
          });

          const data = await response.json();
          resultText.innerText = data.text || "⚠️ 텍스트 변환 실패";
          statusText.innerText = "✅ 완료!";
        } catch (err) {
          console.error("Fetch 실패:", err);
          statusText.innerText = "❌ 서버 응답 실패";
        }

        isRecording = false;
      };

      mediaRecorder.start();
      isRecording = true;
      recordBtn.classList.add("listening");
      recordBtn.innerText = "🎧 듣는 중... 클릭 시 멈춤";
      statusText.innerText = "🎙️ 녹음 중입니다...";
      startWaveAnimation();
    } catch (err) {
      console.error("🚫 마이크 접근 오류:", err);
      alert("마이크 권한을 허용해주세요.");
    }
  } else {
    mediaRecorder.stop();
    statusText.innerText = "🛑 녹음 중지";
  }
};

// 🔵 원형 파동 애니메이션
let radius = 0;
function startWaveAnimation() {
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    radius += 1;
    if (radius > 100) radius = 20;

    ctx.beginPath();
    ctx.arc(150, 150, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#4fc3f7";
    ctx.lineWidth = 4;
    ctx.stroke();

    animationId = requestAnimationFrame(animate);
  }
  animate();
}

function stopWaveAnimation() {
  cancelAnimationFrame(animationId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  radius = 0;
}
