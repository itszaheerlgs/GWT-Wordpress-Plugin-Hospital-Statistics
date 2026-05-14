<?php
/**
 * templates/dashboard.php
 * Rendered by the [hospital_statistics] shortcode.
 */
if ( ! defined( 'ABSPATH' ) ) exit;
$site_name = get_option('hstats_hospital_name', get_bloginfo('name'));
$address   = get_option('hstats_hospital_address','');
?>
<div id="hstats-wrap" role="main">

<!-- ===== HEADER ===== -->
<div class="hs-header">
    <div class="hs-header-left">
        <div class="hs-logo">
            <i class="ti ti-building-hospital" aria-hidden="true"><img src="http://172.10.102.124:8080/wp-content/uploads/2026/04/HIMS_LOGO-Copy.png" alt="HIMS" oncontextmenu="return false;" draggable="false"></i>
        </div>
        <div class="hs-title-block">
            <?php if ($site_name): ?>
            <h1 class="hs-title"><?php echo esc_html($site_name); ?></h1>
            <?php if ($address): ?>
            <p class="hs-subtitle"><?php echo esc_html($address); ?></p>
            <?php endif; endif; ?>
        </div>
    </div>
    <div class="hs-tabs" role="tablist" aria-label="Statistics Period">
        <button class="hs-tab active" data-tab="monthly"    role="tab" aria-selected="true"><i class="ti ti-calendar" aria-hidden="true"></i>Monthly</button>
        <button class="hs-tab"        data-tab="quarterly"  role="tab" aria-selected="false"><i class="ti ti-calendar-stats" aria-hidden="true"></i>Quarterly</button>
        <button class="hs-tab"        data-tab="yearly"     role="tab" aria-selected="false"><i class="ti ti-chart-bar" aria-hidden="true"></i>Yearly</button>
        <button class="hs-tab"        data-tab="comparison" role="tab" aria-selected="false"><i class="ti ti-arrows-diff" aria-hidden="true"></i>Comparison</button>
    </div>
</div>
<!-- ===== TOOLBAR ===== -->
<div class="hs-toolbar">
    <div class="hs-period-badge">
        <div class="hs-period-dot"></div>
        <i class="ti ti-calendar-event" aria-hidden="true"></i>
        <span id="hs-period-lbl">Loading…</span>
    </div>
    <div class="hs-toolbar-actions">
        <button id="hs-print-btn"        class="hs-btn" title="Print Report"><i class="ti ti-printer" aria-hidden="true"></i>Print</button>
        <div class="hs-btn-divider" aria-hidden="true"></div>
        <button id="hs-export-csv-btn"   class="hs-btn" title="Export CSV"><i class="ti ti-download" aria-hidden="true"></i>Export CSV</button>
        <button id="hs-toggle-table-btn" class="hs-btn" title="Toggle data table"><i class="ti ti-table" aria-hidden="true"></i>Data table</button>
    </div>
</div>

    <!-- ===== PERIOD SELECTORS ===== -->
    <div id="hs-monthly-sel"   class="hs-selectors" style="display:none" role="group" aria-label="Monthly selector">
        <label>Year  <select class="hs-year-sel" id="hs-sel-year-monthly"  aria-label="Select year"></select></label>
        <label>Month <select id="hs-sel-month" aria-label="Select month"></select></label>
    </div>
    <div id="hs-quarterly-sel" class="hs-selectors" style="display:none" role="group" aria-label="Quarterly selector">
        <label>Year    <select class="hs-year-sel" id="hs-sel-year-quarterly" aria-label="Select year"></select></label>
        <label>Quarter <select id="hs-sel-quarter" aria-label="Select quarter"></select></label>
    </div>
    <div id="hs-yearly-sel"    class="hs-selectors" style="display:none" role="group" aria-label="Yearly selector">
        <label>Year <select class="hs-year-sel" id="hs-sel-year-yearly" aria-label="Select year"></select></label>
    </div>

    <!-- ===== SUMMARY COUNTS ===== -->
    <div id="hs-summary-section">
        <div class="hs-summary-row" id="hs-summary-row" aria-label="Summary statistics"></div>
    </div>

    <!-- ===== KPI CARDS ===== -->
    <div id="hs-kpi-section">
        <div class="hs-kpi-grid" id="hs-kpi-grid" aria-label="Key Performance Indicators">
            <div class="hs-no-data">Loading…</div>
        </div>
    </div>

    <!-- ===== CHARTS ===== -->
    <div id="hs-chart-section">
        <div class="hs-charts-grid-1">
            <div class="hs-chart-card">
                <div class="hs-chart-card-header">
                    <h3>📈 Monthly Trend — BOR, ADC &amp; ALOS</h3>
                    <select id="hs-trend-year" class="hs-mini-select" aria-label="Trend chart year"></select>
                </div>
                <div class="hs-chart-wrap"><canvas id="hs-trend-chart" aria-label="Monthly trend chart"></canvas></div>
            </div>
            <br>
            <div class="hs-chart-card">
                <div class="hs-chart-card-header"><h3>📊 Key Rates &amp; Ratios</h3></div>
                <div class="hs-chart-wrap"><canvas id="hs-bar-chart" aria-label="Rates and ratios bar chart"></canvas></div>
            </div>
        </div>
            <br>
        <div class="hs-charts-grid-1">
            <div class="hs-chart-card">
                <div class="hs-chart-card-header"><h3>💀 Mortality &amp; Rate Breakdown</h3></div>
                <div class="hs-chart-wrap"><canvas id="hs-deaths-chart" aria-label="Mortality doughnut chart"></canvas></div>
            </div>
            <br>
            <div class="hs-chart-card">
                <div class="hs-chart-card-header"><h3>🏃 OPD vs ED Average Daily Load</h3></div>
                <div class="hs-chart-wrap"><canvas id="hs-opded-chart" aria-label="OPD vs ED bar chart"></canvas></div>
            </div>
        </div>
            <br>
        <div class="hs-charts-grid-1">
            <div class="hs-chart-card">
                <div class="hs-chart-card-header"><h3>🛏 Bed Utilization Trend</h3></div>
                <div class="hs-chart-wrap"><canvas id="hs-bed-chart" aria-label="Bed utilization chart"></canvas></div>
            </div>
            <br>
            <div class="hs-chart-card">
                <div class="hs-chart-card-header"><h3>👶 Obstetrics — Deliveries &amp; CS Rate</h3></div>
                <div class="hs-chart-wrap"><canvas id="hs-ob-chart" aria-label="Obstetrics chart"></canvas></div>
            </div>
        </div>
    </div>

    <!-- ===== DATA TABLE (toggle) ===== -->
    <div id="hs-data-table-section" style="display:none">
        <div class="hs-chart-card">
            <div class="hs-chart-card-header"><h3>📋 Computed Indicators — Data Table</h3></div>
            <div class="hs-table-scroll"><table class="hs-data-table" id="hs-data-table"><thead></thead><tbody></tbody></table></div>
        </div>
    </div>

    <!-- ===== COMPARISON ===== -->
    <div id="hs-comparison-section" style="display:none">
        <div id="hs-comparison-wrap"></div>
    </div>

    <!-- ===== FOOTER ===== -->
<!--     <div class="hs-footer">
        <p>Statistics generated by Hospital Statistics Plugin v<?php echo esc_html(HSTATS_VERSION); ?>.
        Data reflects official hospital records. Rates exclude DOA, Stillbirths, and ER Deaths unless otherwise noted.</p>
    </div> -->

    <!-- ===== PRINT TEMPLATE (hidden) ===== -->
    <div id="hs-print-area" style="display:none"></div>
</div>
