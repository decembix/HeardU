import sys
import torch
import whisper
import os

# 입력/출력 경로 받기
input_path = sys.argv[1]
output_path = sys.argv[2]

# 1. Whisper 모델 구조 복원 (tiny 사용)
model = whisper.load_model("tiny")

# 2. Fine-tuned 가중치 로드
model.load_state_dict(torch.load("assets/heardu.pt"))

# 3. 추론 수행
result = model.transcribe(input_path, language="ko")

# 4. 결과 저장
with open(output_path, "w", encoding="utf-8") as f:
    f.write(result["text"])
