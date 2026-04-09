import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import math

st.set_page_config(page_title="Space Programming Tool", page_icon="📏", layout="wide")

# ── Space Standards Data (NBC 2016 + educational norms) ───────────────────────

TYPOLOGIES = {
    "🏫 School (Primary/Secondary)": {
        "description": "As per NBC 2016 Part 3 and CBSE/UDISE norms. Typically on plots of 2000–15000 m².",
        "inputs": [
            {"key": "classrooms", "label": "Number of Classrooms", "default": 20, "min": 4, "max": 100, "unit": "rooms"},
            {"key": "students", "label": "Total Student Enrollment", "default": 600, "min": 50, "max": 3000, "unit": "students"},
            {"key": "staff", "label": "Number of Teaching + Non-Teaching Staff", "default": 40, "min": 5, "max": 200, "unit": "persons"},
        ],
        "spaces": [
            # (name, area_per_unit, unit, multiplier_key, nbc_ref)
            ("Standard Classroom (9m × 6m)", 54, "per classroom", "classrooms", "NBC Part 3, CBSE norms"),
            ("Laboratory (Science/Computer)", 72, "per 2 classrooms", "classrooms_half", "NBC Part 3"),
            ("Library / Resource Centre", 90, "fixed min", "one", "CBSE: min 90 m²"),
            ("Principal's Office + Reception", 30, "fixed", "one", "NBC Part 3"),
            ("Staff Room + Common Room", 4, "per staff member", "staff", "NBC Part 3"),
            ("Headmaster / HOD Offices", 14, "per 10 staff (min 2)", "staff_per10", "NBC Part 3"),
            ("Assembly Hall / Multi-purpose", 0.8, "per student", "students", "NBC Part 3 (0.7–1.0 m²/student)"),
            ("Canteen / Dining (60% students/session)", 0.9, "per student (60%)", "students_60pct", "1.2–1.5 m²/seat"),
            ("Infirmary / Medical Room", 20, "fixed", "one", "CBSE mandatory"),
            ("Toilet Block – Boys (1 WC per 40 boys)", 3.5, "per WC (incl cubicle + wash)", "boys_wc", "NBC Part 4"),
            ("Toilet Block – Girls (1 WC per 25 girls)", 3.5, "per WC (incl cubicle + wash)", "girls_wc", "NBC Part 4"),
            ("Staff Toilets (1 per 15 staff)", 4, "per WC", "staff_wc", "NBC Part 4"),
            ("Corridor / Circulation (20% of floor area)", 0, "20% of above", "circulation", "NBC Part 3"),
            ("Staircase Block", 20, "per staircase (assume 1/wing)", "one", "NBC Part 4"),
        ],
        "plot_norms": "NBC: Min 2500 m² for schools up to 240 students. CBSE: 0.4–1.6 ha depending on enrollment.",
        "far": 1.75, "max_gc": 40,
    },

    "🏥 Primary Health Centre (PHC)": {
        "description": "Government PHC as per NHM/IPHS norms. Serves 30,000 population. Standard 6-bed unit.",
        "inputs": [
            {"key": "beds", "label": "Number of In-patient Beds", "default": 6, "min": 4, "max": 30, "unit": "beds"},
            {"key": "opd_daily", "label": "Daily OPD Attendance (patients)", "default": 80, "min": 20, "max": 300, "unit": "patients/day"},
            {"key": "staff", "label": "Total Staff (doctors + nurses + support)", "default": 14, "min": 5, "max": 60, "unit": "persons"},
        ],
        "spaces": [
            ("OPD Waiting Area", 1.5, "per peak-hour patient (30% daily)", "opd_peak", "IPHS: 1.5–2 m²/patient"),
            ("OPD Examination Room", 12, "per examination bay", "one", "Min 3m × 4m per bay"),
            ("General OPD Consultation Room", 14, "fixed", "one", "IPHS PHC norms"),
            ("In-patient Ward (General)", 7.4, "per bed", "beds", "IPHS: 7.4 m²/bed minimum"),
            ("Labour Room", 25, "fixed (1 table + 2 cots)", "one", "IPHS mandatory"),
            ("Operation Theatre (Minor)", 36, "fixed", "one", "6m × 6m minimum"),
            ("Pharmacy / Dispensary", 16, "fixed", "one", "IPHS PHC norms"),
            ("Laboratory", 20, "fixed", "one", "IPHS PHC norms"),
            ("Injection / Dressing Room", 12, "fixed", "one", "IPHS PHC norms"),
            ("Reception / Registration", 10, "fixed", "one", "IPHS PHC norms"),
            ("Staff Duty Room + Toilet", 14, "per duty room (1)", "one", "IPHS PHC norms"),
            ("Store (Medicines / Equipment)", 20, "fixed", "one", "IPHS PHC norms"),
            ("Patient Toilets (1 per 6 beds + OPD)", 4.5, "per WC block", "toilet_blocks", "NBC Part 4"),
            ("Circulation (25% of clinical areas)", 0, "25% of above", "circulation", "Hospital norms"),
        ],
        "plot_norms": "IPHS: Min 0.2–0.4 ha for PHC. Vehicular access for ambulance mandatory.",
        "far": 1.5, "max_gc": 40,
    },

    "🏢 Office Building (Commercial)": {
        "description": "Standard commercial office as per NBC 2016 and BIS 3616. Open plan with support areas.",
        "inputs": [
            {"key": "employees", "label": "Total Employees (design capacity)", "default": 200, "min": 20, "max": 5000, "unit": "persons"},
            {"key": "meeting_rooms", "label": "Number of Meeting Rooms", "default": 8, "min": 1, "max": 50, "unit": "rooms"},
        ],
        "spaces": [
            ("Open Plan Workstations", 8.5, "per employee (NBC: 8.5–11 m²/person)", "employees", "NBC Part 3"),
            ("Private Offices (10% of staff)", 14, "per private office", "pvt_offices", "14–18 m² each"),
            ("Meeting Room (8-seater, 3m × 6m)", 18, "per meeting room", "meeting_rooms", "NBC"),
            ("Boardroom / Presentation Room", 60, "fixed (20 seats)", "one", "NBC"),
            ("Reception / Lobby", 0.5, "per employee", "employees", "NBC Part 3"),
            ("Pantry / Breakout per floor", 12, "per floor (assume 50 emp/floor)", "floors_approx", "NBC"),
            ("Server Room / IT Infra", 20, "fixed (small office)", "one", "TIA-942 guidelines"),
            ("File / Print / Storage Room", 0.5, "per employee", "employees", "NBC Part 3"),
            ("Toilet Block – Male (1 WC per 25 men)", 4, "per WC", "male_wc", "NBC Part 4"),
            ("Toilet Block – Female (1 WC per 15 women)", 4, "per WC", "female_wc", "NBC Part 4"),
            ("Circulation + Lobby (25% net area)", 0, "25% of above", "circulation", "NBC Part 3"),
        ],
        "plot_norms": "City centre: FAR up to 3.5 (varies by city). Parking: 3 ECS per 100 m² GFA.",
        "far": 3.0, "max_gc": 55,
    },

    "🏠 Affordable Housing (Group Housing)": {
        "description": "EWS/LIG/MIG housing as per PMAY / NBC Part 3 norms. Plotted or flatted.",
        "inputs": [
            {"key": "units", "label": "Number of Dwelling Units", "default": 100, "min": 10, "max": 1000, "unit": "DUs"},
            {"key": "unit_size", "label": "Typical Unit Size (carpet area, m²)", "default": 30, "min": 21, "max": 120, "unit": "m²"},
            {"key": "floors", "label": "Number of Floors", "default": 5, "min": 2, "max": 20, "unit": "floors"},
        ],
        "spaces": [
            ("Dwelling Units (carpet area)", 1, "per unit", "unit_area_total", "PMAY min: 21 m² EWS / 30 m² LIG"),
            ("Built-up allowance (15% extra)", 0.15, "of carpet (walls + ducts)", "unit_area_pct", "NBC Part 3"),
            ("Staircase + Lift lobby per floor", 12, "per stair core per floor", "stair_cores_per_floor", "NBC Part 4"),
            ("Common Passage / Corridor per floor", 1.2, "per unit per floor", "units_per_floor", "NBC min 1.2 m wide"),
            ("Terrace / Communal Roof Space", 0.5, "per unit (terrace allocation)", "units", "NBC / local DCR"),
            ("Garbage Room (Ground floor)", 0.5, "per unit", "units", "SWM Rules 2016"),
            ("Pump Room + Electrical Room", 20, "fixed per building", "one", "NBC Part 8"),
            ("Cycle Parking (2 per DU)", 2.0, "per 2 cycles (1m² each)", "units", "NBC Part 3"),
        ],
        "plot_norms": "PMAY: plot size varies by city. Min 2.5m setback for G+4. NBC GC max 55% for residential.",
        "far": 2.5, "max_gc": 55,
    },

    "🏨 Budget Hotel / Hostel": {
        "description": "3-star equivalent hotel or institutional hostel per NBC Part 3 and tourism standards.",
        "inputs": [
            {"key": "rooms", "label": "Number of Guest Rooms", "default": 40, "min": 10, "max": 500, "unit": "rooms"},
            {"key": "restaurant_seats", "label": "Restaurant Seating Capacity", "default": 60, "min": 20, "max": 300, "unit": "seats"},
            {"key": "staff", "label": "Total Staff", "default": 30, "min": 5, "max": 200, "unit": "persons"},
        ],
        "spaces": [
            ("Standard Guest Room (en-suite)", 28, "per room (NBC 3-star min)", "rooms", "NBC 2016: 28–36 m² standard room"),
            ("Suite Rooms (10% of inventory)", 45, "per suite", "suites_10pct", "NBC: 45+ m² for suites"),
            ("Hotel Lobby + Reception", 1.5, "per guest room", "rooms", "NBC Part 3"),
            ("Restaurant + Dining", 1.5, "per seat", "restaurant_seats", "NBC: 1.2–2 m² per seat"),
            ("Commercial Kitchen", 0.4, "per restaurant seat", "restaurant_seats", "40% of dining area"),
            ("Conference Room (1.2 m²/seat)", 40, "fixed (35-seat room)", "one", "NBC Part 3"),
            ("Gymnasium / Recreation", 50, "fixed minimum", "one", "Tourism guidelines"),
            ("Housekeeping / Linen Store", 2, "per 10 rooms", "rooms_per10", "Hotel operations norm"),
            ("Back Office / Staff Facilities", 1.5, "per staff", "staff", "NBC Part 3"),
            ("Utilities (pump, electrical, AC plant)", 5, "per 10 rooms", "rooms_per10", "NBC Part 8"),
            ("Circulation (25% of all above)", 0, "25% of above", "circulation", "NBC Part 3"),
        ],
        "plot_norms": "Tourism Dept: 1 car park per room for 3-star. Min 15 m front setback on highway sites.",
        "far": 2.0, "max_gc": 50,
    },

    "🎭 Community Centre / Cultural Hall": {
        "description": "Neighbourhood-scale community centre or cultural building. Public / Semi-public use.",
        "inputs": [
            {"key": "audience", "label": "Auditorium/Hall Audience Capacity", "default": 300, "min": 50, "max": 2000, "unit": "seats"},
            {"key": "activity_rooms", "label": "Number of Multi-purpose Activity Rooms", "default": 6, "min": 2, "max": 20, "unit": "rooms"},
        ],
        "spaces": [
            ("Main Auditorium / Hall", 0.9, "per seat (including stage area)", "audience", "NBC: 0.7–1.1 m²/seat"),
            ("Stage + Wings + Green Room", 60, "fixed (small stage)", "one", "Stage: 10m wide × 8m deep min"),
            ("Foyer / Pre-function Area", 0.3, "per seat", "audience", "NBC Part 3"),
            ("Multi-purpose Activity Room (9m × 7m)", 63, "per room", "activity_rooms", "NBC: min 30 m² activity room"),
            ("Library / Reading Room (small)", 40, "fixed", "one", "NBC Part 3"),
            ("Administrative Office", 20, "fixed", "one", "NBC Part 3"),
            ("Cafeteria (20% of audience)", 1.2, "per seat", "audience_20pct", "NBC: 1.2–1.5 m²/seat"),
            ("Storage (furniture / AV equipment)", 0.15, "per seat", "audience", "NBC Part 3"),
            ("Toilet Block (1 WC per 50 persons)", 4, "per WC", "audience_wc", "NBC Part 4"),
            ("Circulation + Lobby (30%)", 0, "30% of above", "circulation", "NBC Part 3"),
        ],
        "plot_norms": "NBC: Public/Semi-public FAR 1.5. Min 200 m² open space for outdoor events.",
        "far": 1.5, "max_gc": 40,
    },
}

