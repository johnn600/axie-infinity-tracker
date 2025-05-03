//code by John Rey Vilbar
//tenks ChatGPT for helping me to correct some portions


//Display manager name in navbar
var managerName = sessionStorage.managerName
document.getElementById('manager-name').innerHTML = managerName;


//get registered scholars info
function init(){
    console.log("function init()");

    // Destroy the existing DataTable if it exists
    var table = $('#dataTable').DataTable();
    if (table) {
        table.destroy();
    }
    
    //get the data from the SQLite database
    eel.scholar_info()(data => {
        //convert the data to JSON
        var scholarInfo = JSON.parse(data);

        //check if spinner exists
        if(document.getElementById("spinner") == null){
            //do nothing
        } else {
            document.getElementById("spinner").remove();
        }

        //check if scholarInfo is empty
        if(scholarInfo.length == 0){
            //show the div containing the message
            document.getElementById('noScholarRecord').style.display = 'block';
            return;
        }

        //display the dataTable
        document.getElementById("dataTableContainer").classList.remove("d-none");

        //insert data
        $(document).ready(function() {
            $('#dataTable').DataTable( {
            data: scholarInfo,
            columns: [
                {
                    data: null,
                    defaultContent: '',
                    orderable: false,
                    className: 'select-checkbox',
                    render: function () {
                        return '<input type="checkbox"/>';},
                    checkboxes: {
                        selectRow: true,
                        selectAllRender: '<input type="checkbox" class="select-checkbox"/>'}},

                { title: 'Scholar ID', data: 0, visible: false },
                { title: 'Name', data: 1 },
                { title: 'Contract (%)', data: 2 },
                { title: 'SLP Share', data: 3 } ],

                select: {
                    style: 'multi',
                    selector: 'td:first-child' },

                order: [[ 2, 'asc' ]],
            });
        });

    });

}

//retrive persons not assigned as scholar
function unassigned(){
    // Destroy the existing modal table if it exists
    var table = $('#assignScholarTable').DataTable();
    if (table) {
        table.destroy();
        console.log("table destroyed");
    }

    //eel function >> python 
    eel.unassigned_persons()(data => {
        var unassignedPersons = JSON.parse(data);

        $(document).ready(function() {
            $('#assignScholarTable').DataTable({
            data: unassignedPersons,
            order: [[ 2, 'asc' ]],
            "pagingType": 'full',
            "pageLength": 5,
            columns: [
                {
                    data: null,
                    defaultContent: '',
                    orderable: false,
                    width: "20%",
                    className: 'select-checkbox',
                    render: function () {
                        return '<input type="checkbox"/>';},
                    checkboxes: {
                        selectRow: true,
                        selectAllRender: '<input type="checkbox" class="select-checkbox"/>'}},

                { title: 'Person ID', data: 0, visible: false },
                { title: 'Name', data: 1 } ],
            select: {
                style: 'multi',
                selector: 'td:first-child' }
            });
        });
    });
}


//display the accounts played by the scholars
//scholar_plays sqlite view
function plays(){
    // Destroy the existing table if it exists
    var table = $('#accountsPlayedTable').DataTable();
    if (table) {
        table.destroy();
    }

    //eel function >> python 
    eel.scholar_plays()(data => {
        var temp = JSON.parse(data);

        //check if spinner exists
        if(document.getElementById("spinner2") == null){
            //do nothing
        } else {
            document.getElementById("spinner2").remove();
        }

        //show the table
        document.getElementById("accountsPlayedTable").classList.remove("d-none");

        $(document).ready(function() {
            $('#accountsPlayedTable').DataTable({
            data: temp,
            info: false,
            paging: false,
            order: [[ 0, 'asc' ]],
            columns: [
                { title: 'Name', data: 0},
                { title: 'Account ID', data: 1, visible: false},
                { title: 'Account email', data: 2 },
                {
                    data: null,
                    defaultContent: '',
                    orderable: false,
                    className: 'text-center',
                    render: function ( data, type, row ) {
                        return "<a class='btn btn-danger btn-icon-split btn-sm btn-block remove-btn' onclick='accountPlayedRemove()'><span class='text'>Remove</span></a>";},
                    }, ],
            select: {
                style: 'multi',
                selector: 'td:first-child' },
            });
        });
    });
}

