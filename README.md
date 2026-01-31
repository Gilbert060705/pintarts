python3 -m  venv venv


source venv activate


cd backend/app


pip install -r requirements.txt


docker compose up


python populate_paintings.py


cd ..


uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload


Access the swagger through : 127.0.0.1:8000/docs