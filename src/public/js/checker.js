$(document).ready(function() {

    function validatePhrase(phrase, callback){
        const arr = phrase.split(" ")
        if (phrase === "" || arr.length === 12 || arr.length === 15 || arr.length === 18 || arr.length === 21 || arr.length === 24){
            if (phrase === ""){
                callback(true)
                return true
            }else {
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

    let coins_table = $('#coins').dataTable({
        "paging": false,
        "info": false,
        "order": [],
        "scrollY": "600px",
        responsive: true,
        "deferRender": true,
        "columns": [
            {data: 'coin', orderable: true, className: 'text-center align-middle small', "createdCell": function (td, cellData, rowData, row, col){
                    if ((cellData === "ETH") || (cellData === "BNB" && rowData.network === "BSC") || (rowData.network === "ERC20")){
                        $(td).html(`<a target="_blank" class="text-decoration-none" href="https://blockscan.com/address/${rowData.address}">${cellData}</a>`)
                    }
                }},
            {data: 'network', orderable: true, className: 'text-center align-middle small', "createdCell": function (td, cellData, rowData){
                    if (cellData === "ETH" || cellData === "ERC20"){
                        $(td).html(`<a target="_blank" class="text-decoration-none" href="https://etherscan.io/tokenholdings?a=${rowData.address}">${cellData}</a>`)
                    }
                    if (cellData === "BSC"){
                        $(td).html(`<a target="_blank" class="text-decoration-none" href="https://bscscan.com/tokenholdings?a=${rowData.address}">${cellData}</a>`)
                    }
                }},
            {data: 'address', orderable: false, className: 'text-break text-center align-middle small small',
                "createdCell": function (td, cellData, rowData, row, col) {
                    $(td).html(`<a target="_blank" class="text-decoration-none" href="${rowData.link}">${cellData}</a>`)
                }},
            {data: 'private_key', orderable: false, className: 'text-break text-center align-middle small small'},
        ],
        "rowId": 'mnemonic'
    });

    $('#checker_form').submit(function (evt) {
        evt.preventDefault();
        const mnemonic_val = $('#mnemonic').val()
        coins_table.fnClearTable()
        validatePhrase(mnemonic_val, function (is_valid){
            if (is_valid && mnemonic_val !== ""){
                $("#mnemonic").removeClass("is-invalid")

                $("#mnemonic").prop("disabled", true)
                $("#check_phrase_button").prop("disabled", true)

                $.get("/api/phrases/coins?phrase=" + encodeURIComponent(mnemonic_val), function (data, status) {
                    try {
                        //console.log(data)
                        $("#mnemonic").prop("disabled", false)
                        $("#check_phrase_button").prop("disabled", false)
                        let response = JSON.parse(data)
                        if (response.data){
                            coins_table.fnClearTable()
                            coins_table.fnAddData(response.data)
                        }else{
                            if (response.error){
                                alert(response.error)
                            }else{
                                alert("Unknown error.")
                            }
                        }
                    } catch (e) {
                        //show error
                        alert(e.message)
                        alert("Unknown error.")
                    }
                })
            }else{
                $("#mnemonic").addClass("is-invalid");
            }
        })
    })
})