//function to remove the selected account from the scholar
function accountPlayedRemove(){
    $('#accountsPlayedTable').on('click', '.remove-btn', function () {
		var table = $('#accountsPlayedTable').DataTable();
        var row = $(this).parents('tr');

        var accountID = table.row(row).data()[1];
        
        //remove the selected row
        removeAccount(accountID).then(result => {
            if (result !== true) {
                alert('SQLite error.');
            } else {
                //remove the row from the table
                if ($(row).hasClass('child')) {
                    table.row($(row).prev('tr')).remove().draw();
                }
                else
                {
                    table.row($(this).parents('tr')).remove().draw();
                }
                //show toast message
                showToast("Account unassigned from scholar.");
            }    
        });
	});
}

//autocomplete the comboboxes in assign account to scholar modal
function autoComplete(){
    $(document).ready(function() {
        
        //populate the combobox with the scholar names
        eel.scholar_noAccount()(data => {
            var scholarData = JSON.parse(data);
            var select = document.getElementById("assignAccountName");
            var scholarName = [];
            var scholarID = [];
            
            //remove the previous options before writing the new options
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }

            //check if scholarData is empty
            if (scholarData.length != 0){
                //create default option
                var defaultOption = document.createElement("option");
                defaultOption.disabled = true;
                defaultOption.selected = true;
                defaultOption.value = "";
                defaultOption.text = "Registered scholar";
                select.appendChild(defaultOption);
                //create the options
                scholarData.forEach(function(item, index) {
                    scholarName.push(item[1]);
                    scholarID.push(item[0]);
                    var option = document.createElement("option");
                    option.value = scholarID[index];
                    option.text = scholarName[index];
                    select.appendChild(option);
                });

                //enable the comboboxes and Assign btn
                select.disabled = false;
                document.getElementById("assignAccountID").disabled = false;
                document.getElementById("assignAccountBtn").disabled = false;
            } else {
                //create default option
                var defaultOption = document.createElement("option");
                defaultOption.disabled = true;
                defaultOption.selected = true;
                defaultOption.value = "";
                defaultOption.text = "No more idle scholars";
                select.appendChild(defaultOption);
                //disable the comboboxes and Assign btn
                select.disabled = true;
                document.getElementById("assignAccountID").disabled = true;
                document.getElementById("assignAccountBtn").disabled = true;
            }
        });

        //populate the combobox with the spare Account IDs
        eel.scholar_spareAccount()(data => {
            var accountData = JSON.parse(data);
            var select = document.getElementById("assignAccountID");

            //remove the previous options before writing the new options
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }

            //check if accountData is empty
            if(accountData.length != 0){
                //create default option
                var defaultOption = document.createElement("option");
                defaultOption.disabled = true;
                defaultOption.selected = true;
                defaultOption.value = "";
                defaultOption.text = "Select an account";
                select.appendChild(defaultOption);
                //append the account IDs
                accountData.forEach(function(item) {
                    var option = document.createElement("option");
                    option.value = item[0];
                    option.text = item[1];
                    select.appendChild(option);
                });
            } else {
                //create default option
                var defaultOption = document.createElement("option");
                defaultOption.disabled = true;
                defaultOption.selected = true;
                defaultOption.value = "";
                defaultOption.text = "No more spare accounts";
                select.appendChild(defaultOption);
                //disable the comboboxes and Assign btn
                select.disabled = true;
                document.getElementById("assignAccountName").disabled = true;
                document.getElementById("assignAccountBtn").disabled = true;
                }

        });
    });
}




