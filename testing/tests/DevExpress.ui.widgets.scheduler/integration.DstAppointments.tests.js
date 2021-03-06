"use strict";

var $ = require("jquery");

QUnit.testStart(function() {
    $("#qunit-fixture").html('<div id="scheduler"></div>');
});

require("common.css!");
require("generic_light.css!");


var $ = require("jquery"),
    dateLocalization = require("localization/date"),
    fx = require("animation/fx");

require("ui/scheduler/ui.scheduler");

var DATE_TABLE_CELL_CLASS = "dx-scheduler-date-table-cell",
    APPOINTMENT_CLASS = "dx-scheduler-appointment";

function getDeltaTz(schedulerTz, date) {
    var defaultTz = date.getTimezoneOffset() * 60000;
    return schedulerTz * 3600000 + defaultTz;
}

QUnit.module("Integration: Appointments", {
    beforeEach: function() {
        fx.off = true;
        this.createInstance = function(options) {
            this.instance = $("#scheduler").dxScheduler(options).dxScheduler("instance");
        };
        this.clock = sinon.useFakeTimers();
    },
    afterEach: function() {
        fx.off = false;
        this.clock.restore();
    }
});

QUnit.test("Appointment wich started in DST and ended in STD time should have correct start & end dates", function(assert) {
    var startDate = 1541311200000,
        endDate = 1541319000000;

    this.createInstance({
        currentDate: new Date(2018, 10, 4),
        views: ["week"],
        currentView: "week",
        dataSource: [{
            text: "DST",
            startDate: startDate,
            endDate: endDate
        }],
        timeZone: "America/Chicago"
    });

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    var $appointment = $(this.instance.$element()).find("." + APPOINTMENT_CLASS).eq(0),
        deltaTzStart = getDeltaTz(-5, startDate),
        deltaTzEnd = getDeltaTz(-6, endDate),
        startDateByTz = new Date(startDate.setHours(startDate.getHours() + deltaTzStart / 3600000)),
        endDateByTz = new Date(endDate.setHours(endDate.getHours() + deltaTzEnd / 3600000));

    assert.equal($appointment.find(".dx-scheduler-appointment-content div").eq(0).text(), "DST", "Text is correct on init");

    assert.equal($appointment.find(".dx-scheduler-appointment-content-date").eq(0).text(), dateLocalization.format(startDateByTz, "shorttime"), "Start Date is correct on init");
    assert.equal($appointment.find(".dx-scheduler-appointment-content-date").eq(2).text(), dateLocalization.format(endDateByTz, "shorttime"), "End Date is correct on init");
});

QUnit.test("Appointment wich started in STD and ended in DST time should have correct start & end dates", function(assert) {
    var startDate = new Date(1520748000000),
        endDate = new Date(1520751600000);

    this.createInstance({
        currentDate: new Date(2018, 2, 11),
        views: ["timelineDay"],
        currentView: "timelineDay",
        dataSource: [{
            text: "DST",
            startDate: startDate,
            endDate: endDate
        }],
        timeZone: "America/New_York"
    });

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    var $appointment = $(this.instance.$element()).find("." + APPOINTMENT_CLASS).eq(0),
        deltaTzStart = getDeltaTz(-5, startDate),
        deltaTzEnd = getDeltaTz(-4, endDate),
        startDateByTz = new Date(startDate.setHours(startDate.getHours() + deltaTzStart / 3600000)),
        endDateByTz = new Date(endDate.setHours(endDate.getHours() + deltaTzEnd / 3600000));

    assert.equal($appointment.find(".dx-scheduler-appointment-content div").eq(0).text(), "DST", "Text is correct on init");

    assert.equal($appointment.find(".dx-scheduler-appointment-content-date").eq(0).text(), dateLocalization.format(startDateByTz, "shorttime"), "Start Date is correct on init");
    assert.equal($appointment.find(".dx-scheduler-appointment-content-date").eq(2).text(), dateLocalization.format(endDateByTz, "shorttime"), "End Date is correct on init");
});

QUnit.test("Second recurring appointment wich started in STD and ended in DST time should have correct start & end dates", function(assert) {
    var startDate = new Date(1520748000000),
        endDate = new Date(1520751600000);

    this.createInstance({
        currentDate: new Date(2018, 2, 12),
        views: ["timelineDay"],
        currentView: "timelineDay",
        dataSource: [{
            text: "DST",
            startDate: startDate,
            endDate: endDate,
            recurrenceRule: "FREQ=DAILY"
        }],
        timeZone: "America/New_York"
    });

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    var $appointment = $(this.instance.$element()).find("." + APPOINTMENT_CLASS).eq(0),
        deltaTzStart = getDeltaTz(-5, startDate),
        deltaTzEnd = getDeltaTz(-4, endDate),
        startDateByTz = new Date(startDate.setHours(startDate.getHours() + deltaTzStart / 3600000)),
        endDateByTz = new Date(endDate.setHours(endDate.getHours() + deltaTzEnd / 3600000));

    assert.equal($appointment.find(".dx-scheduler-appointment-content div").eq(0).text(), "DST", "Text is correct on init");

    assert.equal($appointment.find(".dx-scheduler-appointment-content-date").eq(0).text(), dateLocalization.format(startDateByTz, "shorttime"), "Start Date is correct on init");
    assert.equal($appointment.find(".dx-scheduler-appointment-content-date").eq(2).text(), dateLocalization.format(endDateByTz, "shorttime"), "End Date is correct on init");
});

QUnit.test("Appointment wich started in STD and ended in DST time should have right width, timeline view", function(assert) {
    var startDate = new Date(2018, 2, 11, 1),
        endDate = new Date(2018, 2, 11, 3),
        currentDate = new Date(2018, 2, 11);

    this.createInstance({
        views: ["timelineDay"],
        currentView: "timelineDay",
        cellDuration: 60,
        dataSource: [{
            text: "DST",
            startDate: startDate,
            endDate: endDate
        }],
        timeZone: "America/New_York"
    });

    this.instance.option("currentDate", this.instance.fire("convertDateByTimezone", currentDate, -5));

    var $appointment = $(this.instance.$element()).find("." + APPOINTMENT_CLASS).first(),
        cellWidth = this.instance.$element().find("." + DATE_TABLE_CELL_CLASS).first().outerWidth(),
        duration = (endDate - startDate) / 3600000;

    assert.roughEqual($appointment.outerWidth(), cellWidth * duration, 2.001, "Appt width is correct on the day of the time ajusting");
});

QUnit.test("Second recurring appointment should have right width if previous appt started in STD and ended in DST, timeline view", function(assert) {
    var startDate = new Date(1520758800000),
        endDate = new Date(1520762400000),
        currentDate = new Date(2018, 2, 12);

    this.createInstance({
        currentDate: currentDate,
        views: ["timelineDay"],
        currentView: "timelineDay",
        dataSource: [{
            text: "DST",
            startDate: startDate,
            endDate: endDate,
            recurrenceRule: "FREQ=DAILY"
        }],
        cellDuration: 60,
        timeZone: "America/New_York"
    });
    this.instance.option("currentDate", this.instance.fire("convertDateByTimezone", currentDate, -5));

    var $secondRecAppointment = $(this.instance.$element()).find("." + APPOINTMENT_CLASS).first(),
        cellWidth = this.instance.$element().find("." + DATE_TABLE_CELL_CLASS).first().outerWidth(),
        duration = (endDate - startDate) / 3600000;

    assert.roughEqual($secondRecAppointment.outerWidth(), cellWidth * duration, 2.001, "Appt width is correct after the day of the time ajusting");
});