# ── Style ─────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
.pg-header{background:linear-gradient(135deg,#1B3A4B,#2196A6,#4CC9C0);
 padding:1.4rem 2rem;border-radius:12px;color:white;margin-bottom:1.2rem;}
.pg-header h1{margin:0 0 0.2rem;font-size:1.9rem;}
.pg-header p{margin:0;opacity:0.85;font-size:0.9rem;}
.total-box{background:linear-gradient(135deg,#1B3A4B,#2196A6);color:white;
 border-radius:10px;padding:1.5rem;text-align:center;}
.total-box h2{font-size:2.5rem;margin:0;}
.total-box p{opacity:0.85;margin:0.3rem 0 0;font-size:0.9rem;}
</style>
<div class="pg-header">
  <h1>📏 Space Programming Tool</h1>
  <p>Calculate required areas for common Indian building typologies · Based on NBC 2016 and national institutional norms</p>
</div>
""", unsafe_allow_html=True)

# ── Typology selector ─────────────────────────────────────────────────────────
typology = st.selectbox("Select Building Typology", list(TYPOLOGIES.keys()))
td = TYPOLOGIES[typology]

st.info(td["description"])

# ── Inputs ────────────────────────────────────────────────────────────────────
st.markdown("### 📋 Project Parameters")
input_vals = {}
cols = st.columns(len(td["inputs"]))
for col, inp in zip(cols, td["inputs"]):
    with col:
        input_vals[inp["key"]] = st.number_input(
            f"{inp['label']} ({inp['unit']})", inp["min"], inp["max"], inp["default"])

# ── Derived quantities ─────────────────────────────────────────────────────────
iv = input_vals

def get_multiplier(key, iv):
    """Calculate the multiplier value for a space based on the key code."""
    mapping = {
        "one": 1,
        "classrooms": iv.get("classrooms", 1),
        "classrooms_half": math.ceil(iv.get("classrooms", 1) / 2),
        "students": iv.get("students", 1),
        "students_60pct": math.ceil(iv.get("students", 1) * 0.6),
        "staff": iv.get("staff", 1),
        "staff_per10": max(2, math.ceil(iv.get("staff", 1) / 10)),
        "staff_wc": max(1, math.ceil(iv.get("staff", 1) / 15)),
        "boys_wc": max(2, math.ceil(iv.get("students", 1) * 0.5 / 40)),
        "girls_wc": max(2, math.ceil(iv.get("students", 1) * 0.5 / 25)),
        "beds": iv.get("beds", 1),
        "opd_peak": math.ceil(iv.get("opd_daily", 80) * 0.3),
        "toilet_blocks": max(2, math.ceil(iv.get("beds", 6) / 6) + 1),
        "employees": iv.get("employees", 1),
        "pvt_offices": max(1, math.ceil(iv.get("employees", 1) * 0.1)),
        "meeting_rooms": iv.get("meeting_rooms", 1),
        "floors_approx": max(1, math.ceil(iv.get("employees", 1) / 50)),
        "male_wc": max(1, math.ceil(iv.get("employees", 1) * 0.5 / 25)),
        "female_wc": max(1, math.ceil(iv.get("employees", 1) * 0.5 / 15)),
        "units": iv.get("units", 1),
        "unit_area_total": iv.get("units", 1) * iv.get("unit_size", 30),
        "unit_area_pct": iv.get("units", 1) * iv.get("unit_size", 30) * 0.15,
        "units_per_floor": max(1, math.ceil(iv.get("units", 1) / max(1, iv.get("floors", 5)))),
        "stair_cores_per_floor": max(1, math.ceil(iv.get("units", 1) / max(1, iv.get("floors", 5)) / 20)) * max(1, iv.get("floors", 5)),
        "rooms": iv.get("rooms", 1),
        "suites_10pct": max(1, math.ceil(iv.get("rooms", 1) * 0.1)),
        "rooms_per10": max(1, math.ceil(iv.get("rooms", 1) / 10)),
        "restaurant_seats": iv.get("restaurant_seats", 1),
        "audience": iv.get("audience", 1),
        "audience_20pct": math.ceil(iv.get("audience", 1) * 0.2),
        "audience_wc": max(2, math.ceil(iv.get("audience", 1) / 50)),
        "activity_rooms": iv.get("activity_rooms", 1),
        "circulation": 0,  # handled separately
    }
    return mapping.get(key, 1)

# ── Calculate spaces ──────────────────────────────────────────────────────────
rows = []
total_net = 0
for space_name, area_factor, desc, mult_key, nbc_ref in td["spaces"]:
    if mult_key == "circulation":
        continue  # Handle at end
    multiplier = get_multiplier(mult_key, iv)
    # Special case for unit_area_total and unit_area_pct
    if mult_key == "unit_area_total":
        area = iv.get("units", 1) * iv.get("unit_size", 30)
        qty_label = f"{iv.get('units',1)} DUs"
    elif mult_key == "unit_area_pct":
        area = iv.get("units", 1) * iv.get("unit_size", 30) * 0.15
        qty_label = "15% allowance"
    else:
        area = area_factor * multiplier
        qty_label = f"{multiplier} × {area_factor} m²" if multiplier != 1 else f"{area_factor} m²"

    area = round(area, 1)
    total_net += area
    rows.append({
        "Space": space_name,
        "Qty / Basis": qty_label,
        "Area (m²)": area,
        "NBC / Standard Reference": nbc_ref,
    })

# Circulation
circ_pct = 0.20 if "School" in typology else 0.25 if "PHC" in typology or "Office" in typology or "Hotel" in typology else 0.30
circ_area = round(total_net * circ_pct, 1)
rows.append({
    "Space": f"Circulation, Corridors, Stairs ({int(circ_pct*100)}% of net)",
    "Qty / Basis": f"{int(circ_pct*100)}% of {total_net:.0f} m²",
    "Area (m²)": circ_area,
    "NBC / Standard Reference": "NBC Part 3",
})
total_gfa = total_net + circ_area

# ── Display ───────────────────────────────────────────────────────────────────
st.markdown("---")
result_df = pd.DataFrame(rows)

# Totals row
totals_row = pd.DataFrame([{
    "Space": "🏗️ TOTAL GROSS FLOOR AREA",
    "Qty / Basis": "",
    "Area (m²)": round(total_gfa, 1),
    "NBC / Standard Reference": f"NBC FAR {td['far']} → suggested plot {round(total_gfa/td['far']):.0f} m²",
}])
display_df = pd.concat([result_df, totals_row], ignore_index=True)

st.markdown("### 📊 Space Programme")
st.dataframe(
    display_df.style.apply(
        lambda x: ["background: #E8F5E9; font-weight: bold;" if x.name == len(display_df) - 1 else "" for _ in x],
        axis=1
    ),
    use_container_width=True, hide_index=True
)

# Key metrics
mc1, mc2, mc3, mc4 = st.columns(4)
with mc1:
    st.markdown(f'<div class="total-box"><h2>{total_gfa:,.0f}</h2><p>Total GFA (m²)</p></div>', unsafe_allow_html=True)
with mc2:
    plot_area_needed = round(total_gfa / td["far"])
    st.metric("Suggested Min Plot Area (m²)", f"{plot_area_needed:,}")
with mc3:
    st.metric("FAR / FSI", td["far"])
with mc4:
    footprint = round(plot_area_needed * td["max_gc"] / 100)
    st.metric("Max Building Footprint (m²)", f"{footprint:,}")

# Pie chart of space distribution
fig = px.pie(result_df, values="Area (m²)", names="Space",
             title="Space Distribution (net areas)",
             color_discrete_sequence=px.colors.qualitative.Set3)
fig.update_traces(textposition="inside", textinfo="percent+label", textfont_size=9)
fig.update_layout(showlegend=False, height=500)
st.plotly_chart(fig, use_container_width=True)

# NBC notes
st.info(f"**Plot size guidance:** {td['plot_norms']}")

# ── Export ────────────────────────────────────────────────────────────────────
st.markdown("---")
col1, col2 = st.columns(2)
with col1:
    if st.button("📥 Download Space Programme (CSV)"):
        st.download_button(
            "⬇️ Download CSV", display_df.to_csv(index=False),
            file_name=f"space_programme_{typology.split()[-1].lower()}.csv",
            mime="text/csv")
with col2:
    st.markdown("**How to use this programme in a design studio:**")
    st.markdown("""
1. Enter project parameters above
2. Download the space programme CSV
3. Use as the brief for your design project
4. Check your schematic design areas match the programme
5. Justify any deviations with design reasoning
""")

with st.expander("ℹ️ About Space Programming"):
    st.markdown("""
**Space programming** is the first phase of an architectural design process — before any design begins,
you must know *what* spaces are needed and *how large* they should be.

**Process:**
1. Client brief → understand activities and users
2. NBC / institutional standards → minimum space requirements
3. Space programme → complete area list with justification
4. Bubble diagram → adjacency and relationships
5. Schematic design → translate programme into spatial form

**Indian Standards Used in This Tool:**
- **NBC 2016** (National Building Code) — primary reference for most space standards
- **CBSE norms** — classroom and school space standards
- **IPHS** (Indian Public Health Standards) — PHC and hospital norms
- **NHM guidelines** — healthcare planning
- **PMAY** (Pradhan Mantri Awas Yojana) — affordable housing unit sizes
- **BIS 3616** — office space planning

*All areas are indicative. Always verify with current edition standards and local authority requirements.*
    """)
