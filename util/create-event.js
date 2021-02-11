const { DH_CHECK_P_NOT_PRIME } = require('constants');
const db = require('./queries')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

readline.question('What is the name of the table you want to create?', table_name => {
  console.log(table_name)
  db.createEvent(table_name)
  console.log(`New event table created named ${table_name}!`);
  readline.close();
});

//   const createEvent = (table_name) => {
//     pool.query('CREATE TABLE table_name=$1 (id serial primary key, token varchar, owner_user_id int)', [table_name], (error) => {
//         if (error) {
//             throw error
//         }
//         for (i=0; i < capacity; i++) {
//             let token = cryptoRandomString({length: 25});
//             pool.query('INSERT INTO table_name=$1 (token=$2) VALUES (i, token=$2', [table_name, token], (error) => {
//                 if (error) {
//                     throw error
//                 }
//             })
//         }
//     })
// }