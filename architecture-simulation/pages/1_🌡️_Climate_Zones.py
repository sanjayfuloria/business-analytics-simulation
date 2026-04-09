import math
import streamlit as st
import plotly.graph_objects as go
import pandas as pd

st.set_page_config(page_title="Climate-Responsive Design", page_icon="🌡️", layout="wide")

# ── Data ──────────────────────────────────────────────────────────────────────
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
MONTH_NUM = list(range(1, 13))

# city → zone, lat, state, monthly {tmin, tmax, rain, humidity}
CITIES = {
    "Delhi": {"zone": "Composite", "lat": 28.6, "state": "Delhi",
        "monthly": {"Jan": (7,21,23,70),"Feb": (9,24,18,62),"Mar": (14,29,13,47),
                    "Apr": (20,36,8,30),"May": (25,41,13,25),"Jun": (28,40,65,52),
                    "Jul": (27,36,180,75),"Aug": (26,34,173,76),"Sep": (24,34,117,69),
                    "Oct": (18,33,14,55),"Nov": (11,28,4,58),"Dec": (7,23,11,68)}},
    "Mumbai": {"zone": "Warm & Humid", "lat": 19.1, "state": "Maharashtra",
        "monthly": {"Jan": (19,31,2,67),"Feb": (20,32,1,65),"Mar": (23,34,1,67),
                    "Apr": (26,36,1,71),"May": (28,37,10,72),"Jun": (26,33,493,86),
                    "Jul": (25,30,842,90),"Aug": (25,30,609,89),"Sep": (24,31,306,86),
                    "Oct": (24,33,65,80),"Nov": (22,33,14,72),"Dec": (20,32,3,67)}},
    "Chennai": {"zone": "Warm & Humid", "lat": 13.1, "state": "Tamil Nadu",
        "monthly": {"Jan": (20,29,24,76),"Feb": (21,31,7,72),"Mar": (23,33,15,71),
                    "Apr": (26,36,25,72),"May": (28,38,52,68),"Jun": (27,37,53,66),
                    "Jul": (26,36,83,72),"Aug": (25,35,103,75),"Sep": (25,34,119,77),
                    "Oct": (23,31,267,82),"Nov": (21,29,407,82),"Dec": (20,28,140,80)}},
    "Kolkata": {"zone": "Warm & Humid", "lat": 22.6, "state": "West Bengal",
        "monthly": {"Jan": (13,27,13,71),"Feb": (16,30,25,65),"Mar": (21,34,33,58),
                    "Apr": (25,36,47,66),"May": (26,36,130,75),"Jun": (26,34,289,82),
                    "Jul": (26,32,330,85),"Aug": (26,32,328,84),"Sep": (25,32,252,83),
                    "Oct": (23,32,114,77),"Nov": (18,30,20,70),"Dec": (13,27,7,70)}},
    "Bangalore": {"zone": "Temperate", "lat": 12.9, "state": "Karnataka",
        "monthly": {"Jan": (15,27,5,60),"Feb": (16,29,10,54),"Mar": (19,32,14,51),
                    "Apr": (22,34,46,57),"May": (22,33,118,66),"Jun": (20,28,90,73),
                    "Jul": (18,26,132,77),"Aug": (18,26,148,78),"Sep": (19,27,192,78),
                    "Oct": (19,27,180,76),"Nov": (17,26,55,70),"Dec": (15,25,18,65)}},
    "Jaipur": {"zone": "Hot & Dry", "lat": 26.9, "state": "Rajasthan",
        "monthly": {"Jan": (8,22,14,63),"Feb": (11,25,9,52),"Mar": (16,31,9,38),
                    "Apr": (22,37,4,27),"May": (26,41,10,26),"Jun": (27,40,55,44),
                    "Jul": (25,35,193,71),"Aug": (24,33,237,75),"Sep": (23,34,73,62),
                    "Oct": (17,33,15,45),"Nov": (11,28,4,47),"Dec": (7,23,8,58)}},
    "Ahmedabad": {"zone": "Hot & Dry", "lat": 23.0, "state": "Gujarat",
        "monthly": {"Jan": (13,28,6,63),"Feb": (15,31,2,52),"Mar": (20,36,3,42),
                    "Apr": (25,41,2,31),"May": (28,43,6,31),"Jun": (27,40,90,57),
                    "Jul": (26,34,317,78),"Aug": (25,33,213,78),"Sep": (25,35,107,67),
                    "Oct": (21,36,8,52),"Nov": (16,33,4,54),"Dec": (12,29,3,62)}},
    "Hyderabad": {"zone": "Composite", "lat": 17.4, "state": "Telangana",
        "monthly": {"Jan": (14,28,6,64),"Feb": (17,31,11,59),"Mar": (21,35,13,52),
                    "Apr": (25,38,24,51),"May": (27,39,30,52),"Jun": (24,34,107,68),
                    "Jul": (23,30,165,79),"Aug": (23,30,175,80),"Sep": (22,30,163,78),
                    "Oct": (19,29,71,72),"Nov": (15,27,25,68),"Dec": (13,26,8,67)}},
    "Kochi": {"zone": "Warm & Humid", "lat": 9.9, "state": "Kerala",
        "monthly": {"Jan": (22,31,19,75),"Feb": (23,32,27,73),"Mar": (25,33,49,75),
                    "Apr": (26,33,122,79),"May": (25,32,263,84),"Jun": (23,29,621,91),
                    "Jul": (23,28,547,90),"Aug": (23,28,395,89),"Sep": (23,28,268,88),
                    "Oct": (23,29,300,86),"Nov": (22,30,163,82),"Dec": (22,30,44,78)}},
    "Pune": {"zone": "Temperate", "lat": 18.5, "state": "Maharashtra",
        "monthly": {"Jan": (10,30,7,58),"Feb": (12,33,3,46),"Mar": (16,36,8,37),
                    "Apr": (21,39,18,40),"May": (23,38,35,51),"Jun": (21,30,113,74),
                    "Jul": (20,27,174,84),"Aug": (20,27,107,84),"Sep": (19,29,100,79),
                    "Oct": (17,31,48,70),"Nov": (13,30,20,63),"Dec": (10,29,6,61)}},
    "Shimla": {"zone": "Cold & Cloudy", "lat": 31.1, "state": "Himachal Pradesh",
        "monthly": {"Jan": (1,9,68,78),"Feb": (2,10,62,75),"Mar": (6,15,65,66),
                    "Apr": (10,20,47,59),"May": (13,24,51,59),"Jun": (16,24,142,75),
                    "Jul": (16,21,386,88),"Aug": (15,20,345,88),"Sep": (13,20,187,83),
                    "Oct": (8,18,34,70),"Nov": (4,14,23,70),"Dec": (1,10,49,76)}},
    "Jodhpur": {"zone": "Hot & Dry", "lat": 26.3, "state": "Rajasthan",
        "monthly": {"Jan": (8,25,6,51),"Feb": (11,28,5,40),"Mar": (16,33,4,28),
                    "Apr": (22,39,2,18),"May": (26,42,8,18),"Jun": (28,41,26,36),
                    "Jul": (26,36,105,63),"Aug": (25,34,117,68),"Sep": (24,36,36,51),
                    "Oct": (18,35,5,30),"Nov": (12,30,2,34),"Dec": (8,26,4,45)}},
    "Varanasi": {"zone": "Composite", "lat": 25.3, "state": "Uttar Pradesh",
        "monthly": {"Jan": (9,22,24,73),"Feb": (12,26,17,62),"Mar": (17,33,11,46),
                    "Apr": (23,39,4,30),"May": (27,42,10,28),"Jun": (29,41,74,52),
                    "Jul": (27,34,285,79),"Aug": (26,33,256,81),"Sep": (25,33,175,73),
                    "Oct": (18,32,26,58),"Nov": (12,28,5,62),"Dec": (8,23,14,72)}},
    "Guwahati": {"zone": "Warm & Humid", "lat": 26.2, "state": "Assam",
        "monthly": {"Jan": (10,24,13,80),"Feb": (12,26,22,77),"Mar": (17,30,62,77),
                    "Apr": (21,30,153,83),"May": (23,30,243,86),"Jun": (25,30,330,87),
                    "Jul": (25,30,341,88),"Aug": (25,30,265,87),"Sep": (24,30,218,87),
                    "Oct": (20,29,106,83),"Nov": (15,27,18,80),"Dec": (10,24,8,79)}},
    "Chandigarh": {"zone": "Composite", "lat": 30.7, "state": "Punjab/Haryana",
        "monthly": {"Jan": (5,17,48,77),"Feb": (7,20,42,70),"Mar": (12,26,36,58),
                    "Apr": (18,34,20,40),"May": (23,39,25,34),"Jun": (26,40,67,47),
                    "Jul": (26,35,214,74),"Aug": (25,33,210,76),"Sep": (22,33,118,67),
                    "Oct": (15,30,18,57),"Nov": (9,24,10,64),"Dec": (5,18,30,74)}},
    "Bhopal": {"zone": "Composite", "lat": 23.3, "state": "Madhya Pradesh",
        "monthly": {"Jan": (9,25,18,67),"Feb": (11,28,12,57),"Mar": (16,33,13,43),
                    "Apr": (22,39,5,30),"May": (26,42,8,28),"Jun": (26,37,106,55),
                    "Jul": (23,29,374,83),"Aug": (22,28,339,85),"Sep": (21,30,173,75),
                    "Oct": (16,31,35,58),"Nov": (11,28,10,57),"Dec": (8,24,14,65)}},
    "Nagpur": {"zone": "Hot & Dry", "lat": 21.1, "state": "Maharashtra",
        "monthly": {"Jan": (13,29,17,64),"Feb": (16,33,18,54),"Mar": (21,38,16,42),
                    "Apr": (26,42,14,31),"May": (29,44,20,30),"Jun": (27,37,133,61),
                    "Jul": (24,30,316,82),"Aug": (23,29,248,83),"Sep": (23,31,147,76),
                    "Oct": (19,33,35,61),"Nov": (14,30,16,58),"Dec": (11,28,14,62)}},
    "Lucknow": {"zone": "Composite", "lat": 26.8, "state": "Uttar Pradesh",
        "monthly": {"Jan": (8,22,26,74),"Feb": (11,25,20,65),"Mar": (17,32,13,48),
                    "Apr": (23,38,5,30),"May": (27,41,10,27),"Jun": (29,40,74,50),
                    "Jul": (27,34,263,77),"Aug": (26,33,259,80),"Sep": (24,33,161,73),
                    "Oct": (19,32,22,57),"Nov": (13,28,6,62),"Dec": (8,23,14,72)}},
    "Bhubaneswar": {"zone": "Warm & Humid", "lat": 20.3, "state": "Odisha",
        "monthly": {"Jan": (14,28,24,72),"Feb": (16,31,32,65),"Mar": (21,36,27,57),
                    "Apr": (25,39,28,55),"May": (26,39,65,61),"Jun": (26,34,238,79),
                    "Jul": (25,31,345,84),"Aug": (25,31,360,84),"Sep": (24,32,240,81),
                    "Oct": (22,33,119,74),"Nov": (17,30,51,72),"Dec": (14,28,18,71)}},
    "Leh": {"zone": "Cold & Sunny", "lat": 34.2, "state": "Ladakh",
        "monthly": {"Jan": (-14,-1,8,50),"Feb": (-13,1,9,49),"Mar": (-5,9,13,42),
                    "Apr": (2,16,8,36),"May": (7,22,7,35),"Jun": (11,27,5,30),
                    "Jul": (15,30,14,37),"Aug": (14,28,16,42),"Sep": (9,23,10,40),
                    "Oct": (2,16,7,37),"Nov": (-6,7,4,44),"Dec": (-12,0,6,50)}},
}

