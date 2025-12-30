use std::collections::BTreeMap;
use wasm_bindgen::prelude::*;

const EMPTY: &str = "";

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct FsState {
    dirs: BTreeMap<String, Vec<String>>,   // path -> child names
    files: BTreeMap<String, Vec<u8>>,      // full path -> bytes
}

impl FsState {
    fn new() -> Self {
        let mut dirs = BTreeMap::new();
        dirs.insert("/".to_string(), vec![]);
        Self { dirs, files: BTreeMap::new() }
    }
}

thread_local! {
    static STATE: std::cell::RefCell<FsState> = std::cell::RefCell::new(FsState::new());
}

fn norm_path(path: &str) -> Result<String, JsValue> {
    if !path.starts_with('/') {
        return Err(JsValue::from_str("path must be absolute"));
    }
    let parts: Vec<&str> = path.split('/').filter(|p| !p.is_empty()).collect();
    let mut stack: Vec<&str> = Vec::new();
    for p in parts {
        if p == "." { continue; }
        if p == ".." { stack.pop(); continue; }
        stack.push(p);
    }
    let mut out = String::from("/");
    out.push_str(&stack.join("/"));
    if out.len() > 1 && out.ends_with('/') { out.pop(); }
    Ok(out)
}

fn parent_and_name(path: &str) -> Result<(String, String), JsValue> {
    let path = norm_path(path)?;
    if path == "/" {
        return Err(JsValue::from_str("root has no parent"));
    }
    let mut parts: Vec<&str> = path.split('/').filter(|p| !p.is_empty()).collect();
    let name = parts.pop().unwrap().to_string();
    let parent = if parts.is_empty() { "/".to_string() } else { format!("/{}", parts.join("/")) };
    Ok((parent, name))
}

/// Initialize the FS from persisted bytes (IndexedDB). Pass undefined/null/empty to create new FS.
#[wasm_bindgen]
pub fn fs_init_from_bytes(bytes: Option<js_sys::Uint8Array>) -> Result<(), JsValue> {
    let st = match bytes {
        None => FsState::new(),
        Some(arr) => {
            let v = arr.to_vec();
            if v.is_empty() {
                FsState::new()
            } else {
                bincode::deserialize::<FsState>(&v)
                    .map_err(|e| JsValue::from_str(&format!("deserialize fs failed: {e}")))?;
                bincode::deserialize::<FsState>(&v)
                    .map_err(|e| JsValue::from_str(&format!("deserialize fs failed: {e}")))?
            }
        }
    };

    STATE.with(|cell| *cell.borrow_mut() = st);
    Ok(())
}

/// Serialize FS state to bytes for persistence.
#[wasm_bindgen]
pub fn fs_dump_state() -> Result<js_sys::Uint8Array, JsValue> {
    let bytes = STATE.with(|cell| {
        bincode::serialize(&*cell.borrow())
            .map_err(|e| JsValue::from_str(&format!("serialize fs failed: {e}")))
    })?;

    Ok(js_sys::Uint8Array::from(bytes.as_slice()))
}

#[wasm_bindgen]
pub fn fs_mkdir(path: String) -> Result<(), JsValue> {
    let path = norm_path(&path)?;
    let (parent, name) = parent_and_name(&path)?;

    STATE.with(|cell| {
        let mut st = cell.borrow_mut();

        if st.dirs.contains_key(&path) {
            return Ok(());
        }
        if !st.dirs.contains_key(&parent) {
            return Err(JsValue::from_str("parent directory does not exist"));
        }

        st.dirs.insert(path.clone(), vec![]);

        let children = st.dirs.get_mut(&parent).unwrap();
        if !children.contains(&name) {
            children.push(name);
            children.sort();
        }

        Ok(())
    })
}

