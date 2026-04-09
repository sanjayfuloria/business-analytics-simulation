import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

st.set_page_config(page_title="History of Indian Architecture", page_icon="📜", layout="wide")

# ── Data ──────────────────────────────────────────────────────────────────────
PERIODS = [
    {
        "id": "indus",
        "name": "Indus Valley Civilisation",
        "start_ce": -3000,
        "end_ce": -1500,
        "label": "c.3000–1500 BCE",
        "color": "#8B7355",
        "style": "Proto-urban / Town Planning",
        "regions": "Sindh, Punjab, Gujarat, Rajasthan (Mohenjo-daro, Harappa, Dholavira, Rakhigarhi)",
        "key_features": [
            "Grid-iron town planning with wide main streets (10 m) and narrower lanes",
            "Two-storey brick houses with internal courtyards and flat roofs",
            "Municipal drainage system — the world's earliest known comprehensive sewage network",
            "Standardised burnt brick dimensions (1:2:4 ratio) across all sites",
            "Great Bath at Mohenjo-daro — waterproofed with bitumen; possible ritual use",
            "Citadel mound (raised platform) separate from lower town",
            "Granaries and assembly halls as civic infrastructure",
            "No monumental temples or palaces — suggests egalitarian or theocratic urban model",
        ],
        "key_buildings": [
            ("Great Bath, Mohenjo-daro", "c. 2600 BCE", "Ritual bathing facility, bitumen-lined pool, 12m × 7m"),
            ("Granary, Harappa", "c. 2600 BCE", "Large civic storage building with ventilation ducts"),
            ("Dholavira Step-well", "c. 2500 BCE", "Sophisticated multi-tiered water harvesting system"),
            ("House of the Priest-King, Mohenjo-daro", "c. 2500 BCE", "Two-storey domestic dwelling"),
        ],
        "materials": "Standardised burnt brick, bitumen waterproofing, timber for floors and lintels, baked pottery drainpipes",
        "structural_system": "Load-bearing burnt brick masonry. Flat roof construction with timber beams.",
        "architectural_significance": "Represents the world's first example of systematic urban planning at scale. The integration of drainage infrastructure within the urban plan has never been surpassed until modern times. Raises fundamental questions about the social organisation required to achieve such coordination.",
        "decline": "Gradual civilisational collapse c.1900–1500 BCE — theories include climate change, river course shifts (Ghaggar-Hakra), and migration.",
    },
    {
        "id": "vedic_mauryan",
        "name": "Vedic & Mauryan Period",
        "start_ce": -1500,
        "end_ce": -185,
        "label": "c.1500–185 BCE",
        "color": "#996633",
        "style": "Timber architecture; early rock-cut caves; Stupa",
        "regions": "Gangetic plain, Bihar, Madhya Pradesh; Mauryan empire (Pataliputra as capital)",
        "key_features": [
            "Transition from Vedic timber architecture (no surviving examples) to stone under Mauryan patronage",
            "Introduction of the Stupa — a hemispherical relic mound derived from burial mounds",
            "Rock-cut Chaitya caves and Vihara (monastery) caves carved from living rock",
            "Polished Mauryan sandstone pillars with animal capitals (Ashoka Pillars)",
            "Vedic Vastu Shastra codified — rules for orientation, proportion, and cosmological layout of buildings",
            "Timber palace at Pataliputra described by Megasthenes — an 80-pillar assembly hall",
        ],
        "key_buildings": [
            ("Great Stupa, Sanchi", "3rd c. BCE – 1st c. CE", "UNESCO heritage; hemispheric relic mound with ceremonial toranas (gateways)"),
            ("Ashoka Pillar, Vaishali", "c. 250 BCE", "Polished sandstone; lion capital; Brahmi inscription"),
            ("Lomas Rishi Cave, Bihar", "c. 250 BCE", "Rock-cut chaitya facade mimicking timber architecture"),
            ("Dhamek Stupa, Sarnath", "c. 249 BCE", "Brick stupa at site of Buddha's first sermon"),
        ],
        "materials": "Sandstone (Chunar), timber (no surviving examples), brick, lime plaster",
        "structural_system": "Rock-cut (subtractive) construction. Brick and timber for surface structures. Stone stupa cores with rubble fill.",
        "architectural_significance": "The Stupa establishes the fundamental vocabulary of Indian sacred architecture: the anda (dome), harmika (railing), yashti (mast), and the pradakshina path (circumambulatory). The Sanchi toranas are among the finest examples of narrative stone sculpture in world architecture.",
        "decline": "Mauryan empire fragmented after Ashoka's death (232 BCE). Sunga dynasty that followed was less sympathetic to Buddhism.",
    },
    {
        "id": "classical",
        "name": "Classical Period (Gupta & Post-Gupta)",
        "start_ce": 320,
        "end_ce": 750,
        "label": "c.320–750 CE",
        "color": "#CC7722",
        "style": "Early Hindu Temple; Nagara style emerges; Buddhist monastery peak",
        "regions": "Northern India, Madhya Pradesh, Rajasthan, Odisha, Western Deccan",
        "key_features": [
            "Hindu temple crystallises as the primary architectural form — replacing Buddhist as dominant patron",
            "Nagara style (North): curvilinear shikhara (tower) over garbhagriha (sanctum)",
            "Early flat-roofed temples evolve into towered sanctuaries",
            "Mandapa (pillared hall) added in front of garbhagriha",
            "Pancharatha and saptharatha wall articulation — faceted towers with multiple projections",
            "Caves at Ajanta reach their artistic peak (Gupta period frescoes)",
            "Ellora caves begun — multi-faith rock-cut complex",
        ],
        "key_buildings": [
            ("Dashavatara Temple, Deogarh", "c. 500 CE", "Early flat-roofed Panchayatana temple; iconic Vishnu panel"),
            ("Mahabodhi Temple, Bodh Gaya", "5th–7th c. CE", "Temple at site of Buddha's enlightenment; tall spire"),
            ("Ajanta Cave 1 & 2", "c. 460–480 CE", "Peak Gupta period frescoes; pillared chaitya hall"),
            ("Udayagiri Cave 5, Vidisha", "c. 401 CE", "Varaha rescuing earth; iconic Gupta sculpture"),
        ],
        "materials": "Sandstone, granite, brick (temple superstructures), lime mortar, pigments for frescoes",
        "structural_system": "Trabeated (post and beam) construction in stone. Rock-cut for cave temples. No arch or vault — corbelled ceilings.",
        "architectural_significance": "The Gupta period is considered the classical golden age of Indian culture. The canonical texts of Hindu temple architecture (Manasara, Samarangana Sutradhara) were compiled in this period, codifying rules for proportions, iconography, and ritual layout.",
        "decline": "Gupta empire decline due to Huna invasions (c. 550 CE). Regional kingdoms fragment but carry temple building tradition.",
    },
    {
        "id": "medieval_nagara",
        "name": "Medieval — Nagara (North Indian Temple)",
        "start_ce": 700,
        "end_ce": 1200,
        "label": "c.700–1200 CE",
        "color": "#AA4400",
        "style": "Nagara temple at its peak: Khajuraho, Odisha, Solanki",
        "regions": "Madhya Pradesh (Chandela), Odisha (Ganga), Rajasthan-Gujarat (Solanki/Paramara)",
        "key_features": [
            "Shikhara becomes taller and more complex — clustered subsidiary spires (urushringas) on main tower",
            "Erotic and narrative sculpture integrated into the entire exterior surface",
            "Panchayatana layout: main sanctum + 4 subsidiary shrines at corners",
            "Ardhamandapa, Mandapa, Mahamandapa, Antarala, Garbhagriha — full processional sequence",
            "Odisha Rekha Deula style: vertical tower with curvilinear profile and incised ornament",
            "Solanki stepwells (Gujarat): vav as monumental sacred architecture underground",
            "Star-shaped plan (stellate plan) in Central Indian examples — Khajuraho, Modhera",
        ],
        "key_buildings": [
            ("Kandariya Mahadeva Temple, Khajuraho", "c.1025–1050 CE", "25 m high; 84 interlocked spires; most complete medieval temple"),
            ("Lingaraja Temple, Bhubaneswar", "c. 1055 CE", "55 m high Rekha Deula; quintessential Kalinga style"),
            ("Sun Temple, Modhera, Gujarat", "c.1026 CE", "Solanki style; aligned for solstice sunrise; kund (stepwell) in front"),
            ("Rani ki Vav, Patan", "c.1063 CE", "UNESCO; 7-storey stepped well; 500+ sculptural panels"),
        ],
        "materials": "Sandstone (Chandela, Khajuraho region), Khondalite (Odisha), buff sandstone (Solanki), dry stone construction without mortar in later phases",
        "structural_system": "Pure trabeated stone construction. Corbelled pseudo-vaults. Tower built by corbelling — not a true vault. Interlocking stone members create structural integrity through weight and friction.",
        "architectural_significance": "This period represents the absolute zenith of Hindu temple architecture. The shikhara as a mountain (Mount Meru) metaphor, the erotic sculpture as cosmological completeness, and the processional sequence from dark garbhagriha to outer light — all reach full expression here.",
        "decline": "Islamic invasions from 12th century systematically destroyed major temple complexes in Northern India.",
    },
    {
        "id": "medieval_dravida",
        "name": "Medieval — Dravidian (South Indian Temple)",
        "start_ce": 600,
        "end_ce": 1600,
        "label": "c.600–1600 CE",
        "color": "#996600",
        "style": "Dravidian Vimana; Gopuram; temple city; Vijayanagara",
        "regions": "Tamil Nadu, Karnataka, Andhra Pradesh, Kerala (Chola, Pallava, Vijayanagara empires)",
        "key_features": [
            "Vimana: pyramidal stepped tower over the main sanctum — horizontal banding, sculpture on all faces",
            "Gopuram: monumental gateway tower at cardinal entrances — dwarfs the main vimana in later periods",
            "Temple city planning: concentric walled enclosures (prakaras) around sanctum — a city within a city",
            "Mandapa columns progressively more elaborate: Vijayanagara horse columns are supreme achievement",
            "Temple tanks (pushkarani) as civic infrastructure",
            "Nataraja — Shiva as Cosmic Dancer — perfected in bronze casting (Chola period)",
        ],
        "key_buildings": [
            ("Shore Temple, Mamallapuram", "c. 700–728 CE", "Earliest structural Dravidian temple; Pallava dynasty; UNESCO"),
            ("Brihadeswara Temple, Thanjavur", "c. 1010 CE", "Chola; 63 m vimana; self-shadowing — built without shadow at noon at equinox"),
            ("Meenakshi Amman Temple, Madurai", "12th–17th c. CE", "14 gopurams; 33,000 sculptures; active temple city"),
            ("Virupaksha Temple, Hampi", "c. 740 CE + Vijayanagara additions", "Vijayanagara capital; Vijayanagara mandapa columns"),
        ],
        "materials": "Granite (south), chloritic schite, brick for upper temple tiers, lime plaster (chunam), bronze for sculpture",
        "structural_system": "Stone trabeated construction. Brick and plaster for gopuram upper sections. Bronze-cast sculpture. Lime mortar used — unlike north Indian tradition of dry stone.",
        "architectural_significance": "The Brihadeswara Temple at Thanjavur is an unparalleled structural and aesthetic achievement — the 63 m vimana required building without centering (no internal scaffolding) and was built by Emperor Raja Raja Chola I in 1010 CE.",
        "decline": "Vijayanagara sacked by Deccan Sultanates (1565 CE, Battle of Talikota). Temple tradition continues in Tamil Nadu under Nayaka rulers.",
    },
    {
        "id": "sultanate_mughal",
        "name": "Sultanate & Mughal Period",
        "start_ce": 1200,
        "end_ce": 1707,
        "label": "c.1200–1707 CE",
        "color": "#2D6A4F",
        "style": "Indo-Islamic synthesis: Trabeate + Arcuate; Persian + Indian",
        "regions": "Delhi, Agra, Fatehpur Sikri, Lahore, Ahmedabad (Gujarat Sultanate), Bijapur (Adil Shahi)",
        "key_features": [
            "Introduction of the arch, vault, and dome to Indian architecture for the first time",
            "Mughal garden (char bagh): fourfold garden divided by water channels; paradise on earth metaphor",
            "Pietra dura (inlay of semi-precious stones in marble) — Mughal decorative signature",
            "Red sandstone and white marble as primary material palette (Mughal imperial)",
            "Synthesis of Persian, Central Asian, and Rajput architectural traditions",
            "The jali (perforated stone screen) reaches supreme refinement in Mughal work",
            "Fatehpur Sikri: planned imperial capital in Akbar's idiosyncratic syncretic style",
        ],
        "key_buildings": [
            ("Qutb Minar, Delhi", "1193–1220 CE", "73 m; fluted red sandstone; first minaret of India; UNESCO"),
            ("Humayun's Tomb, Delhi", "1569–1572 CE", "First monumental Mughal garden tomb; precursor to Taj; UNESCO"),
            ("Fatehpur Sikri", "1571–1585 CE", "Akbar's planned capital; red sandstone; Indo-Islamic synthesis; UNESCO"),
            ("Taj Mahal, Agra", "1632–1653 CE", "Shah Jahan's tomb for Mumtaz Mahal; white marble; UNESCO; symbol of Mughal peak"),
            ("Gol Gumbaz, Bijapur", "1656 CE", "41 m dome; one of the largest single-chamber rooms in the world"),
        ],
        "materials": "Red Agra sandstone, white Makrana marble, pietra dura inlay (lapis lazuli, carnelian, jade), brick with lime plaster",
        "structural_system": "True arch and vault introduced — allows larger spans and taller structures. Bulbous double-dome (outer decorative dome + inner structural dome). Squinches to transition square plan to octagonal to circular drum.",
        "architectural_significance": "The Mughal period represents one of the great civilisational syntheses in architectural history. The Taj Mahal is not merely a beautiful building — it is a precisely calibrated cosmological machine, aligned to the cardinal points, reflected in water, and designed so that its form appears to float.",
        "decline": "Aurangzeb's austerity and religious policy ended Mughal patronage of fine arts. Rapid Mughal decline after 1707.",
    },
    {
        "id": "colonial",
        "name": "Colonial Period",
        "start_ce": 1757,
        "end_ce": 1947,
        "label": "1757–1947 CE",
        "color": "#4A5568",
        "style": "Indo-Saracenic; Neo-Classical; Bungalow typology; Hill station",
        "regions": "Bombay (Mumbai), Madras (Chennai), Calcutta (Kolkata), Delhi (New Delhi), Hill stations",
        "key_features": [
            "Indo-Saracenic style: British architects adopting Mughal and Hindu forms for public buildings",
            "Neo-Classical and Gothic Revival for civic institutions (courts, railways, universities)",
            "The bungalow: adapted colonial house type with deep verandah, high ceiling, and compound",
            "Hill station towns: Shimla (British summer capital), Ooty, Darjeeling — planned leisure towns",
            "Lutyens' New Delhi: Baroque planning with Classical and Indian detail hybridisation",
            "Railway infrastructure: major stations as architectural set pieces (CST Mumbai, Howrah)",
            "Baker-Lutyens debate: Herbert Baker vs Edwin Lutyens on incorporating Indian elements",
        ],
        "key_buildings": [
            ("Chhatrapati Shivaji Maharaj Terminus (CST), Mumbai", "1887–1888", "F.W. Stevens; Victorian Gothic; UNESCO heritage"),
            ("Victoria Memorial, Kolkata", "1906–1921", "William Emerson; Indo-Saracenic; white Makrana marble"),
            ("Rashtrapati Bhavan, New Delhi", "1912–1929", "Edwin Lutyens; Classical with Mughal elements; 340 rooms"),
            ("Gateway of India, Mumbai", "1924", "George Wittet; Indo-Saracenic; basalt; commemorates King George V visit"),
            ("University of Mumbai (Rajabai Tower)", "1878", "George Gilbert Scott; Gothic; modelled on Big Ben"),
        ],
        "materials": "Brick and lime plaster, basalt (Bombay/Mumbai), sandstone, marble, iron and steel (Victorian engineering), cement (introduced 1870s)",
        "structural_system": "Load-bearing masonry for civic buildings. Early use of steel frame and cast iron. Railway stations introduce large-span iron roof trusses.",
        "architectural_significance": "The colonial period created an enormous tension between European and Indian architectural traditions that has shaped the Indian architectural debate ever since. Lutyens' New Delhi remains the most ambitious planned capital in 20th-century history. The bungalow typology fundamentally transformed the Indian domestic landscape.",
        "decline": "Independence 1947 ends colonial building patronage. Indian state must define its own architectural identity.",
    },
    {
        "id": "post_independence",
        "name": "Post-Independence Modernism",
        "start_ce": 1947,
        "end_ce": 1990,
        "label": "1947–1990 CE",
        "color": "#1A3A5C",
        "style": "Nehruvian Modernism; Chandigarh experiment; Institution building",
        "regions": "Chandigarh, Ahmedabad, Delhi, Mumbai",
        "key_features": [
            "Nehru's vision: 'temples of modern India' — large dams, steel plants, educational institutions",
            "Chandigarh: Le Corbusier's planned city for Punjab after Partition — still debated today",
            "International architects invited: Le Corbusier, Louis Kahn, Buckminster Fuller",
            "CEPT founded 1962 (BV Doshi) — first Indian architecture school with modernist curriculum",
            "Balkrishna Doshi: synthesises Le Corbusier and climate-responsive design with Indian context",
            "Charles Correa: explores 'open-to-sky space' as essential Indian spatial quality",
            "Raj Rewal, Habib Rahman: developing an Indian modernism rooted in tradition",
        ],
        "key_buildings": [
            ("Chandigarh Capitol Complex", "1952–1963", "Le Corbusier; Assembly, High Court, Secretariat, Governor's Palace; UNESCO"),
            ("IIM Ahmedabad", "1962–1974", "Louis Kahn; brick; arched walkways; synthesis of tradition and modernism"),
            ("Gandhi Bhavan, Chandigarh", "1961", "Pierre Jeanneret; humanist modernism"),
            ("Aranya Housing, Indore", "1989", "Balkrishna Doshi; incrementally built low-income housing; Pritzker laureate"),
            ("Kanchanjunga Apartments, Mumbai", "1983", "Charles Correa; sky gardens; climate-responsive high-rise"),
        ],
        "materials": "Reinforced concrete (dominant), brick, exposed aggregate, glass curtain wall (from 1970s)",
        "structural_system": "Reinforced concrete frame (moment frame and shear wall). Post-tensioned concrete for long spans. Brick as infill with RC frame.",
        "architectural_significance": "This period is India's great architectural experiment — trying to build national identity through modern architecture. The tension between universalism (International Style) and specificity (Indian climate, culture, poverty) produces some of the most intellectually rich architecture of the 20th century globally.",
        "decline": "1991 economic liberalisation transforms real estate; commercial imperative increasingly overrides design quality.",
    },
    {
        "id": "contemporary",
        "name": "Contemporary Indian Architecture",
        "start_ce": 1990,
        "end_ce": 2025,
        "label": "1990–present",
        "color": "#2D9E51",
        "style": "Post-liberalisation diversity: green architecture, heritage conservation, grassroots design",
        "regions": "Pan-India; major centres: Mumbai, Bangalore, Delhi, Ahmedabad, Chennai",
        "key_features": [
            "Post-1991 liberalisation: rapid urbanisation and real estate boom fundamentally reshape cities",
            "Green architecture: GRIHA, IGBC, LEED India — sustainability becomes mainstream",
            "Heritage conservation: INTACH, ASI, and urban conservation plans",
            "Urban informality: study and design engagement with slums and informal settlements",
            "Climate emergency: passive design revival as environmental awareness grows",
            "Pritzker Prize to BV Doshi (2018) — global recognition of Indian architectural contribution",
            "Digital technology: parametric design, BIM, computational design entering Indian practice",
            "Community and participatory design: Auroville, Hunnarshala Foundation, barefoot architects",
        ],
        "key_buildings": [
            ("CEPT University Campus extensions, Ahmedabad", "2002–2017", "BV Doshi; passive design campus; Pritzker laureate 2018"),
            ("Pearl Academy, Jaipur", "2012", "Morphogenesis; vernacular jali reinterpreted; GRIHA 5-star"),
            ("Suzlon One Earth, Pune", "2009", "Mindspace; India's first LEED Platinum office campus"),
            ("Auroville — Earth Institute buildings", "1970s–ongoing", "Compressed stabilised earth blocks; barrel vault roofs — Satprem Maïni"),
            ("Chanakya Shopping Centre renovation, Delhi", "2019", "Design plus; adaptive reuse of modern heritage"),
        ],
        "materials": "Reinforced concrete (dominant), glass curtain wall, recycled materials, compressed earth blocks (Auroville), locally sourced stone and brick in climate-responsive work",
        "structural_system": "RC frame (universal). Steel frame for long-span commercial. Compressed earth, bamboo, and lime-based structures in sustainable/rural practice.",
        "architectural_significance": "Contemporary India struggles between the global (smart cities, glass towers, import aesthetics) and the deeply local (climate, craft, community). The most significant work of this period engages seriously with these tensions. BV Doshi's Pritzker Prize (2018) placed India's architectural tradition in the global canon.",
        "decline": "Ongoing — real estate pressures, rapid urbanisation, climate crisis, and a weakening of architectural education are active challenges.",
    },
]