ZONE_INFO = {
    "Hot & Dry": {
        "color": "#C4420A", "icon": "☀️",
        "description": "Hot summers (40–48°C), mild winters, very low rainfall (<500 mm/yr), low humidity (<30% in peak summer). High diurnal temperature variation.",
        "regions": "Rajasthan (Jaipur, Jodhpur, Bikaner), Gujarat (Ahmedabad), inland Maharashtra (Nagpur)",
        "challenges": ["Extreme daytime radiant and convective heat", "Very low humidity causes desiccation discomfort", "Dust storms and sand erosion", "Intense solar radiation on all exposed surfaces"],
        "strategies": ["Courtyard planning to create a shaded microclimate", "Small windows on E & W walls to limit solar gain", "Deep overhangs, colonnades, and arcade shading", "Jaali (perforated screen) for ventilation without solar gain", "Thick masonry walls (400–600 mm) for high thermal lag", "Wind catchers (Bawli/Baoli) to capture upper-level breezes", "Evaporative cooling — underground rooms, water features", "Reflective / lime-plastered cool roofs and terraced gardens", "Earth berming on N & W sides for passive insulation", "Deciduous trees on S & W for summer shade only"],
        "case_studies": ["Havelis of Shekhawati, Rajasthan", "Jaisalmer Fort, Rajasthan", "Fatehpur Sikri, Agra", "Amber Fort, Jaipur", "Amdavad ni Gufa (Husain–Doshi Gufa), Ahmedabad"],
    },
    "Warm & Humid": {
        "color": "#0077B6", "icon": "🌊",
        "description": "High temperatures (28–38°C), very high humidity (>70%), heavy monsoon rainfall. Little diurnal variation. Mechanical ventilation alone is insufficient.",
        "regions": "Kerala coast, coastal Tamil Nadu & Karnataka (Mangalore/Goa), West Bengal, Assam, Odisha coast",
        "challenges": ["High humidity causes discomfort even at moderate temperatures", "Mould and fungal growth on surfaces and materials", "Very heavy monsoon rainfall requiring robust waterproofing", "Reduced wind speed inside dense urban fabric"],
        "strategies": ["Maximise cross-ventilation — openings on N and S walls aligned to prevailing wind", "Raised floors to allow sub-floor ventilation and prevent dampness", "Wide overhangs (1–1.5 m) and deep verandahs to shelter open windows", "High-pitched roofs with ventilated ridge for hot air escape", "Lightweight construction for rapid thermal response", "Open porosity plan layouts for through-building airflow", "Wing walls and breeze catchers to direct wind into rooms", "Light-coloured and reflective surfaces to reduce solar absorption", "Dense planting for shade without blocking prevailing winds"],
        "case_studies": ["Kerala Nalukettu (traditional courtyard house)", "Chettinad Houses, Tamil Nadu", "Goan Indo-Portuguese houses", "IIT Madras Campus buildings", "Laurie Baker's cost-efficient houses, Kerala"],
    },
    "Composite": {
        "color": "#7B2D8B", "icon": "🔄",
        "description": "Highly variable — hot humid summers (38–42°C), cool winters, a defined monsoon. Strategies for summer and winter often conflict. Requires adaptive, seasonally responsive design.",
        "regions": "Delhi, Uttar Pradesh, Madhya Pradesh, Telangana (Hyderabad), Chandigarh, parts of Bihar",
        "challenges": ["Hot summers with variable humidity requiring simultaneous shading and ventilation", "Cool winters requiring passive solar gain", "Summer and winter design strategies contradict each other", "Intense monsoon rainfall for 3–4 months"],
        "strategies": ["Elongate building on E–W axis; main openings on N and S", "Adjustable / operable shading on W & E facades (louvres, chajjas)", "Courtyard with deciduous trees — shaded summer, solar winter", "Operable insulation (thick curtains, jalis, bamboo blinds) for seasonal switching", "Thermal mass (brick/concrete) to smooth diurnal swings", "Double-skin buffer zone on W facade", "Verandah or portico as a transition space", "Ceiling fans as primary comfort device in transitional seasons"],
        "case_studies": ["Lutyens' Delhi bungalows", "Traditional havelis of Lucknow (awadhi architecture)", "Mughal garden pavilions (Agra, Delhi)", "Chandigarh by Le Corbusier — shading devices (brise-soleil)"],
    },
    "Temperate": {
        "color": "#2D9E51", "icon": "🌤️",
        "description": "Mild temperatures year-round (15–34°C), moderate humidity, moderate rainfall. Generally pleasant; minimal mechanical conditioning needed.",
        "regions": "Bangalore, Mysore, Pune, Nilgiris (Ooty), Coorg, Shillong (partially)",
        "challenges": ["Summer afternoons can reach 33–34°C and feel uncomfortable", "Moderate monsoon rainfall needs proper waterproofing", "Occasional morning mist and high humidity in hilly areas"],
        "strategies": ["South-facing orientation for modest winter solar access", "Maximise natural ventilation — large operable windows all sides", "Moderate thermal mass (brick / stone)", "Green roofs and planted walls for thermal buffering", "Pergolas with climbing plants for summer shading on W side", "Large windows for daylight without overheating", "Ceiling fans as primary comfort device"],
        "case_studies": ["IISc Campus buildings, Bangalore", "Traditional Coorg (Kodava) tiled houses", "Nilgiri British bungalows", "Charles Correa's work in Bangalore/Pune"],
    },
    "Cold & Cloudy": {
        "color": "#457B9D", "icon": "🌨️",
        "description": "Cold winters (−5 to 5°C), mild summers, heavy snowfall or rainfall, predominantly overcast skies. Requires significant insulation and passive heating.",
        "regions": "Shimla, Mussoorie, Darjeeling, parts of Uttarakhand and North Bengal",
        "challenges": ["Very cold winters requiring heating — fuel poverty is real", "Heavy snow loads on structure", "Low natural light due to persistent overcast sky", "Moisture management (condensation, freeze-thaw)"],
        "strategies": ["Compact building form to minimise surface area-to-volume ratio", "South-facing glazing to maximise winter solar gains", "Double or triple glazed windows with warm-edge spacers", "Vestibule/airlock entries to prevent cold air infiltration", "High insulation levels — walls, roof, and floor", "Thermal mass to store daytime solar heat for night release", "Steep-pitched roofs for snow shedding", "Sheltered walkways and interconnected buildings"],
        "case_studies": ["Traditional Kath-Kuni houses of Himachal Pradesh", "British hill-station bungalows of Shimla", "Tibetan monasteries (adapted typology)", "Darjeeling tea estate bungalows"],
    },
    "Cold & Sunny": {
        "color": "#5C9AC5", "icon": "❄️",
        "description": "Extreme cold winters (−15 to 0°C), warm sunny summers, very low rainfall (<200 mm/yr), high altitude (3000–4500 m), intense solar radiation. Passive solar is the primary strategy.",
        "regions": "Leh–Ladakh, Spiti Valley, Lahaul, Zanskar, upper Kinnaur",
        "challenges": ["Extreme cold requiring maximum heat retention", "Thin air at high altitude reduces convective heat transfer", "Intense UV radiation degrades standard materials quickly", "Very low humidity combined with strong winds"],
        "strategies": ["Extensive south-facing glazing (up to 30–40% of S wall) for passive solar gain", "Trombe walls for thermal storage and time-delayed heat release", "Earth berming on N, E, W sides for insulation", "Attached sunspaces / solar greenhouses as buffer zones", "Super-insulated walls — stone + mud plaster + internal insulation", "Small N & E openings to minimise heat loss", "Flat or low-slope roofs (low snow, good for solar collectors)", "Traditional flat-roofed rammed earth courtyard typology"],
        "case_studies": ["Traditional Ladakhi rammed earth houses, Leh", "Key Monastery, Spiti Valley", "Druk White Lotus School, Ladakh (passive solar design)", "Snow Leopard Lodge, Leh (contemporary vernacular)"],
    },
}