#[wasm_bindgen]
pub fn fs_write_file(path: String, data: js_sys::Uint8Array) -> Result<(), JsValue> {
    let path = norm_path(&path)?;
    let (parent, name) = parent_and_name(&path)?;
    let bytes = data.to_vec();

    STATE.with(|cell| {
        let mut st = cell.borrow_mut();

        if !st.dirs.contains_key(&parent) {
            return Err(JsValue::from_str("parent directory does not exist"));
        }

        st.files.insert(path.clone(), bytes);

        let children = st.dirs.get_mut(&parent).unwrap();
        if !children.contains(&name) {
            children.push(name);
            children.sort();
        }

        Ok(())
    })
}

#[wasm_bindgen]
pub fn fs_read_file(path: String) -> Result<js_sys::Uint8Array, JsValue> {
    let path = norm_path(&path)?;

    let bytes = STATE.with(|cell| {
        let st = cell.borrow();
        st.files
            .get(&path)
            .cloned()
            .ok_or_else(|| JsValue::from_str("file not found"))
    })?;

    Ok(js_sys::Uint8Array::from(bytes.as_slice()))
}

#[wasm_bindgen]
pub fn fs_readdir(path: String) -> Result<js_sys::Array, JsValue> {
    let path = norm_path(&path)?;

    let names = STATE.with(|cell| {
        let st = cell.borrow();
        st.dirs
            .get(&path)
            .cloned()
            .ok_or_else(|| JsValue::from_str("directory not found"))
    })?;

    let arr = js_sys::Array::new();
    for n in names {
        arr.push(&JsValue::from_str(&n));
    }
    Ok(arr)
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct StatResult {
    pub is_dir: bool,
    pub is_file: bool,
    pub size: usize,
}

#[wasm_bindgen]
pub fn fs_stat(path: String) -> Result<JsValue, JsValue> {
    let path = norm_path(&path)?;

    let result = STATE.with(|cell| {
        let st = cell.borrow();

        if st.dirs.contains_key(&path) {
            Ok(StatResult {
                is_dir: true,
                is_file: false,
                size: 0,
            })
        } else if let Some(data) = st.files.get(&path) {
            Ok(StatResult {
                is_dir: false,
                is_file: true,
                size: data.len(),
            })
        } else {
            Err(JsValue::from_str("not found"))
        }
    })?;

    Ok(serde_wasm_bindgen::to_value(&result)?)
}

#[wasm_bindgen]
pub fn fs_rm(path: String) -> Result<(), JsValue> {
    let path = norm_path(&path)?;
    let (parent, name) = parent_and_name(&path)?;

    STATE.with(|cell| {
        let mut st = cell.borrow_mut();

        // Can't delete directories (use rmdir)
        if st.dirs.contains_key(&path) {
            return Err(JsValue::from_str("is a directory (use rmdir)"));
        }

        // Remove file
        if !st.files.remove(&path).is_some() {
            return Err(JsValue::from_str("file not found"));
        }

        // Remove from parent's children
        if let Some(children) = st.dirs.get_mut(&parent) {
            children.retain(|n| n != &name);
        }

        Ok(())
    })
}

#[wasm_bindgen]
pub fn fs_rmdir(path: String) -> Result<(), JsValue> {
    let path = norm_path(&path)?;

    if path == "/" {
        return Err(JsValue::from_str("cannot remove root directory"));
    }

    let (parent, name) = parent_and_name(&path)?;

    STATE.with(|cell| {
        let mut st = cell.borrow_mut();

        // Check if directory exists
        let children = st.dirs
            .get(&path)
            .ok_or_else(|| JsValue::from_str("directory not found"))?
            .clone();

        // Check if directory is empty
        if !children.is_empty() {
            return Err(JsValue::from_str("directory not empty"));
        }

        // Remove directory
        st.dirs.remove(&path);

        // Remove from parent's children
        if let Some(parent_children) = st.dirs.get_mut(&parent) {
            parent_children.retain(|n| n != &name);
        }

        Ok(())
    })
}

#[wasm_bindgen]
pub fn fs_mv(from: String, to: String) -> Result<(), JsValue> {
    let from_path = norm_path(&from)?;
    let to_path = norm_path(&to)?;

    if from_path == to_path {
        return Ok(());
    }

    let (to_parent, to_name) = parent_and_name(&to_path)?;
    let (from_parent, from_name) = parent_and_name(&from_path)?;

    STATE.with(|cell| {
        let mut st = cell.borrow_mut();

        // Check if target parent exists
        if !st.dirs.contains_key(&to_parent) {
            return Err(JsValue::from_str("destination directory does not exist"));
        }

        // Move file
        if let Some(data) = st.files.remove(&from_path) {
            st.files.insert(to_path.clone(), data);

            // Update parent directories
            if let Some(children) = st.dirs.get_mut(&from_parent) {
                children.retain(|n| n != &from_name);
            }
            if let Some(children) = st.dirs.get_mut(&to_parent) {
                if !children.contains(&to_name) {
                    children.push(to_name);
                    children.sort();
                }
            }

            return Ok(());
        }

        // Move directory
        if st.dirs.contains_key(&from_path) {
            // Check if target already exists
            if st.dirs.contains_key(&to_path) || st.files.contains_key(&to_path) {
                return Err(JsValue::from_str("destination already exists"));
            }

            // Collect all paths under from_path
            let prefix = if from_path == "/" { String::new() } else { from_path.clone() };
            let mut to_move: Vec<(String, String)> = Vec::new();

            for (key, _) in st.dirs.iter() {
                if key == &from_path || key.starts_with(&format!("{}/", prefix)) {
                    let suffix = &key[prefix.len()..];
                    let new_key = format!("{}{}", to_path, suffix);
                    to_move.push((key.clone(), new_key));
                }
            }

            // Move directories
            for (old_key, new_key) in to_move {
                if let Some(children) = st.dirs.remove(&old_key) {
                    st.dirs.insert(new_key, children);
                }
            }

            // Move files under the directory
            let mut files_to_move: Vec<(String, String)> = Vec::new();
            for (key, _) in st.files.iter() {
                if key.starts_with(&format!("{}/", prefix)) {
                    let suffix = &key[prefix.len()..];
                    let new_key = format!("{}{}", to_path, suffix);
                    files_to_move.push((key.clone(), new_key));
                }
            }

            for (old_key, new_key) in files_to_move {
                if let Some(data) = st.files.remove(&old_key) {
                    st.files.insert(new_key, data);
                }
            }

            // Update parent directories
            if let Some(children) = st.dirs.get_mut(&from_parent) {
                children.retain(|n| n != &from_name);
            }
            if let Some(children) = st.dirs.get_mut(&to_parent) {
                if !children.contains(&to_name) {
                    children.push(to_name);
                    children.sort();
                }
            }

            return Ok(());
        }

        Err(JsValue::from_str("source not found"))
    })
}

#[wasm_bindgen]
pub fn fs_cp(from: String, to: String) -> Result<(), JsValue> {
    let from_path = norm_path(&from)?;
    let to_path = norm_path(&to)?;

    if from_path == to_path {
        return Ok(());
    }

    let (to_parent, to_name) = parent_and_name(&to_path)?;

    STATE.with(|cell| {
        let mut st = cell.borrow_mut();

        // Check if target parent exists
        if !st.dirs.contains_key(&to_parent) {
            return Err(JsValue::from_str("destination directory does not exist"));
        }

        // Copy file - clone the data first to avoid borrow issues
        if let Some(data) = st.files.get(&from_path).cloned() {
            st.files.insert(to_path.clone(), data);

            // Update parent directory
            if let Some(children) = st.dirs.get_mut(&to_parent) {
                if !children.contains(&to_name) {
                    children.push(to_name);
                    children.sort();
                }
            }

            return Ok(());
        }

        Err(JsValue::from_str("only files can be copied (directories not supported)"))
    })
}
