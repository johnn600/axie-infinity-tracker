//code by John Rey Vilbar

var scholarID = sessionStorage.getItem('scholarID');
document.getElementById('navbar-scholar').innerHTML = "Scholar ID: " + scholarID;


//increasing number animation
//https://www.hashbangcode.com/article/animating-number-updates-jquery (modified)
function incrementNum(element, number, type){
    $(element).prop('counter',0).animate({
        counter: number
    },
    {
      duration: 500,
      type: type,
      step: function(now, fx){
        //different animation for integer and float values
        if (fx.options.type == 'integer'){
            $(this).text(Math.round(now));
        } else {
            $(this).text(now.toFixed(2));
        }
      }
    });
};




eel.quick_check_name(scholarID)(data => { 
    document.getElementById('header-title').innerHTML = "Welcome, " + data;
});

eel.quick_check_slp_today(scholarID)(data => {
    var slp_today = data;
    document.getElementById('slp-today').innerHTML = ((slp_today[0] === null) ? 0 : slp_today);
    //animate the value
    incrementNum('#slp-today', slp_today, 'integer');
});

//yesterday
eel.quick_check_slp_yesterday(scholarID)(data => {
    var slp_yesterday = data;
    document.getElementById('slp-yesterday').innerHTML = ((slp_yesterday[0] === null) ? 0 : slp_yesterday);
    //animate the value
    incrementNum('#slp-yesterday', slp_yesterday, 'integer');
});

eel.quick_check_status(scholarID)(data => {
    var status = JSON.stringify(data[0]);
    //Format the result
    status = status.replace(/"/g, '');
    status = status.charAt(0).toUpperCase() + status.slice(1)

    document.getElementById('scholar-status').innerHTML = status;

    //hide the loading spinner
    document.getElementById('spinnerStatus').classList.add('d-none');
    //show the status
    document.getElementById('scholar-status').classList.remove('d-none');

    //change the border colors according to status
    switch (status){
        case "Out":
            document.getElementById('status-card').classList.toggle('border-left-danger');
            document.getElementById('status-title').classList.toggle('text-danger');
            document.getElementById('status-icon').classList.toggle('text-danger');
            break;
        case "Idle":
            document.getElementById('status-card').classList.toggle('border-left-warning');
            document.getElementById('status-title').classList.toggle('text-warning');
            document.getElementById('status-icon').classList.toggle('text-warning');
            break;
        case "Active":
            document.getElementById('status-card').classList.toggle('border-left-success');
            document.getElementById('status-title').classList.toggle('text-success');
            document.getElementById('status-icon').classList.toggle('text-success');
            break;
    }
});

eel.quick_check_scholar_monthly(scholarID)(data => {
    if (typeof data === 'undefined'){
    document.getElementById('earnings-current-month').innerHTML = 'No record';
    } else {
    var dat = JSON.stringify(data);
    document.getElementById('earnings-current-month').innerHTML = ((dat === '[null]') ? '0' : data);
    //animate the value
    incrementNum('#earnings-current-month', data, 'integer');
    //to display the correct Month (jusko JS why wala kay native strftime support)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date().getMonth();
    const current_month = months[now];
    document.getElementById('header-current-month').innerHTML = 'Earnings: ' + current_month;
    var earnings_monthly = data;

    //SLP value in pesos
    eel.slp_price()(data => {
        var earnings_usd = data * earnings_monthly;
        var value = earnings_usd.toFixed(4)

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '93cbb0ac53mshf3efe9bf6d64374p176dcajsn4f4d8a9d6eae',
                'X-RapidAPI-Host': 'currency-converter-by-api-ninjas.p.rapidapi.com'
            }
        };

        fetch('https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency?have=USD&want=PHP&amount='+value, options)
            .then(response => response.json())
            .then(response => {
                var data = response.new_amount;
                //insert the real money value of accumulated slp
                document.getElementById('slp-to-pesos').innerHTML = ((data === null) ? 0 : data);
                //animate the value
                incrementNum('#slp-to-pesos', data, 'notInt');
                })
            .catch(err => console.error(err));
    });
}});

//printing
function generateReport(){
    //show badge containing scholarID
    //document.getElementById('labelAccountID').classList.remove('d-none');
    document.getElementById('labelAccountID').innerHTML = "Scholar ID: " + sessionStorage.scholarID;

    //generate timestamp for footer
    var time = new Date();
    var x = time.getMonth()+1 +"/"+time.getDate()+"/"+time.getFullYear();
    var y = time.getHours()+":"+time.getMinutes();
    document.getElementById('right-footer').innerHTML = "Report generated on " + x + " " + y;
    //modify header title 
    var name = document.getElementById('header-title').getInnerHTML().replace('Welcome, ', '');
    document.getElementById('alt-title').innerHTML = '<div class"row">' + 'Scholar: ' + name + '</div>';
    //print content
    element = document.getElementById('content');
    window.print(element);
}


//-----------------------------------------------------
//chart.js
//-----------------------------------------------------


