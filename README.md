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



---
---

# May 2026 Hospital Report Mapping

This repository contains the field-to-field mapping between the **May 2026 DOCX** report and the internal system data inputs.

---

## 1. Inpatient Service Mapping

| Field in DOCX | Field in System | Value from DOCX |
| :--- | :--- | :--- |
| Total Inpatient Service Days for a period | **Total Inpatient Service Days for a Period** | **4,533** |
| Total days in the same period | **Total days in the same period** | **31** |
| Total no. of authorized beds | **Authorized / Implementing Beds** | **100** |
| Inpatients Remaining at midnight | **Inpatients Remaining at Midnight (start)** | **123** |
| Admissions | **Total Admissions** | **1,198** |
| Total discharges and deaths for the same period | **Total discharges including deaths and newborns** | **1,194** |
| Admitted & Discharged on the same day | **Admitted & Discharged Same Day** | **0** |
| <span style="color:#d97706; font-weight:bold;">*(Derived Formula)*</span> | **Discharges & Deaths (last day of month only)** | <span style="color:#2563eb; font-weight:bold;">**1,134**</span> |
| Total Length of Stay of discharged patients | **Total Length of Stay of discharged patients** | **4,011** |

> [!NOTE]
> ### 📌 Understanding the "Census Discharges" Value
> The field **Discharges & Deaths (last day of month only)** does not exist as a separate raw number line in the source report document. Instead, it is a derived balance parameter required to satisfy the system's daily bed census accounting logic.
> 
> **The Calculation Formula:**
> $$\text{Census Discharges} = (\text{Remaining at Midnight} + \text{Admissions} + \text{Same Day}) - \text{Inpatients Service Days}$$
> 
> Using the May 2026 dataset parameters:
> $$(123 + 1,198 + 0) - \mathbf{187} = \mathbf{1,134}$$
> 
> *This value is handled automatically on the client-side via the implemented jQuery autofill hook script.*

> [!TIP]
> ### 🧮 Understanding the "187" Value (Daily Census Formula)
> The number **187** represents the raw **Inpatients Service Days** recorded on the final 24-hour daily census tracking sheet. To maintain data integrity across systems, the numbers balance using the **Daily Census Balance Equation**:
> 
> **The Math Equation:**
> $$\text{Inpatients Service Days} = (\text{Inpatients Remaining at Midnight [Start]}) + \text{Admissions} - \text{Census Discharges} + \text{Same Day Admissions \& Discharges}$$
> 
> **🧩 Plugging in the May 2026 Metrics:**
> * Inpatients Remaining at Midnight (Start): **123**
> * Total Admissions: **1,198**
> * Census Discharges & Deaths: <span style="color:#2563eb; font-weight:bold;">**1,134**</span> *(The value derived from system balance)*
> * Admitted & Discharged Same Day: **0**
> 
> **The Math Calculation:**
> $$\text{Inpatients Service Days} = (123 + 1,198) - 1,134 + 0$$
> $$\text{Inpatients Service Days} = 1,321 - 1,134$$
> $$\text{Inpatients Service Days} = \mathbf{187}$$

---

## 2. Neonatal Indicators

> [!IMPORTANT]
> ### 👶 Neonatal Death Rate Calculation
> This metric evaluates infant mortality performance indicators based on total newborn lifecycle tracking configurations.
> 
> **Mathematical Formula:**
> $$\text{Neonatal Death Rate} = \left( \frac{\text{Total no. of NB deaths for the period}}{\text{Total no. of NB Infant discharges (including deaths) for the period}} \right) \times 100$$
> 
> **🧩 Sample Dataset Parameters (May 2026):**
> * Total no. of NB deaths for the period: **2**
> * Total no. of NB Infant discharges (including deaths) for the period: **309**
> 
> **The Rate Metric Run:**
> $$\text{Neonatal Death Rate} = \left( \frac{2}{309} \right) \times 100 \approx \mathbf{0.65\%}$$

---

## 3. Additional Sections

### Deaths Section