# ── Style ─────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
.pg-header{background:linear-gradient(135deg,#1A0020,#4A1060,#8B2FC9);
 padding:1.4rem 2rem;border-radius:12px;color:white;margin-bottom:1.2rem;}
.pg-header h1{margin:0 0 0.2rem;font-size:1.9rem;}
.pg-header p{margin:0;opacity:0.85;font-size:0.9rem;}
.period-badge{display:inline-block;border-radius:20px;padding:0.15rem 0.7rem;
 font-size:0.78rem;font-weight:600;margin-bottom:0.4rem;}
.bldg-card{background:white;border-radius:6px;padding:0.7rem 1rem;
 margin-bottom:0.4rem;box-shadow:0 1px 4px rgba(0,0,0,0.07);}
.bldg-card strong{color:#1A0020;}
.significance{background:#F3E8FF;border-left:4px solid #8B2FC9;
 padding:0.8rem 1rem;border-radius:6px;font-size:0.87rem;margin:0.6rem 0;}
</style>
<div class="pg-header">
  <h1>📜 History of Indian Architecture</h1>
  <p>5000 years of built form · 9 architectural periods · Key monuments · Structural systems · Contemporary lessons</p>
</div>
""", unsafe_allow_html=True)

# ── Timeline visualisation ────────────────────────────────────────────────────
st.markdown("### ⏳ Interactive Timeline (3000 BCE — Present)")

fig_tl = go.Figure()
for i, p in enumerate(PERIODS):
    fig_tl.add_trace(go.Bar(
        x=[p["end_ce"] - p["start_ce"]],
        y=[p["name"]],
        base=p["start_ce"],
        orientation="h",
        marker_color=p["color"],
        name=p["name"],
        text=p["label"],
        textposition="inside",
        hovertemplate=(f"<b>{p['name']}</b><br>{p['label']}<br>Style: {p['style']}<extra></extra>"),
        showlegend=False,
    ))

fig_tl.update_layout(
    xaxis=dict(title="Year (negative = BCE)", gridcolor="#eee",
               tickvals=[-3000, -2000, -1000, 0, 500, 1000, 1500, 1700, 1800, 1900, 1947, 2000, 2025],
               ticktext=["3000 BCE","2000 BCE","1000 BCE","0 CE","500","1000","1500","1700","1800","1900","1947","2000","2025"]),
    yaxis=dict(autorange="reversed"),
    height=420, plot_bgcolor="white",
    margin=dict(l=200, r=20, t=20, b=60),
    barmode="overlay",
)
st.plotly_chart(fig_tl, use_container_width=True)

# ── Period detail ──────────────────────────────────────────────────────────────
st.markdown("---")
period_names = [p["name"] for p in PERIODS]
selected_name = st.selectbox("Explore a Period in Detail", period_names,
                              index=period_names.index("Sultanate & Mughal Period"))
p = next(pp for pp in PERIODS if pp["name"] == selected_name)

# Header
st.markdown(
    f'<span class="period-badge" style="background:{p["color"]};color:white;">{p["label"]}</span> '
    f'<span class="period-badge" style="background:#F3E8FF;color:#4A1060;">{p["style"]}</span>',
    unsafe_allow_html=True)
st.markdown(f"**Geographic Extent:** {p['regions']}")

# Tabs
t1, t2, t3, t4, t5 = st.tabs([
    "🔑 Key Features", "🏛️ Key Buildings", "🧱 Materials & Structure",
    "💡 Significance", "📚 Context"])

with t1:
    for feat in p["key_features"]:
        st.markdown(f"- {feat}")

with t2:
    for bldg_name, date, note in p["key_buildings"]:
        st.markdown(
            f'<div class="bldg-card">'
            f'<strong>{bldg_name}</strong> <span style="color:#999;font-size:0.8rem;">({date})</span><br>'
            f'<span style="color:#555;font-size:0.85rem;">{note}</span>'
            f'</div>',
            unsafe_allow_html=True)

with t3:
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**Materials:**")
        st.markdown(p["materials"])
    with c2:
        st.markdown("**Structural System:**")
        st.markdown(p["structural_system"])

with t4:
    st.markdown(
        f'<div class="significance">{p["architectural_significance"]}</div>',
        unsafe_allow_html=True)

with t5:
    st.markdown(f"**How this period ended / transitioned:**")
    st.markdown(p.get("decline", "This period transitioned gradually into the next through changing patronage, invasions, or ideological shifts."))

# ── Feature Comparison ────────────────────────────────────────────────────────
st.markdown("---")
st.markdown("## 📊 Compare Architectural Features Across Periods")

features = {
    "Arch/Vault": ["indus", "sultanate_mughal", "colonial", "post_independence", "contemporary"],
    "Dome": ["sultanate_mughal", "colonial"],
    "Trabeated Stone": ["vedic_mauryan", "classical", "medieval_nagara", "medieval_dravida"],
    "Courtyard": ["indus", "classical", "medieval_nagara", "medieval_dravida", "sultanate_mughal"],
    "Urban Planning": ["indus", "medieval_dravida", "sultanate_mughal", "colonial", "post_independence", "contemporary"],
    "Timber Primary": ["vedic_mauryan", "medieval_nagara"],
    "Rock-cut": ["vedic_mauryan", "classical"],
    "Ornamental Sculpture": ["classical", "medieval_nagara", "medieval_dravida", "sultanate_mughal"],
    "Garden Integration": ["sultanate_mughal", "colonial"],
    "RC Frame": ["post_independence", "contemporary"],
    "Passive Climate Design": ["indus", "vedic_mauryan", "classical", "medieval_nagara", "medieval_dravida", "contemporary"],
}

feature_data = []
for period in PERIODS:
    row = {"Period": period["name"][:30]}
    for feat, period_ids in features.items():
        row[feat] = "✅" if period["id"] in period_ids else "—"
    feature_data.append(row)

feat_df = pd.DataFrame(feature_data).set_index("Period")
st.dataframe(feat_df, use_container_width=True)

# ── Style evolution ────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown("## 📈 Architectural Style Evolution")

# Plot a simplified timeline of dominant styles using scatter
style_data = {
    "Period": [p["name"][:25] for p in PERIODS],
    "Start": [p["start_ce"] for p in PERIODS],
    "Style": [p["style"][:45] for p in PERIODS],
    "Color": [p["color"] for p in PERIODS],
}

fig_ev = go.Figure()
for i, p in enumerate(PERIODS):
    fig_ev.add_trace(go.Scatter(
        x=[(p["start_ce"] + p["end_ce"]) / 2],
        y=[0],
        mode="markers+text",
        marker=dict(size=20, color=p["color"], symbol="diamond"),
        text=[p["name"][:20]],
        textposition="top center",
        hovertemplate=f"<b>{p['name']}</b><br>{p['label']}<br>{p['style']}<extra></extra>",
        showlegend=False,
    ))
fig_ev.update_layout(
    xaxis=dict(title="Year", tickvals=[-3000,-1000,0,500,1000,1500,1700,1900,2000,2025],
               ticktext=["3000 BCE","1000 BCE","0","500","1000","1500","1700","1900","2000","Now"],
               gridcolor="#eee"),
    yaxis=dict(visible=False, range=[-0.5, 1]),
    height=250, plot_bgcolor="white", margin=dict(t=50, b=50),
    title="Chronological overview — hover each point for details"
)
st.plotly_chart(fig_ev, use_container_width=True)

# ── Study guide ────────────────────────────────────────────────────────────────
with st.expander("📚 Study Guide for Architecture Students"):
    st.markdown("""
**For B.Arch History & Theory courses:**

| Course Year | Topics to Focus On |
|-------------|-------------------|
| **1st Year** | Indus Valley planning, Stupa evolution, basic temple typology (nagara vs dravida) |
| **2nd Year** | Temple architectural orders, Indo-Islamic synthesis, Mughal garden urbanism |
| **3rd Year** | Colonial encounter and its architectural legacy, bungalow typology, vernacular traditions |
| **4th Year** | Post-independence modernism, Le Corbusier in India, BV Doshi, Charles Correa |
| **5th Year** | Contemporary debates: globalisation vs local, sustainability, heritage conservation |

**Key Architectural Debates:**
- **Orientalism vs Nationalism:** Did colonial architecture romanticise India or exploit it?
- **Universalism vs Particularity:** Was it right to apply Le Corbusier's modernism to Chandigarh?
- **Tradition vs Innovation:** How do Indian architects today negotiate heritage and contemporary needs?
- **Form vs Climate:** How much of 'Indian style' is actually climatic response, vs symbolic decoration?

**Recommended Reading:**
- *Architecture in India* — Andreas Volwahsen
- *A History of Indian Architecture* — Percy Brown
- *Understanding Architecture* — Pramar
- *The Language of Indian Architecture* — Subhash Kak
- *In the Shade of the Peepal Tree* — Charles Correa
- *A View from the Gallery* — Vikram Bhatt
    """)
