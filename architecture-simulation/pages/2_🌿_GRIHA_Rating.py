import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

st.set_page_config(page_title="GRIHA Rating Calculator", page_icon="🌿", layout="wide")

# ── GRIHA Criteria ────────────────────────────────────────────────────────────
# Simplified 100-point system based on GRIHA V.2019 categories
CRITERIA = [
    # (id, category, criterion, max_pts, description, guidance)
    # Section 1: Site Planning (20 pts)
    ("S1",  "Site Planning", "Brownfield or infill site", 4,
     "Project on a brownfield, previously developed, or infill urban site.",
     "Avoids greenfield land consumption. Check municipal land-use records."),
    ("S2",  "Site Planning", "Proximity to public transport", 4,
     "Site within 500 m of bus stop / 1 km of metro or rail station.",
     "Reduces private vehicle use. Verify with local transport authority maps."),
    ("S3",  "Site Planning", "Preservation of on-site ecology", 4,
     "Retains existing mature trees (girth >600 mm) and significant topography.",
     "Tree survey required. Transplantation only as last resort."),
    ("S4",  "Site Planning", "Stormwater management & permeable surfaces", 4,
     ">30% of hard landscape is permeable or drains to recharge pit.",
     "Use gravel, grass pavers, or rain gardens. Prepare drainage layout."),
    ("S5",  "Site Planning", "Universal accessibility (NBC Part 3)", 4,
     "Ramps, tactile paths, accessible toilets, and signage for all users.",
     "Follow NBC 2016 Part 3 Chapter 4 and the Rights of Persons with Disabilities Act 2016."),

    # Section 2: Building Design (30 pts)
    ("B1",  "Building Design", "Optimal building orientation (E–W elongation)", 5,
     "Longer facade faces N/S (±15°). Minimises E and W solar exposure.",
     "Check site plan. N–S orientation reduces cooling loads by 15–25% in most Indian climates."),
    ("B2",  "Building Design", "Window-to-Wall Ratio (WWR) compliance", 5,
     "WWR ≤ 40% on N/S, ≤ 20% on E/W for composite and hot-dry zones.",
     "Calculate: (Window area / Gross wall area) × 100 per facade."),
    ("B3",  "Building Design", "Shading devices on all E, W, and S openings", 5,
     "Chajjas, fins, louvres, or jalis on all non-north glazing.",
     "Overhang depth ≥ 0.6 × window height for S facade in most Indian latitudes."),
    ("B4",  "Building Design", "Adequate daylighting (75% of occupied spaces)", 5,
     "≥75% of regularly occupied floor area achieves daylight factor ≥1%.",
     "Use Dialux or VELUX Daylight Visualizer. Document with plan showing daylit zones."),
    ("B5",  "Building Design", "On-site renewable energy (solar PV or thermal)", 5,
     "On-site renewables meet ≥5% of total building energy demand.",
     "Solar PV at 1 kWp ≈ 1200–1500 kWh/yr in most Indian locations. Roof area check needed."),
    ("B6",  "Building Design", "Energy Performance Index (EPI) compliance", 5,
     "Design EPI ≤ 80% of ECBC baseline for the building type.",
     "Requires energy simulation (EnergyPlus/eQUEST) or ECBC Compliance Form."),

    # Section 3: Water Management (25 pts)
    ("W1",  "Water Management", "Rainwater harvesting system", 5,
     "System designed to capture and store ≥50% of annual site rainfall runoff.",
     "Size tank = (Roof area × annual rainfall × 0.80) / 2. Provide overflow to recharge pit."),
    ("W2",  "Water Management", "Water-efficient plumbing fixtures", 5,
     "All taps ≤8 L/min, showers ≤10 L/min, dual-flush toilets (3/6 L).",
     "Specify BIS or WaterSense–equivalent rated fixtures. Saves 30–50% water."),
    ("W3",  "Water Management", "Wastewater treatment and reuse", 5,
     "On-site STP treating ≥80% of wastewater; treated water reused for flushing/irrigation.",
     "MBR or MBBR systems suitable for most institutional and residential projects."),
    ("W4",  "Water Management", "Groundwater recharge", 5,
     "Recharge pits / percolation wells receiving surface runoff from >20% of site area.",
     "Minimum 1 recharge pit per 500 m² impermeable area. Soil percolation test required."),
    ("W5",  "Water Management", "Water metering and leak detection", 5,
     "Sub-metering at each floor/zone with automated leak detection alert.",
     "Smart meters and BMS integration enable data-driven water management."),

    # Section 4: Materials (15 pts)
    ("M1",  "Materials", "Local materials sourced within 500 km", 5,
     "≥30% of total material cost from sources within 500 km of site.",
     "List material suppliers and distances. Reduces embodied transport carbon significantly."),
    ("M2",  "Materials", "Use of fly-ash or AAC blocks (industrial by-products)", 5,
     "≥20% of masonry by volume uses fly-ash bricks, AAC, or similar industrial by-products.",
     "Fly-ash bricks meet IS 12894. AAC meets IS 2185 Part 4. Both reduce embodied energy."),
    ("M3",  "Materials", "Low-VOC paints, adhesives, and sealants", 5,
     "All interior paints VOC <50 g/L; adhesives/sealants meet GRIHA VOC limits.",
     "Specify low-VOC products during tender. Maintain product data sheets."),

    # Section 5: Indoor Environment (5 pts)
    ("I1",  "Indoor Environment", "Thermal comfort in regularly occupied spaces", 3,
     "Maintains comfort for ≥95% of occupied hours without mechanical cooling in temperate/composite zones.",
     "Dynamic thermal simulation or CBE Comfort Tool analysis required."),
    ("I2",  "Indoor Environment", "Post-occupancy indoor air quality monitoring", 2,
     "CO₂ sensors and PM2.5 monitors in occupied spaces with real-time display.",
     "Sensors with BMS integration enable data logging for occupant health."),

    # Section 6: Waste Management (5 pts)
    ("WS1", "Waste Management", "Segregated waste collection stations", 3,
     "Minimum 3-bin system (wet/dry/e-waste) at each floor level.",
     "Comply with Solid Waste Management Rules 2016 and local ULB requirements."),
    ("WS2", "Waste Management", "Organic/food waste composting", 2,
     "On-site composting or biogas unit for food and landscape waste.",
     "Aerobic composting bin at ground level or vermicomposting unit. Compost used on site."),
]

