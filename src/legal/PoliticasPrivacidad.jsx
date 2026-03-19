import { Link } from "react-router-dom";
import { FiShield, FiArrowLeft } from "react-icons/fi";

const PoliticasPrivacidad = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-up text-gray-300">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#a0f000] transition mb-6">
        <FiArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <div className="glass-card p-8 space-y-8">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-[#a0f000]/10 mb-4">
            <FiShield className="w-6 h-6 text-[#a0f000]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Políticas de Privacidad y Uso</h1>
          <p className="text-gray-500 text-sm">Última actualización: marzo 2026</p>
        </div>

        {/* Sección 1 */}
        <section>
          <h2 className="text-lg font-bold text-[#a0f000] mb-3">1. Información que recopilamos</h2>
          <p className="text-sm leading-relaxed">
            Al registrarte en EstDepo recopilamos tu nombre, dirección de correo electrónico y fecha de nacimiento. Esta información es utilizada exclusivamente para gestionar tu cuenta y brindarte una experiencia personalizada dentro de la plataforma.
          </p>
        </section>

        {/* Sección 2 */}
        <section>
          <h2 className="text-lg font-bold text-[#a0f000] mb-3">2. Uso de la información</h2>
          <p className="text-sm leading-relaxed">
            La información que recopilamos se utiliza para:
          </p>
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-400">
            <li>Gestionar tu cuenta y autenticación.</li>
            <li>Proveer acceso a los contenidos Premium si completaste tu suscripción.</li>
            <li>Enviarte correos relacionados con tu cuenta (recuperación de contraseña, confirmación de pago, etc.).</li>
            <li>Mejorar la experiencia y funcionalidades de la plataforma.</li>
          </ul>
          <p className="text-sm leading-relaxed mt-2">
            No compartimos ni vendemos tu información personal a terceros.
          </p>
        </section>

        {/* Sección 3 */}
        <section>
          <h2 className="text-lg font-bold text-[#a0f000] mb-3">3. Pagos y suscripciones</h2>
          <p className="text-sm leading-relaxed">
            Los pagos son procesados por <strong className="text-white">Mercado Pago</strong>. EstDepo no almacena datos de tarjetas de crédito ni información bancaria. Al suscribirte, aceptás los términos de uso de Mercado Pago.
          </p>
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-300">
            <p className="font-bold mb-1">⚠️ Política de cancelación y reembolsos</p>
            <p>
              EstDepo <strong className="text-white">no realiza devoluciones de dinero</strong> bajo ninguna circunstancia una vez efectuado el pago de la suscripción.
            </p>
            <p className="mt-2">
              En caso de cancelar tu suscripción, seguirás teniendo acceso a todos los beneficios Premium <strong className="text-white">hasta el fin del período ya abonado</strong>. Una vez finalizado ese período, tu cuenta pasará al plan gratuito automáticamente.
            </p>
          </div>
        </section>

        {/* Sección 4 */}
        <section>
          <h2 className="text-lg font-bold text-[#a0f000] mb-3">4. Cookies y tecnologías similares</h2>
          <p className="text-sm leading-relaxed">
            Utilizamos almacenamiento local del navegador (localStorage) para gestionar tu sesión activa. No utilizamos cookies de rastreo publicitario.
          </p>
        </section>

        {/* Sección 5 */}
        <section>
          <h2 className="text-lg font-bold text-[#a0f000] mb-3">5. Seguridad</h2>
          <p className="text-sm leading-relaxed">
            Implementamos medidas de seguridad razonables para proteger tu información. Tu contraseña se almacena encriptada y nunca en texto plano. Sin embargo, ningún sistema es 100% seguro; recomendamos usar contraseñas únicas y seguras.
          </p>
        </section>

        {/* Sección 6 */}
        <section>
          <h2 className="text-lg font-bold text-[#a0f000] mb-3">6. Condiciones de uso</h2>
          <ul className="space-y-1 text-sm list-disc list-inside text-gray-400">
            <li>El acceso a la plataforma es personal e intransferible.</li>
            <li>Queda prohibido compartir credenciales de acceso.</li>
            <li>EstDepo se reserva el derecho de suspender cuentas que incumplan estos términos.</li>
            <li>El contenido (fixtures, estadísticas, tablas) es de uso informativo. No se garantiza la exactitud en tiempo real de todos los datos.</li>
          </ul>
        </section>

        {/* Sección 7 */}
        <section>
          <h2 className="text-lg font-bold text-[#a0f000] mb-3">7. Modificaciones</h2>
          <p className="text-sm leading-relaxed">
            Nos reservamos el derecho de actualizar estas políticas en cualquier momento. Los cambios significativos serán comunicados a través de la plataforma o por correo electrónico.
          </p>
        </section>

        {/* Sección 8 */}
        <section>
          <h2 className="text-lg font-bold text-[#a0f000] mb-3">8. Contacto</h2>
          <p className="text-sm leading-relaxed">
            Si tenés preguntas sobre estas políticas, podés contactarnos a través de la plataforma o enviarnos un correo a <span className="text-[#a0f000]">contacto@estdepo.com.ar</span>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PoliticasPrivacidad;
