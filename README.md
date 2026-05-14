# 🏥 Hospital Statistics WordPress Plugin

**Version:** 2.0.2  
**Author:** Dether/Zaheer Lagos — I.T NGANI  
**License:** GPL-2.0+  
**Requires:** WordPress 5.6+ · PHP 7.4+ · MySQL 5.7+ / MariaDB 10.2+

---

A custom WordPress plugin that digitizes the monthly hospital statistical reporting system following **DOH Philippines** standards. Staff enter raw monthly data once — the plugin auto-calculates all **13 standard indicators** and presents them on a live, interactive public dashboard.

Built for a government hospital in the Philippines.

---

## 📁 Project Structure

```
hospital-statistics/
├── hospital-statistics.php     # Main plugin — all backend logic (PHP)
├── README.md                   # This file
├── assets/
│   ├── front.css               # Public dashboard styles
│   ├── front.js                # Chart.js dashboard (REST API-driven)
│   ├── admin.css               # WP Admin panel styles
│   └── admin.js                # Admin CRUD interactions
└── templates/
    └── dashboard.php           # Shortcode output template (public-facing UI)
```

---

## ⚙️ Installation

1. Upload the `hospital-statistics` folder to `/wp-content/plugins/`
2. Activate via **Plugins → Installed Plugins** in WordPress Admin
3. Go to **Hospital Stats** in the left admin menu to start entering data
4. Place the shortcode on any page or post to show the public dashboard:

```
[hospital_statistics]
```

Optional shortcode attributes:

```
[hospital_statistics title="My Hospital Stats" show_export="no"]
```

> **Note:** If the plugin was installed manually via FTP/cPanel and the activation hook did not fire, the database tables will be created automatically on the next admin page load.

---

## ✨ Features

- **Full CRUD** via WordPress Admin — Add, Edit, Delete records per month
- **13 auto-calculated DOH indicators** from raw monthly input
- **4 dashboard views** — Monthly, Quarterly, Yearly, Comparison
- **Interactive charts** powered by Chart.js (trend lines, bar, doughnut, OPD/ED, bed utilization, obstetrics)
- **REST API-driven frontend** — live data, no page reloads
- **CSV Export & Import**
- **Audit Log** — tracks every change with username and IP address
- **Print-friendly** report
- **Settings page** — hospital name, address, default bed count

---

## 📊 DOH Statistical Indicators

All 13 indicators are computed automatically from the raw monthly inputs.

| Code | Name | Formula |
|------|------|---------|
| ADC | Average Daily Census | ISD ÷ Days |
| BOR | Bed Occupancy Rate | (ISD ÷ (Beds × Days)) × 100 |
| BTI | Bed Turnover Interval | ((Beds × Days) − ISD) ÷ D&D |
| BTR | Bed Turnover Rate | D&D ÷ Beds |
| GDR | Gross Death Rate | (Deaths ÷ D&D) × 100 |
| NDR | Net Death Rate | ((Deaths − Deaths<48h) ÷ (D&D+NB − Deaths<48h)) × 100 |
| ALS | Average Length of Stay | Total LOS ÷ D&D |
| AOV | Average OPD Visits/Day | (New + Revisits) ÷ OPD Days |
| AED | Average ED Patients/Day | ED Consults ÷ ED Days |
| CR | Caesarean Section Rate | (CS ÷ Deliveries) × 100 |
| MDR | Maternal Death Rate | (Maternal Deaths ÷ OB D&D) × 100 |
| GIR | Gross Infection Rate | (Infections ÷ D&D) × 100 |
| ISD | Inpatient Service Days | *(raw input field)* |

**Key terms:**
- **D&D** — Discharges & Deaths
- **NB** — Newborns
- **ISD** — Inpatient Service Days
- Excludes DOA, Stillbirths, and ER Deaths from death rate calculations

---

## 🗄️ Database

The plugin creates two custom MySQL tables on activation:

**`{prefix}_hospital_statistics`** — one row per month, stores ~25 raw input fields:
- Inpatient data (admissions, discharges, deaths, service days, length of stay, bed count)
- OPD data (new visits, revisits, operating days)
- ED data (consults, operating days)
- Obstetrics data (CS sections, deliveries, maternal deaths)
- Infection data

**`{prefix}_hospital_statistics_log`** — full audit trail:
- Every insert, update, and delete
- Stores old and new data (JSON), user ID, username, and IP address

---

## 🔌 REST API

The plugin registers public REST endpoints under:

```
/wp-json/hstats/v1/
```

The frontend fetches computed indicator data live from these endpoints. Key endpoint:

```
GET /wp-json/hstats/v1/computed?year=2025&month=1
GET /wp-json/hstats/v1/computed?year=2025&quarter=1
```

Responses are cached in-memory on the client side within a session to minimize requests.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 7.4+, WordPress Plugin API |
| Database | MySQL / MariaDB via `dbDelta` schema management |
| REST API | WordPress REST API (`register_rest_route`) |
| Frontend Charts | Chart.js |
| Frontend Logic | jQuery (bundled with WordPress) |
| Styles | Custom CSS (no framework dependency) |

---

## 📋 Requirements

- WordPress **5.6** or higher
- PHP **7.4** or higher
- MySQL **5.7+** or MariaDB **10.2+**

---

## 👤 Author

**Dether/Zaheer Lagos**  
I.T NGANI  
GitHub: [itszaheerlgs](https://github.com/itszaheerlgs)
