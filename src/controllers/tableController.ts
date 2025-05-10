import { Request, Response, NextFunction, response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import {
  factoryDeleteOne,
  factoryGetAll,
  factoryGetOneById,
  factoryUpdateOne,
} from "./handlerFactory";

import Table from "../models/tableModel";
import BlockedTimeSlot from "../models/blockedTimeSlotModel";

/*-------------------- Table Booking Controllers --------------------*/

export const tableGetAll = factoryGetAll(Table);

export const tableCreateOne = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
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
    } = req.body;

    // Check for conflicting blocked slot
    const isBlocked = await BlockedTimeSlot.findOne({
      selectedDate: new Date(selectedDate),
      selectedTime,
    });

    if (isBlocked) {
      return next(
        new AppError("This time slot is blocked and cannot be booked.", 400)
      );
    }

    const newTable = await Table.create({
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
      return next(new AppError("Could not create new table booking", 404));
    }

    res.status(200).json({
      status: "success",
      table: newTable,
    });
  }
);

export const tableToggleTimeSelectionButtons = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchedNumberOfGuests = req.body.numberOfGuests;
    const searchedSelectedDate = req.body.selectedDate;
    const searchedSelectedTime = req.body.selectedTime;

    interface ITimeSlot {
      hr: number;
      min: string | number;
      isFull: boolean;
      isBlocked: boolean;
    }

    function parseHourAndMinute(
      selectedTime: string | number
    ): [number, string] {
      const timeStr = String(selectedTime).padStart(4, "0");
      const hour = parseInt(timeStr.slice(0, 2), 10);
      const minute = timeStr.slice(2, 4);
      return [hour, minute];
    }

    function buildTimeSlots(selectedTime: string | number): ITimeSlot[] {
      const [hour, minute] = parseHourAndMinute(selectedTime);
      const times: ITimeSlot[] = Array(5)
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
      } else if (minNumber === 15) {
        times[0] = { hr: hour - 1, min: "45", isFull: false, isBlocked: false };
        times[1] = { hr: hour, min: "00", isFull: false, isBlocked: false };
        times[2] = { hr: hour, min: "15", isFull: false, isBlocked: false };
        times[3] = { hr: hour, min: "30", isFull: false, isBlocked: false };
        times[4] = { hr: hour, min: "45", isFull: false, isBlocked: false };
      } else if (minNumber === 30) {
        times[0] = { hr: hour, min: "00", isFull: false, isBlocked: false };
        times[1] = { hr: hour, min: "15", isFull: false, isBlocked: false };
        times[2] = { hr: hour, min: "30", isFull: false, isBlocked: false };
        times[3] = { hr: hour, min: "45", isFull: false, isBlocked: false };
        times[4] = { hr: hour + 1, min: "00", isFull: false, isBlocked: false };
      } else if (minNumber === 45) {
        times[0] = { hr: hour, min: "15", isFull: false, isBlocked: false };
        times[1] = { hr: hour, min: "30", isFull: false, isBlocked: false };
        times[2] = { hr: hour, min: "45", isFull: false, isBlocked: false };
        times[3] = { hr: hour + 1, min: "00", isFull: false, isBlocked: false };
        times[4] = { hr: hour + 1, min: "15", isFull: false, isBlocked: false };
      }

      return times;
    }

    const isTimeSlotFull = async (time: string) => {
      const tablesArr = await Table.find({
        selectedDate: searchedSelectedDate,
        selectedTime: time,
      });

      const totalGuests = tablesArr.reduce(
        (sum, table) => sum + table.numberOfGuests,
        0
      );
      return totalGuests + searchedNumberOfGuests > 15;
    };

    const isTimeSlotBlocked = async (time: string) => {
      const blocked = await BlockedTimeSlot.findOne({
        selectedDate: new Date(searchedSelectedDate),
        selectedTime: time,
      });
      return !!blocked;
    };

    const times = buildTimeSlots(searchedSelectedTime);

    // Populate isFull and isBlocked for each slot
    await Promise.all(
      times.map(async (slot) => {
        const timeString = `${String(slot.hr).padStart(2, "0")}${slot.min}`;
        slot.isFull = await isTimeSlotFull(timeString);
        slot.isBlocked = await isTimeSlotBlocked(timeString);
      })
    );

    res.status(200).json({
      status: "success",
      message: "Data received successfully",
      data: {
        timeSlots: times,
      },
    });
  }
);

export const tableGetOneById = factoryGetOneById(Table);

export const blockedTimeSlotGetOneById = factoryGetOneById(BlockedTimeSlot);

export const tableUpdateOne = factoryUpdateOne(Table);

export const tableDeleteOne = factoryDeleteOne(Table);

export const tableGetManyByDate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
    const [tableBookings, blockedTimeSlots] = await Promise.all([
      Table.find({
        selectedDate: { $gte: startOfDay, $lt: endOfDay },
      }),
      BlockedTimeSlot.find({
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
  }
);

export const tableGetManyByName = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName } = req.body;

    if (!firstName && !lastName) {
      return res.status(400).json({
        status: "fail",
        message: "At least one of firstName or lastName is required.",
      });
    }

    const query: any = {};
    if (firstName) query.firstName = new RegExp(`^${firstName}`, "i");
    if (lastName) query.lastName = new RegExp(`^${lastName}`, "i");

    const bookings = await Table.find(query).sort({
      selectedDate: 1,
      selectedTime: 1,
    });

    res.status(200).json({
      status: "success",
      results: bookings.length,
      bookings,
    });
  }
);

export const tableGetManyByEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required.",
      });
    }

    const emailRegex = new RegExp(`^${email}`, "i"); // case-insensitive, partial match

    const bookings = await Table.find({ email: emailRegex }).sort({
      selectedDate: 1,
      selectedTime: 1,
    });

    res.status(200).json({
      status: "success",
      results: bookings.length,
      bookings,
    });
  }
);

/*-------------------- Blocked Time Slot Controllers --------------------*/

export const blockedTimeSlotCreateOne = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newBlockedTimeSlot = await BlockedTimeSlot.create({
      firstName: "Blocked",
      lastName: "Slot",
      selectedDate: req.body.selectedDate,
      selectedTime: req.body.selectedTime,
    });

    if (!newBlockedTimeSlot) {
      return next(new AppError("Could not create new table booking", 404));
    }

    res.status(200).json({
      status: "success",
      table: newBlockedTimeSlot,
    });
  }
);

export const blockedTimeSlotUpdateOne = factoryUpdateOne(BlockedTimeSlot);

export const blockedTimeSlotDeleteOne = factoryDeleteOne(BlockedTimeSlot);

/*-------------------- Misc Table Slot and Menu Controllers --------------------*/

export const tablePruneBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get today's date and normalize to midnight (start of the day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete all Table and BlockedTimeSlot documents with a selectedDate before today
    const [deletedTableBookings, deletedBlockedTimeSlots] = await Promise.all([
      Table.deleteMany({ selectedDate: { $lt: today } }),
      BlockedTimeSlot.deleteMany({ selectedDate: { $lt: today } }),
    ]);

    // Return a success response with the number of deleted documents
    res.status(200).json({
      status: "success",
      message: `${deletedTableBookings.deletedCount} table bookings and ${deletedBlockedTimeSlots.deletedCount} blocked slots have been deleted.`,
      deletedTableBookings: deletedTableBookings.deletedCount,
      deletedBlockedTimeSlots: deletedBlockedTimeSlots.deletedCount,
    });
  }
);
