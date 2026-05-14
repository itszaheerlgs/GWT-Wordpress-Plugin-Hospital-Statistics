# Hospital Statistics Plugin v2.0.1
## Dr. George Tocao Hofer Medical Center — Ipil, Zamboanga Sibugay

### Installation
1. Upload the `hospital-statistics` folder to `/wp-content/plugins/`
2. Activate the plugin through **Plugins → Installed Plugins** in WordPress Admin
3. Go to **Hospital Stats** in the left admin menu to start entering data

### Usage
Place the shortcode `[hospital_statistics]` on any page or post to display the public dashboard.

### Features
- Full CRUD via WordPress Admin (Add / Edit / Delete per month)
- 13 computed statistical indicators (ADC, BOR, BTI, BTR, GDR, NDR, ALS, AOV, AED, CR, MDR, GIR, ISD)
- Monthly / Quarterly / Yearly / Comparison dashboard views
- Interactive Chart.js charts (trend, bar, doughnut, OPD/ED, bed utilization, obstetrics)
- CSV Export & Import
- Audit log (tracks all changes with user and IP)
- Print-friendly report
- Settings page (hospital name, address, bed count)

### Formula Reference (DOH Philippines)
| Code | Name | Formula |
|------|------|---------|
| ADC  | Average Daily Census | ISD ÷ Days |
| BOR  | Bed Occupancy Rate | (ISD ÷ (Beds × Days)) × 100 |
| BTI  | Bed Turnover Interval | ((Beds × Days) − ISD) ÷ D&D |
| BTR  | Bed Turnover Rate | D&D ÷ Beds |
| GDR  | Gross Death Rate | (Deaths ÷ D&D) × 100 |
| NDR  | Net Death Rate | ((Deaths − Deaths<48h) ÷ (D&D+NB − Deaths<48h)) × 100 |
| ALS  | Average Length of Stay | Total LOS ÷ D&D |
| AOV  | Avg OPD Visits/Day | (New + Revisits) ÷ OPD Days |
| AED  | Avg ED Patients/Day | ED Consults ÷ ED Days |
| CR   | Caesarean Section Rate | (CS ÷ Deliveries) × 100 |
| MDR  | Maternal Death Rate | (Maternal Deaths ÷ OB D&D) × 100 |
| GIR  | Gross Infection Rate | (Infections ÷ D&D) × 100 |

*D&D = Discharges & Deaths, NB = Newborns, ISD = Inpatient Service Days*
*Excludes DOA, Stillbirths, and ER Deaths from death rate calculations.*

### Shortcode Options
```
[hospital_statistics]
[hospital_statistics title="My Hospital Stats" show_export="no"]
```

### Requirements
- WordPress 5.6+
- PHP 7.4+
- MySQL 5.7+ / MariaDB 10.2+
