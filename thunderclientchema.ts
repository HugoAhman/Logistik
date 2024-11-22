import mongoose from "mongoose";
import { Elysia } from 'elysia';
import { worker as WorkerModel } from "./schema";
import { warehouse as WarehouseModel } from "./schema";
import { product as ProductModel } from "./schema";

// JSON CONTENT FOR CREATING MULTIPLE WORKERS EXAMPLE
// [
//     {
//         "name": "Alice",
//         "role": "Stocker",
//         "weekschedule": [
//             { "day": "Monday", "startWork": { "hour": 8, "minute": 0 }, "endWork": { "hour": 16, "minute": 0 } },
//             { "day": "Tuesday", "startWork": { "hour": 8, "minute": 0 }, "endWork": { "hour": 16, "minute": 0 } },
//             { "day": "Wednesday", "startWork": { "hour": 7, "minute": 0 }, "endWork": { "hour": 15, "minute": 0 } },
//             { "day": "Thursday", "startWork": { "hour": 9, "minute": 0 }, "endWork": { "hour": 17, "minute": 0 } },
//             { "day": "Friday", "startWork": { "hour": 10, "minute": 0 }, "endWork": { "hour": 15, "minute": 30 } }
//             ]
//     },
//     {
//         "name": "Alicia",
//         "role": "Stocker",
//         "weekschedule": [
//             { "day": "Monday", "startWork": { "hour": 11, "minute": 30 }, "endWork": { "hour": 15, "minute": 30 } },
//             { "day": "Tuesday", "startWork": { "hour": 10, "minute": 0 }, "endWork": { "hour": 14, "minute": 0 } },
//             { "day": "Wednesday", "startWork": { "hour": 12, "minute": 30 }, "endWork": { "hour": 16, "minute": 30 } },
//             { "day": "Thursday", "startWork": { "hour": 10, "minute": 30 }, "endWork": { "hour": 14, "minute": 30 } }
//             ]
//     },
//     {
//         "name": "Greg",
//         "role": "Stocker",
//         "weekschedule": [
//             { "day": "Monday", "startWork": { "hour": 6, "minute": 0 }, "endWork": { "hour": 18, "minute": 0 } },
//             { "day": "Tuesday", "startWork": { "hour": 6, "minute": 0 }, "endWork": { "hour": 18, "minute": 0 } },
//             { "day": "Wednesday", "startWork": { "hour": 6, "minute": 0 }, "endWork": { "hour": 19, "minute": 0 } },
//             { "day": "Thursday", "startWork": { "hour": 6, "minute": 0 }, "endWork": { "hour": 18, "minute": 0 } },
//             { "day": "Friday", "startWork": { "hour": 6, "minute": 0 }, "endWork": { "hour": 15, "minute": 30 } }
//             ]
//           }
// ]

// JSON CONTENT FOR CREATING WORKER EXAMPLE
// {
//     "name": "Johnny",
//     "role": "Driver",
//     "weekschedule": [
//         { "day": "Monday", "startWork": { "hour": 9, "minute": 0 }, "endWork": { "hour": 17, "minute": 0 } },
//         { "day": "Tuesday", "startWork": { "hour": 8, "minute": 30 }, "endWork": { "hour": 16, "minute": 30 } },
//         { "day": "Wednesday", "startWork": { "hour": 7, "minute": 15 }, "endWork": { "hour": 15, "minute": 0 } },
//         { "day": "Thursday", "startWork": { "hour": 9, "minute": 0 }, "endWork": { "hour": 18, "minute": 0 } },
//         { "day": "Friday", "startWork": { "hour": 10, "minute": 30 }, "endWork": { "hour": 15, "minute": 30 } }
//         ]
// }

// JSON CONTENT FOR CREATING A WAREHOUSE EXAMPLE
// {
//     "warehouseName": "HardwareStorage",
//     "warehouseType": "Hardware",
//     "warehouseSlots": 100
// }

// JSON CONTENT FOR CREATING A PRODUCT EXAMPLE
// {
//     "productName": "Laptop",
//     "productAmount": 50,
//     "warehouseType": "Hardware",
//     "warehouseSlots": 10
// }

// JSON CONTENT FOR UPDATING A WAREHOUSE
// {
//     "warehouseType": "Updated Hardware",
//     "warehouseSlots": 120
// }

// JSON CONTENT FOR UPDATING A ORDER
// {
//     "status": "Picked"
// }

// JSON CONTENT FOR CREATING A ORDER
// {
//     "productName": "Screwdriver",
//     "quantity": 10, 
//     "priority": 2 
// }


