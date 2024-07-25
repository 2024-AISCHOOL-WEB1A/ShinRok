import os
from flask import Blueprint, request, jsonify
import asyncio
from predict import predict_image_from_path
from db import db_con

evaluate_bp = Blueprint('evaluate', __name__)

@evaluate_bp.route('/predict', methods=['POST'])
async def predict():
    try:
        # 비동기 데이터베이스 연결 및 쿼리 실행
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, fetch_crop_data)
        
        if not result:
            return jsonify({"error": "No data found"}), 404

        crop_name, image_path = result
        
        # 비동기 예측 수행
        predicted_label, disease_name = await predict_image_from_path(image_path, crop_name)
        
        # 비동기 데이터베이스 업데이트 및 완료 요청 전송
        await loop.run_in_executor(None, update_db_and_notify, crop_name, image_path, predicted_label, disease_name)

        return jsonify({
            "predicted_label": predicted_label,
            "disease_name": disease_name
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def fetch_crop_data():
    conn = db_con()
    cursor = conn.cursor()
    
    # 데이터베이스에서 식물 이름과 이미지 경로 가져오기
    cursor.execute("SELECT DSS_IMG, DSS_PLANT FROM SR_DSS")
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return result

def update_db_and_notify(crop_name, image_path, predicted_label, disease_name):
    conn = db_con()
    cursor = conn.cursor()
    
    # 예측 결과를 데이터베이스에 저장
    cursor.execute("UPDATE SR_DSS SET DSS_RES=%s, disease_name=%s WHERE condition", (predicted_label, disease_name))
    conn.commit()
    
    cursor.close()
    conn.close()
    
    # 완료 요청을 localhost:3000으로 전송
    import requests
    requests.post("http://localhost:3000/complete", json={"status": "completed"})
