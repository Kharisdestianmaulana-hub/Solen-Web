// ============================================================
// Solen Browser — Dual-Mode Backend
//
// macOS  → Native WKWebView via add_child()
// Linux  → Local proxy server + iframe
// ============================================================

// ======================== COMMON ============================

#[tauri::command]
fn get_render_mode() -> &'static str {
    if cfg!(target_os = "macos") {
        "native"
    } else {
        "proxy"
    }
}

// =================== macOS: Native Webview ===================

#[cfg(target_os = "macos")]
mod native {
    use std::collections::HashMap;
    use std::sync::Mutex;
    use tauri::{LogicalPosition, LogicalSize, Manager, Webview, WebviewBuilder, WebviewUrl};

    pub struct WebviewState {
        pub webviews: Mutex<HashMap<String, Webview>>,
    }

    impl WebviewState {
        pub fn new() -> Self {
            Self {
                webviews: Mutex::new(HashMap::new()),
            }
        }
    }

    #[tauri::command]
    pub fn create_webview(
        app: tauri::AppHandle,
        id: String,
        url: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
    ) -> Result<(), String> {
        let window = app.get_window("main").ok_or("No main window")?;

        let state = app.state::<WebviewState>();
        if state.webviews.lock().unwrap().contains_key(&id) {
            return Ok(());
        }

        let builder = WebviewBuilder::new(
            &id,
            WebviewUrl::External(url.parse().map_err(|_| "Invalid URL".to_string())?),
        );

        let webview = window
            .add_child(
                builder,
                LogicalPosition::new(x, y),
                LogicalSize::new(width, height),
            )
            .map_err(|e| e.to_string())?;

        state.webviews.lock().unwrap().insert(id, webview);
        Ok(())
    }

