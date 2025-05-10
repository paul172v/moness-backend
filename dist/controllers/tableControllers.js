"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tablePruneBookings = exports.blockedTimeSlotDeleteOne = exports.blockedTimeSlotUpdateOne = exports.blockedTimeSlotCreateOne = exports.tableGetManyByEmail = exports.tableGetManyByName = exports.tableGetManyByDate = exports.tableDeleteOne = exports.tableUpdateOne = exports.blockedTimeSlotGetOneById = exports.tableGetOneById = exports.tableToggleTimeSelectionButtons = exports.tableCreateOne = exports.tableGetAll = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const handlerFactory_1 = require("./handlerFactory");
const tableModel_1 = __importDefault(require("../models/tableModel"));
const blockedTimeSlotModel_1 = __importDefault(require("../models/blockedTimeSlotModel"));
/*-------------------- Table Booking Controllers --------------------*/
exports.tableGetAll = (0, handlerFactory_1.factoryGetAll)(tableModel_1.default);
exports.tableCreateOne = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, firstName, lastName, numberOfGuests, occasion, requests, selectedDate, selectedTime, tel, termsAccepted, } = req.body;
    // Check for conflicting blocked slot
    const isBlocked = yield blockedTimeSlotModel_1.default.findOne({
        selectedDate: new Date(selectedDate),
        selectedTime,
    });
    if (isBlocked) {
        return next(new appError_1.default("This time slot is blocked and cannot be booked.", 400));
    }
    const newTable = yield tableModel_1.default.create({
        email,
        firstName,
        lastName,
        numberOfGuests,
        occasion,
        requests,
        selectedDate,
        selectedTime,
        tel,
        termsAccepted,
    });
    if (!newTable) {
        return next(new appError_1.default("Could not create new table booking", 404));
    }
    res.status(200).json({
        status: "success",
        table: newTable,
    });
}));
exports.tableToggleTimeSelectionButtons = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const searchedNumberOfGuests = req.body.numberOfGuests;
    const searchedSelectedDate = req.body.selectedDate;
    const searchedSelectedTime = req.body.selectedTime;
    function parseHourAndMinute(selectedTime) {
        const timeStr = String(selectedTime).padStart(4, "0");
        const hour = parseInt(timeStr.slice(0, 2), 10);
        const minute = timeStr.slice(2, 4);
        return [hour, minute];
    }
    function buildTimeSlots(selectedTime) {
        const [hour, minute] = parseHourAndMinute(selectedTime);
        const times = Array(5)
            .fill(null)
            .map(() => ({
            hr: hour,
            min: minute,
            isFull: false,
            isBlocked: false,
        }));
        const minNumber = parseInt(minute, 10);
        if (minNumber === 0) {
            times[0] = { hr: hour - 1, min: "30", isFull: false, isBlocked: false };
            times[1] = { hr: hour - 1, min: "45", isFull: false, isBlocked: false };
            times[2] = { hr: hour, min: "00", isFull: false, isBlocked: false };
            times[3] = { hr: hour, min: "15", isFull: false, isBlocked: false };
            times[4] = { hr: hour, min: "30", isFull: false, isBlocked: false };
        }
        else if (minNumber === 15) {
            times[0] = { hr: hour - 1, min: "45", isFull: false, isBlocked: false };
            times[1] = { hr: hour, min: "00", isFull: false, isBlocked: false };
            times[2] = { hr: hour, min: "15", isFull: false, isBlocked: false };
            times[3] = { hr: hour, min: "30", isFull: false, isBlocked: false };
            times[4] = { hr: hour, min: "45", isFull: false, isBlocked: false };
        }
        else if (minNumber === 30) {
            times[0] = { hr: hour, min: "00", isFull: false, isBlocked: false };
            times[1] = { hr: hour, min: "15", isFull: false, isBlocked: false };
            times[2] = { hr: hour, min: "30", isFull: false, isBlocked: false };
            times[3] = { hr: hour, min: "45", isFull: false, isBlocked: false };
            times[4] = { hr: hour + 1, min: "00", isFull: false, isBlocked: false };
        }
        else if (minNumber === 45) {
            times[0] = { hr: hour, min: "15", isFull: false, isBlocked: false };
            times[1] = { hr: hour, min: "30", isFull: false, isBlocked: false };
            times[2] = { hr: hour, min: "45", isFull: false, isBlocked: false };
            times[3] = { hr: hour + 1, min: "00", isFull: false, isBlocked: false };
            times[4] = { hr: hour + 1, min: "15", isFull: false, isBlocked: false };
        }
        return times;
    }
    const isTimeSlotFull = (time) => __awaiter(void 0, void 0, void 0, function* () {
        const tablesArr = yield tableModel_1.default.find({
            selectedDate: searchedSelectedDate,
            selectedTime: time,
        });
        const totalGuests = tablesArr.reduce((sum, table) => sum + table.numberOfGuests, 0);
        return totalGuests + searchedNumberOfGuests > 15;
    });
    const isTimeSlotBlocked = (time) => __awaiter(void 0, void 0, void 0, function* () {
        const blocked = yield blockedTimeSlotModel_1.default.findOne({
            selectedDate: new Date(searchedSelectedDate),
            selectedTime: time,
        });
        return !!blocked;
    });
    const times = buildTimeSlots(searchedSelectedTime);
    // Populate isFull and isBlocked for each slot
    yield Promise.all(times.map((slot) => __awaiter(void 0, void 0, void 0, function* () {
        const timeString = `${String(slot.hr).padStart(2, "0")}${slot.min}`;
        slot.isFull = yield isTimeSlotFull(timeString);
        slot.isBlocked = yield isTimeSlotBlocked(timeString);
    })));
    res.status(200).json({
        status: "success",
        message: "Data received successfully",
        data: {
            timeSlots: times,
        },
    });
}));
exports.tableGetOneById = (0, handlerFactory_1.factoryGetOneById)(tableModel_1.default);
exports.blockedTimeSlotGetOneById = (0, handlerFactory_1.factoryGetOneById)(blockedTimeSlotModel_1.default);
exports.tableUpdateOne = (0, handlerFactory_1.factoryUpdateOne)(tableModel_1.default);
exports.tableDeleteOne = (0, handlerFactory_1.factoryDeleteOne)(tableModel_1.default);
exports.tableGetManyByDate = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { selectedDate } = req.body;
    if (!selectedDate) {
        return res.status(400).json({
            status: "fail",
            message: "Selected date is required.",
        });
    }
    // Normalize the date to midnight
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    // Fetch both Table and BlockedTimeSlot bookings
    const [tableBookings, blockedTimeSlots] = yield Promise.all([
        tableModel_1.default.find({
            selectedDate: { $gte: startOfDay, $lt: endOfDay },
        }),
        blockedTimeSlotModel_1.default.find({
            selectedDate: { $gte: startOfDay, $lt: endOfDay },
        }),
    ]);
    // Merge and sort by time (assuming selectedTime is a string like "1730", "1800", etc.)
    const allBookings = [...tableBookings, ...blockedTimeSlots].sort((a, b) => {
        return a.selectedTime.localeCompare(b.selectedTime);
    });
    res.status(200).json({
        status: "success",
        results: allBookings.length,
        bookings: allBookings,
    });
}));
exports.tableGetManyByName = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName } = req.body;
    if (!firstName && !lastName) {
        return res.status(400).json({
            status: "fail",
            message: "At least one of firstName or lastName is required.",
        });
    }
    const query = {};
    if (firstName)
        query.firstName = new RegExp(`^${firstName}`, "i");
    if (lastName)
        query.lastName = new RegExp(`^${lastName}`, "i");
    const bookings = yield tableModel_1.default.find(query).sort({
        selectedDate: 1,
        selectedTime: 1,
    });
    res.status(200).json({
        status: "success",
        results: bookings.length,
        bookings,
    });
}));
exports.tableGetManyByEmail = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            status: "fail",
            message: "Email is required.",
        });
    }
    const emailRegex = new RegExp(`^${email}`, "i"); // case-insensitive, partial match
    const bookings = yield tableModel_1.default.find({ email: emailRegex }).sort({
        selectedDate: 1,
        selectedTime: 1,
    });
    res.status(200).json({
        status: "success",
        results: bookings.length,
        bookings,
    });
}));
/*-------------------- Blocked Time Slot Controllers --------------------*/
exports.blockedTimeSlotCreateOne = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newBlockedTimeSlot = yield blockedTimeSlotModel_1.default.create({
        firstName: "Blocked",
        lastName: "Slot",
        selectedDate: req.body.selectedDate,
        selectedTime: req.body.selectedTime,
    });
    if (!newBlockedTimeSlot) {
        return next(new appError_1.default("Could not create new table booking", 404));
    }
    res.status(200).json({
        status: "success",
        table: newBlockedTimeSlot,
    });
}));
exports.blockedTimeSlotUpdateOne = (0, handlerFactory_1.factoryUpdateOne)(blockedTimeSlotModel_1.default);
exports.blockedTimeSlotDeleteOne = (0, handlerFactory_1.factoryDeleteOne)(blockedTimeSlotModel_1.default);
/*-------------------- Misc Table Slot and Menu Controllers --------------------*/
exports.tablePruneBookings = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get today's date and normalize to midnight (start of the day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Delete all Table and BlockedTimeSlot documents with a selectedDate before today
    const [deletedTableBookings, deletedBlockedTimeSlots] = yield Promise.all([
        tableModel_1.default.deleteMany({ selectedDate: { $lt: today } }),
        blockedTimeSlotModel_1.default.deleteMany({ selectedDate: { $lt: today } }),
    ]);
    // Return a success response with the number of deleted documents
    res.status(200).json({
        status: "success",
        message: `${deletedTableBookings.deletedCount} table bookings and ${deletedBlockedTimeSlots.deletedCount} blocked slots have been deleted.`,
        deletedTableBookings: deletedTableBookings.deletedCount,
        deletedBlockedTimeSlots: deletedBlockedTimeSlots.deletedCount,
    });
}));
