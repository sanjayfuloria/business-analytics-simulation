import streamlit as st
import plotly.graph_objects as go
import pandas as pd

st.set_page_config(page_title="Vernacular Architecture of India", page_icon="🏘️", layout="wide")

# ── Data ──────────────────────────────────────────────────────────────────────
VERNACULAR = {
    "Rajasthani Haveli": {
        "region": "Rajasthan (Shekhawati, Jaipur, Jaisalmer)",
        "climate": "Hot & Dry",
        "typology": "Courtyard house, urban merchant house",
        "image_desc": "Multi-storey painted mansion with intricately carved sandstone facade",
        "spatial_org": "Multiple interconnected courtyards (chowks) arranged hierarchically: baithak (guest), zenana (women's), kitchen. Rooms wrap around each courtyard. Rooftop terrace for sleeping in summer.",
        "climate_response": [
            "Central courtyard creates shaded outdoor space with favourable microclimate",
            "Jali (perforated stone screens) allow ventilation while blocking direct sun and maintaining privacy",
            "Thick sandstone walls (600–900 mm) provide high thermal mass — rooms stay cool through the day",
            "Small openings on east and west facades minimise morning and afternoon solar gain",
            "Baoli (stepwell) within or near compound for evaporative cooling of surrounding air",
            "Lime plaster on roofs reflects solar radiation (albedo effect)",
            "Underground chambers (teh khana) for extreme summer refuge",
        ],
        "materials": ["Yellow and red sandstone (Jodhpur, Jaisalmer, Dholpur)", "Burnt clay brick with lime mortar",
                       "Lime plaster (arayish) — polished to mirror finish", "Teak wood for doors and windows",
                       "Copper and brass fittings"],
        "structural_system": "Load-bearing sandstone masonry. Flat timber beams (shisham/teak) supporting stone slab roofs. Corbelled brackets projecting rooms over streets.",
        "ornament": "Intricate carved sandstone jali, floral medallions, elephant motifs, mirror inlay (sheesha) work, and frescoes depicting mythology and daily life.",
        "case_studies": ["Poddar Haveli, Nawalgarh", "Goenka Double Haveli, Sikar", "Patwon Ki Haveli, Jaisalmer", "Nathmal Ki Haveli, Jaisalmer"],
        "contemporary_lessons": ["Courtyard as passive cooling device", "Shading screens on facades", "Thermal mass in hot climates", "Integration of ornament and climate control"],
    },
    "Kerala Nalukettu": {
        "region": "Kerala (Thrissur, Palakkad, Thiruvananthapuram)",
        "climate": "Warm & Humid",
        "typology": "Traditional aristocratic family house (tharavad)",
        "image_desc": "Tiled-roof mansion with pillared verandah and central courtyard open to sky",
        "spatial_org": "Four rectangular halls (kettu) arranged around a central open courtyard (nadumuttam). Progression: outer verandah → hall → inner courtyard → kitchen. Separate wing for storing rice and paddy.",
        "climate_response": [
            "Central open-to-sky courtyard (nadumuttam) acts as a thermal chimney — hot air rises and draws cooler air through rooms",
            "Steeply pitched roof (45–60°) with large overhangs (1.5–2.5 m) sheds heavy monsoon rain and shades walls",
            "Verandah on all sides acts as a buffer between exterior heat and interior",
            "High ceilings (4–5 m) allow stratification — cooler air at occupant level",
            "Wooden louver screens (thalippila) allow wind while controlling light",
            "Raised plinth (60–90 cm) prevents moisture ingress during monsoon flooding",
            "Cross-ventilation through aligned openings on all four sides",
        ],
        "materials": ["Laterite stone (locally abundant) for plinth and walls", "Kanjippadam timber (jackwood) for structural members",
                       "Country clay tiles (Mangalore tiles or traditional Nalukettu tiles)", "Lime mortar from sea shells",
                       "Bamboo for formwork and temporary structures"],
        "structural_system": "Post-and-beam timber construction with laterite infill walls. Heavy teak columns support the roof structure. Interlocking timber joinery — no metal fasteners in traditional construction.",
        "ornament": "Elaborate wood carving on pillars, brackets, and door frames. Gajalakshmi (elephant motifs), floral patterns, and mythological scenes. Kerala mural paintings on interior walls.",
        "case_studies": ["Krishnapuram Palace, Alappuzha", "Padmanabhapuram Palace, Thiruvananthapuram", "Mattancherry Palace, Kochi", "Olappamanna Mana, Palakkad"],
        "contemporary_lessons": ["Open courtyard as passive ventilation stack", "Wide overhangs for monsoon shielding", "High ceilings for thermal comfort", "Raised floors for flood resilience"],
    },
    "Chettinad House": {
        "region": "Chettinad (Karaikudi, Pudukkottai), Tamil Nadu",
        "climate": "Warm & Humid / Hot & Dry (transitional)",
        "typology": "Merchant mansion of the Nattukotai Chettiars",
        "image_desc": "Grand colonial-era mansion with pillared thinnai, marble floors, and deep verandahs",
        "spatial_org": "Linear progression from street to private: thinnai (public verandah) → thirukattu (entrance vestibule) → mutram (inner courtyard) → mani mutram (main hall) → kitchen courtyard → service areas. Can span 30–50 m deep on a narrow street plot.",
        "climate_response": [
            "Thinnai (public colonnade) shades the facade and provides public seating — creates a cool edge to the street",
            "Multiple successive courtyards create distinct thermal zones",
            "High ceilings (5–6 m) with clerestory windows allow hot air stratification and escape",
            "Burma teak panels and thick lime plaster walls moderate temperature swings",
            "Marble and Athangudi tile floors stay cool due to high thermal mass",
            "Deep rooms rely on courtyards for light and air — no windows on party walls",
        ],
        "materials": ["Chettinad brick (dense, hand-made, extremely durable)", "Limestone from Vellore and Ariyalur",
                       "Burma teak for structural columns and screens", "Italian marble, Athangudi handmade tiles",
                       "Belgian glass for coloured ventilator panes"],
        "structural_system": "Load-bearing brick masonry with Burma teak post-and-beam inside. Heavy limestone lintels over openings. Flat lime concrete roofs.",
        "ornament": "Intricate lime stucco work, coloured Athangudi tiles, Burma teak carving, stained glass ventilators, antique Venetian chandeliers (symbols of merchant wealth).",
        "case_studies": ["Chettinad Palace (Raja's Palace), Karaikudi", "Bangala Heritage Hotel, Karaikudi", "Kanadukathan village mansions"],
        "contemporary_lessons": ["Thinnai as climate buffer at street edge", "Sequential courtyard planning for deep urban plots", "High thermal mass floors for passive cooling"],
    },
    "Goan House (Indo-Portuguese)": {
        "region": "Goa (Panjim, Margao, Bardez)",
        "climate": "Warm & Humid",
        "typology": "Colonial merchant house — fusion of Hindu and Portuguese",
        "image_desc": "Tiled house with oyster-shell windows, colourful facade, and walled garden with well",
        "spatial_org": "Central sala (living hall) flanked by private suites. Portuguese-style chapel or chapel niche at entrance. Varandinha (verandah) facing the garden. Kitchen detached at rear.",
        "climate_response": [
            "Oyster shell windows (capiz windows) diffuse light while admitting breeze — pre-industrial alternative to glass",
            "Clay tile roofs (Mangalore pattern) with wide overhangs for monsoon rainfall",
            "Chunam (lime plaster) walls reflect heat and are antifungal — critical in humid climate",
            "Jalousie shutters (angled timber slats) allow ventilation while blocking monsoon rain",
            "Central sala creates through-ventilation from verandah to rear garden",
            "Recessed balcão (balcony-porch) provides shaded outdoor space facing street",
        ],
        "materials": ["Laterite block for foundations and walls", "Lime plaster (chunam) from shell lime",
                       "Mangalore clay tiles for roof", "Teak and rosewood for doors and windows",
                       "Oyster shells (capiz) as window glazing alternative"],
        "structural_system": "Load-bearing laterite block masonry. Timber flooring on timber joists at upper level. Timber roof structure with clay tile finish.",
        "ornament": "Baroque-inspired mouldings around windows and doors, azulejo-style decorative tiles, wrought iron balustrades, colourful facade paint (ochre, blue, green).",
        "case_studies": ["Casa Braganza, Chandor", "Palacio do Deão, Quepem", "Menezes Braganza House, Chandor"],
        "contemporary_lessons": ["Translucent screens as climate filter", "Integration of garden and building", "Antifungal lime surfaces in humid climates"],
    },
    "Himachali Kath-Kuni": {
        "region": "Himachal Pradesh (Kullu, Kinnaur, upper valleys)",
        "climate": "Cold & Cloudy",
        "typology": "Multi-storey rural mountain house",
        "image_desc": "Distinctive alternating bands of stone rubble and timber logs with slate roof",
        "spatial_org": "Typically 3 storeys: ground floor for animals and grain storage (warmth from animals heats building), middle floor for living and sleeping, top floor for additional grain storage and summer use. Narrow openings facing south.",
        "climate_response": [
            "Alternating stone and timber layers (kath-kuni construction) create a seismically flexible yet thermally efficient wall",
            "Thick stone walls (600–900 mm) provide high thermal mass to retain winter solar heat",
            "Narrow openings minimise heat loss in winter",
            "Overhanging slate roofs (pathar) keep walls dry and snow away from entrances",
            "Animal keeping on ground floor provides passive radiant heat to upper floors",
            "South-facing orientation maximises winter solar gain",
            "Timber infill (kat) between stone layers provides insulation and seismic ductility",
        ],
        "materials": ["Local slate (pathar) for roofing", "Stone rubble from river beds",
                       "Deodar cedar (Cedrus deodara) for kath (timber logs)", "Clay and lime mortar",
                       "Slate flagstones for floors"],
        "structural_system": "Alternating courses of stone and timber (Kath-Kuni system). The timber logs act as tie-beams, distributing load and absorbing seismic energy. Cantilevered timber veranda at upper levels.",
        "ornament": "Carved deodar cedar panels on verandah railings and door surrounds. Painted panels with deities and auspicious symbols.",
        "case_studies": ["Traditional houses of Kullu valley", "Kamru Fort, Kinnaur", "Bahang village houses, Manali"],
        "contemporary_lessons": ["Seismically resilient traditional construction", "Animal heat as passive energy source", "Thermal mass in cold climates", "South-facing micro-siting"],
    },
    "Kerala Fishing (Coastal)": {
        "region": "Kerala and coastal Karnataka fishing communities",
        "climate": "Warm & Humid",
        "typology": "Lightweight vernacular fishing community house",
        "image_desc": "Small elevated hut with coconut thatch roof and open walls",
        "spatial_org": "Single large multi-purpose room for cooking, sleeping, and storage. Separate cooking area under a canopy. Minimal enclosure — life spills outside.",
        "climate_response": [
            "Coconut thatch roof is a superb insulator — low conductivity, high thermal resistance",
            "Open or semi-open walls allow maximum cross-ventilation from sea breezes",
            "Elevated plinth protects against tidal surge and flooding",
            "Narrow floor plan (4–5 m) ensures every room is within 2.5 m of an opening",
            "Mat roofing and woven walls allow air exchange while providing shade",
        ],
        "materials": ["Coconut palm thatch (ola) for roofing", "Bamboo for structure",
                       "Laterite block for plinth", "Woven palm mat panels for walls", "Rope and bamboo ties (no nails in traditional construction)"],
        "structural_system": "Light bamboo post-and-beam with thatch infill. Very flexible in cyclone winds — designed to bend rather than break.",
        "ornament": "Minimal — functional decoration using painted boat-prow motifs on doors, rangoli at entrance.",
        "case_studies": ["Fishing villages of Alleppey (Alappuzha)", "Mararikulam coastal community", "Vizhinjam fishing hamlet"],
        "contemporary_lessons": ["Lightweight adaptable construction in cyclone zones", "Maximum ventilation in humid climates", "Elevation for flood resilience"],
    },
    "Rajasthani Stepwell (Baoli)": {
        "region": "Rajasthan, Gujarat, Delhi",
        "climate": "Hot & Dry",
        "typology": "Public water infrastructure / social space",
        "image_desc": "Ornate multi-storey inverted pyramid descending to a well, with galleries, colonnades, and carved pavilions",
        "spatial_org": "A long descending series of platforms and stairs leading to a permanent water level. Flanked by pillared galleries at each level for resting and socialising. The architecture deepens as it descends — top levels are open, lower levels are enclosed and cool.",
        "climate_response": [
            "Descending into earth creates a naturally cool environment — temperature drops ~5–8°C per metre of depth",
            "Underground water creates high local humidity — evaporative cooling for adjacent spaces",
            "Pillared galleries at each level provide shade for resting",
            "East-west orientation keeps the most-used levels in shade during peak afternoon heat",
            "Functions as a community air conditioning system — the coolest public space in a desert town",
        ],
        "materials": ["Buff sandstone (Dholpur, Jodhpur)", "Lime mortar", "Teak wood for doors and secondary elements"],
        "structural_system": "Massive sandstone masonry descending in stepped tiers. Corbelled ceilings and arched niches for structural efficiency underground.",
        "ornament": "Elaborate carved panels at every level depicting deities, erotic sculpture, and geometric patterns. Latticed balcony screens.",
        "case_studies": ["Rani ki Vav, Patan (UNESCO)", "Agrasen ki Baoli, Delhi", "Chand Baori, Abhaneri, Rajasthan", "Adalaj ni Vav, Gujarat"],
        "contemporary_lessons": ["Earth as thermal insulation", "Infrastructure as social space", "Evaporative cooling in arid climates", "Public space as climate refuge"],
    },
    "Bengali Terracotta Temple House": {
        "region": "West Bengal (Bishnupur, Bardhaman)",
        "climate": "Warm & Humid",
        "typology": "Civic-religious architecture in a flat alluvial landscape",
        "image_desc": "Brick temple with curved Do-chala (double-hut) or Char-chala roof covered in terracotta tiles depicting mythological scenes",
        "spatial_org": "Temple: compact sanctum (garbhagriha) with circumambulatory path and pillared porch. Temple-adjacent house: linear progression, wide verandah facing east.",
        "climate_response": [
            "Curved terracotta tile roof (do-chala) sheds monsoon rain quickly",
            "High-pitched curved roof creates large interior air volume for heat stratification",
            "Brick walls with lime plaster remain cool and resist moisture",
            "Wide east-facing verandah captures morning breeze and provides shade",
            "Cross-ventilation through aligned openings on north and south",
        ],
        "materials": ["Local alluvial clay for hand-made brick and terracotta tiles", "Lime mortar and plaster",
                       "Sal wood for beams and lintels", "Iron cramps for stone connections"],
        "structural_system": "Load-bearing brick masonry. Terracotta tile cladding applied as decoration over brick. Lime concrete flat roofs in some later examples.",
        "ornament": "Terracotta panels depicting scenes from the Ramayana, Mahabharata, Krishna Leela, and everyday Bengali life. Incredibly detailed narrative tiles.",
        "case_studies": ["Bishnupur terracotta temples (17th c.)", "Shyam Rai temple, Bishnupur", "Jorebangla temple group"],
        "contemporary_lessons": ["Terracotta as climate-responsive cladding", "Curved roof forms for rain shedding", "Community-scale craft production"],
    },
    "Northeast Bamboo Architecture": {
        "region": "Assam, Meghalaya, Manipur, Nagaland, Mizoram",
        "climate": "Warm & Humid",
        "typology": "Lightweight raised timber-bamboo dwelling in forested hills",
        "image_desc": "House on stilts with bamboo walls, bamboo roof tiles, and bamboo floors elevated 1–2 m above ground",
        "spatial_org": "Single large multi-purpose room + sleeping room. Verandah facing the village path. Animals kept below the raised floor. Storage loft under roof pitch.",
        "climate_response": [
            "Raised floor on stilts allows sub-floor ventilation, eliminates ground dampness, and protects from floods and animals",
            "Split bamboo (bora) roof cladding is excellent at shedding the heavy NE monsoon rainfall",
            "Woven bamboo mat walls allow continuous air exchange in the humid climate",
            "Steeply pitched roof creates a large attic air buffer that insulates the living level",
            "Light bamboo construction in earthquake-prone regions — flexible not brittle",
        ],
        "materials": ["Bamboo (Dendrocalamus strictus, Bambusa balcooa) — primary structural and cladding material",
                       "Cane for binding and weaving", "Sal and teak posts for main columns (more durable than bamboo at ground contact)",
                       "Thatch (grass / banana leaf) for some traditional roofs"],
        "structural_system": "Bamboo post-and-beam with bamboo rafter roof. Woven bamboo panel infill. Raised on timber or bamboo stilts. Highly earthquake-resilient due to flexibility.",
        "ornament": "Woven patterns in bamboo and cane wall panels. Tribal motifs carved on wooden poles. Traditional hornbill feathers and skulls displayed at entrance in warrior communities.",
        "case_studies": ["Chang Naga houses, Nagaland", "Mising (Mishing) houses on stilts, Assam", "Khasi houses, Meghalaya", "Zomi houses, Mizoram"],
        "contemporary_lessons": ["Bamboo as structural material (high tensile strength)", "Stilt construction for flood zones", "Woven facades for naturally ventilated climates"],
    },
    "Tamil Nadu Agraharam": {
        "region": "Tamil Nadu (Thanjavur, Kumbakonam, Chidambaram)",
        "climate": "Warm & Humid",
        "typology": "Brahmin community linear street house",
        "image_desc": "A continuous row of identical narrow-fronted houses lining both sides of a street, each with a pillared thinnai",
        "spatial_org": "Narrow front (4–6 m), very deep (20–30 m). Linear progression: thinnai → entrance hall (mutham) → main courtyard (munn mutram) → kitchen courtyard (pinn mutram) → well. Common street shared as extended living space.",
        "climate_response": [
            "Narrow-front maximises the street's shading — the row houses shade each other",
            "Thinnai (public colonnade) shades the facade and acts as transition space",
            "Sequential courtyards provide daylight and ventilation to a very deep plan",
            "Mangalore tile roof with wide overhangs in coastal zones; flat terrace on drier inland sites",
            "Party walls on both sides minimise exposed surfaces — excellent thermal buffering",
        ],
        "materials": ["Brick with lime mortar", "Lime plaster (chunam) finish", "Teak or rosewood columns",
                       "Mangalore clay tiles or country tile roof"],
        "structural_system": "Load-bearing brick walls with timber lintels and columns. Party walls shared with neighbours — significantly reduces thermal load.",
        "ornament": "Kolam (rice flour patterns) on thinnai floor. Carved teak pilasters at entrance. Temple bell and lamp bracket at door frame.",
        "case_studies": ["Kumbakonam agraharam streets", "Thanjavur old town agraharams", "Srirangam agraharam near temple"],
        "contemporary_lessons": ["Linear courtyard planning for narrow urban plots", "Street as shared social and climatic infrastructure", "Shared party walls for energy efficiency"],
    },
    "Gujarati Pol House": {
        "region": "Gujarat (Ahmedabad old city / walled city)",
        "climate": "Hot & Dry / Composite",
        "typology": "Urban cluster housing — gated neighborhood (pol)",
        "image_desc": "Carved wooden haveli in a dense organic street pattern with shared well and temple at pol entrance",
        "spatial_org": "Individual houses tightly packed into a pol (gated community of 20–100 families). Each house: ground floor shop/business → upper floor living. Central khadki (pol street) shared. Common amenities: well, temple, chabutaro (bird feeder).",
        "climate_response": [
            "Narrow pol streets (2–4 m wide) create permanent shade — street temperature 8–12°C lower than open areas",
            "Shared party walls on two sides reduce exposed surface area dramatically",
            "Wooden oriel windows (khidki) project over street, allowing cross-ventilation without ground-level enclosure",
            "Central atrium with khatri (skylight) and wind-catcher orientation",
            "Dense urban fabric creates its own cool microclimate",
            "Stone and lime construction with high thermal mass",
        ],
        "materials": ["Teak and shisham wood (elaborately carved facades)", "Brick with lime mortar",
                       "Lime plaster (arayish)", "Kota stone and Dhrangadhra stone for floors"],
        "structural_system": "Load-bearing masonry with timber post-and-beam upper floors. Timber cantilever for oriel windows (khidki). Ground floor often entirely open shopfront.",
        "ornament": "Intricate carved teak facade — the most elaborate woodcarving tradition in India. Parrot, peacock, geometric, and floral motifs. Jharokha (oriel window) is the primary ornamental feature.",
        "case_studies": ["Shahi Baug pol, Ahmedabad", "Kavi pol, Ahmedabad", "Relief Road havelis", "Sant Surdas na Pol"],
        "contemporary_lessons": ["Dense fabric as passive cooling strategy", "Shared community infrastructure", "Carved wooden screens as climate control"],
    },
    "Ladakhi Mud Architecture": {
        "region": "Ladakh (Leh, Nubra, Zanskar)",
        "climate": "Cold & Sunny",
        "typology": "Multi-storey rammed earth / mud brick house in high-altitude desert",
        "image_desc": "White-washed flat-roofed mud house with small windows, prayer flags, and a large south-facing verandah",
        "spatial_org": "Typically 2–3 storeys: ground floor for animals and firewood storage (warmth rises), first floor for living and sleeping (main inhabited zone), roof terrace for drying food and sleeping in summer. Prayer room (gonkhang) on upper floor.",
        "climate_response": [
            "Rammed earth walls (600–900 mm thick) have very high thermal mass — room temperatures remain stable when outside ranges from -15°C to 30°C",
            "Small north-facing windows minimise heat loss",
            "Large south-facing glazed verandah (rabsal) acts as a solar greenhouse — passive solar heating",
            "Flat earth roof is an excellent insulator; accumulation of snow provides additional insulation",
            "White lime-washed exterior reflects summer radiation but absorbs winter sun for Trombe-wall effect",
            "Deeply recessed windows create solar shading in summer while admitting low-angle winter sun",
        ],
        "materials": ["Rammed earth (pisé) and mud brick (adobe)", "Poplar (Populus) for roof beams (only tree available)",
                       "Willow for roof decking", "Juniper bark for waterproofing under earth roof",
                       "Lime for exterior whitewash"],
        "structural_system": "Massive rammed earth walls with poplar post-and-beam roof. Traditional construction requires entire community participation (lhabab tradition).",
        "ornament": "Prayer flags (lungta), Kalachakra symbols above door, Stupa-shaped chimney caps, painted window frames in red-brown.",
        "case_studies": ["Alchi Monastery complex", "Stok Palace, Leh", "Traditional village of Turtuk", "Druk White Lotus School (contemporary interpretation)"],
        "contemporary_lessons": ["Thermal mass as primary climate control in extreme cold", "Passive solar greenhouse in cold climates", "Community construction as social infrastructure"],
    },
}

