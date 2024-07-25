from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# 다른 모듈에서 블루프린트 호출
from evaluate import evaluate_bp

# 환경변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# 블루프린트 등록
app.register_blueprint(evaluate_bp)

# 포트번호, 저장 시 서버 재시작
if __name__ == '__main__':
    app.run(debug=True, port=5000)
