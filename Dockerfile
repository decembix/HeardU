# =============================================
# Dockerfile: Cloudtype용 Whisper + FFmpeg + Node.js (경량 최적화)
# =============================================

FROM python:3.10-slim

# 필수 패키지 및 nodejs 설치
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# ffmpeg 정적 바이너리 설치
RUN curl -LO https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
RUN tar -xf ffmpeg-release-amd64-static.tar.xz && \
    cp ffmpeg-*-amd64-static/ffmpeg /usr/local/bin/ && \
    cp ffmpeg-*-amd64-static/ffprobe /usr/local/bin/ && \
    rm -rf ffmpeg-*-amd64-static ffmpeg-release-amd64-static.tar.xz

# Node 의존성 설치
COPY package*.json ./
RUN npm install --omit=dev

# Python 의존성 설치 (CPU 전용 torch)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache

# 앱 코드 복사
COPY . .

# Whisper 모델 미리 다운로드 제거 (최초 요청 시 로드됨)
# RUN python -c "import whisper; whisper.load_model('tiny')"

EXPOSE 5555
CMD ["node", "server.js"]
