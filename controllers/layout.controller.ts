import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

// create layout - POST /api/v1/layout (POST) - PRIVATE - ADMIN ONLY
export const createLayout = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      // if type exists
      const typeExist = await LayoutModel.findOne({ type });

      if (typeExist) {
        return next(new ErrorHandler(`Layout for ${type} already exists`, 400));
      }

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });

        await LayoutModel.create({
          type,
          banner: {
            images: {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            },
            title,
            subTitle,
          },
        });
      }
      if (type === "FAQ") {
        // gets faq array
        const { faq } = req.body;

        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            const { question, answer } = item;

            const faqItem = {
              question,
              answer,
            };

            return faqItem;
          }),
        );

        await LayoutModel.create({ type: "FAQ", faq: faqItems });
      }

      if (type === "Categories") {
        // gets categories array
        const { categories } = req.body;

        const categoriesItem = await Promise.all(
          categories.map(async (item: any) => {
            const { title } = item;

            return {
              title,
            };
          }),
        );

        await LayoutModel.create({
          type: "Categories",
          categories: categoriesItem,
        });
      }

      res.status(201).json({
        success: true,
        message: "Layout created successfully",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.statusCode, error.message));
    }
  },
);

// edit layout - PUT /api/v1/layout/ (PUT) - PRIVATE - ADMIN ONLY
export const editLayout = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;

        const bannerData = await LayoutModel.findOne({ type: "Banner" });

        if (bannerData?.banner?.images?.length) {
          await cloudinary.v2.uploader.destroy(
            bannerData?.banner?.images?.[0]?.public_id,
          );
        }

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });
        const banner = {
          images: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
          type: "Banner",
        };

        await LayoutModel.findOneAndUpdate({ type: "Banner" }, banner, {
          new: true,
        });
      }
      if (type === "FAQ") {
        // gets faq array
        const { faq } = req.body;

        const faqItm = await LayoutModel.findOne({ type: "FAQ" });

        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            const { question, answer } = item;

            const faqItem = {
              question,
              answer,
            };

            return faqItem;
          }),
        );

        await LayoutModel.findByIdAndUpdate(
          faqItm?._id,
          {
            type: "FAQ",
            faq: faqItems,
          },
          {
            new: true,
          },
        );
      }

      if (type === "Categories") {
        // gets categories array
        const { categories } = req.body;

        const category = await LayoutModel.findOne({ type: "Categories" });

        const categoriesItem = await Promise.all(
          categories.map(async (item: any) => {
            const { title } = item;

            return {
              title,
            };
          }),
        );

        await LayoutModel.findByIdAndUpdate(
          category?._id,
          {
            type: "Categories",
            categories: categoriesItem,
          },
          {
            new: true,
          },
        );
      }

      res.status(200).json({
        success: true,
        message: "Layout updated successfully",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.statusCode, error.message));
    }
  },
);

// get layout by type - GET /api/v1/layout/:type (GET) - PUBLIC
export const getLayoutByType = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;

      const layout = await LayoutModel.findOne({ type: new RegExp(type, "i") });

      res.status(200).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.statusCode, error.message));
    }
  },
);