| Field in DOCX | Field in System | Value from DOCX |
| :--- | :--- | :--- |
| Total deaths including Newborns | **Total Deaths (incl. Newborns)** | **20** |
| Death under 48 hours | **Deaths Under 48 Hours** | **4** |
| Total no. of NB deaths | **Newborn Deaths** | **2** |

### Outpatient & Emergency Section

| Field in DOCX | Field in System | Value from DOCX |
| :--- | :--- | :--- |
| New outpatient visits | **OPD New Visits** | **2,275** |
| Revisits | **OPD Revisits** | **846** |
| Total no. of days for the same period (OPD) | **OPD Days in Period** | **21** |
| Total no. of ED Consults | **ED Total Consults** | **1,995** |
| Total no. of days for the same period (ED) | **ED Days in Period** | **31** |

### Obstetrics Section

| Field in DOCX | Field in System | Value from DOCX |
| :--- | :--- | :--- |
| Total no. of Caesarean sections | **Total no. of Caesarean sections** | **52** |
| Total no. of deliveries | **Total no. of deliveries** | **306** |
| Total no. of direct maternal deaths | **Total no. of direct maternal deaths** | **0** |
| Total no. of NB Infant discharges | **Total OB Discharges (incl. Deaths)** | **309** |


---
---
# Dynamic Custom Sections Guide

## Overview

The Hospital Statistics plugin now supports **dynamic custom sections** without requiring core plugin edits. Add new data collection sections through WordPress filter hooks that automatically persist and display across the admin form and dashboard.

---

## How It Works

### The Filter Hook System

When the admin entry form loads, the plugin uses the `apply_filters('hstats_input_fields', $fields)` hook. This allows external code to add new sections dynamically:

```
Core Fields (standard hospital metrics)
    ↓
apply_filters('hstats_input_fields')
    ↓
Custom Sections (your additions via filter)
    ↓
Final Form Rendering
```

### Data Persistence Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ADMIN ENTRY PAGE LOADS                                   │
├─────────────────────────────────────────────────────────────┤
│ • Plugin calls hstats_input_fields()                         │
│ • Returns standard fields                                    │
│ • Applies 'hstats_input_fields' filter                       │
│ • Your custom filter adds more sections                      │
│ • Final array: standard + Laboratory + custom fields        │
│                                                              │
│ → Admin form renders all sections                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. USER FILLS FORM & SUBMITS                                │
├─────────────────────────────────────────────────────────────┤
│ POST data includes:                                         │
│ • Standard fields (ip_admissions, d_total, etc.)            │
│ • Custom fields (lab_total_tests, ip_ppe_masks_used, etc.)  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. SAVE PROCESS (save_month)                                │
├─────────────────────────────────────────────────────────────┤
│ For each field in POST:                                     │
│ • If in known schema columns → Save directly to table       │
│ • If NOT in schema → Store in JSON extra_data column        │
│                                                              │
│ Example:                                                    │
│ ✓ ip_admissions=150         → dgthmc_hospital_statistics    │
│ ✓ d_newborn_discharges=50   → dgthmc_hospital_statistics    │
│ ✓ lab_total_tests=280       → extra_data JSON               │
│ ✓ ip_ppe_masks_used=1000    → extra_data JSON               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4. LOADING FOR EDIT (normalize_row)                         │
├─────────────────────────────────────────────────────────────┤
│ When user edits a record:                                   │
│ • Retrieve row from database                                │
│ • Decode JSON from extra_data column                        │
│ • Merge custom fields back into row                         │
│ • Return to form with ALL fields ready to edit              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 5. DISPLAY ON DASHBOARD                                     │
├─────────────────────────────────────────────────────────────┤
│ REST API /computed endpoint:                                │
│ • Loads record from DB                                      │
│ • Calls normalize_row() to merge extra_data                 │
│ • Returns complete row to front.js                          │
│ • Front-end renders all available data                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Field Structure

### Basic Field Format

```php
'field_key' => [
    'label'       => 'Human-readable label',      // REQUIRED
    'min'         => 0,                           // optional: minimum value
    'max'         => 31,                          // optional: maximum value
    'attributes'  => [ 'placeholder' => '...' ],  // optional: HTML attributes
    'help'        => 'Help text',                 // optional: displays below field
]
```

### Section Organization

