import { colores } from "../colores";

const AdBanner = ({ 
  type = "default", 
  content = null, 
  className = "",
  style = {},
  onClick = null,
  href = null
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case "sidebar-left":
      case "desktop-left":
        return (
          <div className="text-center p-6">
            <div className="transform -rotate-90 space-y-3">
              <div className="text-[#a0f000] font-bold text-lg">DEPORTES</div>
              <div className="text-gray-400 text-sm">Tu tienda deportiva</div>
              <div className="text-gray-500 text-xs">160x600</div>
            </div>
          </div>
        );
      case "sidebar-right":
      case "desktop-right":
        return (
          <div className="text-center p-6">
            <div className="transform -rotate-90 space-y-3">
              <div className="text-[#a0f000] font-bold text-lg">SPONSOR</div>
              <div className="text-gray-400 text-sm">Espacio disponible</div>
              <div className="text-gray-500 text-xs">160x600</div>
            </div>
          </div>
        );
      case "mobile-top":
        return (
          <div className="text-center px-4">
            <div className="text-[#a0f000] font-bold text-sm">PUBLICIDAD</div>
            <div className="text-gray-400 text-xs">320x50 - Banner superior</div>
          </div>
        );
      case "mobile-bottom":
        return (
          <div className="text-center px-4">
            <div className="text-[#a0f000] font-bold text-sm">ANUNCIO</div>
            <div className="text-gray-400 text-xs">320x50 - Banner inferior</div>
          </div>
        );
      default:
        return (
          <span className="text-gray-400 text-sm">
            Anuncio
          </span>
        );
    }
  };

  const baseStyles = {
    backgroundColor: colores.inputBg,
    ...style
  };

  const handleClick = () => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (onClick) {
      onClick();
    }
  };

  const isClickable = href || onClick;

  const Component = isClickable ? 'button' : 'div';

  // Definir altura específica según el tipo
  const getHeightClass = () => {
    switch (type) {
      case "desktop-left":
      case "desktop-right":
      case "sidebar-left":
      case "sidebar-right":
        return "h-96 min-h-[24rem]"; // 384px mínimo
      case "mobile-top":
      case "mobile-bottom":
        return "h-16"; // 64px para móvil
      default:
        return "h-32"; // 128px por defecto
    }
  };

  return (
    <Component 
      className={`rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center transition-all duration-200 ${getHeightClass()} ${
        isClickable ? 'hover:border-[#a0f000] hover:shadow-lg cursor-pointer' : ''
      } ${className}`}
      style={baseStyles}
      onClick={isClickable ? handleClick : undefined}
    >
      {content || getDefaultContent()}
    </Component>
  );
};

export default AdBanner;