//reference: https://github.com/chartjs/Chart.js/issues/1350#issuecomment-320265946
function beforePrint () {
    for (const id in Chart.instances) {
        Chart.instances[id].resize()
    }
    }
    if (window.matchMedia) {
    let mediaQueryList = window.matchMedia('print')
    mediaQueryList.addListener((mql) => {
        if (mql.matches) {
        beforePrint()
        }
    })
    }
window.onbeforeprint = beforePrint

// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Daily Earnings Chart (7 days)
eel.quick_check_earningsWeek(sessionStorage.scholarID)(data => {
    var temp = data

    //delete the spinner
    document.getElementById('spinner').remove();
    
    //check if record exist
    if(temp == 0){
        //show the alt message
        document.getElementById('noQuotaRecord').style.display = 'block';
        return;
    }

    //show the chart
    document.getElementById('chart').classList.remove('d-none');

    //convert the array to a dictionary
    var dataObj = {};
    for(let i=0; i< temp.length; i++){
        dataObj = Object.assign(dataObj, {[temp[i][0]]: temp[i][1]});
    }

    //current date
    const currentDate = new Date();

    // Create an array of dates from 7 days, including the current date
    const past7Days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        past7Days.push(date.toISOString().slice(0, 10));
    }

    // Iterate through the array of dates
    for (let i = 0; i < past7Days.length; i++) {
        // Check if the date already exists in the object
        if (!dataObj.hasOwnProperty(past7Days[i])) {
            // If not, add it with a value of 0
            dataObj[past7Days[i]] = 0;
        }
    }

    //sort the object by date
    var sorted = {};
    Object.keys(dataObj).sort().forEach(function(key) {
        sorted[key] = dataObj[key];
    });

    //get the date keys and earnings values
    var date = Object.keys(sorted);
    var earnings = Object.values(sorted);

    //convert the date to a readable format of MMM DD
    for (let i = 0; i < date.length; i++) {
        date[i] = new Date(date[i]).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}).toUpperCase();
    }

    //create the chart
    var ctx = document.getElementById("dailyEarningsGraph").getContext("2d");
    var myChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: date,
        datasets: [{
            data: earnings,
            lineTension: 0.3,
            backgroundColor: "rgba(78, 115, 223, 0.75)",
            borderColor: "rgba(78, 115, 223, 1)",
            pointRadius: 3,
            pointBackgroundColor: "rgba(78, 115, 223, 1)",
            pointBorderColor: "rgba(78, 115, 223, 1)",
            pointHoverRadius: 3,
            pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
            pointHoverBorderColor: "rgba(78, 115, 223, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 2,
        }]
    },
    options: {
        maintainAspectRatio: false,
        layout: {
            padding: {
            left: 10,
            right: 25,
            top: 25,
            bottom: 0
            }
        },
        legend: {
            display: false,
        },
        scales: {
            
            xAxes: [{
                time: {
                unit: 'date'
                },
                gridLines: {
                display: false,
                drawBorder: false
                },
                ticks: {
                maxTicksLimit: 7
                }
            }],
            yAxes: [{
                ticks: {
                maxTicksLimit: 5,
                padding: 10,
                },
                gridLines: {
                color: "rgb(234, 236, 244)",
                zeroLineColor: "rgb(234, 236, 244)",
                drawBorder: false,
                borderDash: [2],
                zeroLineBorderDash: [2]
                }
            }],
            },
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            titleMarginBottom: 10,
            titleFontColor: '#6e707e',
            titleFontSize: 14,
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            intersect: false,
            mode: 'index',
            caretPadding: 10,
            callbacks: {
                title: function() {},
                label: function(tooltipItem) {
                return 'SLP: ' + tooltipItem.yLabel;}
                }
            },
        },
    });

});

// Recent quota record
eel.quick_check_recentQuota(sessionStorage.scholarID)(data => {
    var temp = data;

    //hide the spinner
    document.getElementById('spinner2').remove();

    //check if record exist
    if(temp == 0){
        //show the alt message
        document.getElementById('quotaRecordAlt').style.display = 'block';
        return;
    }

    //show the table
    document.getElementById('quotaRecordTable').classList.remove('d-none');

    var quota_slp = temp.map(function(subArr) {return subArr[1]; });
    var quota_timestamp = temp.map(function(subArr) {return subArr[0]; });

    //create child objects
    //temp.length is used instead for 10 to prevent printing null td elements
    //for new systems with less than 10 quota records
    for (let i = 0; i < temp.length; i++){
        var table = document.getElementById("quotaRecordTable");
        var tbody = table.getElementsByTagName("tbody")[0];
        var row = document.createElement("tr");
        //date
        var timestamp = document.createElement("td");
        timestamp.innerHTML = quota_timestamp[i];
        //slp
        var slpMinted = document.createElement("td");
        slpMinted.innerHTML = quota_slp[i];
        row.appendChild(timestamp);
        row.appendChild(slpMinted);
        tbody.appendChild(row);
    };

});