# ── Style ─────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
.pg-header{background:linear-gradient(135deg,#6B3A2A,#A0522D,#CD853F);
 padding:1.4rem 2rem;border-radius:12px;color:white;margin-bottom:1.2rem;}
.pg-header h1{margin:0 0 0.2rem;font-size:1.9rem;}
.pg-header p{margin:0;opacity:0.85;font-size:0.9rem;}
.feature-pill{display:inline-block;background:#FFF3E0;color:#A0522D;
 border:1px solid #CD853F;border-radius:20px;padding:0.2rem 0.7rem;
 font-size:0.8rem;margin:0.2rem;}
.lesson{background:#FFF8F0;border-left:4px solid #CD853F;
 padding:0.6rem 0.9rem;border-radius:6px;font-size:0.85rem;margin-bottom:0.3rem;}
.section-title{color:#6B3A2A;font-weight:700;border-bottom:2px solid #CD853F;
 padding-bottom:0.3rem;margin:1.2rem 0 0.6rem;}
</style>
<div class="pg-header">
  <h1>🏘️ Vernacular Architecture of India</h1>
  <p>12 regional traditions · Climate response strategies · Materials · Construction systems · Case studies</p>
</div>
""", unsafe_allow_html=True)

# ── Main selector ─────────────────────────────────────────────────────────────
col_sel, col_filter = st.columns([3, 1])
with col_filter:
    climate_filter = st.selectbox("Filter by Climate Zone",
                                   ["All"] + sorted(set(v["climate"].split(" / ")[0] for v in VERNACULAR.values())))
with col_sel:
    filtered_traditions = {k: v for k, v in VERNACULAR.items()
                           if climate_filter == "All" or climate_filter in v["climate"]}
    tradition = st.selectbox("Select Vernacular Tradition", list(filtered_traditions.keys()))

td = VERNACULAR[tradition]

# ── Overview row ──────────────────────────────────────────────────────────────
st.markdown(f"### {tradition}")
c1, c2, c3 = st.columns(3)
c1.metric("Region", td["region"][:35] + ("…" if len(td["region"]) > 35 else ""))
c2.metric("Climate Zone", td["climate"])
c3.metric("Building Typology", td["typology"][:35] + ("…" if len(td["typology"]) > 35 else ""))

st.markdown(f"**Spatial Organisation:** {td['spatial_org']}", unsafe_allow_html=False)

# ── Tabs ──────────────────────────────────────────────────────────────────────
t1, t2, t3, t4, t5 = st.tabs([
    "🌬️ Climate Response", "🧱 Materials & Structure", "🏛️ Ornament & Culture",
    "📍 Case Studies", "💡 Contemporary Lessons"])

with t1:
    st.markdown('<div class="section-title">How this building responds to its climate:</div>', unsafe_allow_html=True)
    for feat in td["climate_response"]:
        st.markdown(f"- {feat}")

with t2:
    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="section-title">Primary Materials</div>', unsafe_allow_html=True)
        for mat in td["materials"]:
            st.markdown(f"- {mat}")
    with c2:
        st.markdown('<div class="section-title">Structural System</div>', unsafe_allow_html=True)
        st.markdown(td["structural_system"])

with t3:
    st.markdown('<div class="section-title">Ornament & Cultural Expression</div>', unsafe_allow_html=True)
    st.markdown(td["ornament"])

with t4:
    st.markdown('<div class="section-title">Important Case Studies</div>', unsafe_allow_html=True)
    for cs in td["case_studies"]:
        st.markdown(f"- **{cs}**")

with t5:
    st.markdown('<div class="section-title">Lessons for Contemporary Architecture</div>', unsafe_allow_html=True)
    for lesson in td["contemporary_lessons"]:
        st.markdown(
            f'<div class="lesson">💡 <strong>{lesson}</strong></div>',
            unsafe_allow_html=True)

# ── Compare Two Traditions ─────────────────────────────────────────────────────
st.markdown("---")
st.markdown("## 🔄 Compare Two Traditions")

traditions_list = list(VERNACULAR.keys())
ca, cb = st.columns(2)
with ca:
    trad_a = st.selectbox("Tradition A", traditions_list, index=traditions_list.index(tradition))
with cb:
    default_b_list = [t for t in traditions_list if t != trad_a]
    trad_b = st.selectbox("Tradition B", traditions_list,
                           index=traditions_list.index(default_b_list[0]))

ta, tb = VERNACULAR[trad_a], VERNACULAR[trad_b]

compare_df = pd.DataFrame({
    "Attribute": ["Region", "Climate Zone", "Typology", "Structural System",
                  "Primary Material 1", "Primary Material 2"],
    trad_a: [ta["region"][:40], ta["climate"], ta["typology"][:40],
             ta["structural_system"][:60]+"…",
             ta["materials"][0], ta["materials"][1] if len(ta["materials"]) > 1 else "–"],
    trad_b: [tb["region"][:40], tb["climate"], tb["typology"][:40],
             tb["structural_system"][:60]+"…",
             tb["materials"][0], tb["materials"][1] if len(tb["materials"]) > 1 else "–"],
})
st.dataframe(compare_df, use_container_width=True, hide_index=True)

# Climate response comparison: count mentions of key strategies
strategy_keywords = {
    "Courtyard": "courtyard",
    "Thermal Mass": "thermal mass",
    "Cross Ventilation": "ventilat",
    "Shading / Overhang": "shade|overhang|shad",
    "Raised Floor": "raised|stilt|elevated|plinth",
    "Evaporative Cooling": "evaporat",
    "Passive Solar": "solar",
}
import re
scores_a = {k: 1 if any(re.search(pat, f.lower()) for f in ta["climate_response"] + [ta["structural_system"]])
            else 0 for k, pat in strategy_keywords.items()}
scores_b = {k: 1 if any(re.search(pat, f.lower()) for f in tb["climate_response"] + [tb["structural_system"]])
            else 0 for k, pat in strategy_keywords.items()}

fig = go.Figure()
fig.add_trace(go.Bar(name=trad_a, x=list(strategy_keywords.keys()), y=list(scores_a.values()),
                      marker_color="#C4420A"))
fig.add_trace(go.Bar(name=trad_b, x=list(strategy_keywords.keys()), y=list(scores_b.values()),
                      marker_color="#0077B6"))
fig.update_layout(barmode="group", title="Passive Strategy Presence (1=present, 0=absent)",
                  yaxis=dict(range=[0, 1.2], tickvals=[0, 1]),
                  plot_bgcolor="white", height=350,
                  legend=dict(orientation="h", y=1.1))
st.plotly_chart(fig, use_container_width=True)

# ── All traditions summary table ───────────────────────────────────────────────
st.markdown("---")
st.markdown("## 📋 All Vernacular Traditions at a Glance")
summary_df = pd.DataFrame([
    {"Tradition": k, "Region": v["region"][:45]+"…" if len(v["region"])>45 else v["region"],
     "Climate": v["climate"], "Typology": v["typology"][:40]+"…",
     "Key Strategy": v["contemporary_lessons"][0]}
    for k, v in VERNACULAR.items()
])
st.dataframe(summary_df, use_container_width=True, hide_index=True)
