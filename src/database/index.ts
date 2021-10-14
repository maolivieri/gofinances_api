import { createConnection } from 'typeorm';

(async () => await createConnection())();


// import { Connection, createConnection, getConnectionOptions } from "typeorm";

// export default async (host = "database"): Promise<Connection> => {
//     const defautlOptions = await getConnectionOptions();
//     return createConnection(
//         Object.assign(defautlOptions, {
//             host: process.env.NODE_ENV === "test" ? "localhost" : host,
//             database:
//                 process.env.NODE_ENV === "test"
//                     ? "fin_api_test"
//                     : defautlOptions.database,
//         })
//     );
// };