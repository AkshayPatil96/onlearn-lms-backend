import { Schema, model, Document } from "mongoose";

interface IFaqItem extends Document {
  question: string;
  answer: string;
}

interface ICategory extends Document {
  title: string;
}

interface IBannerImage extends Document {
  public_id: string;
  url: string;
}

interface ILayout extends Document {
  type: string;
  faq: IFaqItem[];
  categories: ICategory[];
  banner: {
    images: IBannerImage[];
    title: string;
    subtitle: string;
  };
}

const faqSchema = new Schema({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const categorySchema = new Schema({
  title: {
    type: String,
  },
});

const bannerImageSchema = new Schema({
  public_id: {
    type: String,
  },
  url: {
    type: String,
  },
});

const layoutSchema = new Schema({
  type: {
    type: String,
  },
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    images: [bannerImageSchema],
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
  },
});

const LayoutModel = model<ILayout>("Layout", layoutSchema);

export default LayoutModel;
