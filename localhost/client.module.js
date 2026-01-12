
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"


import { createApp, ref, onUpdated, reactive} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

import {
    f_o_html_from_o_js,
} from "https://deno.land/x/handyhelpers@5.4.2/mod.js"

import {

    f_o_todoitem, 
    f_s_hashed_sha256,
    f_s_dectrypted_from_a_n_u8,
    f_a_n_u8_encrypted_from_string
} from './functions.module.js'

import {
    a_o_websocket_function
} from "./runtimedata.module.js"

const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const wsHost = location.host; // includes hostname + port automatically
const o_ws = new WebSocket(`${wsProtocol}//${wsHost}`);
globalThis.o_ws = o_ws;
let f_connect_to_websocket = async function(){
    return new Promise((resolve, reject) => {
        o_ws.binaryType = 'arraybuffer'; // set binary type to arraybuffer for receiving binary data
        o_ws.onopen = () => {
            console.log("Connected to WebSocket server");
            resolve();
        };
        o_ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            reject(error);
        };
    });
};


// triggered when the connection closes
o_ws.addEventListener("close", () => {
  console.log("Disconnected from server");
});

// optional: handle errors
o_ws.addEventListener("error", (err) => {
  console.error("WebSocket error:", err);
});
await f_connect_to_websocket();

