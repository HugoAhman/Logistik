import mongoose from "mongoose";
import { Elysia } from 'elysia';
import { worker as WorkerModel } from "./schema";
import { warehouse as WarehouseModel } from "./schema";
import { product as ProductModel } from "./schema";
import { order as OrderModel } from "./schema";

await mongoose.connect('PRIVATE');

const app = new Elysia();

interface Worker {
    name: string;
    role: string;
    weekschedule: string[];
}

interface Warehouse {
    warehouseName: string;
    warehouseType: string;
    warehouseSlots: number;
}

interface Product {
    productName: string;
    productAmount: number;
    warehouseType: string;
    warehouseSlots: number;
}

// Create a new worker
// Thunder Client URL: http://localhost:3030/worker/create
app.post('/worker/create', async ({ body, set }: { body: Worker; set: any }) => {
    const { name, role, weekschedule } = body;
    try {
        const newWorker = await WorkerModel.create({
            name,
            role,
            weekschedule,
        });
        return { message: `Worker ${name} recruited!`, worker: newWorker };
    } catch (error) {
        set.status = 404;
        return { error: error.message };
    }
});


// Bulk creation of workers
// Thunder Client URL: http://localhost:3030/worker/bulkCreate
app.post('/worker/bulkCreate', async ({ body, set }) => {
    if (!Array.isArray(body)) {
        set.status = 400;
        return { message: "Invalid input: Expected an array of workers." };
    }

    try {
        // Insert multiple workers into the database
        const newWorkers = await WorkerModel.insertMany(body, { ordered: false }); // ordered: false allows partial success
        return {
            message: `Successfully created ${newWorkers.length} workers`,
            workers: newWorkers
        };
    } catch (error) {
        set.status = 500;
        return { message: "Error occurred during bulk creation", error: error.message };
    }
});

// Create a new warehouse
// Thunder Client URL: http://localhost:3030/warehouse/create
app.post('/warehouse/create', async ({ body, set }) => {
    const { warehouseName, warehouseType, warehouseSlots } = body;
    try {
        const newWarehouse = await WarehouseModel.create({
            warehouseName,
            warehouseType,
            warehouseSlots,
        });

        return { message: `Warehouse ${warehouseName} succesfully created!`, warehouse: newWarehouse };

    } catch (error) {
        set.status = 400;
        return { message: "An error occured when trying to create a new warehouse!", error: error.message };
    }
});

// Create a new product
// Thunder Client URL: http://localhost:3030/product/create
app.post('/product/create', async ({ body, set }) => {
    const { productName, productAmount, warehouseType, warehouseSlots } = body;

    try {
        if (!productName || !productAmount || !warehouseType || warehouseSlots == null) {
            set.status = 400;
            return { message: "Missing required fields!" };
        }

        const warehouse = await WarehouseModel.findOne({ warehouseType });

        if (!warehouse) {
            set.status = 404;
            return { message: "Warehouse not found!" };
        }

        if (warehouse.warehouseSlots < warehouseSlots) {
            set.status = 400;
            return { message: "Not enough slots in the warehouse!" };
        }

        await WarehouseModel.updateOne(
            { warehouseType },
            { $inc: { warehouseSlots: -warehouseSlots } }
        );

        const newProduct = await ProductModel.create({
            productName,
            productAmount,
            warehouseType,
            warehouseSlots
        });

        set.status = 201;
        return { message: `Product ${productName} successfully created!`, product: newProduct };
    } catch (error) {
        set.status = 500;
        return { message: "An error occurred when trying to create a new product!", error: error.message };
    }
});

// Create a new order
// Thunder Client URL: http://localhost:3030/order/create 
// Create a new order and assign a free stocker (picker)
app.post('/order/create', async ({ body, set }: { body: any; set: any }) => {
    const { orderId, priority } = body;

    try {
        // Find a free stocker (worker with role 'Stocker' and no 'Pending' order)
        const freeStocker = await WorkerModel.findOne({
            role: 'Stocker',
            _id: { $nin: await OrderModel.distinct('stockerId', { status: 'Pending' }) }  // Exclude stockers with pending orders
        });

        if (!freeStocker) {
            set.status = 400;
            return { message: "No free stockers available to assign to this order." };
        }

        // Create the new order and assign the free stocker
        const newOrder = await OrderModel.create({
            orderId,
            status: 'Pending',
            createdAt: new Date(),
            priority,
            stockerId: freeStocker._id, // Assign the free stocker to this order
        });

        return { message: `Order ${orderId} created and assigned to stocker ${freeStocker.name}.`, order: newOrder };

    } catch (error) {
        set.status = 500;
        return { message: "An error occurred while creating the order.", error: error.message };
    }
});



// Uppdate status on a order
// Thunder Client URL: http://localhost:3030/order/update/ORD-1732303639694
app.put('/order/update/:orderId', async ({ params, body, set }) => {
    const { orderId } = params;
    const { status } = body;

    try {
        const order = await OrderModel.findOneAndUpdate(
            { orderId },
            { status },
            { new: true } // Return the updated order
        );

        if (!order) {
            set.status = 404;
            return { message: `No order found with ID ${orderId}.` };
        }

        return { message: `Order ${orderId} status updated to ${status}!`, order };
    } catch (error) {
        set.status = 500;
        return { message: "Error occurred while updating the order.", error: error.message };
    }
});



console.log('Server Date:', new Date().toString()); // Server date/time
console.log('Server Time Zone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
app.listen(3030, () => { console.log('Server is running generate.ts on http://localhost:3030') });
