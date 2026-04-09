import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import math

st.set_page_config(page_title="NBC Compliance Checker", page_icon="📐", layout="wide")

# ── NBC 2016 Data ─────────────────────────────────────────────────────────────
# (Simplified from NBC Part 3: Development Control Rules)
# Structure: use_zone → {max_far, max_gc_pct, front_setback_m, side_setback_m, rear_setback_m, max_height_m}
NBC_ZONES = {
    "Residential – Low Density (R1)": {
        "max_far": 1.5, "max_gc": 50, "front_set": 3.0, "side_set": 1.5, "rear_set": 3.0,
        "max_ht": 12.5, "occupancy_load_m2": 9.3,
        "parking": {"cars_per_unit": 1, "bikes_per_unit": 2},
        "notes": "Applicable to plotted residential development, bungalows, row houses."
    },
    "Residential – Medium Density (R2)": {
        "max_far": 2.0, "max_gc": 55, "front_set": 4.5, "side_set": 2.0, "rear_set": 3.0,
        "max_ht": 21.0, "occupancy_load_m2": 9.3,
        "parking": {"cars_per_unit": 1, "bikes_per_unit": 2},
        "notes": "Apartments, group housing, flatted developments."
    },
    "Residential – High Density (R3)": {
        "max_far": 3.0, "max_gc": 50, "front_set": 6.0, "side_set": 3.0, "rear_set": 4.5,
        "max_ht": 45.0, "occupancy_load_m2": 9.3,
        "parking": {"cars_per_unit": 1.5, "bikes_per_unit": 2},
        "notes": "High-rise residential towers, Transit Oriented Development (TOD) zones."
    },
    "Commercial – Neighbourhood (C1)": {
        "max_far": 2.0, "max_gc": 60, "front_set": 3.0, "side_set": 1.5, "rear_set": 3.0,
        "max_ht": 15.0, "occupancy_load_m2": 9.3,
        "parking": {"car_per_100m2": 2, "bike_per_100m2": 5},
        "notes": "Local shops, neighbourhood commercial, mixed use."
    },
    "Commercial – District / City Centre (C2)": {
        "max_far": 3.5, "max_gc": 55, "front_set": 6.0, "side_set": 3.0, "rear_set": 4.5,
        "max_ht": 60.0, "occupancy_load_m2": 9.3,
        "parking": {"car_per_100m2": 3, "bike_per_100m2": 5},
        "notes": "Office towers, shopping centres, district commercial."
    },
    "Institutional / Educational": {
        "max_far": 1.75, "max_gc": 40, "front_set": 6.0, "side_set": 3.0, "rear_set": 4.5,
        "max_ht": 21.0, "occupancy_load_m2": 2.8,
        "parking": {"car_per_classrm": 1, "bike_per_classrm": 5},
        "notes": "Schools, colleges, universities, training institutes."
    },
    "Healthcare": {
        "max_far": 1.5, "max_gc": 40, "front_set": 9.0, "side_set": 3.0, "rear_set": 4.5,
        "max_ht": 21.0, "occupancy_load_m2": 22.3,
        "parking": {"car_per_10beds": 2, "bike_per_10beds": 5},
        "notes": "Hospitals, nursing homes, clinics. Ambulance access mandatory."
    },
    "Industrial – Light (I1)": {
        "max_far": 1.0, "max_gc": 60, "front_set": 9.0, "side_set": 4.5, "rear_set": 4.5,
        "max_ht": 15.0, "occupancy_load_m2": 9.3,
        "parking": {"car_per_100m2": 1, "bike_per_100m2": 3},
        "notes": "Light manufacturing, workshops, artisan industries."
    },
    "Public / Semi-Public (Cultural, Civic)": {
        "max_far": 1.5, "max_gc": 40, "front_set": 6.0, "side_set": 3.0, "rear_set": 4.5,
        "max_ht": 18.0, "occupancy_load_m2": 1.4,
        "parking": {"car_per_100m2": 2, "bike_per_100m2": 5},
        "notes": "Govt offices, community centres, cultural institutions, museums."
    },
}

