import { useEffect, useState } from "react";
import { Card, CardContent, CardMedia } from "@mui/material";
import { NavLink } from "react-router-dom";
import { colores } from "../colores"; // Ajusta la ruta según tu estructura

export default function Home() {
  const [instagramPosts, setInstagramPosts] = useState([]);

  useEffect(() => {
    // Simulación de datos de Instagram
    setInstagramPosts([
      { id: 1, image: "https://via.placeholder.com/300", caption: "Post 1" },
      { id: 2, image: "https://via.placeholder.com/300", caption: "Post 2" },
    ]);
  }, []);

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ backgroundColor: colores.fondoPrincipal, color: colores.texto }}
    >
      <main className="flex flex-col items-center justify-start flex-1 p-8">
        <h1
          className="text-4xl font-bold mb-6 uppercase tracking-wide"
          style={{ color: colores.acento }}
        >
          Futbol Stat
        </h1>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {instagramPosts.map((post) => (
            <Card
              key={post.id}
              className="rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
              style={{
                backgroundColor: colores.inputBg,
                border: `2px solid ${colores.acento}`,
              }}
            >
              <CardMedia
                component="img"
                image={post.image}
                alt={post.caption}
                className="h-48 object-cover"
              />
              <CardContent className="p-4 text-center">
                <p className="text-lg font-semibold" style={{ color: colores.texto }}>
                  {post.caption}
                </p>
              </CardContent>
            </Card>
          ))}
        </div> */}
      </main>
    </div>
  );
}
