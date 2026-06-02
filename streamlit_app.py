"""
ProductPath — Streamlit portal (Streamlit Community Cloud).

Deploy: connect https://github.com/dheerajmw/ProductPath and set main file to streamlit_app.py
See docs/streamlit-deploy.md for full instructions.
"""

from __future__ import annotations

import os
from typing import Any

import requests
import streamlit as st

DEFAULT_GITHUB = "https://github.com/dheerajmw/ProductPath"
DEFAULT_API = "http://localhost:4000"
DEFAULT_WEB = "http://localhost:3000"
DEFAULT_ADMIN = "http://localhost:3001"

PHASES = [
    ("Phase 0", "Auth, sessions, admin RBAC, feature flags"),
    ("Phase 1", "Role roadmaps, learning modules, progress"),
    ("Phase 2", "Timed assessments, scoring, skill gaps"),
    ("Phase 3", "Recommendations from gaps, skill mappings"),
    ("Phase 4", "Proof-of-work projects, reviewer queue"),
    ("Phase 5", "Verification state machine, public profile"),
    ("Phase 6", "Talent marketplace, recruiter search"),
    ("Phase 7", "Community feed and moderation"),
]


def _secret(key: str, default: str = "") -> str:
    try:
        return st.secrets.get(key, default) or default
    except (FileNotFoundError, AttributeError, KeyError):
        return os.environ.get(key, default)


def _inject_css() -> None:
    st.markdown(
        """
        <style>
          .block-container { padding-top: 2rem; max-width: 1100px; }
          .pp-hero {
            padding: 1.5rem 1.75rem;
            border-radius: 1rem;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(22,29,49,0.7);
            margin-bottom: 1.5rem;
          }
          .pp-hero h1 { color: #d8e2ff; margin: 0 0 0.5rem; font-size: 1.75rem; }
          .pp-hero p { color: #c2c6d6; margin: 0; }
          .pp-pill {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            background: rgba(78,222,163,0.15);
            color: #4edea3;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 0.75rem;
          }
        </style>
        """,
        unsafe_allow_html=True,
    )


def _check_api(base_url: str) -> dict[str, Any]:
    url = base_url.rstrip("/") + "/health"
    try:
        res = requests.get(url, timeout=8)
        data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
        return {"ok": res.ok, "status": res.status_code, "data": data}
    except requests.RequestException as exc:
        return {"ok": False, "status": None, "error": str(exc)}


def main() -> None:
    st.set_page_config(
        page_title="ProductPath",
        page_icon="🛤️",
        layout="wide",
        initial_sidebar_state="expanded",
    )
    _inject_css()

    github = _secret("GITHUB_REPO", DEFAULT_GITHUB)
    api_url = _secret("PRODUCTPATH_API_URL", DEFAULT_API)
    web_url = _secret("WEB_APP_URL", DEFAULT_WEB)
    admin_url = _secret("ADMIN_APP_URL", DEFAULT_ADMIN)

    with st.sidebar:
        st.markdown("### ProductPath OS")
        st.caption("Skill-first talent network")
        st.divider()
        st.link_button("GitHub repository", github, use_container_width=True)
        st.link_button("Full web app (local)", web_url, use_container_width=True)
        st.markdown("---")
        st.markdown("**Monorepo services**")
        st.markdown(f"- API: `{api_url}`")
        st.markdown(f"- Web: `{web_url}`")
        st.markdown(f"- Admin: `{admin_url}`")

    st.markdown(
        """
        <div class="pp-hero">
          <span class="pp-pill">Streamlit portal</span>
          <h1>ProductPath</h1>
          <p>The trusted network for product talent — learn, assess, verify, and connect.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    tab_home, tab_platform, tab_api, tab_deploy = st.tabs(
        ["Overview", "Platform", "API status", "Deploy"]
    )

    with tab_home:
        st.subheader("Problem")
        st.markdown(
            """
            Hiring still rewards resumes and pedigree over **demonstrated product capability**.
            ProductPath connects structured learning, assessments, proof-of-work, and verification
            so candidates earn trust and recruiters discover interview-ready talent.
            """
        )
        st.subheader("Who it's for")
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### Candidates")
            st.markdown(
                "- Role roadmaps and modules  \n"
                "- Skill assessments and gaps  \n"
                "- Projects and verification badge  \n"
                "- Opt-in recruiter discovery"
            )
        with col2:
            st.markdown("#### Recruiters")
            st.markdown(
                "- Search verified candidates  \n"
                "- Interest requests  \n"
                "- Performance signals vs keywords"
            )

    with tab_platform:
        st.subheader("Implementation phases")
        for name, desc in PHASES:
            with st.expander(name, expanded=False):
                st.write(desc)
        st.info(
            "The production UI is the **Next.js** app in `apps/web`. "
            "This Streamlit app is a lightweight portal for demos and API health checks."
        )

    with tab_api:
        st.subheader("API health check")
        st.caption(f"Checking `{api_url.rstrip('/')}/health`")
        if st.button("Run health check", type="primary"):
            with st.spinner("Contacting API…"):
                result = _check_api(api_url)
            if result.get("ok"):
                st.success(f"API reachable (HTTP {result['status']})")
                if result.get("data"):
                    st.json(result["data"])
            else:
                st.warning(
                    "API not reachable from Streamlit Cloud. "
                    "Deploy `apps/api` separately and set `PRODUCTPATH_API_URL` in Streamlit secrets."
                )
                if result.get("error"):
                    st.code(result["error"])
                elif result.get("status") is not None:
                    st.code(f"HTTP {result['status']}")

    with tab_deploy:
        st.subheader("Run the full stack locally")
        st.code(
            """pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev""",
            language="bash",
        )
        st.markdown("| Service | URL |")
        st.markdown("| --- | --- |")
        st.markdown(f"| Web | {web_url} |")
        st.markdown(f"| API | {api_url} |")
        st.markdown(f"| Admin | {admin_url} |")
        st.subheader("Streamlit Community Cloud")
        st.markdown(
            f"""
1. Go to [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub.
2. **New app** → Repository: `dheerajmw/ProductPath`, branch `main`.
3. **Main file path:** `streamlit_app.py`
4. Deploy. Optional: add secrets from `.streamlit/secrets.toml.example`.
5. For API health from the cloud, host the API publicly and set `PRODUCTPATH_API_URL`.

Details: `docs/streamlit-deploy.md` in the repo.
            """
        )


if __name__ == "__main__":
    main()
