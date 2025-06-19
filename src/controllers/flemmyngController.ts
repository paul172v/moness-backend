import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import {
  factoryDeleteOne,
  factoryUpdateOne,
  factoryGetOneById,
} from "./handlerFactory";
import {
  FlemmyngWhileYouWait,
  FlemmyngStarters,
  FlemmyngMains,
  FlemmyngSides,
  FlemmyngDesserts,
} from "../models/flemmyngModel";
import {
  whileYouWaitArr,
  startersArr,
  mainsArr,
  sidesArr,
  dessertsArr,
} from "../dev/flemmyngMenu";

/* -------- Price Formatting Middleware for Updates -------- */
export const formatPrice = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.price !== undefined) {
    req.body.price = parseFloat(Number(req.body.price).toFixed(2));
  }
  next();
};

/* -------- Get All -------- */
export const flemmyngGetAll = catchAsync(
  async (req: Request, res: Response) => {
    const whileYouWait = await FlemmyngWhileYouWait.find();
    const starters = await FlemmyngStarters.find();
    const mains = await FlemmyngMains.find();
    const sides = await FlemmyngSides.find();
    const desserts = await FlemmyngDesserts.find();

    if (!whileYouWait && !starters && !mains && !sides && !desserts)
      return new AppError("No documents could be found", 404);

    res.status(200).json({
      status: "success",
      payload: {
        whileYouWait,
        starters,
        mains,
        sides,
        desserts,
      },
    });
  }
);

/* -------- While You Wait ------ */
export const flemmyngCreateOneWhileYouWait = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, price, allergens } = req.body;

    const newWhileYouWaitItem = await FlemmyngWhileYouWait.create({
      name,
      price: parseFloat(Number(price).toFixed(2)),
      allergens,
    });

    if (!newWhileYouWaitItem) {
      return next(
        new AppError("Could not create new While You Wait Item", 404)
      );
    }

    res.status(200).json({
      status: "success",
      menuItem: newWhileYouWaitItem,
    });
  }
);

export const flemmyngUpdateOneWhileYouWait =
  factoryUpdateOne(FlemmyngWhileYouWait);

export const flemmyngDeleteOneWhileYouWait =
  factoryDeleteOne(FlemmyngWhileYouWait);

export const flemmyngGetOneWhileYouWaitById =
  factoryGetOneById(FlemmyngWhileYouWait);

/* -------- Starters ------ */
export const flemmyngCreateOneStarter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, price, allergens, description, options } = req.body;

    const newStarterItem = await FlemmyngStarters.create({
      name,
      price: parseFloat(Number(price).toFixed(2)),
      allergens,
      description,
      options,
    });

    if (!newStarterItem) {
      return next(new AppError("Could not create new Starter Item", 404));
    }

    res.status(200).json({
      status: "success",
      menuItem: newStarterItem,
    });
  }
);

export const flemmyngUpdateOneStarter = factoryUpdateOne(FlemmyngStarters);

export const flemmyngDeleteOneStarter = factoryDeleteOne(FlemmyngStarters);

export const flemmyngGetOneStarterById = factoryGetOneById(FlemmyngStarters);

/* -------- Mains ------ */
export const flemmyngCreateOneMain = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, price, allergens, description, options } = req.body;

    const newMainItem = await FlemmyngMains.create({
      name,
      price: parseFloat(Number(price).toFixed(2)),
      allergens,
      description,
      options,
    });

    if (!newMainItem) {
      return next(new AppError("Could not create new Main Item", 404));
    }

    res.status(200).json({
      status: "success",
      menuItem: newMainItem,
    });
  }
);

export const flemmyngUpdateOneMain = factoryUpdateOne(FlemmyngMains);

export const flemmyngDeleteOneMain = factoryDeleteOne(FlemmyngMains);

export const flemmyngGetOneMainById = factoryGetOneById(FlemmyngMains);

/* -------- Sides ------ */
export const flemmyngCreateOneSide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, price, allergens, options } = req.body;

    const newSideItem = await FlemmyngSides.create({
      name,
      price: parseFloat(Number(price).toFixed(2)),
      allergens,
      options,
    });

    if (!newSideItem) {
      return next(new AppError("Could not create new Side Item", 404));
    }

    res.status(200).json({
      status: "success",
      menuItem: newSideItem,
    });
  }
);

export const flemmyngUpdateOneSide = factoryUpdateOne(FlemmyngSides);

export const flemmyngDeleteOneSide = factoryDeleteOne(FlemmyngSides);

export const flemmyngGetOneSideById = factoryGetOneById(FlemmyngSides);

/* -------- Desserts ------ */
export const flemmyngCreateOneDessert = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, price, allergens, description, options } = req.body;

    const newDessertItem = await FlemmyngDesserts.create({
      name,
      price: parseFloat(Number(price).toFixed(2)),
      allergens,
      description,
      options,
    });

    if (!newDessertItem) {
      return next(new AppError("Could not create new Dessert Item", 404));
    }

    res.status(200).json({
      status: "success",
      menuItem: newDessertItem,
    });
  }
);

export const flemmyngUpdateOneDessert = factoryUpdateOne(FlemmyngDesserts);

export const flemmyngDeleteOneDessert = factoryDeleteOne(FlemmyngDesserts);

export const flemmyngGetOneDessertById = factoryGetOneById(FlemmyngDesserts);

/* -------- Create Mock Data ------ */
export const flemmyngCreateMockData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await FlemmyngWhileYouWait.deleteMany();
    await FlemmyngStarters.deleteMany();
    await FlemmyngMains.deleteMany();
    await FlemmyngSides.deleteMany();
    await FlemmyngDesserts.deleteMany();

    const whileYouWait = await FlemmyngWhileYouWait.insertMany(whileYouWaitArr);
    const starters = await FlemmyngStarters.insertMany(startersArr);
    const mains = await FlemmyngMains.insertMany(mainsArr);
    const sides = await FlemmyngSides.insertMany(sidesArr);
    const desserts = await FlemmyngDesserts.insertMany(dessertsArr);

    res.status(201).json({
      status: "success",
      message: "Mock data created successfully",
      counts: {
        whileYouWait: whileYouWait.length,
        starters: starters.length,
        mains: mains.length,
        sides: sides.length,
        desserts: desserts.length,
      },
    });
  }
);