    #[tauri::command]
    pub fn show_webview(app: tauri::AppHandle, id: String) -> Result<(), String> {
        let state = app.state::<WebviewState>();
        if let Some(wv) = state.webviews.lock().unwrap().get(&id) {
            wv.show().map_err(|e| e.to_string())?;
            wv.set_focus().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    #[tauri::command]
    pub fn hide_webview(app: tauri::AppHandle, id: String) -> Result<(), String> {
        let state = app.state::<WebviewState>();
        if let Some(wv) = state.webviews.lock().unwrap().get(&id) {
            wv.hide().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    #[tauri::command]
    pub fn close_webview(app: tauri::AppHandle, id: String) -> Result<(), String> {
        let state = app.state::<WebviewState>();
        if let Some(wv) = state.webviews.lock().unwrap().remove(&id) {
            wv.close().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    #[tauri::command]
    pub fn resize_webview(
        app: tauri::AppHandle,
        id: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
    ) -> Result<(), String> {
        let state = app.state::<WebviewState>();
        if let Some(wv) = state.webviews.lock().unwrap().get(&id) {
            wv.set_position(LogicalPosition::new(x, y))
                .map_err(|e| e.to_string())?;
            wv.set_size(LogicalSize::new(width, height))
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    #[tauri::command]
    pub fn navigate_webview(app: tauri::AppHandle, id: String, url: String) -> Result<(), String> {
        let state = app.state::<WebviewState>();
        if let Some(wv) = state.webviews.lock().unwrap().get(&id) {
            let js = format!("window.location.href = '{}';", url);
            wv.eval(&js).map_err(|e| e.to_string())?;
        }
        Ok(())
    }
}

// =================== Linux: Proxy Server ====================

#[cfg(target_os = "linux")]
mod proxy {
    use std::collections::HashMap;
    use warp::Filter;

    pub const PORT: u16 = 9514;

    pub fn start_server() {
        tauri::async_runtime::spawn(async {
            let proxy = warp::path("proxy")
                .and(warp::query::<HashMap<String, String>>())
                .and_then(handle_proxy);

            let cors = warp::cors()
                .allow_any_origin()
                .allow_methods(vec!["GET", "POST", "OPTIONS"])
                .allow_headers(vec!["content-type"]);

            let routes = proxy.with(cors);

            println!("[Solen Proxy] Listening on http://127.0.0.1:{}", PORT);
            warp::serve(routes).run(([127, 0, 0, 1], PORT)).await;
        });
    }

    static PROXY_CLIENT: std::sync::OnceLock<reqwest::Client> = std::sync::OnceLock::new();

    async fn handle_proxy(
        params: HashMap<String, String>,
    ) -> Result<warp::http::Response<Vec<u8>>, warp::Rejection> {
        let url = params
            .get("url")
            .ok_or_else(warp::reject::not_found)?
            .clone();

        let client = PROXY_CLIENT.get_or_init(|| {
            reqwest::Client::builder()
                .redirect(reqwest::redirect::Policy::limited(10))
                .cookie_store(true)
                .build()
                .unwrap_or_else(|_| reqwest::Client::new())
        });

        let response = client
            .get(&url)
            .header("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
            .header("Accept-Language", "en-US,en;q=0.9,id;q=0.8")
            .send()
            .await
            .map_err(|_| warp::reject::not_found())?;

        let status = response.status().as_u16();
        let resp_headers = response.headers().clone();
        let content_type = resp_headers
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_string();

        let content_disposition = resp_headers
            .get("content-disposition")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_lowercase();

        let is_download = content_disposition.contains("attachment") ||
            content_type == "application/octet-stream" ||
            content_type == "application/x-msdownload" ||
            content_type == "application/zip";

        if is_download {
            let filename = extract_filename(&url, &content_disposition);
            let inject = format!(
                r#"<script>
window.parent.postMessage({{ type: 'solen-download-start', url: '{}', filename: '{}' }}, '*');
history.back();
</script>"#,
                url, filename
            );
            return Ok(warp::http::Response::builder()
                .header("Content-Type", "text/html")
                .header("Access-Control-Allow-Origin", "*")
                .body(inject.into_bytes())
                .unwrap());
        }

        let body_bytes = response
            .bytes()
            .await
            .map_err(|_| warp::reject::not_found())?;

        let mut builder = warp::http::Response::builder().status(status);

        for (name, value) in resp_headers.iter() {
            let n = name.as_str().to_lowercase();
            if n == "x-frame-options"
                || n == "content-security-policy"
                || n == "content-security-policy-report-only"
                || n == "cross-origin-opener-policy"
                || n == "cross-origin-embedder-policy"
                || n == "cross-origin-resource-policy"
                || n == "content-length"
            {
                continue;
            }
            if let Ok(v) = value.to_str() {
                builder = builder.header(name.as_str(), v);
            }
        }

        builder = builder.header("Access-Control-Allow-Origin", "*");

        let final_body = if content_type.contains("text/html") {
            let html = String::from_utf8_lossy(&body_bytes);
            let base_url = extract_origin(&url);

            let inject = format!(
                r#"<base href="{}"><script>
document.addEventListener('click', function(e) {{
  var a = e.target.closest('a');
  if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {{
    e.preventDefault();
    if (a.target === '_blank') {{
      window.parent.postMessage({{ type: 'solen-new-tab', url: a.href }}, '*');
    }} else {{
      window.parent.postMessage({{ type: 'solen-navigate', url: a.href }}, '*');
    }}
  }}
}}, true);
window.addEventListener('submit', function(e) {{
  var form = e.target;
  if (form.method && form.method.toLowerCase() === 'get' && form.action) {{
    e.preventDefault();
    var fd = new FormData(form);
    var qs = new URLSearchParams(fd).toString();
    var url = form.action + '?' + qs;
    window.parent.postMessage({{ type: 'solen-navigate', url: url }}, '*');
  }}
}}, true);
</script>"#,
                base_url
            );

            let modified = if let Some(idx) = html.to_lowercase().find("<head") {
                if let Some(close) = html[idx..].find('>') {
                    let insert_pos = idx + close + 1;
                    format!("{}{}{}", &html[..insert_pos], inject, &html[insert_pos..])
                } else {
                    format!("{}{}", inject, html)
                }
            } else {
                format!("{}{}", inject, html)
            };

            modified.into_bytes()
        } else {
            body_bytes.to_vec()
        };

        Ok(builder.body(final_body).unwrap())
    }

    fn extract_origin(url: &str) -> String {
        if let Some(scheme_end) = url.find("://") {
            let after_scheme = &url[scheme_end + 3..];
            if let Some(path_start) = after_scheme.find('/') {
                return format!("{}/", &url[..scheme_end + 3 + path_start]);
            }
        }
        format!("{}/", url)
    }

    fn extract_filename(url: &str, content_disposition: &str) -> String {
        if let Some(idx) = content_disposition.find("filename=") {
            let part = &content_disposition[idx + 9..];
            let part = part.trim_matches(|c| c == '"' || c == '\'');
            if let Some(end) = part.find(';') {
                return part[..end].to_string();
            }
            return part.to_string();
        }
        
        // Fallback to URL path
        if let Ok(parsed) = url::Url::parse(url) {
            if let Some(segments) = parsed.path_segments() {
                if let Some(last) = segments.last() {
                    if !last.is_empty() {
                        return last.to_string();
                    }
                }
            }
        }
        "downloaded_file".to_string()
    }

    #[tauri::command]
    pub fn get_proxy_port() -> u16 {
        PORT
    }
}

// ======================== ENTRYPOINT =========================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // ------- macOS: Native Webview Mode -------
    #[cfg(target_os = "macos")]
    {
        tauri::Builder::default()
            .plugin(tauri_plugin_upload::init())
            .plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_opener::init())
            .manage(native::WebviewState::new())
            .invoke_handler(tauri::generate_handler![
                get_render_mode,
                native::create_webview,
                native::show_webview,
                native::hide_webview,
                native::close_webview,
                native::resize_webview,
                native::navigate_webview,
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    }

    // ------- Linux: Proxy Server Mode -------
    #[cfg(target_os = "linux")]
    {
        tauri::Builder::default()
            .plugin(tauri_plugin_upload::init())
            .plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_opener::init())
            .setup(|_app| {
                proxy::start_server();
                Ok(())
            })
            .invoke_handler(tauri::generate_handler![
                get_render_mode,
                proxy::get_proxy_port,
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    }
}
