import streamlit as st

st.set_page_config(
    page_title="Arch-India | Architecture Education Platform",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Styling ──────────────────────────────────────────────────────────────────
st.markdown("""
<style>
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #1A0800 0%, #2D1000 100%);
}
[data-testid="stSidebar"] * { color: #F4E4D0 !important; }
[data-testid="stSidebar"] .stButton button {
    background: #D4520A; color: white !important; border: none;
    border-radius: 6px; width: 100%;
}
.hero {
    background: linear-gradient(135deg, #6B1010 0%, #C4420A 55%, #E8923A 100%);
    padding: 2.5rem 2rem; border-radius: 16px; color: white;
    text-align: center; margin-bottom: 1.5rem;
    box-shadow: 0 8px 32px rgba(100,20,0,0.35);
}
.hero h1 { font-size: 2.8rem; font-weight: 800; margin: 0 0 0.3rem; letter-spacing: -1px; }
.hero p  { opacity: 0.88; font-size: 1.05rem; margin: 0; }
.stat { background: white; border-radius: 10px; padding: 1rem 0.5rem;
        text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
.stat h2 { color: #C4420A; font-size: 2.2rem; margin: 0; }
.stat p  { color: #666; font-size: 0.78rem; margin: 0.2rem 0 0; }
.card {
    background: white; border-left: 5px solid #C4420A; border-radius: 8px;
    padding: 1.2rem 1.4rem; margin-bottom: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.07);
}
.card h4 { color: #6B1010; margin: 0 0 0.4rem; font-size: 1rem; }
.card p  { color: #555; font-size: 0.85rem; margin: 0; line-height: 1.5; }
.card .tag { color: #C4420A; font-weight: 600; font-size: 0.8rem; margin-top: 0.6rem; display: block; }
.divider { border-top: 3px solid #E8923A; margin: 1.5rem 0; }
.footer { text-align: center; color: #aaa; font-size: 0.78rem;
          padding: 2rem 0 0.5rem; border-top: 1px solid #eee; margin-top: 3rem; }
</style>
""", unsafe_allow_html=True)

# ── Sidebar: Student Profile ──────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🏛️ Arch-India")
    st.markdown("---")
    st.markdown("### 👤 Student Profile")

    if "profile" not in st.session_state:
        st.session_state.profile = {"name": "", "institution": "", "year": "2nd Year B.Arch"}

    name = st.text_input("Full Name", value=st.session_state.profile["name"],
                          placeholder="e.g., Meera Krishnan")
    institution = st.text_input("Institution", value=st.session_state.profile["institution"],
                                  placeholder="e.g., CEPT University")
    year_options = [
        "1st Year B.Arch", "2nd Year B.Arch", "3rd Year B.Arch",
        "4th Year B.Arch", "5th Year B.Arch",
        "M.Arch Student", "Ph.D Scholar", "Faculty",
    ]
    year = st.selectbox("Year of Study", year_options,
                         index=year_options.index(
                             st.session_state.profile.get("year", "2nd Year B.Arch")))
    if st.button("💾 Save Profile"):
        st.session_state.profile = {"name": name, "institution": institution, "year": year}
        st.success("Profile saved!")

    st.markdown("---")
    st.markdown("### 📚 Modules")
    st.markdown("""
- 🌡️ Climate Zones
- 🌿 GRIHA Rating
- 📐 NBC Compliance
- 🏘️ Vernacular India
- 📏 Space Programming
- 📜 Architecture History
""")
    st.markdown("---")
    st.caption("Built for Indian Architecture Schools · Streamlit + Plotly")

# ── Hero ──────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero">
  <h1>🏛️ Arch-India</h1>
  <p><strong>Interactive Architecture Education Platform for the Indian Context</strong></p>
  <p style="margin-top:0.6rem;opacity:0.75;font-size:0.9rem;">
    Climate Design &nbsp;·&nbsp; GRIHA Green Rating &nbsp;·&nbsp; NBC Regulations &nbsp;·&nbsp;
    Vernacular Traditions &nbsp;·&nbsp; Space Programming &nbsp;·&nbsp; History Timeline
  </p>
</div>
""", unsafe_allow_html=True)

profile = st.session_state.profile
if profile.get("name"):
    st.success(
        f"Welcome, **{profile['name']}** ({profile['year']}"
        + (f" · {profile['institution']}" if profile.get("institution") else "")
        + ")! Use the sidebar to navigate between modules."
    )
else:
    st.info("👈 Enter your profile in the sidebar, then explore the modules below.")

# ── Stats row ─────────────────────────────────────────────────────────────────
c1, c2, c3, c4, c5, c6 = st.columns(6)
stats = [
    ("6", "Climate Zones"),
    ("20+", "Indian Cities"),
    ("100 pts", "GRIHA Score"),
    ("12+", "Vernacular Traditions"),
    ("10+", "Building Typologies"),
    ("5000+ yrs", "Architecture History"),
]
for col, (num, label) in zip([c1, c2, c3, c4, c5, c6], stats):
    with col:
        st.markdown(f'<div class="stat"><h2>{num}</h2><p>{label}</p></div>', unsafe_allow_html=True)

# ── Module Cards ──────────────────────────────────────────────────────────────
st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
st.markdown("## 🗺️ Explore Modules")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("""
    <div class="card">
      <h4>🌡️ Climate-Responsive Design</h4>
      <p>Analyse monthly climate data for 20+ Indian cities across all 6 BEE climate zones.
         Get passive design strategy recommendations and solar angle calculations for your project site.</p>
      <span class="tag">→ Use Case: Site Analysis · Climate Design Studio</span>
    </div>
    <div class="card">
      <h4>🏘️ Vernacular Architecture of India</h4>
      <p>Explore 12 regional vernacular traditions — from Rajasthani havelis to Kerala nalukettu.
         Understand climate response, material systems, and spatial organisation.</p>
      <span class="tag">→ Use Case: History & Theory · Design Inspiration</span>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="card">
      <h4>🌿 GRIHA Rating Calculator</h4>
      <p>India's national green building rating system (GRIHA V.2019). Evaluate your project
         against 24 criteria across 6 categories and see your real-time star rating.</p>
      <span class="tag">→ Use Case: Sustainable Design · Professional Practice</span>
    </div>
    <div class="card">
      <h4>📏 Space Programming Tool</h4>
      <p>Calculate required areas for 10+ building typologies using NBC 2016 space standards.
         Generate a complete space program table for your design project.</p>
      <span class="tag">→ Use Case: Design Development · Building Programme</span>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div class="card">
      <h4>📐 NBC Compliance Checker</h4>
      <p>Verify building parameters against the National Building Code of India 2016.
         Calculate allowable FAR, ground coverage, setbacks, parking, and occupancy loads.</p>
      <span class="tag">→ Use Case: Professional Practice · Building Regulation</span>
    </div>
    <div class="card">
      <h4>📜 History of Indian Architecture</h4>
      <p>Interactive timeline spanning 5000 years — from the Indus Valley Civilisation to
         contemporary Indian architecture. Compare styles, periods, and monuments.</p>
      <span class="tag">→ Use Case: History & Theory · Architectural Appreciation</span>
    </div>
    """, unsafe_allow_html=True)

# ── Learning Outcomes ─────────────────────────────────────────────────────────
st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
st.markdown("## 🎓 Learning Outcomes")

co1, co2 = st.columns(2)
with co1:
    st.markdown("**For B.Arch & M.Arch Students**")
    outcomes_students = [
        "Understand India's diverse climate zones and their design implications",
        "Apply GRIHA green building criteria to project proposals",
        "Read and navigate National Building Code requirements confidently",
        "Appreciate regional vernacular wisdom and its relevance to contemporary design",
        "Calculate space programs for common Indian building typologies",
        "Place contemporary Indian architecture within its historical trajectory",
    ]
    for o in outcomes_students:
        st.markdown(f"- {o}")

with co2:
    st.markdown("**For Faculty & Design Studios**")
    outcomes_faculty = [
        "Demonstrate climate analysis visually with real city data",
        "Run GRIHA rating exercises as studio crits or assessment tools",
        "Teach NBC regulations with live calculations — not just reading the code",
        "Compare vernacular traditions across regions for theory courses",
        "Generate space program briefs for student design projects",
        "Provide historical context for contemporary Indian architectural discourse",
    ]
    for o in outcomes_faculty:
        st.markdown(f"- {o}")

# ── How to Use ────────────────────────────────────────────────────────────────
with st.expander("📖 How to Use This Platform"):
    st.markdown("""
1. **Enter your profile** in the left sidebar (name, institution, year of study).
2. **Navigate** using the sidebar links — each module is a standalone interactive tool.
3. **Explore** data, run calculations, and check design decisions.
4. **Apply** the design checklists and insights to your studio project.
5. **Download** tables and results where available (CSV export buttons).

**Technical Note:** This platform runs entirely in the browser via Streamlit.
All data (climate, NBC, GRIHA criteria) is embedded from official Indian standards sources.
Your profile and session data are stored locally in your browser session.
    """)

# ── Footer ────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="footer">
  🏛️ Arch-India · An open educational resource for Indian Architecture Schools<br>
  Data: NBC 2016 · BEE Climate Zones · GRIHA V.2019 · IMD Climate Normals · INTACH Documentation<br>
  Built with Streamlit &amp; Plotly · Hosted on Hugging Face Spaces
</div>
""", unsafe_allow_html=True)
