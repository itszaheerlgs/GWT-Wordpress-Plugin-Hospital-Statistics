/* ============================================================
   Hospital Statistics Plugin — admin.js v2.0.1
   ============================================================ */
(function ($) {
    'use strict';

    if (typeof HSTATS_ADMIN === 'undefined') return;

    var REST  = HSTATS_ADMIN.rest_url;
    var NONCE = HSTATS_ADMIN.nonce;

    function apiFetch(method, path, data, cb) {
        $.ajax({
            url: REST + path,
            method: method,
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            beforeSend: function (xhr) { xhr.setRequestHeader('X-WP-Nonce', NONCE); },
            success: function (res) { cb(null, res); },
            error:   function (xhr) { cb(xhr.responseJSON || xhr.responseText || 'Error'); }
        });
    }

    /* ---- DELETE record ---- */
    $(document).on('click', '.hstats-delete-btn', function () {
        var id     = $(this).data('id');
        var period = $(this).data('period');
        if (!confirm('Delete statistics for ' + period + '?\n\nThis cannot be undone.')) return;
        var $row = $(this).closest('tr');
        apiFetch('DELETE', '/records/' + id, null, function (err, res) {
            if (err) { alert('Error deleting record: ' + JSON.stringify(err)); return; }
            if (res && res.deleted) {
                $row.fadeOut(300, function () { $(this).remove(); });
            }
        });
    });

    /* ---- RESET ALL records (settings page) ---- */
    $(document).on('click', '#hstats-reset-all', function () {
        if (!confirm('WARNING: DELETE ALL hospital statistics records and the audit log?\n\nThis is permanent and cannot be undone.')) return;
        if (!confirm('Are you absolutely sure? This will wipe ALL data.')) return;
        apiFetch('GET', '/records', null, function (err, rows) {
            if (err) { alert('Error fetching records'); return; }
            var ids = (rows || []).map(function (r) { return r.id; });
            if (ids.length === 0) { alert('No records to delete.'); return; }
            var done = 0;
            ids.forEach(function (id) {
                apiFetch('DELETE', '/records/' + id, null, function () {
                    done++;
                    if (done === ids.length) {
                        alert('All records deleted. Refreshing...');
                        window.location.reload();
                    }
                });
            });
        });
    });

    /* ---- IMPORT CSV (single fetch only) ---- */
    var $csvFile   = $('#hstats-csv-file');
    var $importBtn = $('#hstats-import-btn');
    var $preview   = $('#hstats-import-preview');
    var $result    = $('#hstats-import-result');

    $csvFile.on('change', function () {
        var file = this.files[0];
        if (!file) { $importBtn.prop('disabled', true); $preview.hide(); return; }
        var reader = new FileReader();
        reader.onload = function (e) {
            var lines = e.target.result.split('\n').slice(0, 6);
            $preview.html(
                '<strong>Preview (first 5 rows):</strong><br>' +
                lines.map(function (l) { return $('<span>').text(l).html(); }).join('<br>')
            ).show();
            $importBtn.prop('disabled', false);
        };
        reader.readAsText(file);
    });

    $('#hstats-import-form').on('submit', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var file = $csvFile[0].files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            $importBtn.prop('disabled', true).text('Importing...');
            fetch(REST + '/import/csv', {
                method:  'POST',
                headers: { 'Content-Type': 'text/plain', 'X-WP-Nonce': NONCE },
                body:    ev.target.result,
            })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                $importBtn.prop('disabled', false).text('Import CSV');
                var html = '<div class="notice notice-success"><p>Imported <strong>' + res.imported + '</strong> records.</p>';
                if (res.errors && res.errors.length) {
                    html += '<ul style="margin:8px 0 0 16px">' +
                        res.errors.map(function (err) { return '<li>' + err + '</li>'; }).join('') + '</ul>';
                }
                $result.html(html + '</div>');
            })
            .catch(function (err) {
                $importBtn.prop('disabled', false).text('Import CSV');
                $result.html('<div class="notice notice-error"><p>Import error: ' + err + '</p></div>');
            });
        };
        reader.readAsText(file);
    });

    /* ---- Entry form: live formula preview ---- */
    if ($('#hstats-entry-form').length) {
        $(document).on('input change', '.hstats-input', function () {
            clearTimeout(window._hstatsPreviewTimer);
            window._hstatsPreviewTimer = setTimeout(function () {
                var data = {};
                $('.hstats-input').each(function () {
                    var name = $(this).attr('name').replace('hstats[', '').replace(']', '');
                    data[name] = parseInt($(this).val(), 10) || 0;
                });
                var isd  = data.ip_service_days_total   || 0;
                var days = data.ip_days_in_period         || 1;
                var beds = data.ip_authorized_beds        || 100;
                var dd   = data.ip_discharges_deaths      || 0;
                var preview = {
                    'ADC': days              ? (isd / days).toFixed(2)                               : '—',
                    'BOR': (beds * days)     ? ((isd / (beds * days)) * 100).toFixed(2) + '%'        : '—',
                    'BTI': dd                ? (((beds * days) - isd) / dd).toFixed(2)               : '—',
                    'BTR': beds              ? (dd / beds).toFixed(2)                                : '—',
                    'GDR': dd                ? ((data.d_total / dd) * 100).toFixed(2) + '%'          : '—',
                    'ALS': dd                ? (data.ip_length_of_stay_total / dd).toFixed(2)        : '—',
                    'AOV': data.opd_days     ? (((data.opd_new_visits||0) + (data.opd_revisits||0)) / data.opd_days).toFixed(2) : '—',
                    'AED': data.ed_days      ? ((data.ed_consults||0) / data.ed_days).toFixed(2)    : '—',
                    'CR' : data.ob_total_deliveries ? ((data.ob_cs_sections / data.ob_total_deliveries) * 100).toFixed(2) + '%' : '—',
                    'MDR': data.ob_obstetrical_discharges ? ((data.ob_maternal_deaths / data.ob_obstetrical_discharges) * 100).toFixed(4) + '%' : '—',
                    'GIR': dd               ? ((data.inf_total_infections / dd) * 100).toFixed(2) + '%' : '—',
                };
                $.each(preview, function (k, v) {
                    $('.hstats-preview-card[data-key="' + k + '"]').find('.hstats-preview-val').first().text(v);
                });
            }, 400);
        });
    }

})(jQuery);
