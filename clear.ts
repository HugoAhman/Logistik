import mongoose from "mongoose";
import { Elysia } from 'elysia';
import { worker as WorkerModel } from "./schema";
import { warehouse as WarehouseModel } from "./schema";
import { product as ProductModel } from "./schema";
import { order as OrderModel } from "./schema";

await mongoose.connect('PRIVATE');

const app = new Elysia();


// Fire all workers
// Thunder Client URL: http://localhost:3030/worker/delete
app.delete('/worker/delete', async ({ set }) => {
    try {
        const deleteWorkerData = await WorkerModel.deleteMany();

        if (deleteWorkerData.deletedCount > 0) {
            return { message: 'All workers were fired!' };
        } else {
            return { message: 'No workers found!' };
        }
    } catch (error) {
        set.status = 500;
        return { message: 'ERROR OCCURED', error };
    }
});

// Fire one worker
// Thunder Client URL: http://localhost:3030/worker/delete/John%20Doe
// The "%20" is if the name has space in between
// Its also important to include the "decodeURIComponent"
app.delete('/worker/delete/:name', async ({ params, set }) => {
    try {
        const name = decodeURIComponent(params.name);

        console.log(`Decoded name: ${name}.`);

        const deleteWorkerData = await WorkerModel.deleteOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (deleteWorkerData.deletedCount > 0) {
            return { message: `Worker ${name} fired!` };
        } else {
            return { message: `No worker found with the name ${name}.` };
        }

    } catch (error) {
        set.status = 400;
        return { message: 'ERROR OCCURED', error };
    }
});

// Delete one warehouse
// Thunder Client URL http://localhost:3030/warehouse/delete/HardwareStorage
app.delete('/warehouse/delete/:warehouseName', async ({ params, set }) => {
    try {
        const warehouseName = decodeURIComponent(params.warehouseName);

        console.log(`Decoded name: ${warehouseName}.`);

        const deleteWarehouse = await WarehouseModel.deleteOne({ warehouseName: { $regex: new RegExp(`^${warehouseName}$`, 'i') } });

        if (deleteWarehouse.deletedCount > 0) {
            return { message: `Warehouse ${warehouseName} was removed!` };
        } else {
            return { message: `No owned warehouse found with the name ${warehouseName}.` };
        }
    } catch (error) {
        set.status = 500;
        return { message: "Error occured when trying to delete a warehouse!", error: error.message }
    }
});

// Delete all the warehouses
// Thunder Client URL http://localhost:3030/warehouse/delete
app.delete('/warehouse/delete', async ({ set }) => {
    try {
        const result = await WarehouseModel.deleteMany();
        return result.deletedCount > 0
            ? { message: "All warehouses were cleared!" }
            : { message: "No warehouses found!" };
    } catch (error) {
        console.error(`[ERROR] Failed to delete warehouses:`, error);
        set.status = 500;
        return { message: "An internal server error occurred." };
    }
});



console.log('Server Date:', new Date().toString()); // Server date/time
console.log('Server Time Zone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
app.listen(3030, () => { console.log('Server is running clear.ts on http://localhost:3030') });
