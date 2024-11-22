import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    weekschedule: [{ day: String, startWork: { hour: Number, minute: Number }, endWork: { hour: Number, minute: Number } }],
});

const warehouseSchema = new mongoose.Schema({
    warehouseName: { type: String, required: true, unique: true },
    warehouseType: { type: String, required: true, unique: true },
    warehouseSlots: { type: Number, required: true },
});

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true, unique: true },
    productAmount: { type: Number, required: true },
    warehouseType: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
    orderId: String,
    status: { type: String, enum: ['Pending', 'Picked', 'Executed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    priority: Number, // To rank urgency
});

export const order = mongoose.model('Order', orderSchema);
export const worker = mongoose.model('Worker', workerSchema);
export const product = mongoose.model('Product', productSchema);
export const warehouse = mongoose.model('Warehouse', warehouseSchema);

