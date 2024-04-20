import mongoose from "mongoose";

const ticketsCollection = "tickets";

const ticketsSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now, required: true },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
  products: {
    type: [
      {
        _id: false,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: Number,
      },
    ],
    default: [],
  },
});

ticketsSchema.pre("findOne", function () {
  this.populate("products.product");
});

mongoose.set("strictQuery", false);
export const ticketModel = mongoose.model(ticketsCollection, ticketsSchema);