# NBC Occupancy loads (persons/m²) — NBC 2016 Part 4
OCCUPANCY_LOADS = {
    "Assembly / Auditorium (fixed seating)": 0.65,
    "Assembly / Auditorium (movable seating)": 1.4,
    "Classroom": 2.0,
    "Dormitory / Hostel bedroom": 5.6,
    "Exhibition / Museum": 2.8,
    "Hospital patient floor": 22.3,
    "Office (open plan)": 9.3,
    "Residential bedroom": 13.9,
    "Restaurant / Dining": 1.4,
    "Retail / Shop": 3.7,
    "Library reading room": 4.6,
}

# NBC parking norms (simplified from Part 3)
PARKING_NORMS = {
    "Residential (per dwelling unit)": {"cars": 1, "bikes": 2, "note": "< 100 m² DU"},
    "Residential (>100 m² DU)": {"cars": 1.5, "bikes": 2, "note": "Larger units"},
    "Office / Commercial (per 100 m² GFA)": {"cars": 3, "bikes": 5, "note": "City centre"},
    "Office / Commercial – Suburb (per 100 m² GFA)": {"cars": 2, "bikes": 5, "note": ""},
    "Retail / Shopping (per 100 m² GFA)": {"cars": 3, "bikes": 5, "note": ""},
    "Educational (per classroom)": {"cars": 1, "bikes": 5, "note": ""},
    "Hospital (per 10 beds)": {"cars": 2, "bikes": 5, "note": ""},
    "Assembly / Cinema (per 100 seats)": {"cars": 4, "bikes": 10, "note": ""},
}

