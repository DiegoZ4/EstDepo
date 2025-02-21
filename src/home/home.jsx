import { useEffect, useState } from "react";
import { Card, CardContent, CardMedia } from "@mui/material";
import { NavLink } from "react-router-dom";
import { User, Menu } from "lucide-react";

export default function Home() {
  const [instagramPosts, setInstagramPosts] = useState([]);

  useEffect(() => {
    // Aquí iría la llamada a la API de Instagram cuando la configures
    // Por ahora, simulamos con datos de prueba
    setInstagramPosts([
      { id: 1, image: "https://via.placeholder.com/300", caption: "Post 1" },
      { id: 2, image: "https://via.placeholder.com/300", caption: "Post 2" },
    ]);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#141414] text-white">
      {/* Contenido */}
      <main className="flex flex-col items-center justify-start flex-1 p-8">
        <h1 className="text-4xl font-bold mb-6 text-[#a0f000] uppercase tracking-wide">
          Futbol Stat
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

          {/* {instagramPosts.map((post) => (
            <Card
              key={post.id}
              className="rounded-lg overflow-hidden shadow-lg bg-[#003c3c] border-2 border-[#a0f000] hover:scale-105 transition-transform duration-300"
            >
              <CardMedia
                component="img"
                image={post.image}
                alt={post.caption}
                className="h-48 object-cover"
              />
              <CardContent className="p-4 text-center">
                <p className="text-lg font-semibold text-[#ffffff]">{post.caption}</p>
              </CardContent>
            </Card>
          ))} */}
        </div>
      </main>
    </div>
  );
  
}
