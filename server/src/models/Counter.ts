// Counter model server/src/models/Counter.ts
// Hands out numbers one after another (1, 2, 3...), even when two orders are placed at the same moment.
// Used for order numbers: #QC-1042, #QC-1043...

// STEP 22 (part 1): A counter for order numbers

import { model, Schema } from "mongoose";

interface ICounter {
  _id: string; // the counter's name, e.g. "order"
  seq: number; // the last number handed out
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = model<ICounter>("Counter", counterSchema);

// nextNumber("order") -> 1, then 2, then 3...
// $inc adds 1 INSIDE MongoDB in one step, so two orders at the same time can never get the same number.
// upsert: true = if the counter doesn't exist yet, create it (the first call gives 1).
export const nextNumber = async (name: string) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  return counter!.seq; // "!" = with upsert there is always a counter
};
