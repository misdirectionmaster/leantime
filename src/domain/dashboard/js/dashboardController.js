leantime.dashboardController = (function () {

    // Variables (underscore for private variables)
    var  chartColors = {
        red: 'rgb(201,48,44)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(90,182,90)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    var _burndownConfig = '';

    var _progressChart = '';

    //Constructor
    (function () {
        jQuery(document).ready(
            function () {
                _initDueDateTimePickers();

            });
    })();

    //Functions

    var prepareHiddenDueDate = function() {

        var thisFriday = moment().startOf('week').add(5, 'days');
        jQuery("#dateToFinish").val(thisFriday.format("YYYY-MM-DD"));

    };

    var initProgressChart = function (complete, incomplete ) {
        var config = {
            type: 'doughnut',

            data: {
                datasets: [{
                    data: [
                        complete,
                        incomplete

                    ],
                    backgroundColor: [
                            leantime.dashboardController.chartColors.green,
                            leantime.dashboardController.chartColors.grey

                        ],
                    label: leantime.i18n.__("label.project_done")
                }],
                labels: [
                            complete+'% Done',
                            incomplete+'% Open'
                        ]
            },
            options: {
                maintainAspectRatio : false,
                responsive: true,

                legend: {
                    position: 'bottom',
                },
                title: {
                    display: false,
                    text: ''
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        };

        var ctx = document.getElementById('chart-area').getContext('2d');
        _progressChart = new Chart(ctx, config);
    };

    var initBurndown = function (labels, plannedData, actualData) {

        var MONTHS = labels;
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: leantime.i18n.__("label.ideal"),
                        backgroundColor: leantime.dashboardController.chartColors.blue,
                        borderColor: leantime.dashboardController.chartColors.blue,
                        data: plannedData,
                        fill: false,
                        lineTension: 0,
                },
                    {
                        label: 'Actual',
                        backgroundColor: leantime.dashboardController.chartColors.red,
                        borderColor: leantime.dashboardController.chartColors.red,
                        data: actualData,
                        fill: false,
                        lineTension: 0,
                }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio : false,

                title: {
                    display: false,
                    text: 'Line Chart'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                legend: {
                    position: 'bottom',
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: leantime.i18n.__("label.date"),
                        },
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: leantime.i18n.__("label.effort")
                        },
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        };

        var ctx2 = document.getElementById('sprintBurndown').getContext('2d');
        _burndownChart = new Chart(ctx2, config);

        return _burndownChart;

    };

    var initChartButtonClick = function (id, plannedData, actualData, chart) {

        jQuery("#"+id).click(
            function (event) {

                chart.data.datasets[0].data = plannedData;
                chart.data.datasets[1].data = actualData;
                chart.options.scales.yAxes[0].scaleLabel.labelString = leantime.i18n.__("label.open_todos");
                jQuery(".chartButtons").removeClass('active');
                jQuery(this).addClass('active');
                chart.update();

            }
        );

    };

    var initBacklogBurndown = function (labels, actualData) {

        var MONTHS = labels;
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [

                    {
                        label: leantime.i18n.__("label.open_todos"),
                        backgroundColor: leantime.dashboardController.chartColors.red,
                        borderColor: leantime.dashboardController.chartColors.red,
                        data: actualData,
                        fill: false,
                        lineTension: 0,
                        pointRadius:0,

                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio : false,

                title: {
                    display: false,
                    text: 'Line Chart'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                legend: {
                    position: 'bottom',
                },
                elements: {
                    point: {
                        pointStyle: "line",
                        radius:"0"
                    }
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: leantime.i18n.__("label.date"),

                        },
                        type: 'time',

                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: leantime.i18n.__("label.num_tickets")
                        },
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        };

        var ctx2 = document.getElementById('backlogBurndown').getContext('2d');
        _burndownChart = new Chart(ctx2, config);

        return _burndownChart;

    };

    var initBacklogChartButtonClick = function (id, actualData, chart) {

        jQuery("#"+id).click(
            function (event) {

                chart.data.datasets[0].data = actualData;
                chart.options.scales.yAxes[0].scaleLabel.labelString = leantime.i18n.__("label.open_todos");
                jQuery(".backlogChartButtons").removeClass('active');
                jQuery(this).addClass('active');
                chart.update();

            }
        );

    };

    var _initDueDateTimePickers = function () {
        jQuery(".duedates").datepicker(
            {
                dateFormat: leantime.i18n.__("language.jsdateformat"),
                onClose: function(date) {

                    var newDate = "";

                    if(date == "") {

                        jQuery(this).val(leantime.i18n.__("text.anytime"));

                    }

                    var dateTime = new Date(date);
                    dateTime = moment(dateTime).format("YYYY-MM-DD HH:mm:ss");

                    var id = jQuery(this).attr("data-id");
                    newDate = dateTime;

                    leantime.ticketsRepository.updateDueDates(id, newDate, function() {
                        jQuery.jGrowl(leantime.i18n.__("short_notifications.duedate_updated"));
                    });



                }
            }
        );
    };

    // Make public what you want to have public, everything else is private
    return {
        chartColors: chartColors,
        initBurndown: initBurndown,
        initChartButtonClick: initChartButtonClick,
        initBacklogBurndown:initBacklogBurndown,
        initBacklogChartButtonClick:initBacklogChartButtonClick,
        initProgressChart:initProgressChart,
        prepareHiddenDueDate:prepareHiddenDueDate

    };
})();
