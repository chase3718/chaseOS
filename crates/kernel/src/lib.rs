use wasm_bindgen::prelude::*;

mod vfs;

pub use vfs::{
	fs_init_from_bytes,
	fs_dump_state,
	fs_mkdir,
	fs_write_file,
	fs_read_file,
	fs_readdir,
	fs_stat,
	fs_rm,
	fs_rmdir,
	fs_mv,
	fs_cp,
};

#[wasm_bindgen]
pub fn hello(name: &str) -> String {
	format!("Hello from Rust/Wasm, {name}!")
}
