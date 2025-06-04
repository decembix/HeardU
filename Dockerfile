# ========================================
# Dockerfile: Whisper + FFmpeg + Node.js 포함 (경량화 버전)
# ========================================

FROM python:3.10-slim

# 필수 패키지 설치 + ffmpeg + Node.js 설치 (경량화)
RUN apt-get update && \
    apt-get install -y curl ffmpeg git && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 생성
WORKDIR /app

# Node 의존성 설치
COPY package*.json ./
RUN npm install --omit=dev

# Python 의존성 설치 (CPU 전용 torch)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache

# 코드 복사
COPY . .

# Whisper 모델 다운로드 (tiny)
RUN python -c "import whisper; whisper.load_model('tiny')"

# 5555 포트 사용 (Cloudtype용)
EXPOSE 5555
CMD ["node", "server.js"]