//function to save preferences
//we will use localStorage to save the preferences (since mag-persist ang data even after closing the browser)
function savePreferences(){
    var inputScholarContract = document.getElementById("defaultScholarContract").value;

    if(inputScholarContract == 0){
        var form = document.getElementById("userPreferences");
        form.classList.add('was-validated');
        return;

    }

    //create localStorage object to save preferences
    window.localStorage.setItem("defaultScholarContract", inputScholarContract);

    //debug
    console.log("Successfully saved preferences (localStorage objects)");
    //show message
    showToast("Preferences saved");

    //close the modal
    $('#userPreferences').modal('hide');

}

//when the Preferences modal was opened
function preferencesModal(){
    var form = document.getElementById("userPreferences");
    form.classList.remove('was-validated');
    
    //set the values of the localStorage objects to the input fields
    document.getElementById("defaultScholarContract").value = localStorage.getItem("defaultScholarContract");
}




//function for Assign, Update, Remove buttons
function modalButtons(action){    
    //when modal is opened (for main table)
    switch(action){
        case "scholarAssign":
            console.log("Assign modal opened");
            //populate the table in the assign modal
            unassigned();
            //disable the Assign btn in the modal
            document.getElementById("assignBtn").classList.add('disabled');
            break;

        case "scholarUpdate":
            //reset the appearance of the form (from previous validation)
            var modal = document.getElementById(action);
            modal.classList.remove('was-validated');

            //clear the previous generated QR code (hidden div)
            document.getElementById("qrcode").innerHTML = "";
            //remove the top margin of QR code div
            document.getElementById('qrcode').classList.remove('mt-3');
            //hide the QR code container (was set to visible from previous QR code generation)
            document.getElementById('qrContainer').classList.add('d-none');

            var selectedData = rowData('#dataTable', 'all');
            //modify the input values in the Update modal
            document.getElementById("inputName").value = selectedData[0][1];
            document.getElementById("inputContractPercentage").value = selectedData[0][2];
            document.getElementById("inputScholarShare").value = selectedData[0][3] + " SLP";
            //show person ID in the modal
            document.getElementById("labelScholarID").innerHTML = selectedData[0][0] + '<i class="fas fa-regular fa-copy pl-2"></i>';
            break;

        //assign account modal
        case "scholarAssignAccount":
            //reset the appearance of the form (from previous validation)
            var form = document.getElementById("assignAccountForm");
            form.classList.remove('was-validated');
            form.reset();

            //enable autocomplete in Accounts played modal
            autoComplete();

        
        case "formRemove":
            break;
    }

}


//function to get data from selected rows
function rowData(tab, arg){
    var table = $(tab).DataTable();
    var data = table.rows('.selected').data();
    var temp = []

    if(arg == "all"){
        // Loop through the selected rows and log the data for each column
        for (var i = 0; i < data.length; i++) {
            temp.push(data[i])
        }
        console.log(temp);
        return temp;
    } 
    else if(arg == "id"){
        for (var i = 0; i < data.length; i++) {
            temp.push(data[i][0]);
        }
        console.log(temp);
        return temp;
    }
}


//handles checkbox click events
function checkboxAction(tableID){
    console.log("checkboxAction(tableID) >> " + tableID);
    
    $(tableID).on('click', 'input[type="checkbox"]', function() {
        //data of selected row
        var row = $(this).closest('tr', tableID);
        //count the number of selected checkboxes
        var rowCount = $(tableID + ' :checkbox:checked').length;

        //if the checkboxes are selected
        if (this.checked){
            row.addClass('selected');
        } else {
            row.removeClass('selected');
        }

        switch(tableID){
            case "#dataTable":
                //enable/disable buttons in the main table
                if(rowCount == 1){
                    document.getElementById("updateBtn").classList.remove('disabled');
                    document.getElementById("removeBtn").classList.remove('disabled');
                }
                else if (rowCount > 1){
                    document.getElementById("updateBtn").classList.add('disabled');
                }
                else {
                    document.getElementById("updateBtn").classList.add('disabled');
                    document.getElementById("removeBtn").classList.add('disabled');
                }
                break;

            case "#assignScholarTable":
                //enable/disable buttons in the assign modal
                if(rowCount > 0){
                    document.getElementById("assignBtn").classList.remove('disabled');
                } else {
                    document.getElementById("assignBtn").classList.add('disabled');
                }
        }
    });
}