# ── Style ─────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
.pg-header{background:linear-gradient(135deg,#3D0C02,#8B1A1A,#C4420A);
 padding:1.4rem 2rem;border-radius:12px;color:white;margin-bottom:1.2rem;}
.pg-header h1{margin:0 0 0.2rem;font-size:1.9rem;}
.pg-header p{margin:0;opacity:0.85;font-size:0.9rem;}
.result-ok{background:#E8F5E9;border-left:5px solid #4CAF50;
 padding:0.8rem 1.2rem;border-radius:6px;margin:0.4rem 0;}
.result-fail{background:#FFEBEE;border-left:5px solid #F44336;
 padding:0.8rem 1.2rem;border-radius:6px;margin:0.4rem 0;}
.result-warn{background:#FFF8E1;border-left:5px solid #FFC107;
 padding:0.8rem 1.2rem;border-radius:6px;margin:0.4rem 0;}
.metric-box{background:white;border-radius:8px;padding:1rem;text-align:center;
 box-shadow:0 2px 8px rgba(0,0,0,0.08);}
.metric-box h3{margin:0;font-size:1.8rem;color:#C4420A;}
.metric-box p{margin:0;font-size:0.78rem;color:#666;}
</style>
<div class="pg-header">
  <h1>📐 NBC 2016 Compliance Checker</h1>
  <p>National Building Code of India 2016 · Calculate FAR, setbacks, parking, occupancy loads, and fire egress widths</p>
</div>
""", unsafe_allow_html=True)

tool = st.radio("Select Tool", [
    "🏗️ Building Envelope Calculator (FAR, Height, Setbacks)",
    "🅿️ Parking Calculator",
    "👥 Occupancy Load Calculator",
    "🚪 Exit Width Calculator",
    "📋 NBC Quick Reference",
], horizontal=False)

# ═══════════════════════════════════════════════════════════════════════════════
# TOOL 1: BUILDING ENVELOPE
# ═══════════════════════════════════════════════════════════════════════════════
if "Building Envelope" in tool:
    st.markdown("### 🏗️ Building Envelope Calculator")
    st.caption("Enter your project parameters to check NBC compliance and calculate allowable building envelope.")

    col1, col2 = st.columns(2)
    with col1:
        use_zone = st.selectbox("Use Zone / Occupancy Type", list(NBC_ZONES.keys()))
        plot_area = st.number_input("Plot Area (m²)", min_value=50, value=1000, step=50)
        proposed_gc = st.number_input("Proposed Ground Coverage (m²)", min_value=10,
                                       value=400, step=10)
        num_floors = st.number_input("Number of Floors (above ground)", min_value=1, value=4, step=1)
        typical_floor_ht = st.number_input("Typical Floor-to-Floor Height (m)", min_value=2.5, value=3.2, step=0.1)
        front_road = st.number_input("Abutting Road Width (m)", min_value=3.0, value=9.0, step=0.5)
    with col2:
        proposed_gfa = st.number_input("Proposed Total GFA (m²)", min_value=50, value=1600, step=50)
        front_set = st.number_input("Proposed Front Setback (m)", min_value=0.0, value=4.5, step=0.5)
        side_set = st.number_input("Proposed Side Setbacks (avg, m)", min_value=0.0, value=2.0, step=0.5)
        rear_set = st.number_input("Proposed Rear Setback (m)", min_value=0.0, value=3.0, step=0.5)

    nbc = NBC_ZONES[use_zone]
    max_gc_m2 = plot_area * nbc["max_gc"] / 100
    max_gfa = plot_area * nbc["max_far"]
    proposed_gc_pct = proposed_gc / plot_area * 100
    proposed_far = proposed_gfa / plot_area
    building_ht = num_floors * typical_floor_ht

    # Road-width-based additional height limit (NBC 2016 simplified rule)
    road_ht_limit = front_road * 1.5 + 1.5
    effective_ht_limit = min(nbc["max_ht"], road_ht_limit)

    st.markdown("---")
    st.markdown("### ✅ Compliance Results")

    # FAR
    if proposed_far <= nbc["max_far"]:
        st.markdown(f'<div class="result-ok">✅ <strong>FAR / FSI:</strong> Proposed {proposed_far:.2f} ≤ Max {nbc["max_far"]} — <strong>COMPLIANT</strong><br>'
                    f'<small>Allowable GFA = {max_gfa:,.0f} m² &nbsp;|&nbsp; You have <strong>{max_gfa - proposed_gfa:,.0f} m²</strong> of unused FAR</small></div>',
                    unsafe_allow_html=True)
    else:
        excess = proposed_gfa - max_gfa
        st.markdown(f'<div class="result-fail">❌ <strong>FAR / FSI:</strong> Proposed {proposed_far:.2f} > Max {nbc["max_far"]} — <strong>NON-COMPLIANT</strong><br>'
                    f'<small>Reduce GFA by <strong>{excess:,.0f} m²</strong> to comply. Allowable max = {max_gfa:,.0f} m²</small></div>',
                    unsafe_allow_html=True)

    # Ground Coverage
    if proposed_gc_pct <= nbc["max_gc"]:
        st.markdown(f'<div class="result-ok">✅ <strong>Ground Coverage:</strong> Proposed {proposed_gc_pct:.1f}% ≤ Max {nbc["max_gc"]}% — <strong>COMPLIANT</strong><br>'
                    f'<small>Max footprint = {max_gc_m2:,.0f} m² &nbsp;|&nbsp; Remaining open area = {plot_area - proposed_gc:,.0f} m²</small></div>',
                    unsafe_allow_html=True)
    else:
        st.markdown(f'<div class="result-fail">❌ <strong>Ground Coverage:</strong> Proposed {proposed_gc_pct:.1f}% > Max {nbc["max_gc"]}% — <strong>NON-COMPLIANT</strong><br>'
                    f'<small>Reduce building footprint to max <strong>{max_gc_m2:,.0f} m²</strong></small></div>',
                    unsafe_allow_html=True)

    # Height
    if building_ht <= effective_ht_limit:
        st.markdown(f'<div class="result-ok">✅ <strong>Building Height:</strong> Proposed {building_ht:.1f} m ≤ Max {effective_ht_limit:.1f} m — <strong>COMPLIANT</strong><br>'
                    f'<small>NBC zone limit: {nbc["max_ht"]} m &nbsp;|&nbsp; Road-width limit: {road_ht_limit:.1f} m (governing: {effective_ht_limit:.1f} m)</small></div>',
                    unsafe_allow_html=True)
    else:
        st.markdown(f'<div class="result-fail">❌ <strong>Building Height:</strong> Proposed {building_ht:.1f} m > Max {effective_ht_limit:.1f} m — <strong>NON-COMPLIANT</strong><br>'
                    f'<small>Reduce floor count or floor-to-floor height. Road-width abutment may require wider setbacks for taller buildings.</small></div>',
                    unsafe_allow_html=True)

    # Setbacks
    for label, proposed_s, min_s in [
        ("Front Setback", front_set, nbc["front_set"]),
        ("Side Setback", side_set, nbc["side_set"]),
        ("Rear Setback", rear_set, nbc["rear_set"]),
    ]:
        if proposed_s >= min_s:
            st.markdown(f'<div class="result-ok">✅ <strong>{label}:</strong> {proposed_s} m ≥ Min {min_s} m — <strong>COMPLIANT</strong></div>',
                        unsafe_allow_html=True)
        else:
            deficit = min_s - proposed_s
            st.markdown(f'<div class="result-fail">❌ <strong>{label}:</strong> {proposed_s} m < Min {min_s} m — <strong>NON-COMPLIANT</strong> — Increase by {deficit:.1f} m</div>',
                        unsafe_allow_html=True)

    # Metrics
    st.markdown("---")
    st.markdown("### 📊 Key Metrics")
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(f'<div class="metric-box"><h3>{max_gfa:,.0f}</h3><p>Max Allowable GFA (m²)</p></div>', unsafe_allow_html=True)
    with m2:
        st.markdown(f'<div class="metric-box"><h3>{max_gc_m2:,.0f}</h3><p>Max Ground Coverage (m²)</p></div>', unsafe_allow_html=True)
    with m3:
        st.markdown(f'<div class="metric-box"><h3>{effective_ht_limit:.1f}</h3><p>Max Permissible Height (m)</p></div>', unsafe_allow_html=True)
    with m4:
        open_space = plot_area - proposed_gc
        st.markdown(f'<div class="metric-box"><h3>{open_space:,.0f}</h3><p>Open/Landscaped Area (m²)</p></div>', unsafe_allow_html=True)

    # Envelope visualisation (simple 2D rectangle)
    st.markdown("### 📐 Site Envelope Diagram (Schematic)")
    available_w = math.sqrt(plot_area)  # assume square plot
    available_l = plot_area / available_w
    fig = go.Figure()
    # Plot boundary
    fig.add_shape(type="rect", x0=0, y0=0, x1=available_w, y1=available_l,
                  fillcolor="rgba(200,200,200,0.3)", line=dict(color="#999", width=2))
    # Setback envelope
    bx0 = front_set; bx1 = available_w - side_set
    by0 = rear_set; by1 = available_l - front_set
    fig.add_shape(type="rect", x0=bx0, y0=by0, x1=bx1, y1=by1,
                  fillcolor="rgba(196,66,10,0.15)", line=dict(color="#C4420A", width=2, dash="dash"))
    fig.add_annotation(x=available_w/2, y=-1.5, text=f"Plot: {available_w:.0f}×{available_l:.0f} m (schematic)",
                       showarrow=False, font=dict(size=10, color="#666"))
    fig.add_annotation(x=(bx0+bx1)/2, y=(by0+by1)/2,
                       text=f"Buildable zone<br>{(bx1-bx0)*(by1-by0):,.0f} m²",
                       showarrow=False, font=dict(size=10, color="#C4420A"))
    fig.update_layout(xaxis=dict(visible=False), yaxis=dict(visible=False, scaleanchor="x"),
                      height=320, showlegend=False, margin=dict(l=20, r=20, t=20, b=40),
                      plot_bgcolor="white")
    st.plotly_chart(fig, use_container_width=True)
    st.caption("🔴 Dashed red = buildable zone after setbacks. Grey = full plot boundary. Not to scale.")

    # Notes
    with st.expander("📌 Notes & Assumptions"):
        st.markdown(f"""
- **Applicable zone:** {use_zone}
- **NBC Reference:** Part 3 – Development Control Rules (2016 edition)
- **Height limit calculation:** min(Zone limit {nbc['max_ht']} m, Road-width based limit 1.5×{front_road}+1.5 = {road_ht_limit:.1f} m)
- **Note:** Local Development Control Regulations (DCR) of the Municipal Corporation take precedence over NBC defaults.
  Verify with the relevant authority: MCGM (Mumbai), DDA (Delhi), BDA (Bangalore), HMDA (Hyderabad), etc.
- {nbc['notes']}
        """)

# ═══════════════════════════════════════════════════════════════════════════════
# TOOL 2: PARKING
# ═══════════════════════════════════════════════════════════════════════════════
elif "Parking" in tool:
    st.markdown("### 🅿️ Parking Space Calculator")
    st.caption("Calculate required parking as per NBC 2016 Part 3 and local DCR norms.")

    use_type = st.selectbox("Primary Use", list(PARKING_NORMS.keys()))
    norms = PARKING_NORMS[use_type]

    col1, col2 = st.columns(2)
    with col1:
        if "dwelling" in use_type.lower():
            num_units = st.number_input("Number of Dwelling Units", 1, 5000, 50)
            cars_req = math.ceil(num_units * norms["cars"])
            bikes_req = math.ceil(num_units * norms["bikes"])
        elif "per 100 m²" in use_type.lower() or "per 100" in use_type.lower():
            gfa = st.number_input("Gross Floor Area (m²)", 100, 500000, 2000, step=100)
            cars_req = math.ceil(gfa / 100 * norms["cars"])
            bikes_req = math.ceil(gfa / 100 * norms["bikes"])
        elif "classroom" in use_type.lower():
            classrooms = st.number_input("Number of Classrooms", 1, 500, 20)
            cars_req = math.ceil(classrooms * norms["cars"])
            bikes_req = math.ceil(classrooms * norms["bikes"])
        elif "bed" in use_type.lower():
            beds = st.number_input("Number of Beds", 10, 5000, 100, step=10)
            cars_req = math.ceil(beds / 10 * norms["cars"])
            bikes_req = math.ceil(beds / 10 * norms["bikes"])
        elif "seat" in use_type.lower():
            seats = st.number_input("Number of Seats", 10, 10000, 200, step=10)
            cars_req = math.ceil(seats / 100 * norms["cars"])
            bikes_req = math.ceil(seats / 100 * norms["bikes"])
        else:
            gfa = st.number_input("Gross Floor Area (m²)", 100, 500000, 1000, step=100)
            cars_req = math.ceil(gfa / 100 * norms.get("cars", 2))
            bikes_req = math.ceil(gfa / 100 * norms.get("bikes", 5))

    with col2:
        # Car space dimensions: 2.5 × 5.0 m = 12.5 m² per ECS (NBC)
        car_area = cars_req * 12.5
        # Aisle and circulation: 50% additional
        total_parking_area = car_area * 1.5 + bikes_req * 1.5  # bikes ~1.5 m² each

        st.metric("Required Car Spaces (ECS)", cars_req)
        st.metric("Required Two-Wheeler Spaces", bikes_req)
        st.metric("Estimated Parking Area Needed", f"{total_parking_area:,.0f} m²")
        st.metric("Basement Floors Required (3500 m² each)", math.ceil(total_parking_area / 3500))

    st.info(f"""
**NBC Standard car parking space:** 2.5 m × 5.0 m = 12.5 m² (ECS — Equivalent Car Space)
**Aisle width:** Min 6.0 m for 90° parking (NBC Part 3)
**Two-wheeler space:** 1.0 m × 2.0 m = 2.0 m²
**Note:** {norms.get('note', '')}
    """)

    # Parking layout visualization
    if cars_req <= 100:
        st.markdown("### 🗺️ Schematic Parking Layout (90° parking)")
        cols_parking = min(10, cars_req)
        rows_parking = math.ceil(cars_req / cols_parking)
        fig = go.Figure()
        for row in range(rows_parking):
            for col in range(cols_parking):
                idx = row * cols_parking + col
                if idx < cars_req:
                    x0, x1 = col * 2.7, col * 2.7 + 2.5
                    y0, y1 = row * 7.5, row * 7.5 + 5.0
                    fig.add_shape(type="rect", x0=x0, y0=y0, x1=x1, y1=y1,
                                  fillcolor="rgba(196,66,10,0.2)", line=dict(color="#C4420A"))
        fig.update_layout(xaxis=dict(visible=False), yaxis=dict(visible=False, scaleanchor="x"),
                          height=min(600, rows_parking * 80 + 100), showlegend=False,
                          plot_bgcolor="#f0f0f0", margin=dict(l=0, r=0, t=0, b=0))
        st.plotly_chart(fig, use_container_width=True)

# ═══════════════════════════════════════════════════════════════════════════════
# TOOL 3: OCCUPANCY LOAD
# ═══════════════════════════════════════════════════════════════════════════════
elif "Occupancy Load" in tool:
    st.markdown("### 👥 Occupancy Load Calculator")
    st.caption("NBC 2016 Part 4 – Fire & Life Safety: Determine occupancy load for exit width calculation.")

    st.markdown("Add spaces/rooms to calculate the total occupancy load of the building:")

    if "spaces" not in st.session_state:
        st.session_state.spaces = [{"name": "Classroom", "type": "Classroom", "area": 60.0}]

    for i, sp in enumerate(st.session_state.spaces):
        c1, c2, c3, c4 = st.columns([2, 2, 1, 0.5])
        with c1:
            sp["name"] = st.text_input("Space Name", sp["name"], key=f"sp_name_{i}")
        with c2:
            sp["type"] = st.selectbox("Space Type", list(OCCUPANCY_LOADS.keys()),
                                       index=list(OCCUPANCY_LOADS.keys()).index(sp["type"])
                                       if sp["type"] in OCCUPANCY_LOADS else 0,
                                       key=f"sp_type_{i}")
        with c3:
            sp["area"] = st.number_input("Area (m²)", 1.0, 10000.0, sp["area"],
                                          key=f"sp_area_{i}")
        with c4:
            if st.button("🗑️", key=f"del_{i}") and len(st.session_state.spaces) > 1:
                st.session_state.spaces.pop(i)
                st.rerun()

    if st.button("➕ Add Space"):
        st.session_state.spaces.append({"name": "New Space", "type": "Office (open plan)", "area": 50.0})
        st.rerun()

    # Calculate
    rows = []
    for sp in st.session_state.spaces:
        load_factor = OCCUPANCY_LOADS[sp["type"]]
        occupants = math.ceil(sp["area"] / load_factor)
        rows.append({"Space": sp["name"], "Type": sp["type"], "Area (m²)": sp["area"],
                     "Load Factor (m²/person)": load_factor, "Occupants": occupants})
    result_df = pd.DataFrame(rows)
    total_occ = result_df["Occupants"].sum()

    st.markdown("---")
    st.markdown(f"### Total Occupancy Load: **{total_occ} persons**")
    st.dataframe(result_df, use_container_width=True, hide_index=True)

    # Exit requirements (NBC Part 4)
    st.markdown("### 🚪 Recommended Exit Provisions")
    min_exits = 2 if total_occ < 500 else 3 if total_occ < 1000 else 4
    min_stair_width = 1.5 if total_occ > 50 else 1.0
    total_exit_width = total_occ / 60  # NBC: 1m width per 60 persons
    st.markdown(f"""
| Parameter | Requirement |
|-----------|------------|
| Minimum exits required | **{min_exits}** (for {total_occ} persons) |
| Min staircase width | **{min_stair_width} m** (NBC Part 4 Cl. 4.7) |
| Total exit width needed | **{total_exit_width:.1f} m** (NBC: 1 m per 60 persons) |
| Max travel distance to exit | **30 m** (unsprinklered) / **45 m** (sprinklered) |
| Min door width (exit) | **1.0 m** (NBC Part 4) |
""")

# ═══════════════════════════════════════════════════════════════════════════════
# TOOL 4: EXIT WIDTH
# ═══════════════════════════════════════════════════════════════════════════════
elif "Exit Width" in tool:
    st.markdown("### 🚪 Exit Width & Egress Calculator")
    st.caption("NBC 2016 Part 4 – Fire & Life Safety.")

    c1, c2 = st.columns(2)
    with c1:
        occupants = st.number_input("Total Occupants (all floors)", 10, 50000, 300, step=10)
        floors = st.number_input("Number of Storeys", 1, 50, 4)
        sprinklered = st.checkbox("Building is sprinklered")
    with c2:
        bldg_type = st.selectbox("Building Type", [
            "Residential", "Educational", "Assembly", "Business/Office",
            "Mercantile/Retail", "Industrial", "Healthcare"])

    # NBC calculation
    total_exit_w = occupants / 60
    min_exits = 2 if occupants < 500 else (3 if occupants < 1000 else 4)
    min_stair_w = 1.5
    min_corridor_w = 1.8 if bldg_type in ["Healthcare", "Assembly"] else 1.5
    travel_dist = 45 if sprinklered else 30
    dead_end = 15 if sprinklered else 6

    st.markdown("---")
    st.markdown("### Results")
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Minimum exits required", min_exits)
        st.metric("Total exit width needed", f"{total_exit_w:.1f} m")
        st.metric("Min staircase width", f"{min_stair_w} m")
    with col2:
        st.metric("Min corridor width", f"{min_corridor_w} m")
        st.metric("Max travel distance to exit", f"{travel_dist} m")
        st.metric("Max dead-end corridor", f"{dead_end} m")

    st.info(f"**NBC Reference:** Part 4 (Fire & Life Safety), Clause 4.7 (Exits), Table 5 (Occupancy loads). Sprinkler system {'reduces' if sprinklered else 'does not reduce'} travel distance limits.")

# ═══════════════════════════════════════════════════════════════════════════════
# TOOL 5: QUICK REFERENCE
# ═══════════════════════════════════════════════════════════════════════════════
elif "Quick Reference" in tool:
    st.markdown("### 📋 NBC 2016 Quick Reference")

    # FAR table
    st.markdown("#### Floor Area Ratio (FAR) by Zone")
    far_df = pd.DataFrame([
        {"Zone": k, "Max FAR": v["max_far"], "Max GC %": v["max_gc"],
         "Max Height (m)": v["max_ht"],
         "Front Setback (m)": v["front_set"], "Side Setback (m)": v["side_set"],
         "Rear Setback (m)": v["rear_set"]}
        for k, v in NBC_ZONES.items()
    ])
    st.dataframe(far_df, use_container_width=True, hide_index=True)

    # Occupancy loads table
    st.markdown("#### Occupancy Loads (NBC Part 4)")
    occ_df = pd.DataFrame([
        {"Space Type": k, "Area per Person (m²)": v, "Persons per 100 m²": round(100/v, 1)}
        for k, v in OCCUPANCY_LOADS.items()
    ])
    st.dataframe(occ_df, use_container_width=True, hide_index=True)

    st.markdown("#### Key NBC Part 4 Requirements")
    st.markdown("""
| Requirement | Value |
|-------------|-------|
| Min exit door width | 1.0 m |
| Min staircase width (>50 occupants) | 1.5 m |
| Min corridor width (general) | 1.5 m |
| Min corridor width (healthcare) | 1.8 m |
| Max travel distance (unsprinklered) | 30 m |
| Max travel distance (sprinklered) | 45 m |
| Exit width unit | 1 m per 60 persons |
| Riser height max | 190 mm |
| Tread width min | 250 mm |
| Headroom on staircase min | 2.2 m |
| Accessible ramp max gradient | 1:12 (8.3%) |
| Accessible ramp landing | 1.5 m × 1.5 m every 9 m |
""")

    with st.expander("ℹ️ About NBC 2016"):
        st.markdown("""
**National Building Code of India (NBC) 2016** is published by the Bureau of Indian Standards (BIS).
It comprises 12 Parts covering Administration, Construction Management, Development Control,
Structural Design, Building Materials, Services (MEP), Fire & Life Safety, Plumbing,
Lifts & Escalators, Signage, and Energy Efficiency.

**Parts most relevant to architecture students:**
- **Part 3:** Development Control Rules (FAR, setbacks, parking)
- **Part 4:** Fire & Life Safety (exits, occupancy loads, sprinklers)
- **Part 5:** Building Materials (IS standards)
- **Part 8:** Building Services (HVAC, plumbing)
- **Part 11:** Approach to Sustainability (energy + water)

**Important:** The NBC sets minimum national standards. Local Municipal Corporation regulations
(DCR/DCPR) may be more stringent and always take local precedence.
        """)
