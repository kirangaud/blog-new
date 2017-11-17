$(document).ready(function() {
    window.page = 0;
    window.active_scroll = "yes";
    window.sort_by = "_id";
    window.sort_order = "desc";
    window.module_name = $("#current_module_name").val();
    window.columns = $("#module_columns").val();
    var position = $('#table-grid-nav').offset();
    // call_grid(window.module_name, window.columns, window.page, "", "append", window.sort_by, window.sort_order);
    $(".col-sortable").click(function() {
        var sort = $(this).attr("data-field");
        var order = $(this).attr("data-order");
        var search_by = $("#grid_search_by").val();
        call_grid(module_name, columns, 0, search_by, "html", sort, order);
        $(".sort-col-" + sort).removeClass("fa-sort");
        $(".sort-col-" + sort).addClass("fa-sort-" + order);
        if (order == "asc") {
            $(".sort-col-" + sort).removeClass("fa-sort-desc");
            $(this).attr("data-order", "desc");
        } else {
            $(".sort-col-" + sort).removeClass("fa-sort-asc");
            $(this).attr("data-order", "asc");
        }
    });
    $("#grid_search_by").keyup(function() {
        var search_by = $(this).val();
        call_grid(window.module_name, window.columns, 0, search_by, "html", window.sort_by, window.sort_order);
    });
    $("#ajaxtable div table tbody").scroll(function() {
        if (window.active_scroll == "yes") {
            var search_by = $("#grid_search_by").val();
            call_grid(window.module_name, window.columns, window.page, search_by, "append", window.sort_by, window.sort_order);
        }
    });
});

function call_grid(module, columns, page, search_by, action_type, sort, order) {
    window.active_scroll = "no";
    var grid_url = "/route/" + module + "/grid-view/";
    var data = {};
    data.page = page;
    data.columns = columns;
    data.search_by = search_by;
    data.sort = sort;
    data.order = order;
    if ($("#frm-grid-search").length) {
        data.search_query = $("#frm-grid-search").serializeObject();
    }
    $.ajax({
        url: grid_url,
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            if (action_type == "html") {
                $("#tbody-grid-view").html(result);
            } else if (action_type == "append") {
                $("#tbody-grid-view").append(result);
            }
            window.page = page + 1;
            window.active_scroll = "yes";
            window.sort_by = sort;
            window.sort_order = order;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var result = jQuery.parseJSON(jqXHR.responseText);
            if (jqXHR.status == 500) {
                window.location.reload();
            } else {
                window.location.reload();
            }
        }
    });
}


function DrawCustomDataTable(tableId, tableHeight, apiUrl, dataColumns, sort_order, form_search_query, filter_column, bFilter, bColumnFilter, headersData, rowId, columnNumber) {
    var selected_column = dataColumns;
    if (filter_column) {
        console.log("filter_column", filter_column);
        selected_column = [];
        _.map(dataColumns, function(obj) {
            if (obj.visible == false || filter_column.indexOf(obj.data) != -1) {
                selected_column.push(obj);
            }
        });
    }
    var settings = {
        bFilter: bFilter,
        "pageLength": 50,
        "scrollY": tableHeight,
        "scrollX": true,
        processing: true,
        serverSide: true,
        deferRender: true,
        language: {
            processing: "<div class='datatable-loading-inner'><span class='datatable-loading-inner-span'><i class='fa fa-spinner fa-spin' aria-hidden='true'></i>Loading...</span></div>",
        },
        scroller: true,
        "columns": selected_column,
        order: sort_order,
        "ajax": {
            "type": "POST",
            "url": apiUrl,
            "data": function(d) {
                d.table_format = "datatable";
                d.soring = d.order;
                delete d.order;
                d.sort_by = d.columns[d.soring[0]['column']]['data'];
                d.order = d.soring[0]['dir'];
                if (d.search['value']) {
                    d.search_by = d.search['value'];
                }
                if (form_search_query != "" && $("#" + form_search_query).length) {
                    d.search_query = $("#" + form_search_query).serializeObject();
                }
                d.limit = d.length;
            },
            "dataSrc": function(json) {
                json.recordsTotal = json.count;
                json.recordsFiltered = json.count;

                return json.result;
            }
        },
        "headerCallback": function(thead, data, start, end, display) {
            // $(thead).find('th').eq(0).html( 'Displaying '+(end-start)+' records' );
            console.log("header callback")
            if (headersData) {
                headersData(this, thead, data, start, end, display);
            }

        },
        "drawCallback": function(settings) {
                var api = this.api();

                var rows = api.rows({ page: 'current' }).nodes();
                var last = null;

                api.column(columnNumber, { page: 'current' }).data().each(function(group, i) {
                    if (last !== group) {
                        $(rows).eq(i).before(
                        );
                        last = group;
                    }
                });
            }
    }
    if (rowId) {
        settings.rowId = rowId;
    }
    var table = $('#' + tableId)
        .DataTable(settings).on('init.dt', function() {
            $("#" + tableId + "_length").hide();
            $("#" + tableId + "_paginate").hide();
            if (bColumnFilter == true) {
                $('#' + tableId + '-dropdown-toggle').remove();
                var filter_html = '<i style="margin-top:4px" title="Filter Coloumns" class="fa fa-filter pull-right dropdown-toggle ' + tableId + '-dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></i>';
                filter_html += '<div class="dropdown-menu ' + tableId + '-dropdown-menu filter-dropdown dropdown-right-menu"><div>';
                for (var headerlist = 0; headerlist < dataColumns.length; headerlist++) {
                    if (dataColumns[headerlist].visible != false) {
                        filter_html += '<li><input type="checkbox" name="chk_' + tableId + '_column[]" class="chk_' + tableId + '_column" value="' + dataColumns[headerlist].data + '"  checked="checked" />' + dataColumns[headerlist].sTitle + '</li>';
                    }
                }
                filter_html += '</div>';
                filter_html += '<button type="button" id="btn-datatable-filter-' + tableId + '" class="btn btn-info btn-xs btn-block">Filter</button>';
                filter_html += '</div>';
                filter_html += '<div class="clearfix"></div>';
                $("#" + tableId + "_filter").append(filter_html);
                $('.' + tableId + '-dropdown-menu').click(function(e) {
                    e.stopPropagation();
                });
                $('#btn-datatable-filter-' + tableId).click(function(e) {
                    var checked_column = $('.chk_' + tableId + '_column:checked').map(function() {
                        return this.value;
                    }).get();
                    table.destroy();
                    $('#' + tableId).html("");
                    DrawCustomDataTable(tableId, tableHeight, apiUrl, dataColumns, sort_order, form_search_query, checked_column, bFilter, bColumnFilter);
                    $('.' + tableId + '-dropdown-toggle').trigger('click');
                });
            }
        });
    return table;
}

$(window).load(function() {
    $("#frm-grid-search").validate({
        errorPlacement: function(error, element) {},
        submitHandler: function(form) {
            call_grid(window.module_name, window.columns, 0, "", "html", window.sort_by, window.sort_order);
        }
    })
});