//call the starter functions
init();
plays();
checkboxAction('#dataTable');
checkboxAction('#assignScholarTable');



//This function handles the button actions in the modal
//action: Add, Update, Delete
function modalActionButton(action) {
    // Get the form in the currently displayed modal
    var modal = document.querySelector('.modal.show');
    var form = modal.querySelector('form');

  
    // Validate the form
    if(action == 'Update' || action == 'AssignAccount'){
        if (form.checkValidity() === false) {
        console.log("form invalid");
        //show the invalid input messages
        form.classList.add('was-validated');
        //animate the modal to shake
        modal.classList.add('animate__animated', 'animate__headShake');
        //remove the animation class after animation
        modal.addEventListener('animationend', () => {
            modal.classList.remove('animate__animated', 'animate__headShake');
        });

        //terminate the function if invalid form
        return;
        }
    }

    switch(action){
        //add scholar to database
        case 'Assign':
            var selectedRowData = rowData("#assignScholarTable", "id");
            var userDefaults = [localStorage.getItem("defaultScholarContract")];
            
            console.log("Selected: " + selectedRowData);
            console.log("User Defaults: " + userDefaults);
            

            //call intermediary function to execute backend query
            addScholar(selectedRowData, userDefaults).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    //show toast
                    showToast((selectedRowData.length == 1 ? "Person is added as a scholar." : "Selected persons added as scholars."))
                    //hide the modal
                    $('#addEntryModal').modal('hide');
                    $('#dataTable').DataTable().destroy();
                    //reload the table
                    init();
                }
            }); 
            break;

        case 'Update':
            var scholarID = document.getElementById('labelScholarID').textContent;
            var scholarName = document.getElementById('inputName').value;
            var scholarContract = document.getElementById('inputContractPercentage').value;
            var updateData = [scholarID, scholarName, scholarContract];

            //update scholar details
            updateDetails(updateData).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Updated scholar information of " + scholarName)
                    //hide modal
                    $('#editEntryModal').modal('hide');
                    //destroy table
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                    //make the modal buttons disabled
                    document.getElementById("updateBtn").classList.add('disabled');
                    document.getElementById("removeBtn").classList.add('disabled');
                }
            });
            break;
        
        case 'Delete':
            var scholarID = rowData('#dataTable','id');

            //delete scholar
            deleteScholar(scholarID).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Successfully removed as scholar/s.")
                    $('#deleteEntryModal').modal('hide');
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                    //refresh the Accounts played table
                    plays();
                    //make the modal buttons disabled
                    document.getElementById("updateBtn").classList.add('disabled');
                    document.getElementById("removeBtn").classList.add('disabled');
                }
            });
            break;
        
        //assign account to scholar
        case 'AssignAccount':
            var scholarID = document.getElementById('assignAccountName').value;
            var accountID = document.getElementById('assignAccountID').value;
            var assignData = [scholarID, accountID];

            //assign account to scholar
            assignAccount(assignData).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Successfully assigned account to scholar.")
                    $('#assignAccount').modal('hide');

                    $('#accountsPlayedTable').DataTable().destroy();
                    //repopulate the table
                    plays();

                }
            });

            break;


    }
}
  

