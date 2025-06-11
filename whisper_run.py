import sys
import torch
import whisper
import os

# 입출력 경로 받기
input_path = sys.argv[1]
output_path = sys.argv[2]

#Whisper 모델 구조 : tiny
model = whisper.load_model("base")

#pt파일 로드
model.load_state_dict(torch.load("assets/heardu.pt"))

#결과 뽑기
result = model.transcribe(input_path, language="ko")

#결과 저장
with open(output_path, "w", encoding="utf-8") as f:
    f.write(result["text"])