MAX_TOTAL = sum(c[3] for c in CRITERIA)

STAR_THRESHOLDS = [
    (1, 25, "1 Star"),
    (2, 40, "2 Stars"),
    (3, 55, "3 Stars"),
    (4, 70, "4 Stars"),
    (5, 85, "5 Stars"),
]

CATEGORY_COLORS = {
    "Site Planning":      "#4A7C59",
    "Building Design":    "#C4420A",
    "Water Management":   "#0077B6",
    "Materials":          "#7B2D8B",
    "Indoor Environment": "#E8923A",
    "Waste Management":   "#2D9E51",
}

# ── Page style ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
.pg-header{background:linear-gradient(135deg,#1A4D2E,#2D9E51,#52B788);
 padding:1.4rem 2rem;border-radius:12px;color:white;margin-bottom:1.2rem;}
.pg-header h1{margin:0 0 0.2rem;font-size:1.9rem;}
.pg-header p{margin:0;opacity:0.85;font-size:0.9rem;}
.cat-header{font-weight:700;font-size:1rem;padding:0.5rem 0.8rem;border-radius:6px;
 color:white;margin:1rem 0 0.4rem;}
.crit-row{background:white;border-radius:6px;padding:0.6rem 0.8rem;margin-bottom:0.4rem;
 box-shadow:0 1px 4px rgba(0,0,0,0.07);}
.score-badge{font-size:2.8rem;font-weight:800;text-align:center;}
.star{font-size:2rem;}
.rec{background:#FFFBF0;border-left:4px solid #E8923A;
 padding:0.6rem 0.9rem;border-radius:6px;font-size:0.85rem;margin-bottom:0.3rem;}
</style>
<div class="pg-header">
  <h1>🌿 GRIHA Rating Calculator</h1>
  <p>GRIHA V.2019 — Green Rating for Integrated Habitat Assessment · India's national green building rating system · 24 criteria · 100 points</p>
</div>
""", unsafe_allow_html=True)

st.info("Award points for each criterion based on your project's design decisions. The star rating updates in real-time.")

# ── Project Info ──────────────────────────────────────────────────────────────
with st.expander("📋 Project Details (optional)", expanded=False):
    pc1, pc2, pc3 = st.columns(3)
    with pc1:
        proj_name = st.text_input("Project Name", placeholder="e.g., Green Student Hostel")
    with pc2:
        proj_type = st.selectbox("Building Type", ["Residential", "Institutional / Educational",
                                                     "Commercial / Office", "Healthcare", "Mixed Use"])
    with pc3:
        proj_area = st.number_input("Built-up Area (m²)", min_value=100, value=2000, step=100)

# ── Scoring UI ────────────────────────────────────────────────────────────────
st.markdown("### 📝 Evaluate Your Project")
scores = {}
categories = [c[1] for c in CRITERIA]
unique_cats = list(dict.fromkeys(categories))

for cat in unique_cats:
    cat_criteria = [c for c in CRITERIA if c[1] == cat]
    cat_max = sum(c[3] for c in cat_criteria)
    color = CATEGORY_COLORS[cat]
    st.markdown(
        f'<div class="cat-header" style="background:{color};">'
        f'{cat} <span style="font-weight:400;font-size:0.85rem;">(max {cat_max} pts)</span></div>',
        unsafe_allow_html=True)

    for cid, _, crit_name, max_pts, desc, guidance in cat_criteria:
        with st.container():
            r1, r2 = st.columns([5, 2])
            with r1:
                st.markdown(f"**{crit_name}**")
                st.caption(desc)
                with st.expander("📌 Guidance"):
                    st.markdown(guidance)
            with r2:
                scores[cid] = st.slider(f"Points (max {max_pts})",
                                         0, max_pts, 0, key=f"score_{cid}",
                                         label_visibility="collapsed")
                st.caption(f"{scores[cid]}/{max_pts} pts")
        st.divider()

# ── Live Score & Rating ───────────────────────────────────────────────────────
total = sum(scores.values())
pct = (total / MAX_TOTAL) * 100

# Star rating
stars = 0
for s, threshold, _ in STAR_THRESHOLDS:
    if total >= threshold:
        stars = s
star_label = next((lbl for s, thr, lbl in STAR_THRESHOLDS if s == stars), "Not Rated")

# Colours
color_map = {0: "#aaa", 1: "#E8923A", 2: "#F4A261", 3: "#FFBF69", 4: "#90BE6D", 5: "#43AA8B"}
badge_color = color_map.get(stars, "#aaa")

st.markdown("---")
st.markdown("## 📊 Your GRIHA Score")

sc1, sc2, sc3 = st.columns([1, 1, 2])
with sc1:
    st.markdown(
        f'<div style="background:{badge_color};border-radius:12px;padding:1.5rem;text-align:center;">'
        f'<div class="score-badge" style="color:white;">{total}</div>'
        f'<div style="color:white;font-size:0.9rem;font-weight:600;">out of {MAX_TOTAL} points</div>'
        f'</div>', unsafe_allow_html=True)
with sc2:
    star_str = "⭐" * stars + "☆" * (5 - stars)
    st.markdown(
        f'<div style="background:white;border:3px solid {badge_color};border-radius:12px;'
        f'padding:1.5rem;text-align:center;">'
        f'<div class="star">{star_str}</div>'
        f'<div style="color:{badge_color};font-weight:700;font-size:1rem;">{star_label}</div>'
        f'<div style="color:#666;font-size:0.8rem;margin-top:0.3rem;">GRIHA Rating</div>'
        f'</div>', unsafe_allow_html=True)
with sc3:
    # Progress toward next star
    next_star_data = [(s, thr, lbl) for s, thr, lbl in STAR_THRESHOLDS if thr > total]
    if next_star_data:
        next_s, next_thr, next_lbl = next_star_data[0]
        needed = next_thr - total
        st.markdown(f"**{needed} more points needed for {next_lbl}**")
    else:
        st.markdown("**Maximum GRIHA rating achieved! 🏆**")
    # Progress bar for each category
    for cat in unique_cats:
        cat_criteria = [c for c in CRITERIA if c[1] == cat]
        cat_max = sum(c[3] for c in cat_criteria)
        cat_score = sum(scores[c[0]] for c in cat_criteria)
        frac = cat_score / cat_max if cat_max else 0
        color = CATEGORY_COLORS[cat]
        st.markdown(
            f'<div style="display:flex;align-items:center;margin-bottom:4px;">'
            f'<span style="width:160px;font-size:0.78rem;color:#444">{cat}</span>'
            f'<div style="flex:1;background:#eee;border-radius:4px;height:10px;">'
            f'<div style="width:{frac*100:.0f}%;background:{color};height:10px;border-radius:4px;"></div>'
            f'</div>'
            f'<span style="width:55px;text-align:right;font-size:0.78rem;color:#666">{cat_score}/{cat_max}</span>'
            f'</div>', unsafe_allow_html=True)

# Radar chart
cat_scores = []
cat_maxes = []
for cat in unique_cats:
    cc = [c for c in CRITERIA if c[1] == cat]
    cat_scores.append(sum(scores[c[0]] for c in cc))
    cat_maxes.append(sum(c[3] for c in cc))
cat_pcts = [s / m * 100 if m else 0 for s, m in zip(cat_scores, cat_maxes)]

fig_radar = go.Figure(go.Scatterpolar(
    r=cat_pcts + [cat_pcts[0]],
    theta=unique_cats + [unique_cats[0]],
    fill="toself", fillcolor="rgba(45,158,81,0.2)",
    line=dict(color="#2D9E51", width=2),
    name="Score %",
))
fig_radar.add_trace(go.Scatterpolar(
    r=[100] * (len(unique_cats) + 1),
    theta=unique_cats + [unique_cats[0]],
    fill=None, line=dict(color="#ddd", dash="dot"), name="Max"
))
fig_radar.update_layout(
    polar=dict(radialaxis=dict(visible=True, range=[0, 100], ticksuffix="%")),
    showlegend=False, height=380,
    title="Score by Category (%)"
)
st.plotly_chart(fig_radar, use_container_width=True)

# ── Rating thresholds table ───────────────────────────────────────────────────
st.markdown("### 🏆 GRIHA Star Thresholds")
thr_df = pd.DataFrame([
    {"Rating": "⭐" * s + "☆" * (5 - s), "Label": lbl,
     "Minimum Points": thr, "% of Max": f"{thr/MAX_TOTAL*100:.0f}%",
     "Your Status": "✅ Achieved" if total >= thr else f"Need {thr - total} more pts"}
    for s, thr, lbl in STAR_THRESHOLDS
])
st.dataframe(thr_df, use_container_width=True, hide_index=True)

# ── Recommendations ───────────────────────────────────────────────────────────
st.markdown("### 💡 Improvement Recommendations")
zero_criteria = [(cid, crit_name, max_pts, cat) for cid, cat, crit_name, max_pts, *_ in CRITERIA if scores[cid] == 0]
if zero_criteria:
    st.markdown("**Criteria scoring 0 points — highest impact opportunities:**")
    zero_criteria_sorted = sorted(zero_criteria, key=lambda x: -x[2])
    for cid, crit_name, max_pts, cat in zero_criteria_sorted[:5]:
        next_thresholds = [thr for s, thr, l in STAR_THRESHOLDS if thr > total]
        next_threshold = next_thresholds[0] if next_thresholds else 999
        impact = "unlock the next star rating" if (total + max_pts) >= next_threshold else "significantly improve your score"
        st.markdown(
            f'<div class="rec">🔧 <strong>{crit_name}</strong> ({cat}) — '
            f'Worth up to <strong>{max_pts} pts</strong>. Addressing this criterion could {impact}.</div>',
            unsafe_allow_html=True)
else:
    st.success("All criteria scored! Excellent — review if any scores can be increased further.")

# ── Export ────────────────────────────────────────────────────────────────────
st.markdown("---")
if st.button("📥 Download Score Summary (CSV)"):
    rows = []
    for cid, cat, crit_name, max_pts, desc, _ in CRITERIA:
        rows.append({"ID": cid, "Category": cat, "Criterion": crit_name,
                     "Score": scores[cid], "Max": max_pts, "Description": desc})
    rows.append({"ID": "TOTAL", "Category": "—", "Criterion": "Total Score",
                 "Score": total, "Max": MAX_TOTAL, "Description": f"{stars}-star rating"})
    export_df = pd.DataFrame(rows)
    st.download_button("⬇️ Download CSV", export_df.to_csv(index=False),
                       file_name="griha_score.csv", mime="text/csv")

with st.expander("ℹ️ About GRIHA"):
    st.markdown("""
**GRIHA (Green Rating for Integrated Habitat Assessment)** is India's national green building rating system,
developed by TERI and administered by the GRIHA Council under the Ministry of New & Renewable Energy.

It is specifically designed for the Indian context — climate, materials, regulations, and socioeconomic conditions.

**Key difference from LEED/BREEAM:**
- GRIHA evaluates buildings against the *Indian* NBC and ECBC baseline
- Emphasis on passive design and climate-responsive architecture
- Considers Indian material supply chains and local labour practices
- Mandatory criteria ensure a minimum performance level before points are counted

**Mandatory Criteria** (not included in this simplified calculator):
- Metered energy and water consumption
- No use of Ozone Depleting Substances (ODS)
- Tobacco Smoke Control

*This calculator uses a simplified 100-point version for educational purposes.*
*For professional GRIHA certification, consult the GRIHA Council (www.grihaindia.org).*
    """)
