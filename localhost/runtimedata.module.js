// here 'runtimedata' is stored
// this is data that only exists at the runtime
// usually its arrays of objects representing stuff
// objects can be named and then exported
// import {
//     O_person
// } from "./classes.module.js"

// let o_person__hans = new O_person(
//     'hans', 
//     80,
// );
// // also arrays of objects can be exported
// let a_o_person = [
//     o_person__hans, 
//     new O_person()// if you dont need the named object
//     // 'unnamed' objects can always be accessed with a_o.find(o=>...)
// ]
// export {
//     o_person__hans,
//     a_o_person
// }
let a_o_websocket_function = [
    {
        n_id: 0, 
        s_name: "write",
    },
    {
        n_id: 1, 
        s_name: 'set_uuid_hashed'
    },
    {
        n_id: 2,
        s_name: 'payload_is_a_n_u8_encrypted_o_list'
    }, 
    {
        n_id: 3, 
        s_name: 'update_o_object'
    }, 
    {
        n_id: 4, 
        s_name: 'read_o_object'
    }
];

let o_websocket_function_write = a_o_websocket_function[0];
let o_websocket_function_set_uuid_hashed = a_o_websocket_function[1];
let o_websocket_function_payload_is_a_n_u8_encrypted_o_list = a_o_websocket_function[2];
let o_websocket_function_update_o_object = a_o_websocket_function[3];
let o_websocket_function_read_o_object = a_o_websocket_function[4];

export {
    a_o_websocket_function, 
    o_websocket_function_write,
    o_websocket_function_set_uuid_hashed,
    o_websocket_function_payload_is_a_n_u8_encrypted_o_list,
    o_websocket_function_update_o_object,
    o_websocket_function_read_o_object
};