use actix_web::{get, web, App, HttpServer, Responder, HttpResponse, Error};
use std::fs;
use std::path::PathBuf;


#[get("/{filename:.*}")] 
async fn serve_file(filename: web::Path<String>) -> Result<HttpResponse, Error> {
    let mut path = PathBuf::from(".");
    path.push(filename.into_inner());

    match fs::read_to_string(&path) {
        Ok(contents) => {
            println!("File content for {}:\n{}", path.display(), contents);
            Ok(HttpResponse::Ok().body(contents))
        },
        Err(_) => Ok(HttpResponse::NotFound().body(format!("File not found: {}", path.display()))),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting server on http://127.0.0.1:8070");
    HttpServer::new(|| {
        App::new().service(serve_file)
    })
    .bind("127.0.0.1:8070")?
    .run()
    .await
}