def _v(city_data, month, idx):
    return city_data["monthly"][month][idx]


def solar_altitude_noon(lat_deg, month_num):
    """Approximate solar altitude at solar noon (degrees) for given latitude and month."""
    decl = 23.45 * math.sin(math.radians(360 / 365 * (284 + month_num * 30.4)))
    alt = 90 - abs(lat_deg - decl)
    return round(max(0.0, min(90.0, alt)), 1)


# ── UI ────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
.pg-header{background:linear-gradient(135deg,#1A4A7A,#0096C7,#48CAE4);
 padding:1.4rem 2rem;border-radius:12px;color:white;margin-bottom:1.2rem;}
.pg-header h1{margin:0 0 0.2rem;font-size:1.9rem;}
.pg-header p{margin:0;opacity:0.85;font-size:0.9rem;}
.insight{background:#EFF9FF;border-left:4px solid #0096C7;
 padding:0.8rem 1rem;border-radius:6px;margin-top:0.6rem;font-size:0.88rem;}
.zone-box{padding:1rem 1.4rem;border-radius:8px;margin:0.8rem 0;
 box-shadow:0 2px 8px rgba(0,0,0,0.08);}
</style>
<div class="pg-header">
  <h1>🌡️ Climate-Responsive Design</h1>
  <p>Analyse monthly climate data for 20+ Indian cities · Passive design strategies by BEE climate zone · Solar angle calculator</p>
</div>
""", unsafe_allow_html=True)

# ── City selector ─────────────────────────────────────────────────────────────
city = st.selectbox("Select City", sorted(CITIES.keys()), index=sorted(CITIES.keys()).index("Delhi"))
cd = CITIES[city]
zone = cd["zone"]
zi = ZONE_INFO[zone]

tmaxes = [_v(cd, m, 1) for m in MONTHS]
tmins = [_v(cd, m, 0) for m in MONTHS]
rains = [_v(cd, m, 2) for m in MONTHS]
hums = [_v(cd, m, 3) for m in MONTHS]

c1, c2, c3, c4 = st.columns(4)
c1.metric("Climate Zone", f"{zi['icon']} {zone}")
c2.metric("Peak Summer Max", f"{max(tmaxes)}°C")
c3.metric("Coldest Month Min", f"{min(tmins)}°C")
c4.metric("Annual Rainfall", f"{sum(rains)} mm")

# Zone banner
st.markdown(
    f'<div class="zone-box" style="background:white;border-left:6px solid {zi["color"]}">'
    f'<strong style="color:{zi["color"]}">{zi["icon"]} {zone} Climate Zone</strong>'
    f'<p style="margin:0.4rem 0 0;color:#444;font-size:0.87rem;">{zi["description"]}</p>'
    f'<p style="margin:0.3rem 0 0;color:#666;font-size:0.8rem;"><strong>Regions:</strong> {zi["regions"]}</p>'
    f'</div>',
    unsafe_allow_html=True,
)

# ── Tabs: charts ──────────────────────────────────────────────────────────────
tab1, tab2, tab3, tab4 = st.tabs(["🌡️ Temperature", "🌧️ Rainfall", "💧 Humidity", "☀️ Solar Angles"])

with tab1:
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=MONTHS, y=tmaxes, name="Max Temp", fill=None,
                              line=dict(color="#C4420A", width=3)))
    avg = [(h + l) / 2 for h, l in zip(tmaxes, tmins)]
    fig.add_trace(go.Scatter(x=MONTHS, y=avg, name="Avg Temp",
                              line=dict(color="#E8923A", width=2, dash="dash")))
    fig.add_trace(go.Scatter(x=MONTHS, y=tmins, name="Min Temp",
                              fill="tonexty", fillcolor="rgba(228,146,58,0.12)",
                              line=dict(color="#0077B6", width=3)))
    fig.add_hrect(y0=18, y1=26, line_width=0, fillcolor="rgba(45,158,81,0.10)",
                  annotation_text="Thermal comfort 18–26°C", annotation_position="right")
    fig.update_layout(title=f"Monthly Temperature — {city}, {cd['state']}",
                      xaxis_title="Month", yaxis_title="Temperature (°C)",
                      plot_bgcolor="white", hovermode="x unified", height=400,
                      legend=dict(orientation="h", y=1.08, x=1, xanchor="right"))
    st.plotly_chart(fig, use_container_width=True)
    diurnal = [tmaxes[i] - tmins[i] for i in range(12)]
    st.markdown(
        f'<div class="insight">🏗️ <strong>Design insight:</strong> Peak temp in '
        f'<strong>{MONTHS[tmaxes.index(max(tmaxes))]}</strong> ({max(tmaxes)}°C). '
        + (f'High diurnal range (up to {max(diurnal):.0f}°C) — night-flush ventilation and high thermal mass are very effective.'
           if max(diurnal) > 12 else
           f'Low diurnal range ({max(diurnal):.0f}°C) — thermal mass alone is insufficient; prioritise shading and ventilation.')
        + '</div>', unsafe_allow_html=True)

with tab2:
    colors_r = ["#023E8A" if r > 300 else "#0096C7" if r > 100 else "#48CAE4" if r > 20 else "#F4A261"
                for r in rains]
    fig = go.Figure(go.Bar(x=MONTHS, y=rains, marker_color=colors_r,
                            text=[f"{r}" for r in rains], textposition="outside"))
    fig.update_layout(title=f"Monthly Rainfall — {city}", xaxis_title="Month",
                      yaxis_title="Rainfall (mm)", plot_bgcolor="white", height=400)
    st.plotly_chart(fig, use_container_width=True)
    heavy = [MONTHS[i] for i in range(12) if rains[i] > 100]
    annual = sum(rains)
    insight = (f'Monsoon months ({", ".join(heavy)}) bring intense rainfall — design for rapid roof drainage, '
               f'water harvesting, and monsoon-adapted living with covered verandahs.'
               if heavy else
               f'Low annual rainfall ({annual} mm). Flat roofs with rainwater harvesting tanks are viable and recommended.')
    st.markdown(f'<div class="insight">🏗️ <strong>Design insight:</strong> Annual rainfall <strong>{annual} mm</strong>. {insight}</div>',
                unsafe_allow_html=True)

with tab3:
    fig = go.Figure(go.Scatter(x=MONTHS, y=hums, mode="lines+markers+text",
                                fill="tozeroy", fillcolor="rgba(0,119,182,0.10)",
                                line=dict(color="#0077B6", width=3),
                                text=[f"{h}%" for h in hums], textposition="top center"))
    fig.add_hrect(y0=30, y1=70, line_width=0, fillcolor="rgba(45,158,81,0.10)",
                  annotation_text="Comfort range 30–70%", annotation_position="right")
    fig.update_layout(title=f"Monthly Relative Humidity — {city}", xaxis_title="Month",
                      yaxis_title="Relative Humidity (%)", yaxis_range=[0, 105],
                      plot_bgcolor="white", height=400)
    st.plotly_chart(fig, use_container_width=True)
    dry = [MONTHS[i] for i in range(12) if hums[i] < 30]
    humid = [MONTHS[i] for i in range(12) if hums[i] > 80]
    if dry:
        ins = f'Very dry months ({", ".join(dry)}) — evaporative cooling (desert coolers, wet jute screens, courtyard fountains) is highly effective and energy-efficient.'
    elif humid:
        ins = f'High-humidity months ({", ".join(humid)}) — evaporative cooling will NOT work. Prioritise cross-ventilation through sleeping zones at night. Avoid stagnant air pockets.'
    else:
        ins = 'Moderate humidity year-round. Both ventilation and occasional evaporative cooling can enhance comfort depending on season.'
    st.markdown(f'<div class="insight">🏗️ <strong>Design insight:</strong> {ins}</div>', unsafe_allow_html=True)

with tab4:
    lat = cd["lat"]
    sol = [{"Month": m, "Solar Altitude (°)": solar_altitude_noon(lat, mn)}
           for m, mn in zip(MONTHS, MONTH_NUM)]
    sol_df = pd.DataFrame(sol)
    june_alt = sol_df[sol_df["Month"] == "Jun"]["Solar Altitude (°)"].values[0]
    dec_alt = sol_df[sol_df["Month"] == "Dec"]["Solar Altitude (°)"].values[0]
    # Overhang depth per 1m window height for summer shade
    ov = round(1 / max(0.01, math.tan(math.radians(june_alt))), 2) if june_alt > 5 else ">5"
    fig = go.Figure(go.Bar(x=sol_df["Month"], y=sol_df["Solar Altitude (°)"],
                            marker_color="#E8923A", text=[f"{v}°" for v in sol_df["Solar Altitude (°)"]],
                            textposition="outside"))
    fig.update_layout(title=f"Solar Altitude at Solar Noon — {city} (Lat {lat}°N)",
                      xaxis_title="Month", yaxis_title="Solar Altitude (°)", yaxis_range=[0, 100],
                      plot_bgcolor="white", height=400)
    st.plotly_chart(fig, use_container_width=True)
    st.markdown(
        f'<div class="insight">🏗️ <strong>Solar design for {city}:</strong><br>'
        f'Summer altitude (June) <strong>{june_alt}°</strong> — overhang depth ≈ <strong>{ov} m</strong> per 1 m window height to fully shade south-facing glass in summer.<br>'
        f'Winter altitude (Dec) <strong>{dec_alt}°</strong> — low winter sun '
        + ('penetrates deep into south-facing rooms, which is desirable for passive solar heating.' if zone in ["Cold & Cloudy", "Cold & Sunny"] else
           'illuminates E and W facades; control glare with vertical fins on east and west.')
        + '</div>', unsafe_allow_html=True)
    st.dataframe(sol_df, use_container_width=True, hide_index=True)

# ── Passive strategies ────────────────────────────────────────────────────────
st.markdown("---")
st.markdown("## 🏗️ Passive Design Strategies")

cl, cr = st.columns(2)
with cl:
    st.markdown(f"#### {zi['icon']} For {zone} Climate")
    for s in zi["strategies"]:
        st.markdown(f"- {s}")
    st.markdown("#### ⚠️ Key Design Challenges")
    for c in zi["challenges"]:
        st.markdown(f"- {c}")

with cr:
    st.markdown("#### 🏛️ Case Study References")
    for ex in zi["case_studies"]:
        st.markdown(f"- {ex}")
    st.markdown("#### ✅ Strategy Checklist — tick what you'll apply")
    checked = []
    for i, s in enumerate(zi["strategies"][:7]):
        if st.checkbox(s, key=f"strat_{zone}_{i}"):
            checked.append(s)
    if checked:
        st.success(f"{len(checked)} passive strategy/strategies selected. Document these in your design report!")

# ── City comparison ───────────────────────────────────────────────────────────
st.markdown("---")
st.markdown("## 🔄 Compare Two Cities")
cities_sorted = sorted(CITIES.keys())
ca, cb = st.columns(2)
with ca:
    city_a = st.selectbox("City A", cities_sorted, index=cities_sorted.index(city))
with cb:
    default_b = [c for c in cities_sorted if c != city_a][0]
    city_b = st.selectbox("City B", cities_sorted, index=cities_sorted.index(default_b))

da, db = CITIES[city_a], CITIES[city_b]
fig = go.Figure()
fig.add_trace(go.Scatter(x=MONTHS, y=[_v(da, m, 1) for m in MONTHS],
                          name=f"{city_a} Max Temp (°C)", line=dict(color="#C4420A", width=2)))
fig.add_trace(go.Scatter(x=MONTHS, y=[_v(db, m, 1) for m in MONTHS],
                          name=f"{city_b} Max Temp (°C)", line=dict(color="#0077B6", width=2)))
fig.add_trace(go.Scatter(x=MONTHS, y=[_v(da, m, 2) for m in MONTHS],
                          name=f"{city_a} Rainfall (mm)", line=dict(color="#E8923A", width=2, dash="dot"),
                          yaxis="y2"))
fig.add_trace(go.Scatter(x=MONTHS, y=[_v(db, m, 2) for m in MONTHS],
                          name=f"{city_b} Rainfall (mm)", line=dict(color="#48CAE4", width=2, dash="dot"),
                          yaxis="y2"))
fig.update_layout(title=f"Climate Comparison: {city_a} vs {city_b}",
                  xaxis_title="Month",
                  yaxis=dict(title="Temperature (°C)", side="left"),
                  yaxis2=dict(title="Rainfall (mm)", overlaying="y", side="right"),
                  hovermode="x unified", plot_bgcolor="white", height=450,
                  legend=dict(orientation="h", y=1.08, x=1, xanchor="right"))
st.plotly_chart(fig, use_container_width=True)

# ── Zone overview table ───────────────────────────────────────────────────────
st.markdown("---")
st.markdown("## 🗺️ India's 6 BEE Climate Zones at a Glance")
overview = pd.DataFrame([
    {"Zone": f"{v['icon']} {k}", "Typical Regions": v["regions"][:55]+"…",
     "Peak Challenge": v["challenges"][0], "Primary Strategy": v["strategies"][0]}
    for k, v in ZONE_INFO.items()
])
st.dataframe(overview, use_container_width=True, hide_index=True)