```php
'Section Name' => [
    'field_key_1' => [ ... ],
    'field_key_2' => [ ... ],
    'field_key_3' => [ ... ],
]
```

---

## Getting Started: Quick Examples

### Example 1: Laboratory Section

Add to your **theme's `functions.php`** or **mu-plugin**:

```php
<?php
add_filter( 'hstats_input_fields', function( $fields ) {
    $fields['Laboratory'] = [
        'lab_total_tests' => [
            'label'  => 'Total Lab Tests Performed',
            'min'    => 0,
            'help'   => 'Count all lab tests including culture, blood work, urinalysis, etc.'
        ],
        'lab_positive_culture' => [
            'label'  => 'Positive Culture Results',
            'min'    => 0,
            'help'   => 'Number of positive pathogenic cultures.'
        ],
        'lab_turnaround_time' => [
            'label'  => 'Average Turnaround Time (hours)',
            'min'    => 0,
            'max'    => 72,
            'help'   => 'Average hours from sample submission to result delivery.'
        ],
    ];
    return $fields;
});
```

**Result:** New "Laboratory" section appears in admin form with 3 fields. Values auto-save and load.

---

### Example 2: Infection Prevention Section

```php
<?php
add_filter( 'hstats_input_fields', function( $fields ) {
    $fields['Infection Prevention'] = [
        'ip_ppe_masks_used' => [
            'label'  => 'PPE Masks Used',
            'min'    => 0,
        ],
        'ip_hand_sanitizer_ml' => [
            'label'  => 'Hand Sanitizer (mL)',
            'min'    => 0,
        ],
        'ip_infections_uti' => [
            'label'  => 'UTI Cases',
            'min'    => 0,
        ],
        'ip_infections_ssi' => [
            'label'  => 'SSI Cases',
            'min'    => 0,
        ],
        'ip_infections_pneumonia' => [
            'label'  => 'Pneumonia Cases',
            'min'    => 0,
        ],
    ];
    return $fields;
});
```

---

### Example 3: Pharmacy & Medication Management

```php
<?php
add_filter( 'hstats_input_fields', function( $fields ) {
    $fields['Pharmacy Management'] = [
        'pharm_prescriptions_filled' => [
            'label'  => 'Prescriptions Filled',
            'min'    => 0,
        ],
        'pharm_generic_dispensed' => [
            'label'  => 'Generic Medications Dispensed',
            'min'    => 0,
            'help'   => 'Count of generic medications vs. brand name for cost analysis.'
        ],
        'pharm_expired_destroyed' => [
            'label'  => 'Expired Medications Destroyed',
            'min'    => 0,
        ],
        'pharm_drug_wastage_percent' => [
            'label'  => 'Drug Wastage (%)',
            'min'    => 0,
            'max'    => 100,
        ],
    ];
    return $fields;
});
```

---

## Where to Put Your Code

### Option 1: Theme Functions (Simplest)

Add to the end of your theme's `functions.php`:

```
wp-content/themes/your-theme/functions.php
```

**Pros:** Easy to edit, works immediately
**Cons:** Custom sections disappear if you change themes

---

### Option 2: Must-Use Plugin (Recommended)

Create a new file: `wp-content/mu-plugins/hstats-custom-sections.php`

```php
<?php
/**
 * Plugin Name: Hospital Stats Custom Sections
 * Description: Extended data modules for Hospital Statistics
 */

add_filter( 'hstats_input_fields', function( $fields ) {
    $fields['Laboratory'] = [ ... ];
    $fields['Pharmacy Management'] = [ ... ];
    return $fields;
});
```

**Pros:** Persistent across theme changes, auto-loads before plugins
**Cons:** Requires server file access

---

### Option 3: Dedicated Plugin

Create a full custom plugin with:

```
wp-content/plugins/hstats-lab-module/
    ├── plugin.php (main file with filter)
    └── readme.txt
```

**Pros:** Easily distributable, independent versioning
**Cons:** More overhead for small extensions

---

## Advanced: Display Custom Fields on Dashboard

### Step 1: Add to Indicator Metadata

