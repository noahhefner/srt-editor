# Build stage
FROM python:3.13.1-slim-bookworm AS builder

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir build pip-tools

RUN pip-compile pyproject.toml

RUN pip install --no-cache-dir -r requirements.txt

RUN python -m build --wheel

# Run stage
FROM python:3.13.1-slim-bookworm AS runner

WORKDIR /app

COPY --from=builder /app/dist/*.whl /app/

RUN pip install --no-cache-dir /app/*.whl waitress

EXPOSE 8080

CMD ["waitress-serve", "--call", "srt_editor:create_app"]
