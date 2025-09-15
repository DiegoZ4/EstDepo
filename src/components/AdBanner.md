# AdBanner Component

Un componente reutilizable para mostrar anuncios publicitarios en la aplicación EstDepo.

## Uso Básico

```jsx
import AdBanner from "../components/AdBanner";

// Anuncio básico
<AdBanner />

// Anuncio con tipo específico
<AdBanner type="sidebar-left" />

// Anuncio con contenido personalizado
<AdBanner 
  type="mobile-top"
  content={
    <div>
      <h3>Mi Anuncio</h3>
      <p>Descripción del anuncio</p>
    </div>
  }
/>

// Anuncio clickeable con enlace
<AdBanner 
  type="sidebar-right"
  href="https://example.com"
  content={<div>Haz clic aquí</div>}
/>

// Anuncio con función onClick
<AdBanner 
  onClick={() => alert('Anuncio clickeado')}
  content={<div>Botón personalizado</div>}
/>
```

## Props

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `type` | string | "default" | Tipo de anuncio: "sidebar-left", "sidebar-right", "mobile-top", "mobile-bottom" |
| `content` | ReactNode | null | Contenido personalizado del anuncio |
| `className` | string | "" | Clases CSS adicionales |
| `style` | object | {} | Estilos CSS adicionales |
| `onClick` | function | null | Función a ejecutar al hacer clic |
| `href` | string | null | URL para abrir en nueva pestaña al hacer clic |

## Tipos de Anuncio

### Desktop - Laterales
- `sidebar-left`: Anuncio lateral izquierdo (160x600px aprox)
- `sidebar-right`: Anuncio lateral derecho (160x600px aprox)

### Mobile - Horizontales
- `mobile-top`: Banner superior móvil (320x50px)
- `mobile-bottom`: Banner inferior móvil (320x50px)

## Características

✅ **Responsive**: Se adapta automáticamente a desktop y móvil
✅ **Clickeable**: Soporte para enlaces y funciones onClick
✅ **Personalizable**: Contenido y estilos completamente personalizables
✅ **Hover Effects**: Efectos visuales al pasar el mouse
✅ **Accesible**: Semánticamente correcto (button vs div)

## Ejemplos de Implementación

### Página Home
La página de inicio ya implementa los 4 tipos de anuncios:
- 2 laterales para desktop
- 2 horizontales para móvil

### Agregar a Otras Páginas
```jsx
// En cualquier página
const MiPagina = () => {
  return (
    <div className="flex">
      {/* Contenido principal */}
      <main className="flex-1">
        Mi contenido
      </main>
      
      {/* Anuncio lateral */}
      <aside className="hidden lg:block w-48">
        <AdBanner 
          type="sidebar-right"
          href="https://mi-sponsor.com"
        />
      </aside>
    </div>
  );
};
```

## Monetización

Este sistema permite fácilmente:
- Vender espacios publicitarios
- Rotar anuncios dinámicamente
- Trackear clicks y conversiones
- Adaptar contenido según la página

## Personalización

Para cambiar los estilos por defecto, modifica:
- `/src/components/AdBanner.jsx` - Lógica del componente
- `/src/colores.jsx` - Colores del tema