//generate QR code
//https://github.com/davidshimjs/qrcodejs
function generateQrCode(){
    if(document.getElementById('qrcode').innerHTML == ''){
        var scholarID = document.getElementById('labelScholarID').innerText;
        var scholarName = document.getElementById('inputName').value;
        var currentYear = new Date().getFullYear();

        //embedded logo (base64 string)
        const logo = "data:image/png;base64,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";

        var options = {
            text: scholarID,
            width: 600,
            height: 600,
            colorDark : "#313380",
            correctLevel : QRCode.CorrectLevel.H,
            
            dotScale: 0.5,
            dotScaleTiming_V: 0.5,
            dotScaleTiming_H: 0.5,

            quietZone: 30,
            quietZoneColor: "rgba(255,255,255,0)",
            logo: logo,
            logoWidth: 120,
            logoHeight: 120,
            logoBackgroundTransparent: true,
      
            title: "AXIE TRACKER (BETA) " + currentYear,
            titleTop: 0,
            titleHeight: 10,
            font: "bold 16px Monospace",

            subTitle: 'SCHOLAR: ' + scholarName.toUpperCase() + " (" + scholarID.toUpperCase() + ")",
            subTitleTop: 640,
            subTitleFont: "bold 14px Monospace",

        };
        
        //generate the QRCode Object
        new QRCode(document.getElementById("qrcode"), options);

        //show the QR code container
        document.getElementById('qrContainer').classList.remove('d-none');
        document.getElementById('qrContainer').classList.add('mt-3');
        document.getElementById('qrContainer').classList.add('animate__animated', 'animate__bounceIn');
        document.getElementById('qrcode').setAttribute('title', 'QR code for ' + document.getElementById('inputName').value)

        //remove animation class after animation
        document.getElementById('qrContainer').addEventListener('animationend', () => {
            document.getElementById('qrContainer').classList.remove('animate__animated', 'animate__bounceIn');
        });
    }
}

//save qr image
document.querySelector("#saveQr").addEventListener("click", function() {
    const canvas = document.querySelector("#qrcode canvas");
    // Get data URI of the canvas image
    const dataURI = canvas.toDataURL();
    // Create a link element
    const link = document.createElement("a");
    // Set the link's href attribute to the data URI
    link.href = dataURI;
    // Set the link's download attribute to "qr.png"
    link.download = 'Scholar: ' + document.getElementById('inputName').value + ".png";
    // Trigger the click event on the link
    link.click();
});
  


//show a toast message
//https://www.jqueryscript.net/other/Toast-Notification-Library.html
function showToast(msg){
    $.toast({
        title: msg,
        position: 'bottom'
    });
}

//copy to clipboard
function copyToClipboard(value){
    navigator.clipboard.writeText(value);
    showToast('Copied to clipboard')
}

//print button
function generateReport(){
    //generate timestamp for footer
    var time = new Date();
    var x = time.getMonth()+1 +"/"+time.getDate()+"/"+time.getFullYear();
    var y = time.getHours()+":"+time.getMinutes();
    document.getElementById('right-footer').innerHTML = "Report generated on " + x + " " + y;
    //modify table title
    document.getElementById('table-title').innerHTML = "All scholars in the guild as of " + x;

    //print content
    element = document.getElementById('content');
    window.print(element);
}


//intermediary functions---------------------------------------------------------------
//bridge between python and javascript (through Eel framework)
//special thanks sa ChatGPT for helping me in this huhu
function addScholar(data, defaults) {
    return new Promise(resolve => {
        eel.scholar_addEntry(data, defaults)(data => {
        result = JSON.parse(data);
        if (result !== false) {
            resolve(true);
        } else {
            resolve(false);
        }
        });
    });
}

//update scholar details
function updateDetails(data){
    return new Promise(resolve => {
        eel.scholar_updateEntry(data)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

//remove person as scholar
function deleteScholar(data){
    return new Promise(resolve => {
        eel.scholar_deleteEntry(data)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

//assign account to scholar
function assignAccount(data){
    return new Promise(resolve => {
        eel.scholar_assignAccount(data)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

//unassign account from scholar
function removeAccount(data){
    return new Promise(resolve => {
        eel.scholar_removeAccount(data)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

