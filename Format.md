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
> ### 📌 Understanding the "Census Discharges" & "187" Relationship
> The value **187** represents the raw **Inpatients Service Days** recorded on the final 24-hour daily census tracking sheet. To maintain data integrity inside the system, the hidden parameters must perfectly balance out using the daily census tracking equation:
> 
> **Daily Census Equation:**
> $$\text{Inpatients Service Days} = (\text{Remaining at Midnight} + \text{Admissions}) - \text{Census Discharges} + \text{Same Day}$$
> 
> Using the May 2026 dataset parameters:
> $$(123 + 1,198) - \mathbf{1,134} + 0 = \mathbf{187}$$
> 
> *Note: This calculation has been completely automated via the custom jQuery script added to your data submission view.*

---

## 2. Additional Sections

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
