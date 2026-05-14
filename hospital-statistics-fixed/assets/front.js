/* ============================================================
   Hospital Statistics Plugin — front.js v3.0
   Data is fetched LIVE from the REST API (hstats/v1).
   Nothing is hardcoded — all numbers come from the database.
   ============================================================ */
(function ($) {
    'use strict';

    if (typeof HSTATS === 'undefined') return;

    var MN    = HSTATS.monthNames;
    var QN    = HSTATS.qNames;
    var LBL   = HSTATS.labels;
    var YEARS = (HSTATS.years || []).map(Number);
    var REST  = HSTATS.restUrl;
    var NONCE = HSTATS.nonce;

    var CHART_PALETTE = [
        '#2563eb','#db2777','#059669','#d97706','#7c3aed',
        '#0891b2','#dc2626','#4f46e5','#0d9488','#65a30d',
        '#e11d48','#9333ea','#b91c1c'
    ];
    var chartInstances = {};

    var state = {
        tab: 'monthly', year: HSTATS.curYear, month: HSTATS.curMonth,
        quarter: Math.ceil(HSTATS.curMonth / 3), trendYear: HSTATS.curYear,
        cmpAYear: YEARS[1] || YEARS[0], cmpAPeriod: 'annual',
        cmpBYear: YEARS[0], cmpBPeriod: 'annual', tableVisible: false,
    };

    /* ---- In-memory cache ---- */
    var _cache = {};
    function cacheKey(year, type, sub) { return year + ':' + type + ':' + (sub || ''); }

    // function apiFetch(path) {
    //     return $.ajax({ url: REST + path, method: 'GET',
    //         beforeSend: function (xhr) { xhr.setRequestHeader('X-WP-Nonce', NONCE); } });

    // }
    function apiFetch(path) {
    return $.ajax({
        url: REST + path,
        method: 'GET',
        headers: {}
    });
}

    function fetchMonth(year, month) {
        var k = cacheKey(year, 'month', month);
        if (_cache[k] !== undefined) return $.Deferred().resolve(_cache[k]);
        return apiFetch('/computed?year=' + year + '&month=' + month)
            .then(function (d) { _cache[k] = d || null; return _cache[k]; })
            .fail(function ()  { _cache[k] = null; return null; });
    }
    function fetchQuarter(year, q) {
        var k = cacheKey(year, 'quarter', q);
        if (_cache[k] !== undefined) return $.Deferred().resolve(_cache[k]);
        return apiFetch('/computed?year=' + year + '&quarter=' + q)
            .then(function (d) { _cache[k] = d || null; return _cache[k]; })
            .fail(function ()  { _cache[k] = null; return null; });
    }
    function fetchYear(year) {
        var k = cacheKey(year, 'annual', '');
        if (_cache[k] !== undefined) return $.Deferred().resolve(_cache[k]);
        return apiFetch('/computed?year=' + year)
            .then(function (d) { _cache[k] = d || null; return _cache[k]; })
            .fail(function ()  { _cache[k] = null; return null; });
    }
    function fetchAllMonths(year) {
        var k = cacheKey(year, 'year_months', '');
        if (_cache[k] !== undefined) return $.Deferred().resolve(_cache[k]);
        return apiFetch('/computed?year=' + year + '&all_months=1')
            .then(function (d) { _cache[k] = d || {}; return _cache[k]; })
            .fail(function ()  { _cache[k] = {}; return {}; });
    }
    function fetchPeriodData(year, period) {
        if (period === 'annual') return fetchYear(year);
        if (/^q[1-4]$/.test(period)) return fetchQuarter(year, parseInt(period[1]));
        var m = parseInt(period);
        if (m >= 1 && m <= 12) return fetchMonth(year, m);
        return $.Deferred().resolve(null);
    }

    /* ---- Helpers ---- */
    function fmt(val, unit) {
        if (val === null || val === undefined || val === '') return '—';
        var n = parseFloat(val); if (isNaN(n)) return '—';
        if (unit === '%') return n.toFixed(2) + '%';
        if (n === Math.floor(n)) return n.toLocaleString();
        return n.toFixed(2);
    }
    function fmtNum(n) { var num = parseInt(n,10); return isNaN(num) ? '—' : num.toLocaleString(); }
    function destroyChart(id) { if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; } }
    function badge(cur, prev) {
        if (prev === null || prev === undefined) return '';
        var diff = parseFloat(cur) - parseFloat(prev);
        if (Math.abs(diff) < 0.005) return '<span class="hs-badge hs-badge-same">— 0</span>';
        if (diff > 0) return '<span class="hs-badge hs-badge-up">▲ ' + Math.abs(diff).toFixed(2) + '</span>';
        return '<span class="hs-badge hs-badge-down">▼ ' + Math.abs(diff).toFixed(2) + '</span>';
    }
    function periodLabel(year, period) {
        if (period === 'annual') return year + ' (Full Year)';
        if (/^q[1-4]$/.test(period)) return year + ' ' + QN[parseInt(period[1])];
        return MN[parseInt(period)] + ' ' + year;
    }
    function chartBaseOpts() {
        return { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, padding: 12 } },
                tooltip: { backgroundColor: 'rgba(15,23,42,.92)', titleFont: { size: 12, weight: 'bold' }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 8 } } };
    }
    function showLoading(msg) { $('#hs-kpi-grid').html('<div class="hs-no-data">' + (msg||'Loading…') + '</div>'); $('#hs-summary-row').empty(); }

    /* ---- Summary bar ---- */
    function renderSummary(d) {
        var $s = $('#hs-summary-row').empty(); if (!d) return;
        [{ val: d._admissions, lbl: 'Admissions' }, { val: d._discharges, lbl: 'Discharges+Deaths' },
         { val: d._deaths, lbl: 'Total Deaths' }, { val: d._isd, lbl: 'Service Days' },
         { val: d._opd_total, lbl: 'OPD Visits' }, { val: d._ed_total, lbl: 'ED Consults' },
         { val: d._deliveries, lbl: 'Deliveries' }, { val: d._cs, lbl: 'CS Performed' },
         { val: d._infections, lbl: 'Infections' }, { val: d._maternal_deaths, lbl: 'Maternal Deaths' },
         { val: d._beds, lbl: 'Auth. Beds' }, { val: d._days, lbl: 'Days in Period' }
        ].forEach(function (i) { $s.append('<div class="hs-summary-item"><div class="val">' + fmtNum(i.val) + '</div><div class="lbl">' + i.lbl + '</div></div>'); });
    }

    /* ---- KPI cards ---- */
    function renderKPIs(d) {
        var $g = $('#hs-kpi-grid').empty();
        if (!d) { $g.html('<div class="hs-no-data">No data available for this period.</div>'); return; }
        $.each(LBL, function (key, info) {
            if (d[key] === undefined) return;
            $g.append('<div class="hs-kpi-card" style="--kpi-color:' + info.color + '">' +
                '<span class="hs-kpi-icon">' + info.icon + '</span>' +
                '<div class="hs-kpi-value">' + fmt(d[key], info.unit) + (info.unit==='%'?'':`<span class="hs-kpi-unit">${info.unit}</span>`) + '</div>' +
                '<div class="hs-kpi-label">' + info.label + '</div>' +
                '<div class="hs-kpi-desc">' + info.desc + '</div></div>');
        });
    }

    /* ---- Data table ---- */
    function renderDataTable(d, lbl) {
        var $tbl=$('#hs-data-table'), $head=$tbl.find('thead').empty(), $body=$tbl.find('tbody').empty();
        if (!d) return;
        $head.append('<tr><th>Indicator</th><th>Unit</th><th>' + lbl + '</th></tr>');
        $.each(LBL, function (key, info) {
            if (d[key]===undefined) return;
            $body.append('<tr><td class="td-label">' + info.icon + ' ' + info.label + '</td><td>' + info.unit + '</td><td>' + fmt(d[key], info.unit) + '</td></tr>');
        });
    }

    /* ---- Charts (all async from DB) ---- */
    function renderTrendChart(year) {
        destroyChart('trend');
        fetchAllMonths(year).done(function (months) {
            var labels=[], bor=[], adc=[], als=[];
            for (var m=1;m<=12;m++) { if (months[m]) { labels.push(MN[m].substring(0,3)); bor.push(months[m].BOR||0); adc.push(months[m].ADC||0); als.push(months[m].ALS||0); } }
            if (!labels.length) return;
            var ctx=document.getElementById('hs-trend-chart'); if (!ctx) return;
            chartInstances['trend'] = new Chart(ctx, { type:'line', data:{ labels:labels, datasets:[
                { label:'BOR (%)', data:bor, borderColor:'#db2777', backgroundColor:'rgba(219,39,119,.07)', tension:.4, fill:true, pointRadius:4, pointHoverRadius:6 },
                { label:'Avg Daily Census', data:adc, borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,.06)', tension:.4, fill:true, pointRadius:4, pointHoverRadius:6 },
                { label:'Avg Length of Stay', data:als, borderColor:'#059669', backgroundColor:'rgba(5,150,105,.06)', tension:.4, fill:true, pointRadius:4, pointHoverRadius:6 },
            ]}, options:$.extend(true,{},chartBaseOpts(),{ scales:{ x:{grid:{display:false}}, y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.04)'}} } }) });
        });
    }
    function renderBarChart(d, lbl) {
        destroyChart('bar'); if (!d) return;
        var keys=['BOR','ADC','ALS','BTR','BTI','AOV','AED'];
        var labels=keys.map(function(k){return LBL[k]?LBL[k].label.replace('Average ','Avg ').replace(' Rate','').replace(' Interval','').replace(' Ratio',''):k;});
        var ctx=document.getElementById('hs-bar-chart'); if (!ctx) return;
        chartInstances['bar'] = new Chart(ctx, { type:'bar', data:{ labels:labels, datasets:[{ label:lbl, data:keys.map(function(k){return d[k]||0;}), backgroundColor:CHART_PALETTE, borderRadius:6, borderWidth:0 }]},
            options:$.extend(true,{},chartBaseOpts(),{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true}} }) });
    }
    function renderDeathsChart(d) {
        destroyChart('deaths'); if (!d) return;
        var ctx=document.getElementById('hs-deaths-chart'); if (!ctx) return;
        chartInstances['deaths'] = new Chart(ctx, { type:'doughnut', data:{ labels:['Gross Death Rate','Net Death Rate','Maternal Death Rate','CS Rate','Gross Infection Rate'],
            datasets:[{ data:[d.GDR||0,d.NDR||0,d.MDR||0,d.CR||0,d.GIR||0], backgroundColor:['#dc2626','#b91c1c','#9333ea','#0d9488','#65a30d'], borderWidth:2, borderColor:'#fff' }]},
            options:$.extend(true,{},chartBaseOpts(),{ interaction:{mode:'nearest'}, cutout:'62%', plugins:{ legend:{position:'bottom',labels:{boxWidth:12,font:{size:11},padding:10}},
                tooltip:{callbacks:{label:function(c){return c.label+': '+c.raw.toFixed(4)+'%';}}}} }) });
    }
    function renderOpdEdChart(year) {
        destroyChart('opded');
        fetchAllMonths(year).done(function (months) {
            var labels=[], aov=[], aed=[];
            for (var m=1;m<=12;m++) { if (months[m]) { labels.push(MN[m].substring(0,3)); aov.push(months[m].AOV||0); aed.push(months[m].AED||0); } }
            if (!labels.length) return;
            var ctx=document.getElementById('hs-opded-chart'); if (!ctx) return;
            chartInstances['opded'] = new Chart(ctx, { type:'bar', data:{ labels:labels, datasets:[
                { label:'Avg OPD Visits/Day', data:aov, backgroundColor:'#4f46e5', borderRadius:5, borderWidth:0 },
                { label:'Avg ED Pts/Day', data:aed, backgroundColor:'#e11d48', borderRadius:5, borderWidth:0 },
            ]}, options:$.extend(true,{},chartBaseOpts(),{scales:{x:{grid:{display:false}},y:{beginAtZero:true}}}) });
        });
    }
    function renderBedChart(year) {
        destroyChart('bed');
        fetchAllMonths(year).done(function (months) {
            var labels=[], bor=[], btr=[];
            for (var m=1;m<=12;m++) { if (months[m]) { labels.push(MN[m].substring(0,3)); bor.push(months[m].BOR||0); btr.push(months[m].BTR||0); } }
            if (!labels.length) return;
            var ctx=document.getElementById('hs-bed-chart'); if (!ctx) return;
            chartInstances['bed'] = new Chart(ctx, { type:'bar', data:{ labels:labels, datasets:[
                { label:'BOR (%)', data:bor, backgroundColor:'rgba(219,39,119,.85)', borderRadius:4, borderWidth:0, yAxisID:'y' },
                { label:'BTR (times)', data:btr, type:'line', borderColor:'#059669', backgroundColor:'rgba(5,150,105,.1)', tension:.4, fill:false, pointRadius:3, yAxisID:'y2' },
            ]}, options:$.extend(true,{},chartBaseOpts(),{ scales:{ x:{grid:{display:false}},
                y:{beginAtZero:true,title:{display:true,text:'BOR %',font:{size:10}}},
                y2:{beginAtZero:true,position:'right',grid:{display:false},title:{display:true,text:'BTR',font:{size:10}}}} }) });
        });
    }
    function renderObChart(year) {
        destroyChart('ob');
        fetchAllMonths(year).done(function (months) {
            var labels=[], del=[], cs=[], cr=[];
            for (var m=1;m<=12;m++) { if (months[m]) { labels.push(MN[m].substring(0,3)); del.push(months[m]._deliveries||0); cs.push(months[m]._cs||0); cr.push(months[m].CR||0); } }
            if (!labels.length) return;
            var ctx=document.getElementById('hs-ob-chart'); if (!ctx) return;
            chartInstances['ob'] = new Chart(ctx, { type:'bar', data:{ labels:labels, datasets:[
                { label:'Total Deliveries', data:del, backgroundColor:'rgba(13,148,136,.8)', borderRadius:4, borderWidth:0, yAxisID:'y' },
                { label:'CS Performed', data:cs, backgroundColor:'rgba(147,51,234,.75)', borderRadius:4, borderWidth:0, yAxisID:'y' },
                { label:'CS Rate (%)', data:cr, type:'line', borderColor:'#d97706', backgroundColor:'rgba(217,119,6,.1)', tension:.4, fill:false, pointRadius:3, yAxisID:'y2' },
            ]}, options:$.extend(true,{},chartBaseOpts(),{ scales:{ x:{grid:{display:false}}, y:{beginAtZero:true},
                y2:{beginAtZero:true,position:'right',grid:{display:false},title:{display:true,text:'CS Rate %',font:{size:10}}}} }) });
        });
    }
    function renderAllCharts(d, lbl) {
        var year = state.year;
        renderTrendChart(state.trendYear || year);
        renderBarChart(d, lbl); renderDeathsChart(d);
        renderOpdEdChart(year); renderBedChart(year); renderObChart(year);
    }

    /* ---- Comparison view ---- */
    function buildPeriodOptions(year, selected, availableMonths) {
        var o = '<option value="annual"' + (selected==='annual'?' selected':'') + '>Full Year ' + year + '</option>';
        var quarters = {};
        (availableMonths||[]).forEach(function(m){ quarters[Math.ceil(m/3)]=true; });
        for (var q=1;q<=4;q++) { if (quarters[q]) o += '<option value="q'+q+'"'+(selected==='q'+q?' selected':'')+'>'+QN[q]+'</option>'; }
        (availableMonths||[]).forEach(function(m){ o += '<option value="'+m+'"'+(selected==m?' selected':'')+'>'+MN[m]+'</option>'; });
        return o;
    }
    function renderComparison() {
        var $w = $('#hs-comparison-wrap').empty();
        $w.html('<div class="hs-no-data">Loading comparison data…</div>');
        var yearOpts = YEARS.map(function(y){ return '<option value="'+y+'">'+y+'</option>'; }).join('');
        $.when(fetchAllMonths(state.cmpAYear), fetchAllMonths(state.cmpBYear)).done(function (mA, mB) {
            var moA=Object.keys(mA).map(Number), moB=Object.keys(mB).map(Number);
            $w.empty().append('<div class="hs-comp-selectors"><strong>Period A:</strong>' +
                '<label>Year <select id="cmp-a-year">'+yearOpts+'</select></label>' +
                '<select id="cmp-a-period">'+buildPeriodOptions(state.cmpAYear,state.cmpAPeriod,moA)+'</select>' +
                '<span class="hs-vs-divider">vs</span><strong>Period B:</strong>' +
                '<label>Year <select id="cmp-b-year">'+yearOpts+'</select></label>' +
                '<select id="cmp-b-period">'+buildPeriodOptions(state.cmpBYear,state.cmpBPeriod,moB)+'</select></div>');
            $('#cmp-a-year').val(state.cmpAYear); $('#cmp-b-year').val(state.cmpBYear);
            $.when(fetchPeriodData(state.cmpAYear,state.cmpAPeriod), fetchPeriodData(state.cmpBYear,state.cmpBPeriod)).done(function (dA, dB) {
                var lA=periodLabel(state.cmpAYear,state.cmpAPeriod), lB=periodLabel(state.cmpBYear,state.cmpBPeriod);
                var sumItems=[{key:'_admissions',lbl:'Admissions'},{key:'_discharges',lbl:'Discharges+Deaths'},
                    {key:'_deaths',lbl:'Total Deaths'},{key:'_opd_total',lbl:'OPD Visits'},{key:'_ed_total',lbl:'ED Consults'},{key:'_deliveries',lbl:'Deliveries'}];
                var sumHtml='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px">';
                sumItems.forEach(function(it){
                    var vA=dA?(dA[it.key]||0):null, vB=dB?(dB[it.key]||0):null;
                    sumHtml+='<div class="hs-chart-card" style="padding:14px 16px"><div style="font-size:.75rem;font-weight:700;color:var(--hs-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">'+it.lbl+'</div>'+
                        '<div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:1.3rem;font-weight:700;color:#2563eb;font-family:\'IBM Plex Mono\',monospace">'+(vA!==null?fmtNum(vA):'—')+'</span>'+
                        '<span style="font-size:.75rem;color:var(--hs-muted)">vs</span><span style="font-size:1.3rem;font-weight:700;color:#db2777;font-family:\'IBM Plex Mono\',monospace">'+(vB!==null?fmtNum(vB):'—')+'</span></div></div>';
                });
                $w.append(sumHtml+'</div>');
                var tbl='<div class="hs-chart-card" style="margin-bottom:20px"><div class="hs-chart-card-header"><h3>📋 All Indicators — Side-by-Side</h3></div><div class="hs-table-scroll"><table class="hs-comp-table">'+
                    '<thead><tr><th>Indicator</th><th>Unit</th><th style="color:#2563eb">'+lA+'</th><th style="color:#db2777">'+lB+'</th><th>Change A→B</th></tr></thead><tbody>';
                $.each(LBL, function(key,info){
                    var vA=dA&&dA[key]!==undefined?dA[key]:null, vB=dB&&dB[key]!==undefined?dB[key]:null;
                    tbl+='<tr><td class="td-label">'+info.icon+' '+info.label+'</td><td style="font-size:.78rem;color:var(--hs-muted)">'+info.unit+'</td>'+
                        '<td>'+(vA!==null?fmt(vA,info.unit):'—')+'</td><td>'+(vB!==null?fmt(vB,info.unit):'—')+'</td>'+
                        '<td>'+(vA!==null&&vB!==null?badge(vB,vA):'')+'</td></tr>';
                });
                $w.append(tbl+'</tbody></table></div></div>');
                destroyChart('cmp');
                $w.append('<div class="hs-chart-card"><div class="hs-chart-card-header"><h3>📊 Side-by-Side Key Indicators</h3></div><div class="hs-chart-wrap"><canvas id="hs-cmp-chart"></canvas></div></div>');
                var cmpKeys=['BOR','ADC','ALS','BTR','BTI','GDR','NDR','CR','AOV','AED'], cmpCtx=document.getElementById('hs-cmp-chart');
                if (cmpCtx) { chartInstances['cmp'] = new Chart(cmpCtx, { type:'bar', data:{ labels:cmpKeys.map(function(k){return LBL[k]?LBL[k].label.substring(0,18):k;}),
                    datasets:[{ label:lA, data:cmpKeys.map(function(k){return dA?(dA[k]||0):0;}), backgroundColor:'rgba(37,99,235,.85)', borderRadius:5 },
                        { label:lB, data:cmpKeys.map(function(k){return dB?(dB[k]||0):0;}), backgroundColor:'rgba(219,39,119,.85)', borderRadius:5 }]},
                    options:$.extend(true,{},chartBaseOpts(),{scales:{x:{grid:{display:false},ticks:{font:{size:9}}},y:{beginAtZero:true}}}) }); }
            });
            $w.on('change','#cmp-a-year',function(){state.cmpAYear=+$(this).val();state.cmpAPeriod='annual';renderComparison();});
            $w.on('change','#cmp-b-year',function(){state.cmpBYear=+$(this).val();state.cmpBPeriod='annual';renderComparison();});
            $w.on('change','#cmp-a-period',function(){state.cmpAPeriod=$(this).val();renderComparison();});
            $w.on('change','#cmp-b-period',function(){state.cmpBPeriod=$(this).val();renderComparison();});
        });
    }

    /* ---- Selectors ---- */
    function populateSelectors() {
        $('.hs-year-sel,#hs-trend-year').each(function(){ var $s=$(this).empty(); YEARS.forEach(function(y){ $s.append('<option value="'+y+'"'+(y===state.year?' selected':'')+'>'+y+'</option>'); }); });
        $('#hs-trend-year').val(state.trendYear||state.year);
        var $ms=$('#hs-sel-month').empty(); for (var m=1;m<=12;m++) $ms.append('<option value="'+m+'"'+(m===state.month?' selected':'')+'>'+MN[m]+'</option>');
        var $qs=$('#hs-sel-quarter').empty(); for (var q=1;q<=4;q++) $qs.append('<option value="'+q+'"'+(q===state.quarter?' selected':'')+'>'+QN[q]+'</option>');
    }

    /* ---- Main render: always fetches from DB ---- */
    function render() {
        var tab=state.tab;
        $('#hs-monthly-sel,#hs-quarterly-sel,#hs-yearly-sel').hide();
        $('#hs-kpi-section,#hs-chart-section,#hs-summary-section').hide();
        $('#hs-comparison-section,#hs-data-table-section').hide();
        if (tab==='comparison') { $('#hs-comparison-section').show(); renderComparison(); return; }
        $('#hs-kpi-section,#hs-chart-section,#hs-summary-section').show();
        if (state.tableVisible) $('#hs-data-table-section').show();
        showLoading('Fetching data…');
        var fetcher, lbl;
        if (tab==='monthly')   { $('#hs-monthly-sel').show();   fetcher=fetchMonth(state.year,state.month);     lbl=MN[state.month]+' '+state.year; }
        else if (tab==='quarterly') { $('#hs-quarterly-sel').show(); fetcher=fetchQuarter(state.year,state.quarter); lbl=QN[state.quarter]+' '+state.year; }
        else                   { $('#hs-yearly-sel').show();    fetcher=fetchYear(state.year);                  lbl='Full Year '+state.year; }
        $('#hs-period-lbl').text(lbl);
        fetcher.done(function(d){ renderKPIs(d); renderSummary(d); renderAllCharts(d,lbl); if (state.tableVisible) renderDataTable(d,lbl); })
               .fail(function(){ $('#hs-kpi-grid').html('<div class="hs-no-data">⚠ Could not load data. Please refresh.</div>'); });
    }

    /* ---- CSV export ---- */
    function exportCSV() {
        var tab=state.tab; if (tab==='comparison') return;
        var fetcher, lbl;
        if (tab==='monthly')   { fetcher=fetchMonth(state.year,state.month);     lbl=MN[state.month]+'_'+state.year; }
        if (tab==='quarterly') { fetcher=fetchQuarter(state.year,state.quarter); lbl='Q'+state.quarter+'_'+state.year; }
        if (tab==='yearly')    { fetcher=fetchYear(state.year);                  lbl='Year_'+state.year; }
        fetcher.done(function(d){
            if (!d) return;
            var rows=[['Indicator','Unit','Value']];
            $.each(LBL,function(key,info){ if (d[key]!==undefined) rows.push([info.label,info.unit,d[key]]); });
            var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"';}).join(',');}).join('\n');
            var blob=new Blob([csv],{type:'text/csv'}); var a=document.createElement('a');
            a.href=URL.createObjectURL(blob); a.download='hospital-statistics-'+lbl+'.csv'; a.click();
        });
    }

    /* ---- Init ---- */
    $(document).ready(function () {
        if (!$('#hstats-wrap').length) return;
        populateSelectors(); render();
        $(document).on('click','.hs-tab',function(){ $('.hs-tab').removeClass('active').attr('aria-selected','false'); $(this).addClass('active').attr('aria-selected','true'); state.tab=$(this).data('tab'); render(); });
        $(document).on('change','#hs-sel-year-monthly,#hs-sel-year-quarterly,#hs-sel-year-yearly',function(){ state.year=+$(this).val(); populateSelectors(); render(); });
        $(document).on('change','#hs-sel-month',function(){ state.month=+$(this).val(); render(); });
        $(document).on('change','#hs-sel-quarter',function(){ state.quarter=+$(this).val(); render(); });
        $(document).on('change','#hs-trend-year',function(){ state.trendYear=+$(this).val(); renderTrendChart(state.trendYear); renderBedChart(state.trendYear); renderOpdEdChart(state.trendYear); renderObChart(state.trendYear); });
        $(document).on('click','#hs-export-csv-btn',exportCSV);
        $(document).on('click','#hs-print-btn',function(){ window.print(); });
        $(document).on('click','#hs-toggle-table-btn',function(){
            state.tableVisible=!state.tableVisible;
            if (state.tab!=='comparison') {
                $('#hs-data-table-section').toggle(state.tableVisible);
                if (state.tableVisible) {
                    var lbl=''; var fetcher;
                    if (state.tab==='monthly')   { lbl=MN[state.month]+' '+state.year;    fetcher=fetchMonth(state.year,state.month); }
                    if (state.tab==='quarterly') { lbl=QN[state.quarter]+' '+state.year;  fetcher=fetchQuarter(state.year,state.quarter); }
                    if (state.tab==='yearly')    { lbl='Full Year '+state.year;            fetcher=fetchYear(state.year); }
                    fetcher.done(function(d){ renderDataTable(d,lbl); });
                }
            }
        });
    });

})(jQuery);
