const recordBtn = document.getElementById("recordBtn");
const statusText = document.getElementById("status");
const resultText = document.getElementById("resultText");
const canvas = document.getElementById("visualizer");
const ctx = canvas ? canvas.getContext("2d") : null;

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let animationId;

// ripple 애니메이션
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  button.appendChild(ripple);

  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";

  ripple.addEventListener("animationend", () => ripple.remove());
}

recordBtn.onclick = async (event) => {
  createRipple(event);

  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        recordBtn.classList.remove("listening");
        const blob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", blob, "input.wav");

        statusText.innerText = "⏳";

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          resultText.innerText = data.text || "텍스트 변환 실패";
          statusText.innerText = "완료";
        } catch (err) {
          statusText.innerText = "서버 응답 실패";
        }

        isRecording = false;
      };

      mediaRecorder.start();
      isRecording = true;
      recordBtn.classList.add("listening");
      statusText.innerText = "녹음 중...";
    } catch (err) {
      alert("마이크 권한을 허용해주세요.");
    }
  } else {
    mediaRecorder.stop();
    statusText.innerText = "녹음 중지";
  }
};
