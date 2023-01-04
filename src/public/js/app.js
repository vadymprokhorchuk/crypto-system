$(document).ready(function() {
    let phrases_table = $('#phrases').DataTable({
        "paging": true,
        "info": false,
        "ajax": '/api/phrases',
        "order": [],
        "scrollY": "490px",
        "deferRender": true,
        "responsive": true,
        "lengthMenu": [10, 15, 20, 50, 100, 150],
        "pageLength": 15,
        "oLanguage": {
            sLengthMenu: "_MENU_",
        },
        "columns": [
            {data: null, defaultContent: "", orderable: false, className: 'small select-checkbox align-middle', width: 20},
            {data: 'index', orderable: false, className: 'small text-center align-middle', width: 5},
            {data: 'mnemonic', orderable: false, className: 'text-break small'},
            {
                data: null,
                width: 30,
                defaultContent: "",
                orderable: false,
                className: 'small text-center align-middle',
                "createdCell": function (td, cellData, rowData, row, col) {
                    //console.log(cellData)
                    //console.log(cellData.wallets.reduce((accumulator, current) => accumulator + current.balance, 0))
                    if (cellData.wallets.reduce( function(a, b){ return a + b.balance; }, 0) > 0){
                        //$(td).css('background-color', '#24c824')
                        $(td).addClass('saturated_green')
                        //$(td).text("+")
                    }else{
                        $(td).addClass('saturated_red')
                        //$(td).text("-")
                    }
                    // if (cellData === "+") {
                    //     $(td).css('background-color', '#24c824')
                    // } else {
                    //     if (cellData === "-"){
                    //         $(td).css('background-color', '#e82b3b')
                    //     }else{
                    //         $(td).css('background-color', '#e8a52b')
                    //     }
                    // }
                }
            },
            {
                data: null,
                orderable: false,
                className: 'small text-center align-middle',
                defaultContent: "<button class='btn btn-sm btn-outline-success'>View</button>"
            }
        ],
        "select": {
            style: 'multi+shift',
            selector: 'td:first-child'
        },
        "rowId": 'mnemonic',
        "initComplete": function(settings, json) {
            //$('#custom_buttons').appendTo('.pagination');
            //$('.dataTables_paginate').prepend($('#custom_buttons'))
        },
        "processing": true,
        "serverSide": true,
        "pagingType": "numbers",
        "dom": '<"table_top"<"left"><"right"fl>>tri<"table_bottom mt-2"p>'
    });
    $('.left').prepend($('#total_phrases_text'))
    $('.table_bottom').prepend($('#custom_buttons'))
    phrases_table.on('xhr.dt', function(e, settings, json, xhr) {
        $('#last_update').text(new Date(json.last_update).toGMTString())
        $('#total_phrases_count').text(json.recordsTotal)
    })

    let current_mnemonic = null
    let coins_table = $('#coins').DataTable({
        "paging": false,
        "info": false,
        "order": [],
        "stateSave": true,
        "scrollY": "490px",
        "responsive": true,
        "deferRender": true,
        "createdRow":function (row, data, dataIndex, asd, das){
            //console.log(row)
            //console.log(data.balance)

            // if (data.balance > 0){
            //     $(row).css('background-color', 'rgba(36,200,36,0.27)', '!important')
            // }else{
            //     $(row).css('background-color', 'rgba(232,43,59,0.27)')
            // }

            // console.log(dataIndex)
            // console.log(asd)
            // console.log(das)
            //console.log("---")
        },
        "columns": [
            {data: 'coin', orderable: false, className: 'text-center align-middle small', "width": 5, "createdCell": function (td, cellData, rowData, row, col){
                if ((cellData === "ETH") || (cellData === "BNB" && rowData.network === "BSC") || (rowData.network === "ERC20")){
                    $(td).html(`<a target="_blank" class="text-decoration-none" href="https://blockscan.com/address/${rowData.address}">${cellData}</a>`)
                }
                }},
            {data: 'network', orderable: true, className: 'text-center align-middle small', "createdCell": function (td, cellData, rowData){
                if (cellData === "ETH" || cellData === "ERC20"){
                    //console.log(rowData)
                    $(td).html(`<a target="_blank" class="text-decoration-none" href="https://etherscan.io/tokenholdings?a=${rowData.address}">${cellData}</a>`)
                }
                if (cellData === "BSC"){
                    $(td).html(`<a target="_blank" class="text-decoration-none" href="https://bscscan.com/tokenholdings?a=${rowData.address}">${cellData}</a>`)
                }
                }},
            {data: 'balance', orderable: true, className: 'text-center align-middle small', "width": 5,  "createdCell": function (td, cellData, rowData, row, col) {
                    if (typeof cellData !== "number") {
                        $(td).html("?")
                    }else{
                        let balance = cellData
                        //console.log(row)
                        //console.log(coins_table.row(row))
                        if (balance > 0) {
                            //$(td).css('background-color', 'rgba(36,200,36,0.27)')
                            $(td).addClass('mirror_green')
                            let re = new RegExp('^-?\\d+(?:\.\\d{0,' + (8 || -1) + '})?');
                            balance = balance.toFixed(18)
                            balance = balance.toString().match(re)[0]
                            if (parseFloat(balance) === 0) {
                                balance = "> 0"
                            }
                        }else{
                            //$(td).css('background-color', 'rgba(232,43,59,0.27)')
                            $(td).addClass('mirror_red')
                        }
                        $(td).html(balance)
                    }
                }},
            {data: 'address', orderable: false, className: 'text-break small',
                "createdCell": function (td, cellData, rowData, row, col) {
                    $(td).html(`<a target="_blank" class="text-decoration-none" href="${rowData.link}">${cellData}</a>`)
                }},
            {data: 'private_key', orderable: false, className: 'text-break small'},
        ],
        "rowId": 'coin'
    });

    $('#phrases tbody').on( 'click', 'button', function () {
        const data = phrases_table.row($(this).parents('tr')).data();
        //console.log(JSON.stringify(data));
        $('#current_phrase').text(data.mnemonic)
        current_mnemonic = data.mnemonic
        update_coins_information(data)
    } );

    function update_coins_information(data){
        try{
            //
            //console.log(data)
            if (data.wallets){
                //$('#current_phrase').text(data.mnemonic)
                coins_table.clear()
                coins_table.rows.add(data.wallets);
                coins_table.draw(false)
                // coins_table.fnClearTable()
                //
                // if (data.wallets.length !== 0){
                //     coins_table.fnAddData(data.wallets)
                // }
                // coins_table.fnDraw()
                //current_mnemonic = data.mnemonic
            }else{
                show_alert("Unknown error4.", false)
            }
        }catch (err){
            show_alert("Unknown error." + err.message, false)
        }
    }

    function reload_phrases_table(){
        let scrollingContainer = $(phrases_table.table().node()).parent('div.dataTables_scrollBody');
        let scrollTop = scrollingContainer.scrollTop();
        phrases_table.ajax.reload(function (data){
            //alert(phrases_table.rows().count())
            //console.log(data.recordsTotal)
            //$('#total_phrases_count').text(data.recordsTotal)
            //$('#last_update').text(new Date(data.last_update).toGMTString())
            scrollingContainer.scrollTop(scrollTop);
            //console.log(current_mnemonic)
            if (current_mnemonic) {
                const found = data.data.find(element => element.mnemonic === current_mnemonic)
                console.log(found)
                if (found) {
                    update_coins_information(found)
                } else {
                    current_mnemonic = null
                    coins_table.clear().draw()
                    $('#current_phrase').text("")
                    // alert(1)
                    // $.get("/api/phrases/get?phrase=" + encodeURIComponent(current_mnemonic), function (data, status) {
                    //     try {
                    //         const response = JSON.parse(data)
                    //         if (response.success && response.wallets) {
                    //             //callback(true)
                    //             update_coins_information({wallets: response.wallets})
                    //         } else {
                    //             let alert_message
                    //             if (response.error) {
                    //                 alert_message = response.error
                    //             } else {
                    //                 alert_message = "Unknown error, while receiving wallets."
                    //             }
                    //             show_alert(alert_message, false)
                    //         }
                    //     } catch (e) {
                    //         //show error
                    //         //callback(false)
                    //         show_alert("Unknown error, while receiving wallets.", false)
                    //     }
                    // })
                }
            }
        }, false);
    }

    setInterval(function(){
        reload_phrases_table()
    }, 10000);

    // $("#refresh").on( "click", function(e) {
    //     let scrollingContainer = $(phrases_table.table().node()).parent('div.dataTables_scrollBody');
    //     let scrollTop = scrollingContainer.scrollTop();
    //     phrases_table.ajax.reload(function (){
    //         scrollingContainer.scrollTop(scrollTop);
    //     }, false);
    // });

    function show_alert(message, is_success=true){
        let alert
        if (is_success !== true && is_success !== false){
            is_success = true
        }
        if (is_success){
            alert = "success"
        }else{
            alert = "danger"
        }
        $('#messages').append(`<div id="message" class="alert alert-${alert} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`)
    }

    function validatePhrase(phrase, callback){
        const arr = phrase.split(" ")
        if (phrase === "" || arr.length === 12 || arr.length === 15 || arr.length === 18 || arr.length === 21 || arr.length === 24){
            if (phrase === ""){
                callback(true)
                return true
            }else{
                $.get("/api/phrases/check?phrase=" + encodeURIComponent(phrase), function (data, status) {
                    try {
                        if (JSON.parse(data).valid === true) {
                            callback(true)
                        } else {
                            callback(false)
                        }
                    } catch (e) {
                        //show error
                        callback(false)
                    }
                })
            }
        }else{
            callback(false)
        }
    }

    $('#mnemonic').on('input', function(){
        validatePhrase($(this).val(), function (is_valid){
            if (is_valid){
                $("#mnemonic").removeClass("is-invalid");
                $("#save_settings_button").prop("disabled", false)
            }else{
                $("#mnemonic").addClass("is-invalid");
                $("#save_settings_button").prop("disabled", true)
            }
        })
    });

    $('#phrase_to_check').on('input', function(){
        const phrase_val = $(this).val()
        validatePhrase(phrase_val, function(is_valid){
            if (is_valid) {
                $("#phrase_to_check").removeClass("is-invalid");
                if (phrase_val !== ""){
                    $("#add_phrase_to_check_submit").prop("disabled", false)
                }
            }else{
                $("#phrase_to_check").addClass("is-invalid");
                $("#add_phrase_to_check_submit").prop("disabled", true)
            }
        })
    });

    $('#phrases_add_form').submit(function (evt) {
        evt.preventDefault();
        const phrase_val = $('#phrase_to_check').val()
        validatePhrase(phrase_val, function (is_valid){
            if (is_valid){
                $("#phrase_to_check").removeClass("is-invalid");
                if (phrase_val !== ""){
                    $("#add_phrase_to_check_submit").prop("disabled", false)

                    $.post("/api/phrases/", {phrase: phrase_val}, function(data, status) {
                        try {
                            const data_obj = JSON.parse(data)
                            if (data_obj.saved === true) {
                                $("#phrase_to_check").removeClass("is-invalid");
                                $('#phrase_to_check').val("")
                                $("#add_phrase_to_check_submit").prop("disabled", true)
                                //phrases_table.ajax.reload(null, false);

                                reload_phrases_table()

                                //show_alert("Phrase successfully added.", true)
                            } else {
                                if (JSON.parse(data).error){
                                    show_alert(JSON.parse(data).error, false)
                                }else{
                                    show_alert("Unknown error.", false)
                                }
                            }
                        } catch (err) {
                            show_alert("Unknown error. ", false)
                            return false
                        }
                    })
                }
            }else{
                $("#phrase_to_check").addClass("is-invalid");
                $("#add_phrase_to_check_submit").prop("disabled", true)
            }
        })
    })

    $('#settings').submit(function (evt) {
        evt.preventDefault();
        const phrase_val = $('#mnemonic').val()
        validatePhrase(phrase_val, function (is_valid){
            if (is_valid){
                $("#mnemonic").removeClass("is-invalid");
                $("#save_settings_button").prop("disabled", false)

                $.post( "/api/settings", { phrase: phrase_val, user_id: $('#user_id').val()}, function(data, status) {
                    try {
                        const data_obj = JSON.parse(data)
                        if (data_obj.saved === true) {
                            show_alert("Settings successfully saved.", true)
                        } else {
                            if (JSON.parse(data).error){
                                show_alert(JSON.parse(data).error, false)
                            }else{
                                show_alert("Unknown error.", false)
                            }
                        }
                    } catch (e) {
                        show_alert("Unknown error.", false)
                        return false
                    }
                })
            }else{
                $("#mnemonic").addClass("is-invalid");
                $("#save_settings_button").prop("disabled", true)
            }

        })
    });

    $("#select_all").on( "click", function(e) {
        if (phrases_table.rows( { selected: true } ).data().count() === phrases_table.rows( { } ).data().count()){
            phrases_table.rows( ).deselect();
        }else{
            phrases_table.rows().select()
        }
    });

    $("#delete_zero").on("click", function (e){
        if (phrases_table.rows({}).data().count() > 0){
            if (window.confirm("Do you really want delete zero records?")) {
                let obj = {delete_zero: true}
                $.post("/api/phrases/delete", obj, function (data, status) {
                    try {
                        const data_obj = JSON.parse(data)
                        if (data_obj.deleted === true) {
                            //phrases_table.ajax.reload(null, false);
                            reload_phrases_table()
                            const updatet_rows = phrases_table.rows( { } ).data()
                            console.log(updatet_rows)
                        } else {
                            if (JSON.parse(data).error) {
                                show_alert(JSON.parse(data).error, false)
                            } else {
                                show_alert("Unknown error.", false)
                            }
                        }
                    } catch (e) {
                        show_alert("Unknown error.", false)
                        return false
                    }
                })
            }
        }else{
            show_alert("No have records to delete.", false)
        }
    })

    $("#delete_all").on("click", function(e) {
        if (phrases_table.rows({}).data().count() > 0){
            if (window.confirm("Do you really want delete all records?")) {
                coins_table.clear().draw()
                $('#current_phrase').text("")
                current_mnemonic = null
                let obj = {delete_all: true}
                $.post("/api/phrases/delete", obj, function (data, status) {
                    try {
                        const data_obj = JSON.parse(data)
                        if (data_obj.deleted === true) {
                            //phrases_table.ajax.reload(null, false);

                            reload_phrases_table()

                            //show_alert("Phrase successfully added.", true)
                        } else {
                            if (JSON.parse(data).error) {
                                show_alert(JSON.parse(data).error, false)
                            } else {
                                show_alert("Unknown error.", false)
                            }
                        }
                    } catch (e) {
                        show_alert("Unknown error.", false)
                        return false
                    }
                })
            }
        }else{
            show_alert("No have records to delete.", false)
        }
    })

    $("#delete").on( "click", function(e) {
        //const aa = phrases_table.rows( { selected: true } ).ids(true);
        const selected_rows = phrases_table.rows( { selected: true } ).data()
        if (selected_rows.count() > 0) {
            let phrases = []
            selected_rows.map(el => {
                phrases.push(el.mnemonic);
                if (el.mnemonic === current_mnemonic) {
                    coins_table.clear().draw()
                    $('#current_phrase').text("")
                    current_mnemonic = null
                }
            })
            let obj
            obj = {phrases: JSON.stringify(phrases)}
            // if (phrases_table.rows({selected: true}).data().count() === phrases_table.rows({}).data().count()) {
            //     obj = {delete_all: true}
            // } else {
            //     obj = {phrases: JSON.stringify(phrases)}
            // }

            $.post("/api/phrases/delete", obj, function (data, status) {
                try {
                    const data_obj = JSON.parse(data)
                    if (data_obj.deleted === true) {
                        //phrases_table.ajax.reload(null, false);

                        reload_phrases_table()

                        //show_alert("Phrase successfully added.", true)
                    } else {
                        if (JSON.parse(data).error) {
                            show_alert(JSON.parse(data).error, false)
                        } else {
                            show_alert("Unknown error.", false)
                        }
                    }
                } catch (e) {
                    show_alert("Unknown error.", false)
                    return false
                }
            })
        } else {
            show_alert("You must select rows to delete", false)
        }
    });

    $('#phrases_file').change(function() {
        let phrases_file_input = $('#phrases_file')[0]
        //alert(JSON.stringify($('#phrases_file')[0].files[0]))
        if (phrases_file_input.files[0].type === "text/plain"){
            if (phrases_file_input.files[0].size <= 1048576){
                let formData = new FormData();
                formData.append('file', phrases_file_input.files[0]);

                $.ajax({
                    url : '/api/phrases/upload',
                    type : 'POST',
                    data : formData,
                    processData: false,  // tell jQuery not to process the data
                    contentType: false,  // tell jQuery not to set contentType
                    success : function(data) {
                        const data_obj = JSON.parse(data)
                        if (data_obj.uploaded === true) {
                            $("#phrases_file").val(null);
                            //phrases_table.ajax.reload(null, false);

                            reload_phrases_table()

                            phrases_table.columns.adjust().draw()
                            show_alert("Successfully uploaded.", true)
                        } else {
                            $("#phrases_file").val(null);
                            if (JSON.parse(data).error){
                                show_alert(JSON.parse(data).error, false)
                            }else{
                                show_alert("Unknown error.", false)
                            }
                        }
                    }
                });
            }else{
                $("#phrases_file").val(null);
                show_alert("File max size is 1.5mb", false)
            }
        }else{
            $("#phrases_file").val(null);
            show_alert("File must be text/plain", false)
        }
    });

} );