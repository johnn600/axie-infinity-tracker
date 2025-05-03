//code by John Rey Vilbar
//widget values
//https://stackoverflow.com/a/50026752/19225183


//display manager name in the navbar
document.getElementById('manager-name').innerHTML = sessionStorage.managerName;


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


//modify sessionStorage.managerFirstLogin to false
//para dili mabalik ang transition sa page
window.sessionStorage.setItem('managerFirstLogin', false);


//read the views from database
eel.slp_today()(data => {
    if (typeof data === 'undefined'){
    document.getElementById('slp-today').innerHTML = 'No record';
    } else {
    document.getElementById('slp-today').innerHTML = ((data === null) ? 0 : data);
    incrementNum('#slp-today', data, 'integer');
}});

eel.slp_yesterday()(data => {
    if (typeof data === 'undefined'){
    document.getElementById('slp-yesterday').innerHTML = 'No record';
    } else {
    document.getElementById('slp-yesterday').innerHTML = ((data === null) ? 0 : data);
    incrementNum('#slp-yesterday', data, 'integer');
}});

eel.scholars_active()(data => {
    if (typeof data === 'undefined'){
    document.getElementById('scholars-active').innerHTML = 'No record';
    } else {
    x = JSON.parse(data)
    document.getElementById('scholarsActive').innerHTML = x[1];
    document.getElementById('scholarsTotal').innerHTML = x[0];
    incrementNum('#scholarsActive', x[1], 'integer');
    incrementNum('#scholarsTotal', x[0], 'integer');

    document.getElementById('active-scholars-chart').style.width = (x[1] / x[0]) * 100 +"%";
}});

eel.earnings_current_month()(data => {
    //display the current Month (jusko JS why wala kay native strftime support)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date().getMonth();
    const current_month = months[now];
    document.getElementById('header-current-month').innerHTML = 'Earnings: ' + current_month;

    if (data == false){
        document.getElementById('earnings-current-month').innerHTML = '0';
        //remove the spinner
        document.getElementById('spinnerEarningsMonth').remove();
    } else {
        document.getElementById('earnings-current-month').innerHTML = ((data === null) ? 0 : data);
        incrementNum('#earnings-current-month', data, 'integer');

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

                //remove the spinner
                document.getElementById('spinnerEarningsMonth').remove();

                //insert the approximate money value (in pesos) of accumulated slp
                document.getElementById('slp-to-pesos').innerHTML = ((data === null) ? 0.00 : data);
                incrementNum('#slp-to-pesos', data, 'float');
                })
            .catch(err => console.error(err));
    });
}});

eel.recent_quota()(data => {
    
    //remove the spinner
    document.getElementById('spinner2').remove();

    if (data == false){
        //recent_quota is empty
        var hideTable = document.getElementById('quotaRecordTable');
        var altContent = document.getElementById('quotaRecordAlt');
        hideTable.style.display = 'none';
        altContent.style.display = 'block';

    } else {
        var temp = JSON.parse(data);

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
}});


//print button function
function generateReport(){
    //generate timestamp for footer
    var time = new Date();
    var x = time.getMonth()+1 +"/"+time.getDate()+"/"+time.getFullYear();
    var y = time.getHours()+":"+time.getMinutes();
    document.getElementById('right-footer').innerHTML = "Report generated on " + x + " " + y;
    //modify header title

    //print content
    element = document.getElementById('content');
    window.print(element);
}

//reset preferences
function resetPreferences(){
    //hide the opened modal
    $('#userPreferences').modal('hide');
    //open the reset dialog
    $('#resetModal').modal('show');
}





//-------------------------------------------------------------------------
//chart.js
//-------------------------------------------------------------------------

//puta ka Chart.js maynalang nakita nako ni na code
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

//create a chart.js bar graph for the earnings (7 days)
eel.graph_dailyEarnings()(data => {
    var temp = JSON.parse(data);
    
    //delete the spinner
    document.getElementById('spinner').remove();

    //check if the array is empty
    if (temp.length == 0){
        //show the div containing the alternative content
        document.getElementById('noQuotaRecord').style.display = 'block';
        //terminate this function
        return
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
    console.log(currentDate);

    // Create an array of dates from 7 days, including the current date
    const past7Days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        past7Days.push(date.toISOString().slice(0, 10));
    }

    console.log(past7Days);

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
                data: earnings
            }]
        },
        options: {
            layout: {
                padding: {
                    top: 20,
                    bottom: 0
                }
            },
            maintainAspectRatio: false,
            //responsive: true,
            //cutoutPercentage: 60,
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
                        maxTicksLimit: 7,
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
                titleMarginBottom: 1,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 10,
                yPadding: 5,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 5,
                callbacks: {
                    title: function() {},
                    label: function(tooltipItem) {
                    return 'SLP: ' + tooltipItem.yLabel;}
                    },
            }
        }
    });


});