```php
<?php
add_filter( 'hstats_indicator_labels', function( $labels ) {
    $labels['LAB_CULTURE_RATE'] = [
        'label'  => 'Positive Culture Rate',
        'unit'   => '%',
        'icon'   => '🧬',
        'color'  => '#8b5cf6',
        'desc'   => 'Percentage of positive culture results.'
    ];

    $labels['PHARM_WASTAGE'] = [
        'label'  => 'Pharmacy Wastage Rate',
        'unit'   => '%',
        'icon'   => '💊',
        'color'  => '#ef4444',
        'desc'   => 'Percentage of medications wasted or expired.'
    ];

    return $labels;
});
```

### Step 2: Add Computation Logic

The plugin's formula engine needs to compute these custom indicators. Hook into the computation:

```php
<?php
add_filter( 'hstats_compute_all', function( $indicators, $row ) {
    // Lab Culture Rate
    $lab_total = $row['lab_total_tests'] ?? 0;
    $lab_pos = $row['lab_positive_culture'] ?? 0;
    $indicators['LAB_CULTURE_RATE'] = $lab_total > 0
        ? round( ( $lab_pos / $lab_total ) * 100, 2 )
        : 0;

    // Pharmacy Wastage
    $pharm_total = $row['pharm_prescriptions_filled'] ?? 0;
    $pharm_waste = $row['pharm_expired_destroyed'] ?? 0;
    $indicators['PHARM_WASTAGE'] = $pharm_total > 0
        ? round( ( $pharm_waste / $pharm_total ) * 100, 2 )
        : 0;

    return $indicators;
}, 10, 2 );
```

**Result:** New indicators appear as KPI cards on the dashboard and are included in charts/exports.

---

## Complete Working Example

Save as: `wp-content/mu-plugins/hstats-extended.php`

```php
<?php
/**
 * Plugin Name: Hospital Statistics - Extended Modules
 * Description: Laboratory, Infection Prevention & Pharmacy modules
 * Version: 1.0
 * Author: Your Hospital
 */

// ============================================================
// 1. ADD LABORATORY SECTION
// ============================================================
add_filter( 'hstats_input_fields', function( $fields ) {

    $fields['Laboratory'] = [
        'lab_total_tests' => [
            'label' => 'Total Tests Performed',
            'min'   => 0,
            'help'  => 'All laboratory tests performed in the period.'
        ],
        'lab_positive_culture' => [
            'label' => 'Positive Culture Results',
            'min'   => 0,
            'help'  => 'Count of positive pathogenic cultures.'
        ],
        'lab_turnaround_time' => [
            'label' => 'Avg Turnaround Time (hours)',
            'min'   => 0,
            'max'   => 72,
        ],
    ];

    // ============================================================
    // 2. ADD INFECTION PREVENTION SECTION
    // ============================================================
    $fields['Infection Prevention'] = [
        'ip_ppe_masks_used' => [
            'label' => 'PPE Masks Used',
            'min'   => 0,
        ],
        'ip_hand_sanitizer_ml' => [
            'label' => 'Hand Sanitizer (mL)',
            'min'   => 0,
        ],
        'ip_infections_uti' => [
            'label' => 'UTI Cases',
            'min'   => 0,
        ],
        'ip_infections_ssi' => [
            'label' => 'SSI Cases',
            'min'   => 0,
        ],
    ];

    return $fields;
});

// ============================================================
// 3. ADD CUSTOM INDICATORS TO DASHBOARD
// ============================================================
add_filter( 'hstats_indicator_labels', function( $labels ) {

    $labels['LAB_CULTURE_RATE'] = [
        'label' => 'Positive Culture Rate',
        'unit'  => '%',
        'icon'  => '🧬',
        'color' => '#8b5cf6',
        'desc'  => 'Percentage of positive cultures out of total tests.'
    ];

    $labels['IP_UTI_RATE'] = [
        'label' => 'UTI Rate',
        'unit'  => 'cases',
        'icon'  => '⚠️',
        'color' => '#f59e0b',
        'desc'  => 'Urinary tract infection cases detected.'
    ];

    return $labels;
});

// ============================================================
// 4. COMPUTE CUSTOM INDICATORS
// ============================================================
add_filter( 'hstats_compute_all', function( $indicators, $row ) {

    // Lab Culture Rate
    $lab_total = $row['lab_total_tests'] ?? 0;
    $lab_pos = $row['lab_positive_culture'] ?? 0;
    $indicators['LAB_CULTURE_RATE'] = $lab_total > 0
        ? round( ( $lab_pos / $lab_total ) * 100, 2 )
        : 0;

    // UTI Rate (example: simple count)
    $indicators['IP_UTI_RATE'] = $row['ip_infections_uti'] ?? 0;

    return $indicators;
}, 10, 2 );
```

