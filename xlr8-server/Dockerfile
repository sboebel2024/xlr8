FROM python:3.9-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY requirements.txt requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 5000

CMD ["python", "run.py"]