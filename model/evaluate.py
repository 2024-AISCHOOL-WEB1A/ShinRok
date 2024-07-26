import pymysql
from predict import predict_image
from db import db_con

def fetch_image_and_crop(user_idx):
    connection = db_con()
    cursor = connection.cursor()

    try:
        # 예측할 이미지 경로와 작물 이름을 데이터베이스에서 가져오기
        cursor.execute("SELECT DSS_IDX, DSS_PLANT, DSS_IMG FROM SR_DSS WHERE USER_IDX = %s", (user_idx,))
        result = cursor.fetchone()
        if result:
            dss_idx, dss_plant, dss_img = result
            return dss_idx, dss_plant, dss_img
        else:
            return None, None, None

    except pymysql.MySQLError as e:
        print(f"Error while fetching data from database: {e}")
        return None, None, None

    finally:
        cursor.close()
        connection.close()

def predict_and_update(user_idx):
    # 이미지 경로와 작물 이름을 데이터베이스에서 가져오기
    dss_idx, crop_name, image_path = fetch_image_and_crop(user_idx)
    if not dss_idx or not crop_name or not image_path:
        print("No pending prediction requests found.")
        return None

    # 이미지 예측 수행
    predicted_label, disease_name = predict_image(image_path, crop_name)
    
    # 데이터베이스 연결
    connection = db_con()
    cursor = connection.cursor()

    try:
        # 예측 결과를 SR_DSS 테이블에 업데이트
        query = """
        UPDATE SR_DSS
        SET DSS_STATE='completed', DSS_DISC=%s, DSS_PREV=%s, DSS_RES=%s
        WHERE DSS_IDX=%s
        """
        cursor.execute(query, (disease_name, predicted_label, f"Prediction label: {predicted_label}", dss_idx))
        connection.commit()

        # 업데이트된 데이터 확인 (옵션)
        cursor.execute("SELECT * FROM SR_DSS WHERE DSS_IDX=%s", (dss_idx,))
        result = cursor.fetchone()
        
        return result

    except pymysql.MySQLError as e:
        print(f"Error while updating database: {e}")
        connection.rollback()
        return None

    finally:
        cursor.close()
        connection.close()
