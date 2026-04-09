---
title: Arch India Architecture Education Platform
emoji: 🏛️
colorFrom: orange
colorTo: red
sdk: streamlit
sdk_version: 1.41.0
app_file: app.py
pinned: false
license: mit
---

# 🏛️ Arch-India: Architecture Education Platform

An interactive simulation platform for teaching and learning architecture in the Indian context — built for B.Arch students, M.Arch students, and faculty of Indian Architecture Schools.

## Modules

| Module | Description |
|--------|-------------|
| 🌡️ **Climate-Responsive Design** | BEE climate zones, monthly data for 20+ cities, passive strategies, solar angles |
| 🌿 **GRIHA Rating Calculator** | India's green building rating — interactive 100-point checklist with star rating |
| 📐 **NBC Compliance Checker** | National Building Code 2016 — FAR, setbacks, parking, occupancy load |
| 🏘️ **Vernacular India** | 12+ regional vernacular traditions — climate response, materials, typology |
| 📏 **Space Programming** | Area calculator for 10+ building typologies using NBC space standards |
| 📜 **Architecture History** | Interactive timeline: Indus Valley to contemporary Indian architecture |

## Tech Stack

- **Frontend/Backend:** Python + Streamlit
- **Charts:** Plotly
- **Data:** Embedded Python dicts (NBC 2016, BEE climate zones, GRIHA V.2019)
- **Hosting:** Hugging Face Spaces

## Local Development

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Data Sources

- Bureau of Energy Efficiency (BEE) — Climate Zone Classification
- National Building Code of India 2016 (NBC 2016)
- GRIHA Council — Green Rating for Integrated Habitat Assessment V.2019
- IMD — Indian Meteorological Department climate normals
- INTACH — Indian vernacular architecture documentation

## For Educators

Each module includes:
- **Architecture Insights** — contextualised tips derived from input data
- **Design Checklists** — apply principles to your own project
- **Case Study References** — real Indian buildings demonstrating each concept
- **Comparison Tools** — compare cities, regions, periods, and building configurations

## License

MIT License — Free for educational use. Attribution appreciated.
