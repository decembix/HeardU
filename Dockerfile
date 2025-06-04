# ========================================
# Dockerfile: Whisper + FFmpeg + Node.js 포함
# ========================================

# 1단계: Node.js + Python + FFmpeg이 포함된 이미지 선택
FROM python:3.10-slim

# Node.js 설치
RUN apt-get update && \
    apt-get install -y curl ffmpeg git && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 생성
WORKDIR /app

# Node.js 의존성 설치
COPY package*.json ./
RUN npm install

# Python 의존성 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 나머지 코드 복사
COPY . .

# Whisper 모델 자동 다운로드 (tiny 기준)
RUN python -c "import whisper; whisper.load_model('tiny')"

# 5000 포트 사용 (Cloudtype용)
EXPOSE 5555

# Node.js 서버 실행
CMD ["node", "server.js"]
