# Deploy ProductPath on Streamlit Community Cloud

Streamlit hosts the **Python portal** in this repo (`streamlit_app.py`). The full ProductPath product (Next.js + Fastify API + Postgres) still runs on your machine, Docker, or another host—Streamlit does not replace those services.

## Files

| File | Purpose |
|------|---------|
| `streamlit_app.py` | Main Streamlit entry (set this in Cloud settings) |
| `requirements.txt` | Python dependencies for Cloud |
| `.streamlit/config.toml` | Dark ProductPath OS theme |
| `.streamlit/secrets.toml.example` | Optional secrets template |

## One-time setup on Streamlit Cloud

1. Open [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub.
2. Click **Create app**.
3. Repository: **dheerajmw/ProductPath**, branch **main**.
4. **Main file path:** `streamlit_app.py`
5. **App URL** (optional): e.g. `productpath`.
6. Click **Deploy**.

Streamlit installs packages from `requirements.txt` at the repo root automatically.

## Optional secrets

In the app → **Settings** → **Secrets**, paste (adjust URLs):

```toml
PRODUCTPATH_API_URL = "https://your-api.example.com"
WEB_APP_URL = "https://your-web.example.com"
ADMIN_APP_URL = "https://your-admin.example.com"
GITHUB_REPO = "https://github.com/dheerajmw/ProductPath"
```

Without a public API, the **API status** tab will show that localhost is unreachable from Cloud (expected).

## Local Streamlit dev

```bash
cd ProductPath
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run streamlit_app.py
```

Open http://localhost:8501.

## Full stack (not on Streamlit)

See the root [README.md](../README.md) for `pnpm dev`, database, and seed steps.
