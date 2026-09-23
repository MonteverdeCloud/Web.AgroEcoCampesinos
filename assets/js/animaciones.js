/* =========================================================
   Agroecología Los Campesinos — Animaciones e interacciones
   Archivo: assets/js/animaciones.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       1. ANIMACIONES DE ENTRADA AL SCROLL
       ========================================================= */
    const elementos = document.querySelectorAll('.animar');

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada, i) => {
            if (entrada.isIntersecting) {
                setTimeout(() => {
                    entrada.target.classList.add('visible');
                }, i * 80);
                observador.unobserve(entrada.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    elementos.forEach(el => observador.observe(el));

    /* =========================================================
       2. MENÚ MÓVIL
       ========================================================= */
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('abierto');
            const icono = toggle.querySelector('i');
            if (icono) {
                icono.classList.toggle('fa-bars');
                icono.classList.toggle('fa-xmark');
            }
        });

        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('abierto');
                const icono = toggle.querySelector('i');
                if (icono) {
                    icono.classList.add('fa-bars');
                    icono.classList.remove('fa-xmark');
                }
            });
        });
    }

    /* =========================================================
       3. NAV AL SCROLL
       ========================================================= */
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if (!nav) return;
        if (window.scrollY > 60) {
            nav.style.boxShadow = '0 4px 20px rgba(46, 83, 57, 0.12)';
        } else {
            nav.style.boxShadow = '0 1px 0 rgba(255, 255, 255, 0.6) inset';
        }
    }, { passive: true });

    /* =========================================================
       4. AÑO DINÁMICO EN FOOTER
       ========================================================= */
    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();

    /* =========================================================
       5. BOTONES PLACEHOLDER
       ========================================================= */
    const botonesPlaceholder = [
        { id: 'botonReserva', mensaje: 'Próximamente: enlace de reserva por WhatsApp' },
        { id: 'btnCasita', mensaje: 'Próximamente: página de la casita campesina' },
        { id: 'btnTierra', mensaje: 'Próximamente: página de la finca' },
        { id: 'btnPlatillos', mensaje: 'Próximamente: nuestro menú' },
        { id: 'btnGaleria', mensaje: 'Próximamente: galería de fotos' },
        { id: 'btnFamilia', mensaje: 'Próximamente: página sobre la familia' },
        { id: 'btnVoluntariado', mensaje: 'Próximamente: información de voluntariado' }
    ];

    botonesPlaceholder.forEach(({ id, mensaje }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // TODO: reemplazar con la URL real correspondiente
                alert(mensaje);
            });
        }
    });

    /* =========================================================
       6. HELPER GENÉRICO: crear un carrusel con flechas + dots o barra
       ========================================================= */
    function crearCarrusel({
        contenedorId,
        viewportId,
        prevId,
        nextId,
        dotsId = null,
        barraId = null,
        itemSelector
    }) {
        const contenedor = document.getElementById(contenedorId);
        const viewport = document.getElementById(viewportId);
        const prev = document.getElementById(prevId);
        const next = document.getElementById(nextId);
        const dotsWrap = dotsId ? document.getElementById(dotsId) : null;
        const barra = barraId ? document.getElementById(barraId) : null;

        if (!contenedor || !viewport || !prev || !next) return;

        const items = viewport.querySelectorAll(itemSelector);
        if (!items.length) return;

        let index = 0;
        let dots = [];

        /* --- Crear dots si se pidió --- */
        if (dotsWrap) {
            items.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'carrusel__dot';
                dot.setAttribute('aria-label', `Ir al ítem ${i + 1}`);
                dot.addEventListener('click', () => irA(i));
                dotsWrap.appendChild(dot);
            });
            dots = dotsWrap.querySelectorAll('.carrusel__dot');
        }

        /* --- Ir a un ítem específico --- */
        function irA(i) {
            index = Math.max(0, Math.min(i, items.length - 1));
            const item = items[index];
            viewport.scrollTo({
                left: item.offsetLeft - viewport.offsetLeft,
                behavior: 'smooth'
            });
            actualizarUI();
        }

        /* --- Actualizar dots, flechas y barra --- */
        function actualizarUI() {
            if (dots.length) {
                dots.forEach((d, i) => d.classList.toggle('activo', i === index));
            }
            prev.disabled = index === 0;
            next.disabled = index === items.length - 1;
            actualizarBarra();
        }

        /* --- Barra de progreso (si aplica) --- */
        function actualizarBarra() {
            if (!barra) return;

            const scrollLeft = viewport.scrollLeft;
            const scrollMax = viewport.scrollWidth - viewport.clientWidth;

            if (scrollMax <= 0) {
                barra.style.width = '100%';
                barra.style.transform = 'translateX(0)';
                return;
            }

            const proporcion = viewport.clientWidth / viewport.scrollWidth;
            const anchoBarra = Math.max(proporcion * 100, 15); // mínimo 15% visible
            const desplazamientoMax = 100 - anchoBarra;
            const progreso = scrollLeft / scrollMax;
            const desplazamiento = progreso * desplazamientoMax;

            barra.style.width = `${anchoBarra}%`;
            barra.style.transform = `translateX(${(desplazamiento / anchoBarra) * 100}%)`;
        }

        /* --- Flechas prev / next --- */
        prev.addEventListener('click', () => irA(index - 1));
        next.addEventListener('click', () => irA(index + 1));

        /* --- Detección de scroll para actualizar indicadores --- */
        let scrollTimeout;
        viewport.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollLeft = viewport.scrollLeft;
                let masCercano = 0;
                let distanciaMinima = Infinity;

                items.forEach((item, i) => {
                    const distancia = Math.abs(item.offsetLeft - viewport.offsetLeft - scrollLeft);
                    if (distancia < distanciaMinima) {
                        distanciaMinima = distancia;
                        masCercano = i;
                    }
                });

                index = masCercano;

                if (dots.length) {
                    dots.forEach((d, i) => d.classList.toggle('activo', i === index));
                }
                prev.disabled = index === 0;
                next.disabled = index === items.length - 1;
                actualizarBarra();
            }, 80);
        }, { passive: true });

        /* --- Estado inicial --- */
        actualizarUI();

        /* --- Re-calcular al cambiar el tamaño --- */
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => irA(index), 150);
        });

        /* --- Navegación con teclado (flechas) --- */
        viewport.setAttribute('tabindex', '0');
        viewport.addEventListener('keydown', (e) => {
            const ancho = items[0]?.offsetWidth || 300;
            if (e.key === 'ArrowRight') {
                viewport.scrollBy({ left: ancho + 40, behavior: 'smooth' });
            } else if (e.key === 'ArrowLeft') {
                viewport.scrollBy({ left: -(ancho + 40), behavior: 'smooth' });
            }
        });
    }

    /* =========================================================
       7. INSTANCIAR LOS CUATRO CARRUSELES
       ========================================================= */

    /* 7.1 Carrusel de tarjetas (Experiencias) — flechas + dots */
    crearCarrusel({
        contenedorId: 'carrusel',
        viewportId: 'carruselViewport',
        prevId: 'carruselPrev',
        nextId: 'carruselNext',
        dotsId: 'carruselDots',
        itemSelector: '.tarjeta'
    });

    /* 7.2 Carrusel de íconos (Experiencias) — flechas + barra */
    crearCarrusel({
        contenedorId: 'carruselIconos',
        viewportId: 'carruselIconosViewport',
        prevId: 'iconosPrev',
        nextId: 'iconosNext',
        barraId: 'carruselIconosBarra',
        itemSelector: '.icono'
    });

    /* 7.3 Carrusel de valores (Valores) — flechas + barra */
    crearCarrusel({
        contenedorId: 'carruselValores',
        viewportId: 'carruselValoresViewport',
        prevId: 'valoresPrev',
        nextId: 'valoresNext',
        barraId: 'carruselValoresBarra',
        itemSelector: '.valor'
    });

    /* 7.4 Carrusel de respaldo (Valores) — flechas + dots */
    crearCarrusel({
        contenedorId: 'carruselRespaldo',
        viewportId: 'carruselRespaldoViewport',
        prevId: 'respaldoPrev',
        nextId: 'respaldoNext',
        dotsId: 'carruselRespaldoDots',
        itemSelector: '.respaldo__item'
    });

});