---

## Technical Details

| Aspect                  | Details                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **Storage**             | Standard columns in `dgthmc_hospital_statistics` table; custom fields as JSON in `extra_data` column |
| **Auto-loading**        | Custom fields automatically loaded when editing via `normalize_row()` method                         |
| **Dashboard Display**   | All fields available in data endpoints; create indicators via `hstats_indicator_labels` filter       |
| **Persistence**         | Custom data persists through plugin updates (stored in separate JSON column)                         |
| **No DB Migrations**    | No need to alter table schema — just use the filter and save                                         |
| **Backward Compatible** | Removing filter doesn't corrupt data — values remain in `extra_data` JSON                            |

---

## Troubleshooting

### Custom fields not appearing in form?

1. **Verify filter hook is hooked early enough:**

    ```php
    // Add priority to ensure it runs
    add_filter( 'hstats_input_fields', function( $fields ) {
        // your code
    }, 10 ); // 10 is default priority
    ```

2. **Check file location:**
    - Must-use plugins run before regular plugins
    - Theme functions.php runs after plugins
    - Use `mu-plugins/` for guaranteed execution order

3. **Clear caches:**
    - WordPress object cache may cache filter results
    - Clear transients if using caching plugin

### Values not saving?

1. **Check field key naming:**
    - Use lowercase with underscores: `lab_total_tests` ✓
    - No spaces or special chars (except underscore)

2. **Verify section structure:**

    ```php
    'Section Name' => [  // Section name (string key)
        'field_key' => [ ... ]  // Field inside section
    ]
    ```

3. **Sanitization:**
    - Numeric fields: wrap values in `(int)` or `(float)`
    - Text fields: use `sanitize_text_field()`
    - System handles this automatically for custom fields

### Data not loading when editing?

- If `normalize_row()` isn't called, custom data won't merge
- This should happen automatically for admin edit page
- Check for `HSTATS_Data::get_raw_month()` in your code

---

## API Reference

### Available Hooks

| Hook                      | Parameters            | Purpose                                    |
| ------------------------- | --------------------- | ------------------------------------------ |
| `hstats_input_fields`     | `$fields` (array)     | Add custom sections & fields to admin form |
| `hstats_indicator_labels` | `$labels` (array)     | Define new dashboard indicators            |
| `hstats_compute_all`      | `$indicators`, `$row` | Compute custom indicator values            |

### Key Functions

```php
// Get fields with custom sections applied
$fields = hstats_input_fields();

// Get raw month data with custom fields merged
$data = HSTATS_Data::get_raw_month( 2026, 5 );

// Save month with custom fields
HSTATS_Data::save_month( $data, $user_id );

// Get computed indicators including custom ones
$indicators = HSTATS_Formulas::compute_all( $row );
```

---

## Best Practices

✅ **DO:**

- Use descriptive, unique field keys: `lab_total_tests` not `lab1`
- Group related fields in logical sections
- Provide help text for clarity
- Use min/max validation for data quality
- Create indicators for important metrics you want on dashboard

❌ **DON'T:**

- Edit core plugin files for custom sections (use filters!)
- Use field keys that match existing schema columns
- Forget sanitization for user input
- Mix data types in a single field (stick to int/text per field)

---

## Support & Questions

For technical help, refer to:

- **Plugin Code:** `hospital-statistics.php` lines 550-630 (field structure)
- **Data Handling:** `HSTATS_Data::save_month()` (lines 420-480)
- **Display:** `hstats_indicator_labels()` (lines 500-520)

---

**Last Updated:** June 2026
**Plugin Version:** 2.0.3+
