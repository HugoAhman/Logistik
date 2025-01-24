import mongoose, { set } from "mongoose";
import { Elysia } from 'elysia';
import { worker as WorkerModel } from "./schema";
import { warehouse as WarehouseModel } from "./schema";
import { product as ProductModel } from "./schema";
import { order as OrderModel } from "./schema";

await mongoose.connect('PRIVATE');

// POST = CREATE
// GET = READ
// PUT = UPDATE
// DELETE = DELETE

interface WorkerData {
    name: string;
    weekschedule: string;
}

const app = new Elysia();

// Search for all the workers
// Thunder Client URL: http://localhost:3030/worker
app.get('/worker', async ({ set }) => {
    try {
        const allWorkers = await WorkerModel.find();
        return { Workers: allWorkers };
    } catch (error) {
        set.status = 500;
        return { message: "Error occured trying to find workers", error: error.message };
    }
});

// Search for a specific worker using the name of the worker
// Thunder Client URL: http://localhost:3030/worker/Jason%20Bur
// The "%20" is used when the worker has a space in their name
app.get('/worker/:name', async ({ params, set }) => {
    try {
        const workerName = decodeURIComponent(params.name?.trim());

        if (!workerName) {
            set.status = 400;
            return { message: "Worker name parameter is required!" };
        }

        const worker = await WorkerModel.findOne({
            name: { $regex: new RegExp(`^${workerName}$`, 'i') }
        });

        if (!worker) {
            set.status = 404;
            return { message: `No worker found with the name ${workerName}.` };
        }

        return { message: "Worker found", data: worker };
    } catch (error) {
        set.status = 500;
        return { message: "Server error during worker search", error: error.message };
    }
});

// Search for driver working on a specific day
// Thunder Client URL: http://localhost:3030/working/drivers/Monday
app.get('/working/drivers/:day', async ({ params, set }) => {
    const { day } = params;

    if (!day) {
        set.status = 400;
        return { message: "Day parameter is required!" };
    }

    try {
        const drivers = await WorkerModel.find({
            role: "Driver",
            weekschedule: {
                $elemMatch: { day: { $regex: new RegExp(`^${day}$`, 'i') } }
            },
        });

        if (drivers.length === 0) {
            return { message: `No drivers are working on ${day}.` };
        }

        const driversSchedule = drivers.map((driver) => {
            const driverScheduleForDay = driver.weekschedule.filter(
                (schedule) => schedule.day?.toLowerCase() === day.toLowerCase()
            );

            return {
                name: driver.name,
                role: driver.role,
                schedule: driverScheduleForDay
            };
        });

        return {
            message: `Drivers working on ${day}:`,
            drivers: driversSchedule
        };
    } catch (error) {
        set.status = 500;
        return { message: "Error fetching drivers", error: error.message };
    }
});

// Search for a warehouse using the name of the warehouse
// Thunder Client URL: http://localhost:3030/warehouse/HardwareStorage
app.get('/warehouse/:warehouseName', async ({ params, set }) => {
    const warehouseName = decodeURIComponent(params.warehouseName);

    try {
        const warehouse = await WarehouseModel.findOne({ warehouseName: { $regex: new RegExp(`^${warehouseName}$`, 'i') } });
        if (!warehouse) {
            set.status = 404;
            return { message: `No warehouse found with the name ${warehouseName}.` };
        }
        return { warehouse };
    } catch (error) {
        set.status = 500;
        return { message: "Error occurred while retrieving the warehouse.", error: error.message };
    }
});

// Search for all products
// Thunder Client URL: http://localhost:3030/product/all
app.get('/product/all', async ({ set }) => {
    try {
        const products = await ProductModel.find();
        return { products };
    } catch (error) {
        set.status = 500;
        return { message: "Error occurred while retrieving products.", error: error.message };
    }
});

// Search for a product in a warehouse
// Thunder Client URL: http://localhost:3030/product/Screwdriver
app.get('/product/:productName', async ({ params, set }) => {
    const productName = decodeURIComponent(params.productName);

    try {
        const product = await ProductModel.findOne({ productName: { $regex: new RegExp(`^${productName}$`, 'i') } });
        if (!product) {
            set.status = 404;
            return { message: `No product found with the name ${productName}.` };
        }
        return { product };
    } catch (error) {
        set.status = 500;
        return { message: "Error occurred while retrieving the product.", error: error.message };
    }
});

// Check what orders need to be picked
// Thunder Client URL: http://localhost:3030/orders/to-pick
app.get('/orders/to-pick', async ({ set }) => {
    try {
        const orders = await OrderModel.find({ status: 'Pending' }).sort({ priority: -1, createdAt: 1 });
        if (!orders.length) {
            return { message: "No orders need to be picked right now." };
        }
        return { message: "Orders to pick:", orders };
    } catch (error) {
        set.status = 500;
        return { message: "Error occurred while fetching orders to pick", error: error.message };
    }
});

// Check what is the oldest order
// Thunder Client URL: http://localhost:3030/orders/oldest-picked
app.get('/orders/oldest-picked', async ({ set }) => {
    try {
        const oldestPickedOrder = await OrderModel.findOne({ status: 'Picked' })
            .sort({ createdAt: 1 });

        if (!oldestPickedOrder) {
            return { message: "No picked orders waiting for execution." };
        }

        return {
            message: "Oldest picked order awaiting execution:",
            order: oldestPickedOrder,
        };
    } catch (error) {
        set.status = 500;
        return { message: "Error occurred while fetching the oldest picked order", error: error.message };
    }
});


// Check what stockers dont have any orders right now
// Thunder Client URL: http://localhost:3030/stockers/free 
app.get('/stockers/free', async ({ set }) => {
    try {
        // Find all stockers
        const stockers = await WorkerModel.find({ role: 'Stocker' });
        if (!stockers.length) {
            return { message: "No stockers found in the system." };
        }

        // Find stockers with pending orders
        const busyStockerIds = await OrderModel.distinct('stockerId', { status: 'Pending' });

        // Find stockers without pending orders
        const freeStockers = stockers.filter(stocker => !busyStockerIds.includes(stocker._id.toString()));

        if (!freeStockers.length) {
            return { message: "No stockers are currently free." };
        }

        return {
            message: "Free stockers:",
            stockers: freeStockers.map(stocker => stocker.name),
        };
    } catch (error) {
        set.status = 500;
        return { message: "Error occurred while fetching free stockers", error: error.message };
    }
});

console.log('Server Date:', new Date().toString()); // Server date/time
console.log('Server Time Zone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

app.listen(3030, () => { console.log('Server is running index.ts on http://localhost:3030') });