// import { Boolean } from '/three.js-r126/examples/jsm/math/BooleanOperation.js';
// import { STLExporter } from '/three/STLExporter.js';
// if you need more addons/examples download from here...
//  
let s_id_error_msg = 'error_msg'
o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    #${s_id_error_msg}{
        position: absolute;
        width: 100%;
        top: 0;
        background: #f5c0c099;
        color: #5e0505;
        padding: 1rem;
        z-index: 111;
    }
    canvas{
        position:fixed;
        top:0;
        left:0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }
    #app {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        pointer-events: none;
    }
    #app > * {
        pointer-events: auto;
    }
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    `
);


let o_div = document;
let o_blob_stl = null;
// let a_o_license = await(await fetch('https://api.sketchfab.com/v3/licenses')).json()
// let a_o_category = await(await(fetch('https://api.sketchfab.com/v3/categories'))).json()


// Create canvas element separately (not inside Vue app)
let o_canvas_element = document.createElement('canvas');
o_canvas_element.id = 'canvas';
document.body.appendChild(o_canvas_element);

// Create app container
let o = await f_o_html_from_o_js(
    {
        id: "app",
        a_o: []
    }
);
document.body.appendChild(o);



const app = createApp({
    // $nextTick: () => {
    //     debugger
    // // Runs after the DOM has updated
    // // this.accessRenderedElement()
    // },
    async mounted() {
            let o_self = this;
            globalThis.o_self = this;

            let b_new_object = true;
            let s_id = window.location.hash.replace('#', '');

            if(s_id != ``){
                o_self.f_set_websocket_uuid(s_id);
                b_new_object = false;
            }

        globalThis.o_canvas = document.querySelector('canvas');

        f_init_sketch_js_stuff();

        if(b_new_object){
            o_self.o_object.s_id = crypto.randomUUID();
            o_self.o_object.n_scl_x_px = window.innerWidth;
            o_self.o_object.n_scl_y_px = window.innerHeight;
            window.location.hash = o_self.o_object.s_id;
            await o_self.f_set_websocket_uuid(o_self.o_object.s_id);

            o_self.o_object.a_o_path.push(
                reactive(
                    f_o_todoitem('this is your first todo item. click the square to mark it as done. click the trash can to delete it. click the color button to change its color. add more items with the input field at the bottom. everything is saved automatically. you can also import/export your list with the settings button ⚙️. have fun!')
                ),
            )
            await o_self.f_update_o_object();
            debugger
        }
        o_canvas.width = o_self.o_object.n_scl_x_px;
        o_canvas.height = o_self.o_object.n_scl_y_px;
        

        // triggered when a message is received from the server
        o_ws.addEventListener("message",async (o_e) => {

            let a_n_u8_payload = new Uint8Array(o_e.data);

            let n_id_websocket_function = a_n_u8_payload[0];
            let a_n_u8_data = a_n_u8_payload.slice(1);
            let o_websocket_function = a_o_websocket_function.find(o=>{
                return o.n_id == n_id_websocket_function
            });
            if(!o_websocket_function){
                console.error('could not find function with id '+n_id_websocket_function);
                return;
            }
            if(o_websocket_function.s_name == 'update_o_object'){
      
                let o_self = globalThis.o_self;
                let a_n_u8_encrypted = a_n_u8_payload.slice(1);
                const s_json_decrypted = await o_self.f_s_dectrypted_from_a_n_u8(new Uint8Array(a_n_u8_encrypted), o_self.o_object.s_id);
                let o_data = JSON.parse(s_json_decrypted);
                if(o_data?.o_object){
                    o_self.o_object.a_o_path = o_data.o_object.a_o_path;
                    o_self.o_object.n_ts_ms_last_downloaded_backup = o_data.o_object.n_ts_ms_last_downloaded_backup;
                }else{
                    console.error('could not find o_object in data from server');
                }
            
            }
            if(o_websocket_function.s_name == 'payload_is_a_n_u8_encrypted_o_object'){
                let a_n_u8_encrypted = a_n_u8_data;

                if(a_n_u8_encrypted.length == 0){
                    return null;
                }
                const s_json_decrypted = await o_self.f_s_dectrypted_from_a_n_u8(new Uint8Array(a_n_u8_encrypted), s_id);
                let o_data = JSON.parse(s_json_decrypted);
                o_self.o_object = o_data;
                
                return o_data;

            }

        });





        document.addEventListener('pointerup', this.f_pointerup);
          
    },
    beforeUnmount() {
        window.removeEventListener('pointerup', this.f_pointerup);
    },
    methods: {
        f_set_websocket_uuid: async function(s_uuid){

            let o_self = this;
            let s_websocket_function = 'set_uuid_hashed';
            
            let a_n_u8_payload = new Uint8Array();

            let o_websocket_function = a_o_websocket_function.find(o=>{
                return o.s_name == s_websocket_function
            });
            if(!o_websocket_function){
                alert("could not find function "+s_websocket_function);
            };
            let s_uuid_hashed = await o_self.f_s_hashed_sha256(s_uuid);
            let o_text_encoder = new TextEncoder();
            // the payload always starts with the function id
            // after that the data (can be dynamic in this case it is the string of the hashed uuid) follows
            a_n_u8_payload = new Uint8Array([
                o_websocket_function.n_id,
                ...o_text_encoder.encode(s_uuid_hashed)
                
            ]);

            o_ws.send(
                a_n_u8_payload
            )

        },
        f_interval_fetch_list: async function(){
            let o_self = this;
            if(o_self.b_writing){
                return;
            }
            // console.log('ival')
            let v_o_object = await o_self.f_v_o_object_from_s_id(o_self.o_object.s_id);
            o_self.o_object.a_o_path = v_o_object.a_o_path;
        },
        f_o_toast: function(s_msg){
            alert(s_msg)
        },
        f_s_dectrypted_from_a_n_u8: f_s_dectrypted_from_a_n_u8,
        f_s_hashed_sha256: f_s_hashed_sha256,
        f_a_n_u8_encrypted_from_string: f_a_n_u8_encrypted_from_string,
        f_o_todoitem: f_o_todoitem,
        f_b_network_server_connection : async function(){
            let o_self = this;
            let n_ms = window.performance.now();

            try {
                
                let o_resp = await fetch(
                    '/serverconnectiontest', 
                    {
                        method: 'GET',
                    }
                );
                if(!o_resp.ok){
                    o_self.f_o_toast('there is no connection to the server!', 'error', 5000)
                }
                let o = await o_resp.json();

                if(o?.b_success){
                    // o_self.f_o_toast('success connection server!', 'info', 5000)
                }
            } catch (error) {
                // This will catch network errors like ERR_CONNECTION_REFUSED
                if (error.message.includes('Failed to fetch') || 
                    error.message.includes('NetworkError') || 
                    error.message.includes('ERR_CONNECTION_REFUSED')) {
                    o_self.f_o_toast('There is no connection to the server!', 'error', 5000);
                } else {
                    o_self.f_o_toast('An unexpected error occurred!', 'error', 5000);
                    console.error('Connection test error:', error);
                }
            }
            setTimeout(async ()=>{
                await o_self.f_b_network_server_connection();
                
                // if(s_id){
                //     let v_o_object = await o_self.f_v_o_object_from_s_id(s_id);
                //     if(v_o_object != null){
                //         o_state.o_object.s_id = s_id;    
                //         o_state.o_object.a_o_path = v_o_object.a_o_path;
                //     }
                // }

            }, o_self.n_ms_interval_server_network_connection_test)
        },


       
        f_test: function(){
            //always start like this 
            let o_self = this;
            // and then use o_self.prop instead of 'o_state.prop'
            // ...
        },


      
        f_b_UUIDv4 : function(s_uuid) {
            return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s_uuid);
        },
        f_add_todoitem: function(){
            let o_self = this;
            if(o_self.s_text != ''){
                let o_todoitem = o_self.f_o_todoitem(o_self.s_text);
                o_todoitem.s_bg_color = o_self.s_bg_color;
                o_self.o_object.a_o_path.push(
                    o_todoitem
                );
                o_self.s_text = '';
                o_self.f_update_o_object();
            }
        },
        f_undelete_item: function(o_todoitem){
            let o_self = this;
            let o_item = o_self.o_object.a_o_path.find(
                (o_todoitem2, n_index) => {
                    return `${o_todoitem2.s_text}${o_todoitem2.n_ts_ms_created}` 
                        == `${o_todoitem.s_text}${o_todoitem.n_ts_ms_created}`;
                }
            )
            o_item.b_done_final = false;
            o_self.f_update_o_object();
        },
        f_doneundone_todoitem: function(o_todoitem){
            let o_self = this;
            let o_item = o_self.o_object.a_o_path.find(
                (o_todoitem2, n_index) => {
                    return `${o_todoitem2.s_text}${o_todoitem2.n_ts_ms_created}` 
                        == `${o_todoitem.s_text}${o_todoitem.n_ts_ms_created}`;
                }
            )
            o_item.a_n_ts_ms_done.push(Date.now());
            o_self.f_update_o_object();
        },
        f_delete_item: function(o_todoitem){
            let o_self = this;
            let o_item = o_self.o_object.a_o_path.find(
                (o_todoitem2, n_index) => {
                    return `${o_todoitem2.s_text}${o_todoitem2.n_ts_ms_created}` 
                        == `${o_todoitem.s_text}${o_todoitem.n_ts_ms_created}`;
                }
            )
            o_item.b_done_final = true;
            let b_done = o_item.a_n_ts_ms_done.length%2 == 1;
            if(!b_done){
                o_item.a_n_ts_ms_done.push(Date.now());
            }
            o_self.f_update_o_object();
        },
        f_delete_list: async function(){
            let o_self = this;
            let b = confirm(`do you really want to delete this list? this cannot be undone!`);
            if(!b){
                return;
            }

            o_self.o_object.a_o_path = [];
            
            let s_id_hashed = await o_self.f_s_hashed_sha256(o_self.o_object.s_id);
            let o_resp = await fetch(
                '/delete', 
                {
                    method: 'POST',
                    body: JSON.stringify(
                        {s_id_hashed}
                    )
                }
            );
            console.log(o_resp.json())

        },
        f_v_o_object_from_s_id : async function(s_id){
            let o_self = this;
            let s_id_hashed = await o_self.f_s_hashed_sha256(s_id);
            let o_resp = await fetch(
                '/read', 
                {
                    method: 'POST',
                    body: JSON.stringify(
                        {s_id_hashed}
                    )
                }
            );

            let a_n_u8_encrypted = new Uint8Array(await o_resp.arrayBuffer());
            if(a_n_u8_encrypted.length == 0){
                return null;
            }
            const s_json_decrypted = await o_self.f_s_dectrypted_from_a_n_u8(new Uint8Array(a_n_u8_encrypted), s_id);
            let o_data = JSON.parse(s_json_decrypted);
            return o_data;
        },
        f_a_n_u8_payload : async function(
            o_data,
            s_id
        ){
          

            let o_self = this;
            let a_n_u8_encrypted = await o_self.f_a_n_u8_encrypted_from_string(
                o_data, 
                s_id 
            )
            const encoder = new TextEncoder();
            let s_id_hashed = await o_self.f_s_hashed_sha256(s_id); // hash the id
            const a_n_u8_hashed_id = encoder.encode(s_id_hashed);

            // Create a single ArrayBuffer with:
            // - 2 bytes for hash length (Uint16)
            // - N bytes for hash
            // - Remaining bytes for encrypted data
            let n_bytes_hash = 2;
            const buffer = new Uint8Array(n_bytes_hash + a_n_u8_hashed_id.length + a_n_u8_encrypted.length);
            const view = new DataView(buffer.buffer);
        
            // Write hash length (2 bytes)
            view.setUint16(0, a_n_u8_hashed_id.length);
        
            // Write hash bytes
            buffer.set(a_n_u8_hashed_id, n_bytes_hash);
        
            // Write encrypted data
            buffer.set(a_n_u8_encrypted, n_bytes_hash + a_n_u8_hashed_id.length);
        
            return buffer
        },
        f_read_o_object: async function(){
            debugger
            let o_self = this; 
            let s_uuid_hashed = await o_self.f_s_hashed_sha256(o_self.o_object.s_id);
            let o_websocket_function = a_o_websocket_function.find(o=>{
                return o.s_name == 'f_read_o_object'
            });
            let a_n_u8_payload = await o_self.f_a_n_u8_payload(
                o_websocket_function?.n_id,
                s_uuid_hashed
            );
            o_ws.send(a_n_u8_payload); 
            await o_self.f_backup_list();
        },
        f_update_o_object : async function(){

            let o_self = this;
            o_self.b_writing = true;
            // update data structure updates that changes with different git versions
            for(let o of o_self.o_object.a_o_path){
                if(!o?.b_done_final){
                    o.b_done_final = false;
                }
                if(!o?.s_uuid){
                    o.s_uuid = crypto.randomUUID();
                }
            }
            let s_websocket_function = 'update_o_object';
            let o_websocket_function = a_o_websocket_function.find(o=>{
                return o.s_name == s_websocket_function
            });
            if(!o_websocket_function){
                alert("could not find function "+s_websocket_function);
            };
            let o_data = o_self.o_object;

            let a_n_u8_encrypted = await o_self.f_a_n_u8_encrypted_from_string(
                o_data, 
                o_self.o_object.s_id 
            )
            const encoder = new TextEncoder();
            let s_id_hashed = await o_self.f_s_hashed_sha256(o_self.o_object.s_id); // hash the id
            const a_n_u8_hashed_id = encoder.encode(s_id_hashed);

            // Create a single ArrayBuffer with:
            // - 2 bytes for hash length (Uint16)
            // - N bytes for hash
            // - Remaining bytes for encrypted data
            let n_bytes_hash = 2;
            const buffer = new Uint8Array(n_bytes_hash + a_n_u8_hashed_id.length + a_n_u8_encrypted.length);
            const view = new DataView(buffer.buffer);
        
            // Write hash length (2 bytes)
            view.setUint16(0, a_n_u8_hashed_id.length);
        
            // Write hash bytes
            buffer.set(a_n_u8_hashed_id, n_bytes_hash);
        
            // Write encrypted data
            buffer.set(a_n_u8_encrypted, n_bytes_hash + a_n_u8_hashed_id.length);
        
            let a_n_u8_payload = new Uint8Array([
                o_websocket_function.n_id,
                ...buffer
            ]);

            o_ws.send(
                a_n_u8_payload
            )
            // let o_resp = await fetch(
            //     '/write', 
            //     {
            //         method: 'POST',
            //         'Content-Type': 'application/octet-stream', // Important for binary data
            //         body: a_n_u8_payload
            //     }
            // );

            o_self.b_writing = false;
            // f_o_toast('saved', 'success', 5000)
        },


    },
    computed:{

    },
    watch: {
    },
  data() {
    return {
        a_s_color: ['red', 'green', 'blue', 'yellow', 'purple', 'orange'],
        n_ms_delta_max_server_network_connection_test: 1000,
        n_ms_interval_server_network_connection_test: 3333,
        n_id_interval_server_network_connection_test: null,
        n_id_interval_list_autofetch: null, 
        n_ms_interval_list_autofetch: 100000,
        b_show_settings: false,
        s_text: '',
        s_bg_color: 'transparent', // default color
        o_path: null,
        b_show_colorpicker: false,
        b_show_deleted: false,
        b_show_done : true, 
        n_ms_autodownload_backup_interval: 24 * 60 * 60 * 1000, // every 24 hours
        n_ms_loaded: new Date().getTime(),
        s_uuid_selected: null,
        o_object: {
            s_id: '',
            n_scl_x_px: 300,
            n_scl_y_px: 300,
            // n_ts_ms_last_downloaded_backup: new Date().getTime(),
            a_o_path: [
            ],
        },     
        b_writing: false,   
        // ...o_state_a_o_toast,
    };
  }
})


let f_init_sketch_js_stuff = function(){

    // sketchjs stuff
    // Access Paper.js from the global window/paper object
    const { Base, Path, Point, PointText } = window.paper;

    // Setup Paper.js with the canvas
    window.paper.setup(document.querySelector('canvas'));

    var path = new Path();
    var textItem = new PointText({
        content: 'Click and drag to draw a line.',
        point: new Point(20, 30),
        fillColor: 'black',
    });
    
    // Use Paper.js's Tool system for mouse events
    // Paper.js Tool provides event.point automatically
    var tool = new window.paper.Tool();

    console.log('Paper.js tool created:', tool);

    tool.onMouseDown = function(event) {
        console.log('mousedown event:', event);
        // If we produced a path before, deselect it:
        if (path) {
            path.selected = false;
        }

        // Create a new path and set its stroke color to black:
        path = new Path({
            segments: [event.point],
            strokeColor: 'black',
            // Select the path, so we can see its segment points:
            fullySelected: true
        });
    }

    // While the user drags the mouse, points are added to the path
    // at the position of the mouse:
    tool.onMouseDrag = function(event) {
        path.add(event.point);

        // Update the content of the text item to show how many
        // segments it has:
        textItem.content = 'Segment count: ' + path.segments.length;
    }

    // When the mouse is released, we simplify the path:
    tool.onMouseUp = function(event) {
        var segmentCount = path.segments.length;

        // When the mouse is released, simplify it:
        path.simplify(10);

        // Select the path, so we can see its segments:
        path.fullySelected = true;

        var newSegmentCount = path.segments.length;
        var difference = segmentCount - newSegmentCount;
        var percentage = 100 - Math.round(newSegmentCount / segmentCount * 100);
        textItem.content = difference + ' of the ' + segmentCount + ' segments were removed. Saving ' + percentage + '%';
    }
   	// // Create a Paper.js Path to draw a line into it:
	// var path = new Path();
	// // Give the stroke a color
	// path.strokeColor = 'black';
	// var start = new Point(100, 100);
	// // Move to start and draw a line from there
	// path.moveTo(start);
	// // Note the plus operator on Point objects.
	// // PaperScript does that for us, and much more!
	// path.lineTo(start + [ 100, -50 ]);

}    

app.mount('#app')

globalThis.o_vue = app;




